(function() {

  // var prototype = require("prototype4node");
  // Object.extend(global, prototype);

  var Parser = require("parser-generator");

  /**
   * JavaScript Behaviors Library
   *
   * @copyright 2014 Stephen Riesenberg, All Rights Reserved
   * @author Dan Yoder
   * @author Stephen Riesenberg
   * @version 0.7
   * @license MIT
   * @link http://code.google.com/p/cruiser/wiki/Behaviors
   * @link https://github.com/sjohnr/behaviors.js
   */
  var Behaviors = {
    /**
     * Load and process Behaviors Stylesheets.
     */
    load: function() {
      $A(document.getElementsByTagName("link"))
          .select(Behaviors.Stylesheet.test)
          .pluck("href")
          .each(Behaviors.process);
    },
    /**
     * Load an individual Behaviors Stylesheet file by URL.
     */
    process: function(href) {
      Behaviors.Stylesheet.load(href);
    }
  };

  Behaviors.Stylesheet = {
    /**
     * Determine if the given <link> element is a Behaviors Stylesheet.
     *
     * @param link A <link> element to test
     */
    test: function(link) {
      return link.rel == "behaviors";
    },
    /**
     * Load the contents of a Behaviors Styleseheet via Ajax
     * and process the result.
     *
     * @param url The URL to load
     */
    load: function(url) {
      new Ajax.Request(url, { method: "get", onSuccess: Behaviors.Stylesheet.process });
    },
    /**
     * Process an Ajax response as a Behaviors Stylesheet.
     *
     * @param t The Ajax response object
     */
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
            } catch (ex) {
              if (window.console) {
                console.log(ex);
                console.log("@ " + r.key + " { " + a.key + ": " + a.value + "; }");
              }
            }
          });
        });
      });
    },
    /**
     * Parse a Behaviors Stylesheet.
     *
     * @param s The contents of the stylesheet file
     */
    parse: function(s) {
      return Behaviors.Stylesheet._parse(s).first();
    }
  };

  Behaviors.Translator = {
    /**
     * Translate style attributes an associative array.
     *
     * @param attrs The attributes parse tree
     */
    style: function (attrs) {
      return attrs.inject({}, function (h, a) {
        if (a) {
          h[a[0]] = a[2];
        }

        return h;
      });
    },
    /**
     * Translate rules to an associative array.
     *
     * @param rx The rules parse tree
     */
    rules: function (rx) {
      return rx.inject({}, function (h, r) {
        if (r) {
          h[r[0]] = r[1];
        }

        return h;
      });
    }
  };

  Behaviors.Grammar = {};
  (function() {
    var g = Behaviors.Grammar, s = Behaviors.Stylesheet, t = Behaviors.Translator, o = Parser.Operators;

    // basic tokens
    g.lbrace = o.token("{");
    g.rbrace = o.token("}");
    g.lparen = o.token(/\(/);
    g.rparen = o.token(/\)/);
    g.colon = o.token(":");
    g.semicolon = o.token(";");
    // comments
    g.inlineComment = o.token(/\x2F\x2F[^\n]*\n/);
    g.multilineComment = o.token(/\x2F\x2A(.|\n)*?\x2A\x2F/);
    g.comments = o.ignore(o.any(g.inlineComment, g.multilineComment));
    // attributes
    g.attrName = o.token(/[\w\-\d]+/);
    g.attrValue = o.token(/[^;\}]+/);
    g.attr = o.each(g.attrName, g.colon, g.attrValue, g.semicolon);
    g.attrList = o.many(o.any(g.comments, g.attr));
    g.style = o.process(o.between(g.lbrace, g.attrList, g.rbrace), t.style);
    // style rules
    g.selector = o.token(/[^\{]+/);
    g.rule = o.any(g.comments, o.each(g.selector, g.style));
    g.rules = o.process(o.many(g.rule), t.rules);
    // parser
    s._parse = g.rules;
  })();

  Behaviors.Bindings = {};
  (function() {
    /**
     * Set the binding property of an object
     *
     * @param o The object or element to bind to
     * @param t The target object or element being bound
     */
    function bind(o, t) {
      o.binding = ((t instanceof Element) && t.binding) ? t.binding : t;
    }

    Object.extend(Behaviors.Bindings, {
      "new":      function(e, x) { bind(e, eval("new "+x+"(e)")); },
      "object":   function(e, x) { bind(e, eval(x)); },
      "select":   function(e, x) { bind(e, $$(x)[0]); },
      "up":       function(e, x) { bind(e, e.up(x)); },
      "down":     function(e, x) { bind(e, e.down(x)); },
      "previous": function(e, x) { bind(e, e.previous(x)); },
      "next":     function(e, x) { bind(e, e.next(x)); }
    });
  })();

  Behaviors.Relative = {};
  Behaviors.Attributes = {};
  (function() {
    /**
     * Adds relative attribute functions: minimum, maximum, equal.
     *
     * @param c The comparator function
     * @param a The attribute name
     * @param e1 The first element (the element to act upon)
     * @param s The selector to evaluate as an element to compare to
     */
    function apply(c, a, e1, s) {
      var e2 = $$(s)[0]; if (!e2) return;
      if (c(parseInt(e1.getStyle(a)), parseInt(e2.getStyle(a)))) {
        e1.style[a] = e2.getStyle(a) ;
      }
    }

    /**
     * Adds an event handler to the element: blur, change, click, etc.
     *
     * @param h The handler
     * @param e The element
     * @param v The function name to invoke
     */
    function observe(h, e, v) {
      e.observe(h, e.binding[v].bind(e.binding));
    }

    /**
     * Adds relative attributes: height, width ...
     *
     * @param a The attribute name
     * @param e The element
     * @param v The function spec, e.g. "minimum( div.sidebar )"
     */
    function relative(a, e, v) {
      var f = parseFunction(v);
      if (!f) {
        return;
      }
      var fname = f[1]; var s = f[2];
      var fn = Behaviors.Relative[fname];
      if (fn) {
        fn(a, e, s);
      }
    }

    function parseFunction(s) {
      return s.match(/(\w+)\s*\(\s*([^\)]+)\s*\)/);
    }

    //
    // Comparator functions
    //
    Object.extend(Behaviors.Relative, $H({
      "minimum": function(a, b) { return a < b; },
      "maximum": function(a, b) { return a > b; },
      "equals":   function(a, b) { return a == b; }
    }).inject({}, function(r, h) {
      return r[h.key] = apply.curry(h.value);
    }));

    //
    // Core attribute functions
    //
    Object.extend(Behaviors.Attributes, {
      /**
       * Adds a binding to an element.
       *
       * @param e The element
       * @param v The function spec, e.g. "new( TabControl )"
       */
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
      /**
       * Adds a callback when the element is loaded.
       *
       * @param e The element
       * @param v The function, e.g. "addMenuItem"
       */
      load: function(e, v) {
        if (e.binding[v]) {
          e.binding[v](e);
        }
      },
      /**
       * Give an element focus.
       *
       * @param e The element
       * @param v Dummy argument, "true" or "yes"
       */
      hasFocus: function(e, v) {
        v = v.toLowerCase();
        if (v == "true" || v == "yes") {
          e.focus();
        }
      }
    });

    //
    // Meta functions for observing events
    //
    $w("blur change click dblclick contextmenu focus keydown keypress keyup mousedown mousemove mouseout mouseover mouseup resize").each(function(s) {
      Behaviors.Attributes[s] = observe.curry(s);
    });

    //
    // Meta functions for maintaining relative size
    //
    $w("height width").each(function(s) {
      Behaviors.Attributes[s] = relative.curry(s);
    });
  })();

  // export module
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Parser;
  } else {
    window.Parser = Parser;
  }

  // register onload event
  if (typeof window !== 'undefined') {
    window.addEventListener("load", Behaviors.load);
  }
})();