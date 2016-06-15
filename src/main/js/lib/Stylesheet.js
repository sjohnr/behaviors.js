"use strict";

var $ = require("jquery");
var _ = require("underscore");
var _camelize = require("underscore.string/camelize");
_.camelize = _camelize;

var Grammar = require("./Grammar");
var Attributes = require("./Attributes");

var Stylesheet = {
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
    $.get(url, {}, Stylesheet.process);
  },
  /**
   * Process an Ajax response as a Behaviors Stylesheet.
   *
   * @param response The Ajax response
   */
  process: function(response) {
    var rules = Stylesheet.parse(response);
    _.each(rules, function(attributes, selector) {
      var elements = $(selector);
      _.each(elements, function(e) {
        if (!e.binding) {
          e.binding = e;
        }
        _.each(attributes, function(value, name) {
          var fn = Attributes[_.camelize(name)] || Attributes[name];
          try {
            fn ? fn(e, value, name) : null;
          } catch (ex) {
            if (window.console) {
              console.log(ex);
              console.log("@ " + selector + " { " + name + ": " + value + "; }");
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
    return _.first(Grammar.parse(s));
  }
};

console.log("Loaded Stylesheet module");
module.exports = Stylesheet;
