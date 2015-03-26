"use strict";
var ansi = require("ansi-escape-sequences");

exports["ansi-underline"] = function(input){
    return ansi.sgr.format(input, "underline");
};
