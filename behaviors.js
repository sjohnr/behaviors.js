/**
 * JavaScript Behaviors Library
 *
 * @copyright 2007 Dan Yoder, All Rights Reserved
 * @author Dan Yoder <dan@zeraweb.com>
 * @author Stephen Riesenberg <stephen [dot] riesenberg [at] gmail [dot] com>
 * @version 0.6
 * @license MIT
 * @link http://code.google.com/p/cruiser/wiki/Behaviors
 */
var Behaviors = {
	load: function() {
		$A(document.getElementsByTagName("link"))
			.select(Behaviors.Stylesheet.test)
			.pluck("href")
			.map(Behaviors.process);
	},
	process: function(href) {
		Behaviors.Stylesheet.load(href);
	}
};

Behaviors.Stylesheet = {
	test: function(link) {
		return link.rel == "behaviors";
	},
	load: function(url) {
		new Ajax.Request(url, { method: "get", onSuccess: Behaviors.Stylesheet.process });
	},
	process: function(t) {
		var rules = Behaviors.Stylesheet.parse(t.responseText);
		$H(rules).each(function(r) {
			var elements = $$(r.key);
			var attributes = r.value;
			elements.each(function(e) {
				if (!e.binding) {
					e.binding = e;
				}
				$H(attributes).each(function(a) {
					var fn = Behaviors.Attributes[a.key.camelize()];
					try {
						fn ? fn(e, a.value, a.key) : null;
					} catch(ex) {
						if (window.console) {
							console.log(ex); console.log("@ " + r.key + " { " + a.key + ": " + a.value + "; }");
						}
					};
				});
			});
		});
	},
	parse: function(s) {
		return Behaviors.Stylesheet._parse(s).first();
	}
};

Behaviors.Translator = {
	style: function(attrs) {
		return attrs.inject({}, function(h, a) {
			h[a[0]] = a[1];
			
			return h;
		});
	},
	rules: function(rx) {
		return rx.inject({}, function(h, r) {
			if (r) {
				h[r[0]] = r[1];
			}
			
			return h;
		});			
	},
	parse: function(rx) {
		return rx.inject({}, function(h, r) {
			for (var key in r) {
				h[key] = r[key];
			}
			
			return h;
		})						
	}
};

Behaviors.Grammar = (function() {
	var g = {}, t = Behaviors.Translator, o = Parsing.Operators;
	// basic tokens
	g.lbrace = o.token("{"); g.rbrace = o.token("}");
	g.lparen = o.token(/\(/); g.rparen = o.token(/\)/);
	g.colon = o.token(":"); g.semicolon = o.token(";");
	// comments
	g.inlineComment = o.token(/\x2F\x2F[^\n]*\n/);
	g.multilineComment = o.token(/\x2F\x2A(.|\n)*?\x2A\x2F/);
	g.comments = o.ignore(o.any(g.inlineComment, g.multilineComment));
	// attributes
	g.attrName = o.token(/[\w\-\d]+/); g.attrValue = o.token(/[^;\}]+/);
	g.attr = o.pair(g.attrName, g.attrValue, g.colon);
	g.attrList = o.list(g.attr, g.semicolon, true);
	g.style = o.process(o.between(g.lbrace, g.attrList, g.rbrace), t.style);
	// style rules
	g.selector = o.token(/[^\{]+/);
	g.rule = o.any(g.comments, o.each(g.selector, g.style)); g.rules = o.process(o.many(g.rule), t.rules);
	// parser
	Behaviors.Stylesheet._parse = g.rules;
	
	return g;
})();

Behaviors.Bindings = (function() {
	/**
	 * Set the binding property of an object
	 *
	 * @param object
	 * @param target
	 */
	function bind(o, t) {
		o.binding = ((t instanceof Element) && t.binding) ? t.binding : t;
	}
	
	return {
		"new":      function(e, x) { bind(e, eval("new "+x+"(e)")); },
		"object":   function(e, x) { bind(e, eval(x)); },
		"select":   function(e, x) { bind(e, $$(x)[0]); },
		"up":       function(e, x) { bind(e, e.up(x)); },
		"down":     function(e, x) { bind(e, e.down(x)); },
		"previous": function(e, x) { bind(e, e.previous(x)); },
		"next":     function(e, x) { bind(e, e.next(x)); }
	};
})();

Behaviors.Relative = (function() {
	/**
	 * adds relative attribute functions: minimum, maximum, equal
	 *
	 * @param element
	 * @param attribute
	 * @param selector
	 * @param comparator
	 */
	function apply(e1, a, s, c) {
		var e2 = $$(s)[0]; if (!e2) return;
		if (c(parseInt(e1.getStyle(a)), parseInt(e2.getStyle(a)))) { 
			e1.style[a] = e2.getStyle(a) ;
		}
	}
	
	return $H({
		minimum: function(a, b) {
			return a < b;
		},
		maximum: function(a, b) {
			return a > b;
		},
		equal: function(a, b) {
			return a == b;
		}
	}).inject({}, function(r, h) {
		return r[h.key] = apply.rcurry(h.value);
	});
})();

Behaviors.Attributes = (function() {
	/**
	 * Adds an event handler to the element: blur, change, click, etc.
	 *
	 * @param element
	 * @param fname
	 * @param handler
	 */
	function observe(e, v, h) {
		e.observe(h, e.binding[v].bind(e.binding));
	}
	
	/**
	 * Adds relative attributes: height, width ...
	 *
	 * @param element
	 * @param function
	 * @param attribute
	 */
	function relative(e, v, a) {
		var f = parseFunction(v);
		if (!f) {
			return;
		}
		var fname = f[1]; var s = f[2];
		var fn = Behaviors.Relative[fname];
		if (fn) {
			fn(e, a, s);
		}
	}
	
	function parseFunction(s) {
		return s.match(/(\w+)\s*\(\s*([^\)]+)\s*\)/);
	}
	
	var a = {
		binding: function(e, v) {
			var f = parseFunction(v);
			if (!f) {
				return;
			}
			var fname = f[1], x = f[2];
			var fn = Behaviors.Bindings[fname];
			if (fn) {
				fn(e, x);
			}
		},
		load: function(e, v) {
			if (e.binding[v]) {
				e.binding[v](e);
			}
		},
		hasFocus: function(e, v) {
			v = v.toLowerCase();
			if (v == "true" || v == "yes") {
				e.focus();
			}
		}
	};
	
	$w("blur change click dblclick contextmenu focus keydown keypress keyup mousedown mousemove mouseout mouseover mouseup resize").each(function(s) {
		a[s] = observe.rcurry(s);
	});
	$w("height width").each(function(s) {
		a[s] = relative.rcurry(s);
	});
	
	return a;
})();

Function.prototype.rcurry = function() {
	if (!arguments.length) {
		return this;
	}
	
	var __method = this, args = $A(arguments);
	return function() {
		return __method.apply(this, $A(arguments).concat(args));
	}
};

document.observe("dom:loaded", Behaviors.load);