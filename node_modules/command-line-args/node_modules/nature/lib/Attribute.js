"use strict";
var a = require("array-tools"),
    t = require("typical");

module.exports = Attribute;

/**
Enforces strict type and value checking on thing properties
@class
*/
function Attribute(properties){
    var self = this,
        _required = properties.required || false,
        _invalidMsg = properties.invalidMsg,
        _type = properties.type,
        _valueTest = properties.valueTest,
        _value = properties.value,
        _valid,
        _validationMessages = [];

    if (!properties.name) throw new Error("must specify a name on the Attribute");

    function addValidationMessage(msg){
        _validationMessages.push(msg);
    }
    
    function validateValue(){
        if (_required){
            if (!_value) {
                addValidationMessage("Missing required value");
            }
        }
        
        if (_value !== undefined){
            if (typeof _type === "string"){
                if (typeof _value !== _type){
                    addValidationMessage(_value + " is not a " + _type);
                }
            } else if (typeof _type === "function"){
                /* instanceof doesn't work across contexts on node-webkit, workaround: */
                if (_value.constructor.name === _type.name || _value instanceof _type){
                    // ok 
                } else {
                    addValidationMessage("Value is not an instance of " + _type.name);
                }
            }
            
            a.arrayify(_valueTest).forEach(function(valueTest){
                if(valueTest instanceof RegExp){
                    /*
                    tested value must not be null or undefined, as `/\w+/.test(undefined)` returns true
                    */
                    if (_value){
                        if (!valueTest.test(_value)){
                            addValidationMessage("Failed valueTest: " + _value);
                        }
                    } else {
                        addValidationMessage("Failed valueTest: no value to test");
                    }
                } else if(typeof valueTest === "function"){
                    try{
                        var extras = {
                            addValidationMessage: addValidationMessage,
                            thing: properties.parent
                        };
                        var result = valueTest.call(extras, _value);
                        if (!result){
                            addValidationMessage("Failed valueTest function: " + _value);
                        }
                    } catch(e){
                        addValidationMessage("valueTest function crashed: " + e);
                    }
                } else {
                    if (_value !== valueTest){
                        addValidationMessage("value does not match valueTest");
                    }
                }
            });
        }
    }

    function validate(){
        _valid = true;
        _validationMessages.splice(0);
        validateValue();
        
        if (_validationMessages.length){
            _valid = false;
            if (self.invalidMsg) addValidationMessage(self.invalidMsg);

            if (self.throwOnInvalid){
                console.log("Property: " + self.name);
                console.log(_validationMessages.join("\n"));
                throw new Error("INVALID");
            }
        }
    }


    /**
    Gets/sets the property value. Will attempt to convert values to Number for definitions of `type` "number".
    @member {Any} value
    @memberof Attribute#
    */
    Object.defineProperty(this, "value", {
        enumerable: true,
        get: function getValue(){ return _value; },
        set: function setValue(newValue){
            var oldValue = _value;
            // typecast to Number
            if (this.type === "number" && t.isNumber(newValue)){
                _value = Number(newValue);

            // typecast to Array
            } else if (this.type === Array && newValue && !Array.isArray(newValue)){
                if (typeof newValue === "object"){
                    _value = [ newValue ];
                } else {
                    _value = newValue.toString().split(",").map(function(val){ return val.trim(); });
                }

            // typecast to RegExp
            } else if (this.type === RegExp && typeof newValue === "string"){
                try{
                    _value = new RegExp(newValue);
                } catch(e) {
                    _value = newValue;
                }

            // every other case, just set the value
            } else {
                _value = newValue;
            }

            if(typeof this.postSet === "function") this.postSet.call(this.parent, _value, oldValue);
            validate();
        }
    });

    /**
    @member {String | Function} type
    @memberof Attribute#
    @example
        thing.define({ name: "name", type: "string" });
        thing.define({ name: "created", type: Date });
        thing.define({ name: "onComplete", type: "function" });
        thing.define({ name: "data", type: JobData });
        thing.define({ name: "properties", type: Object });
        thing.define({ name: "files", type: Array });
    */
    Object.defineProperty(this, "type", {
        enumerable: true,
        get: function(){ return _type; },
        set: function(newValue){
            _type = newValue;
            validate();
        }
    });

    /**
    A regular expression, function or Array containing one or more of each. A value
    must return true for all to be valid.
    @member {Regexp | Function | Array} valueTest
    @memberof Attribute#
    @example
        thing.define({ name: "name", type: "string", valueTest: /\w{3}/ })
        thing.define({ name: "age", type: "number", valueTest: function(value){ return value > 16; } })
        thing.define({
            name: "colours",
            type: Array,
            valueTest: [
                /red/,
                function(colours){
                    return colours.length > 0;
                }
            ]
        });
    */
    Object.defineProperty(this, "valueTest", {
        enumerable: true,
        get: function(){ return _valueTest; },
        set: function(newValue){
            _valueTest = newValue;
            validate();
        }
    });

    /**
    Thing instance will remain invalid until a value is set
    @member {Boolean} required
    @memberof Attribute#
    */
    Object.defineProperty(this, "required", {
        enumerable: true,
        get: function(){ return _required; },
        set: function(newValue){
            _required = newValue;
            validate();
        }
    });

    /**
    @member {String} invalidMsg
    @memberof Attribute#
    */
    Object.defineProperty(this, "invalidMsg", {
        enumerable: true,
        get: function(){ return _invalidMsg; },
        set: function(newValue){
            _invalidMsg = newValue;
            validate();
        }
    });

    /**
    @member {Boolean} valid
    @memberof Attribute#
    @readonly
    */
    Object.defineProperty(this, "valid", {
        enumerable: true,
        get: function(){ return _valid; },
    });

    /**
    @member {Arrary} validationMessages
    @memberof Attribute#
    @readonly
    */
    Object.defineProperty(this, "validationMessages", {
        enumerable: true,
        get: function(){ return _validationMessages; },
    });

    /**
    @member {Array}
    */
    this.groups = properties.groups || [];

    /**
    @member {String}
    */
    this.name = properties.name;

    /**
    if unnamed values are passed to thing.set(), set them AS AN ARRAY on this property
    @member {Boolean}
    */
    this.defaultOption = properties.defaultOption;

    /**
    @member {String}
    */
    this.alias = properties.alias;

    /**
    @member {Boolean}
    */
    this.throwOnInvalid = properties.throwOnInvalid;
    
    /** @member {Function} */
    this.postSet = properties.postSet;
    
    /** @member {Model} */
    this.parent = properties.parent;

    validate();
}
