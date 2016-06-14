"use strict";

var $ = require("jquery");
var _ = require("underscore");

/**
 * Adds relative attribute functions: minimum, maximum, equals.
 *
 * @param c The comparator function
 * @param a The attribute name
 * @param e1 The first element (the element to act upon)
 * @param s The selector to evaluate as an element to compare to
 */
function apply(c, a, e1, s) {
  var e2 = _.first($(s)); if (!e2) return;
  if (c(parseInt(e1.css(a)), parseInt(e2.css(a)))) {
    e1.css(a, e2.css(a));
  }
}

var Relative = _.reduce({
  "minimum": function(a, b) { return a < b; },
  "maximum": function(a, b) { return a > b; },
  "equals":  function(a, b) { return a == b; }
}, function(h, fn, a) {
  return h[a] = _.partial(apply, fn);
}, {});

// alias equals
Relative.equal = Relative.equals;

console.log("Loaded Relative module");
module.exports = Relative;
