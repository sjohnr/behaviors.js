"use strict";

var _ = require("underscore");

var Translator = {
  /**
   * Translate style attributes an associative array.
   *
   * @param attrs The attributes parse tree
   */
  style: function (attrs) {
    return _.reduce(attrs, function (h, a) {
      if (a) {
        h[a[0]] = a[2];
      }

      return h;
    }, {});
  },
  /**
   * Translate rules to an associative array.
   *
   * @param rx The rules parse tree
   */
  rules: function (rx) {
    return _.reduce(rx, function (h, r) {
      if (r) {
        h[r[0]] = r[1];
      }

      return h;
    }, {});
  }
};

console.log("Loaded Translator module");
module.exports = Translator;
