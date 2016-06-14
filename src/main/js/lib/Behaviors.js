"use strict";

var _ = require("underscore");

var Stylesheet = require("./Stylesheet");

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
    _.chain(document.getElementsByTagName("link"))
        .filter(Stylesheet.test)
        .pluck("href")
        .each(Behaviors.process)
        .value();
  },
  /**
   * Load an individual Behaviors Stylesheet file by URL.
   */
  process: function(href) {
    Stylesheet.load(href);
  }
};

console.log("Loaded Behaviors module");
module.exports = Behaviors;
