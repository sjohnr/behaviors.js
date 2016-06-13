"use strict";

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
    new Ajax.Request(url, { method: "get", onSuccess: Stylesheet.process });
  },
  /**
   * Process an Ajax response as a Behaviors Stylesheet.
   *
   * @param t The Ajax response object
   */
  process: function(t) {
    var rules = Stylesheet.parse(t.responseText);
    $H(rules).each(function(r) {
      var elements = $$(r.key);
      var attributes = r.value;
      elements.each(function(e) {
        if (!e.binding) {
          e.binding = e;
        }
        $H(attributes).each(function(a) {
          var fn = Attributes[a.key.camelize()];
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
    return Grammar.parse(s).first();
  }
};

console.log("Loaded Stylesheet module");
module.exports = Stylesheet;
