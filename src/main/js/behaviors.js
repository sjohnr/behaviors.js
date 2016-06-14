(function() {

  var Behaviors = require("./lib/Behaviors");
  Behaviors.Stylesheet = require("./lib/Stylesheet");
  Behaviors.Translator = require("./lib/Translator");
  Behaviors.Grammar = require("./lib/Grammar");
  Behaviors.Bindings = require("./lib/Bindings");
  Behaviors.Relative = require("./lib/Relative");
  Behaviors.Attributes = require("./lib/Attributes");

  // export module
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Behaviors;
  } else {
    window.Behaviors = Behaviors;
  }

  // register onload event
  if (typeof window !== "undefined") {
    window.addEventListener("load", Behaviors.load);
  }

})();