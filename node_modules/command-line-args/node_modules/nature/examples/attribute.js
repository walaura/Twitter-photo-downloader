var fullAttribute = {
    name: "attr", 
    type: "string",
    value: "something",
    setter: String.prototype.toUpperCase,
    getter: function(){ console.log("getting"); return this.value; },
    test: /regex/ or function(){}
    invalidMsg: "value must be correct"
}