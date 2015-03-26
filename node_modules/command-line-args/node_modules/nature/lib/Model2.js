var EventEmitter = require("events").EventEmitter,
    util = require("util");

module.exports = Model;

/**
@class
@classdesc 
*/
function Model(attributes){
    var self = this;
    var values = {};
    if (!attributes) throw new Error("Model constructor requires attributes");
    attributes.forEach(function(attribute){
        values[attribute.name] = attribute.value;
        Object.defineProperty(self, attribute.name, {
            enumerable: true,
            configurable: false,
            get: function(){
                attribute.type = attribute.type || String;
                var value = values[attribute.name];
                if (value === undefined || value === null){
                    return value;
                } else if (attribute.type === Array && Array.isArray(value)){
                    return value;
                } else {
                    return attribute.type(value);
                }
            },
            set: function(val){
                values[attribute.name] = val;
            }
        })
    });
}
// util.inherits(Model, EventEmitter);
