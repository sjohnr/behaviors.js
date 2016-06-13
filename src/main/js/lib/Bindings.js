"use strict";

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
  "select":   function(e, x) { bind(e, $$(x)[0]); },
  "up":       function(e, x) { bind(e, e.up(x)); },
  "down":     function(e, x) { bind(e, e.down(x)); },
  "previous": function(e, x) { bind(e, e.previous(x)); },
  "next":     function(e, x) { bind(e, e.next(x)); }
};

console.log("Loaded Bindings module");
module.exports = Bindings;
