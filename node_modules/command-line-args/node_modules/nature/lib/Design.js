var Model = require("./Model2"),
    a = require("array-tools");

module.exports = Design;

function Design(attributes){
    if (!(this instanceof Design)) return new Design(attributes);
    
    this._attributes = [];
    if (attributes){
        if (attributes.every(function(group){ return "groups" in group; })){
            var groups = attributes;
            for (var i = 0; i < groups.length; i++){
                this.define(groups[i].attributes, { groups: groups[i].groups });
            }
        } else if (attributes.every(function(attribute){ return "name" in attribute; })){
            this.define(attributes);
        } else {
            console.dir(attributes);
            throw new Error("Bad attribute data");
        }
    }
}

Design.prototype.create = function(){
    return new Model(this._attributes);
};
Design.prototype.define = function(attribute, options){
    if (Array.isArray(attribute)) {
        for (var i = 0; i < attribute.length; i++){
            this.define(attribute[i], options);
        }
        return;
    }
    
    if (options) {
        attribute.groups = a.arrayify(options.groups);
    }
    this._attributes.push(attribute);
};
Design.prototype.load = function(){};
Design.prototype.groups = function(){
    var groups = a.pluck(this._attributes, "groups");
    var flattened = groups.reduce(function(prev, curr){
        return prev.concat(curr);
    }, []);
    return a.unique(flattened);
};
Design.prototype.where = function(expression, model){
    var output = {};
    var iterator = new Function("attribute", expression);
    var attributes = this._attributes.filter(iterator);
    var names = a.pluck(attributes, "name");
    for (var i = 0; i < attributes.length; i++){
        output[names[i]] = model[names[i]];
    }
    
    return output;
};
