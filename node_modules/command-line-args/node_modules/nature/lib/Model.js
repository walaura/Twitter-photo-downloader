"use strict";
var util = require("util"),
    path = require("path"),
    o = require("object-tools"),
    a = require("array-tools"),
    t = require("typical"),
    Attribute = require("./Attribute"),
    EventEmitter = require("events").EventEmitter;

var l = console.log;

module.exports = Model;

function initInstanceVars(model, options){
    if (!model._definitions){
        Object.defineProperty(model, "_definitions", { enumerable: false, configurable: false, value: {} });
    }
    if (!model._errors) {
        Object.defineProperty(model, "_errors", { enumerable: false, configurable: false, value: [] });
    }
    Object.defineProperty(model, "_throwOnInvalid", {
        enumerable: false, configurable: false, writable: false,
        value: options && options.throwOnInvalid
    });
}

function error(model, err){
    initInstanceVars(model);
    model._errors.push(err);
    model.emit("error", err);
}

/*
used internally to return a definition from alias or full name
*/
function getDefinition(model, property){
    var item = model._definitions[property];
    if (item !== undefined){
        return typeof item === "string"
            ? model._definitions[item]
            : item;
    }
};

/**
The base class for some Model. Example models:

* Application property list (version, update, help)
* An Output style (verbosity level, dry-run)
* CRUD capability (add, remove, list, update)

more specific models:

* Secure database configuration (username, complex password, remote host IP)
* Video file list (video files, recursively searched, excludes hidden files)
* Young lad (name, male, between 11-19 years old)

or a hybrid of models

* A Video file list with CRUD capability

To define Models, first load the class

    var Model = require("nature").Model;

get an instance and start defining

    var youngLad = new Model()
        .define({ name: "firstname" });

    youngLad.firstname = "Geoff";
    youngLad.car = "Clio"; // Ignored, `car` is not yet defined and Model instances are sealed (object non-extensible, properties non-configurable).

Add type checking

    // additional calls to define() redefine an existing property, or add new property definitions.
    youngLad.define({ name: "firstname", type: "string" })
        .define({ name: "DOB", type: Date });

    var dob = new Date("19 Feb 2000");
    youngLad.DOB = dob; // valid, `dob` is an instance of `Date`
    youngLad.firstname = dob; // invalid, `typeof dob` is not `"string"`

Add value testing

    youngLad.define({ name: "gender", type: "string", valueTest: /^(male|female)$/ });

    youngLad.gender = "man"; // invalid
    youngLad.gender = "male"; // valid

Value tests can be a function

    function oldEnough(age){ return age >= 11; }
    youngLad.define({ name: "age", type: "number", valueTest: oldEnough });

    youngLad.age = 9; // invalid, too young

Or an array of tests, which must all pass

    function oldEnough(age){ return age >= 11; }
    function youngEnough(age){ return age <= 19; }
    youngLad.define({ name: "age", type: "number", valueTest: [oldEnough, youngEnough] });

    youngLad.age = 29; // invalid, too old!

Invalid data doesn't throw an error so check the `valid` flag and `validationMessages`

    if (!youngLad.valid){
        console.log(youngLad.validationMessages); // prints "Invalid age: 22"
    }

Add custom validationMessages

    // you could also set `validFail` property using `define`, either is fine
    youngLad._definitionList["age"].validFail = "You must be 16-21";

    youngLad.set("age", 9); // invalid
    console.log(youngLad.validationMessages); // prints "You must be 16-21"

Mix and match..

    var appearance = new Model()
        .define({ name: "style", type: "string" })
        .define({ name: "labels", type: Array });

    youngLad.mixIn(appearance);

Load data in bulk

    youngLad.set({
        firstname: "Paul",
        age: 19,
        style: "understated class with a grassroot drizzle",
        labels: [ "Paul Smith", "Burberry", "Nike" ]
    });

Besides object literals you can load from the command line, environment or file

    youngLad.set(process.argv);
    youngLad.set(process.env);
    youngLad.set("./profile.json");

Other ways of retrieving values

    youngLad.toJSON(); // get entire set
    youngLad.where({ group: "primary" }).toJSON(); // get sub-set

@class Model
@constructor
*/
function Model(options){
    initInstanceVars(this, options);
}
util.inherits(Model, EventEmitter);
/**
Define an property
@method define
@chainable
@param {String | Array} [groups] The group or groups to add the new property definition to
@param {Object | Attribute | Array} definitions The new property definitions
@example
    var vehicleModel = new Model()
        .define({ name: "maxSpeed", type: "number", alias: "m", valueTest: /\d+/, default: 4 })
        .define({ name: "isTaxed", type: "boolean", default: false })
        .define("specifications", [
            { name: "engineSize", type: "number" },
            { name: "wheels", type: "number" }
        ]);
*/
Model.prototype.define = function(){
    var definition,
        self = this;

    initInstanceVars(this);

    if (arguments.length === 0){
        error(this, new Error("missing definition"));
    } else if (arguments.length === 1 ){
        // define(propertyDefinition)
        if (typeof arguments[0] === "object" && !Array.isArray(arguments[0])){
            definition = arguments[0];

        // define(propertyDefinitionArray)
        } else if (Array.isArray(arguments[0])) {
            var propertyDefinitionArray = arguments[0];
            propertyDefinitionArray.forEach(function(def){
                self.define(def);
            });
            return this;

        } else {
            error(this, new Error("Please pass a single or array of property definitions"));
        }

    } else if (arguments.length === 2){
        var groups = Array.isArray(arguments[0])
            ? arguments[0]
            : [arguments[0]];

        // define(groups, definitionArray)
        if (Array.isArray(arguments[1])){
            var definitionArray = arguments[1];
            definitionArray.forEach(function(definition){
                self.define(groups, definition);
            });
            return self;
        } else {
            definition = arguments[1];
            definition.groups = groups;
        }

    }

    // set the parent model on the definition
    definition.parent = this;

    definition.throwOnInvalid = this._throwOnInvalid;

    if (!(definition instanceof Attribute)){
        definition = new Attribute(definition);
    }

    var name = definition.name;

    // duplication checks
    var existingDef = this._definitions[name];
    if (typeof existingDef !== "undefined"){
        delete this._definitions[existingDef.alias];
        delete this._definitions[name];
    }
    if (definition.alias && typeof this._definitions[definition.alias] !== "undefined"){
        error(this, new Error("Cannot create property, alias already exists: " + definition.alias));
    }

    // create alias
    if (definition.alias !== undefined){
        this._definitions[definition.alias] = name;
    }

    this._definitions[name] = definition;

    Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,
        get: function(){ return this._definitions[name].value; },
        set: function(val){ return this.set(name, val); }
    });
    return this;
};

/**
@property definitions
@type Object
*/
Object.defineProperty(Model.prototype, "_definitionList", { enumerable: false, get: getDefinitions });
function getDefinitions(){
    initInstanceVars(this);
    var output = {};
    for (var prop in this._definitions){
        var def = this._definitions[prop];
        if (typeof def !== "string"){
            output[prop] = def;
        }
    }
    return output;
}

function setModel(incoming, target){
    for (var property in incoming._definitionList){
        target.set(property, incoming[property]);
    }
}
function setPlainObject(incoming, target){
    for (var property in incoming){
        target.set(property, incoming[property]);
    }
}


function setArray(array, target){
    var arrayItems = array.slice(0),
        item,
        defaultValues = [];

    if (array === process.argv){
        arrayItems.splice(0, 2);
    }
    while (typeof (item = arrayItems.shift()) !== "undefined"){
        var propertyPattern = /^-{1,2}/,
            property = "";
        if(propertyPattern.test(item)){
            property = item.replace(propertyPattern, "");
            var def = getDefinition(target, property);
            if (def){
                if(def.type === "boolean"){
                    target.set(property, true);
                } else if (arrayItems.length) {
                    target.set(property, arrayItems.shift());
                }
            } else {
                error(target, new Error("invalid property: " + property));
            }
        } else {
            defaultValues.push(item);
        }
    }

    if (defaultValues.length > 0){
        o.each(target._definitions, function(definition, propertyName){
            if (definition.defaultOption){
                if (definition.type === Array || definition.type.name === "Array" || Array.isArray(definition.value) ){
                    if (Array.isArray(target[propertyName])){
                        target[propertyName] = target[propertyName].concat(defaultValues);
                    } else {
                        target.set(propertyName, defaultValues);
                    }
                } else {
                    target.set(propertyName, defaultValues[0]);
                }
            }
        });
    }
}

/**
Set a value on the specified property
@method set
@param {Model | Object | String | Array} property Pass a Model instance, string to set a single value, an object to set multiple values
@param {Any} value
@chainable
*/
Model.prototype.set = function set(property, value){
    // l("set", property, value)
    var self = this;
    initInstanceVars(this);
    
    if (property){
        if (property instanceof Model){
            setModel(property, this);
            
        } else if (t.isPlainObject(property)){
            setPlainObject(property, this);

        } else if (Array.isArray(property)){
            setArray(property, this);
            
        } else {
            var definition = this._definitions[property];
            if (definition !== undefined){
                // alias
                if (typeof definition === "string"){
                    this.set(definition, value);
                }
                // normal
                else {
                    definition.value = value;
                }
            } else {
                error(this, new Error("invalid property: " + property));
            }
        }
    }

    return this;
};

/**
@property valid
@type Boolean
*/
Object.defineProperty(Model.prototype, "valid", {
    enumerable: true,
    configurable: true,
    get: function() {
        initInstanceVars(this);
        return this._errors.length === 0 && o.every(this._definitionList, function(def, name){
            return def.valid;
        });
    }
});

/**
An array containing a list of invalid properties
@property validationMessages
@type Array
*/
Object.defineProperty(Model.prototype, "validationMessages", {
    enumerable: true,
    get: function(){
        var output = [],
            self = this,
            validationMessages;
        for (var property in this._definitionList){
            validationMessages = this._definitionList[property].validationMessages;
            if (validationMessages.length){
                output = output.concat({
                    property: property,
                    validationMessages: validationMessages
                });
            }
        }

        output.toString = function(){
            var toString = "";
            this.forEach(function(prop){
                prop.validationMessages.forEach(function(msg){
                    toString += prop.property + ":\t" + msg + "\n";
                });
            });
            return toString;
        };

        return output;
    }
});

/**
Groups a property
@method group
@param {String} groupName The group
@chainable
*/
Model.prototype.group = function(groupName, propertyArray){
    var self = this;

    if (propertyArray){
        if (!Array.isArray(propertyArray))
            propertyArray = [propertyArray];

        propertyArray.forEach(function(propertyName){
            var definition = self._definitionList[propertyName];
            if (definition.groups.indexOf(groupName) === -1){
                definition.groups.push(groupName);
            }
        });
    } else {
        for (var property in this._definitionList){
            var definition = this._definitionList[property];
            if (definition.groups.indexOf(groupName) === -1){
                definition.groups.push(groupName);
            }
        }
    }

    return this;
};

/**
@method ungroup
@param String groupName
@param Array [propertyNames]
@chainable
@example
    model.ungroup("video");
    model.ungroup("video", ["stereo", "channels"]);
*/
Model.prototype.ungroup = function(groupName, propertyNameArray){
    var self = this;
    if (propertyNameArray){
        if (!Array.isArray(propertyNameArray)){
            propertyNameArray = [propertyNameArray];
        }
        propertyNameArray.forEach(function(propertyName){
            var definition = self._definitionList[propertyName];
            if (definition){
                definition.groups = a.without(definition.groups, groupName);
            } else {
                error(this, new Error("property does not exist: " + propertyName));
            }
        });
    } else {
        for (var property in this._definitionList){
            var definition = this._definitionList[property];
            definition.groups = a.without(definition.groups, groupName);
        }
    }
    return this;
};

/**
returns a new model instance containing a subset of the properties
@method where
@param {Object} filterOptions Mongo style query
@return {Model} A new Model instance with the filters applied
@example
    var excludeProperties = model.where({
        name: { $ne: ["preset-list", "help", "scan", "title" ] }
    });

    var certainGroup = model.where({ group: "handbrake" });
*/
Model.prototype.where = function(filterOptions){
    var result = new Model(),
        isTruthy = function(i){ return i; };

    for (var propertyName in this._definitionList){
        var definition = this._definitionList[propertyName],
            tests = [];

        if (filterOptions.group){
            tests.push(definition.groups.indexOf(filterOptions.group) > -1);
        }

        if (filterOptions.name){
            var query = filterOptions.name;
            if ("$ne" in query){
                tests.push(query.$ne.indexOf(definition.name) === -1);
            }
        }

        if (tests.every(isTruthy)){
            result.define(definition);
        }
    }

    return result;
};

/**
Returns the set properties as an array suitable for passing to say, Child_Process.
@method toArray
@param quote {Boolean} Set to true to wrap the properties values in double quotes
@return Array
*/
Model.prototype.toArray = function(quote){
    var output = [];
    for (var property in this._definitionList){
        if (this[property] !== undefined){
            output.push("--" + property);
            if (quote){
                output.push("\"" + this[property] + "\"");
            } else {
                output.push(this[property]);
            }
        }
    }
    return output;
};


/**
@method toJSON
@return {Object} Containing property/value pairs
*/
Model.prototype.toJSON = function() {
    var output = {};
    o.each(this._definitionList, function(def, key){
        if (def.value !== undefined){
            output[key] = def.value;
        }
    });
    return output;
};

/**
Mix in properties from another model instance
@method mixIn
@chainable
@param {Model} model The model instance to mix in
@param {String | Array} [groups] The group or groups to put the added properties in
*/
Model.prototype.mixIn = function(model, groups){
    if (model instanceof Model){
        for (var property in model._definitionList){
            if (groups){
                this.define(groups, model._definitionList[property]);
            } else {
                this.define(model._definitionList[property]);
            }
        }
    } else {
        error(this, new Error("mixIn: must pass in an instance of Model"));
    }
    return this;
};
