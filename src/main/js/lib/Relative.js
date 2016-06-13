"use strict";

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

var Relative = $H({
  "minimum": function(a, b) { return a < b; },
  "maximum": function(a, b) { return a > b; },
  "equals":   function(a, b) { return a == b; }
}).inject({}, function(r, h) {
  return r[h.key] = apply.curry(h.value);
});

console.log("Loaded Relative module");
module.exports = Relative;
