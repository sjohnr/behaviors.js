"use strict";

var _ = require("underscore");
var Bindings = require("./Bindings");
var Relative = require("./Relative");

/**
 * Adds an event handler to the element: blur, change, click, etc.
 *
 * @param h The handler
 * @param e The element
 * @param v The function name to invoke
 */
function observe(h, e, v) {
  e.observe(h, _.bind(e.binding[v], e.binding));
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
  var fname = f[1], s = f[2];
  var fn = Relative[fname];
  if (fn) {
    fn(a, e, s);
  }
}

function parseFunction(s) {
  return s.match(/(\w+)\s*\(\s*([^\)]+)\s*\)/);
}

var Attributes = {
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
    var fn = Bindings[fname];
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
};

function $w(s) {
  return _(s.split(" "));
}

//
// Meta functions for observing events
//
$w("blur change click dblclick contextmenu focus keydown keypress keyup mousedown mousemove mouseout mouseover mouseup resize").each(function(s) {
  Attributes[s] = _.partial(observe, s);
});

//
// Meta functions for maintaining relative size
//
$w("height width").each(function(s) {
  Attributes[s] = _.partial(relative, s);
});

console.log("Loaded Attributes module");
module.exports = Attributes;
