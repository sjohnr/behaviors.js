"use strict";

var $ = require("jquery");
var _ = require("underscore");

/**
 * Set the binding property of an object
 *
 * @param o The object or element to bind to
 * @param t The target object or element being bound
 */
function bind(o, t) {
  o.binding = ((t instanceof Element) && t.binding) ? t.binding : t;
}

var Bindings = {
  "new":      function(e, x) { bind(e, eval("new "+x+"(e)")); },
  "object":   function(e, x) { bind(e, eval(x)); },
  "select":   function(e, x) { bind(e, _.first($(x))); },
  "up":       function(e, x) { bind(e, _.first($(e).closest(x))); },
  "down":     function(e, x) { bind(e, _.first($(e).find(x))); },
  "previous": function(e, x) { bind(e, _.first($(e).prevAll(x))); },
  "next":     function(e, x) { bind(e, _.first($(e).nextAll(x))); }
};

console.log("Loaded Bindings module");
module.exports = Bindings;
