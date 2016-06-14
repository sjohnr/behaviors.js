"use strict";

var g = {}, o = require("parser-generator").Operators, t = require("./Translator");

// basic tokens
g.lbrace = o.token("{");
g.rbrace = o.token("}");
g.lparen = o.token(/\(/);
g.rparen = o.token(/\)/);
g.colon = o.token(":");
g.semicolon = o.token(";");
// comments
g.inlineComment = o.token(/\x2F\x2F[^\n]*\n/);
g.multilineComment = o.token(/\x2F\x2A(.|\n)*?\x2A\x2F/);
g.comments = o.ignore(o.any(g.inlineComment, g.multilineComment));
// attributes
g.attrName = o.token(/[\w\-\d]+/);
g.attrValue = o.token(/[^;\}]+/);
g.attr = o.each(g.attrName, g.colon, g.attrValue, g.semicolon);
g.attrList = o.many(o.any(g.comments, g.attr));
// style rules
g.style = o.process(o.between(g.lbrace, g.attrList, g.rbrace), t.style);
g.selector = o.token(/[^\{]+/);
g.rule = o.each(g.selector, g.style);
g.rules = o.process(o.many(o.any(g.comments, g.rule)), t.rules);

var Grammar = {
  parse: g.rules
};

console.log("Loaded Grammar module");
module.exports = Grammar;
