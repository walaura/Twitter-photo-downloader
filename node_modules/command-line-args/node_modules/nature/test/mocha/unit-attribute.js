"use strict";
var assert = require("assert"),
    Attribute = require("../lib/Attribute"),
    attr = null,
    l = console.log,
    d = function(attr){ return JSON.stringify(attr, null, "\t"); };

var CustomClass = function(){};

function lessThan10(value) {
    return value < 10;
}
function allLessThan10(arr){
    return arr.every(lessThan10);
}
function allFamily(arr){
    return arr.every(function(member){
        return (/^(dad|sister|brother|mother)$/).test(member);
    });
}
function allFamilyElse(arr){
    var self = this;
    return arr.every(function(member){
        if(/^(dad|sister|brother|mother)$/.test(member)){
            return true;
        } else {
            self.addValidationMessage("this one is invalid: " + member);
            return false;
        }
    });
}
function broken(){
    throw new Error("error");
}

function factory(name){
    var definitions = {
        name:   { name: "one" },
        string: { name: "one", type: "string" },
        number: { name: "one", type: "number" },
        bool:   { name: "one", type: "boolean" },
        func:   { name: "one", type: "function" },
        obj:    { name: "one", type: "object" },
        array:  { name: "one", type: Array },
        custom: { name: "one", type: CustomClass },
        date:   { name: "one", type: Date },
        regex:  { name: "one", type: RegExp }
    };
    return new Attribute(definitions[name]);
}

describe("Attribute", function(){
    describe("properties: ", function(){
        it("access to `this.config` in a `valueTest` function must fail if config is not set");
        it("should be ok to have an definition with no defined type");
        it("type: [Array, Function] should allow a type of either");

        describe(".valid", function(){
            it("valid if no type specified", function(){
                attr = factory("name");
                assert.strictEqual(attr.valid, true);
            });

            it("valid when value matches type", function(){
                attr = factory("string");
                attr.value = 123;
                assert.strictEqual(attr.valid, false);
                attr.value = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "test";
                assert.strictEqual(attr.valid, true);
                attr.value = function(){};
                assert.strictEqual(attr.valid, false);
                attr.value = {};
                assert.strictEqual(attr.valid, false);
                attr.value = [];
                assert.strictEqual(attr.valid, false);

                attr = factory("number");
                attr.value = 123;
                assert.strictEqual(attr.valid, true);
                attr.value = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "test";
                assert.strictEqual(attr.valid, false);
                attr.value = "123";
                assert.strictEqual(attr.valid, true); // numeric string gets typecast to Number
                attr.value = function(){};
                assert.strictEqual(attr.valid, false);
                attr.value = {};
                assert.strictEqual(attr.valid, false);
                attr.value = [];
                assert.strictEqual(attr.valid, false);

                attr = factory("bool");
                attr.value = 123;
                assert.strictEqual(attr.valid, false);
                attr.value = true;
                assert.strictEqual(attr.valid, true);
                attr.value = "test";
                assert.strictEqual(attr.valid, false);
                attr.value = "123";
                assert.strictEqual(attr.valid, false);
                attr.value = function(){};
                assert.strictEqual(attr.valid, false);
                attr.value = {};
                assert.strictEqual(attr.valid, false);
                attr.value = [];
                assert.strictEqual(attr.valid, false);

                attr = factory("func");
                attr.value = 123;
                assert.strictEqual(attr.valid, false);
                attr.value = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "test";
                assert.strictEqual(attr.valid, false);
                attr.value = "123";
                assert.strictEqual(attr.valid, false);
                attr.value = function(){};
                assert.strictEqual(attr.valid, true);
                attr.value = {};
                assert.strictEqual(attr.valid, false);
                attr.value = [];
                assert.strictEqual(attr.valid, false);

                attr = factory("obj");
                attr.value = 123;
                assert.strictEqual(attr.valid, false);
                attr.value = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "test";
                assert.strictEqual(attr.valid, false);
                attr.value = "123";
                assert.strictEqual(attr.valid, false);
                attr.value = function(){};
                assert.strictEqual(attr.valid, false);
                attr.value = {};
                assert.strictEqual(attr.valid, true);
                attr.value = [];
                assert.strictEqual(attr.valid, true);
            });

            it("valid when value instanceof type", function(){
                attr = factory("array");
                attr.value = 123;
                assert.strictEqual(attr.valid, true); // converted to Array
                assert.deepEqual(attr.value, [ 123 ]);
                attr.value = [];
                assert.strictEqual(attr.valid, true);
                assert.deepEqual(attr.value, [ ]);
                attr.value = {};
                assert.strictEqual(attr.valid, true);
                assert.deepEqual(attr.value, [ {} ]);
                attr.value = "a string";
                assert.strictEqual(attr.valid, true); // converted to Array
                assert.deepEqual(attr.value, [ "a string" ]);
                attr.value = new Date();
                assert.strictEqual(attr.valid, true); // converted to Array
                assert.ok(attr.value[0] instanceof Date);

                attr = factory("custom");
                attr.value = 123;
                assert.strictEqual(attr.valid, false);
                attr.value = [];
                assert.strictEqual(attr.valid, false);
                attr.value = {};
                assert.strictEqual(attr.valid, false);
                attr.value = new CustomClass();
                assert.strictEqual(attr.valid, true);

                attr = factory("date");
                attr.value = new Date();
                assert.strictEqual(attr.valid, true);
            });

            it("valid with .required", function(){
                /*
                required means 'value should be truthy'.
                not required permits a value to be undefined.
                */
                attr = factory("string");
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "";
                assert.strictEqual(attr.valid, false);
                attr.value = " ";
                assert.strictEqual(attr.valid, true);

                attr = factory("number");
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);
                attr.value = 0;
                assert.strictEqual(attr.valid, false);
                attr.value = 1;
                assert.strictEqual(attr.valid, true);

                attr = factory("array");
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);

                attr = factory("custom");
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);
            });
            
            it("valid with .required and .valueTest", function(){
                attr = factory("string");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /test/;
                assert.strictEqual(attr.valid, true);
                attr.value = "clive"
                assert.strictEqual(attr.valid, false);
                attr.value = "test"
                assert.strictEqual(attr.valid, true);
                attr.value = "";
                assert.strictEqual(attr.valid, false);
                attr.value = undefined;
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);

                attr = factory("number");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = lessThan10;
                assert.strictEqual(attr.valid, true);
                attr.value = "clive"
                assert.strictEqual(attr.valid, false);
                attr.value = 9
                assert.strictEqual(attr.valid, true);
                attr.value = 0;
                assert.strictEqual(attr.valid, true);
                attr.value = undefined;
                assert.strictEqual(attr.valid, true);
                attr.required = true;
                assert.strictEqual(attr.valid, false);
                attr.value = 0;
                assert.strictEqual(attr.valid, false);
                
                attr = factory("string");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /test/;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = 1;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = lessThan10;
                assert.strictEqual(attr.valid, true);
                
                attr = factory("number");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /test/;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = 1;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = lessThan10;
                assert.strictEqual(attr.valid, true);
                
                attr = factory("func");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /test/;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = 1;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = lessThan10;
                assert.strictEqual(attr.valid, true);
                
                attr = factory("array");
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /test/;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = 1;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = lessThan10;
                assert.strictEqual(attr.valid, true);
            });

            it("valid with RegExp .valueTest", function(){
                /*
                any definition with a valueTest should always be tested. Required is implied.
                */
                attr = factory("string");
                attr.valueTest = /test/;
                attr.required = true;
                assert.strictEqual(attr.valid, false);
                attr.value = "test";
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /tast/;
                assert.strictEqual(attr.valid, false);

                attr.valueTest = /^(dad|sister|brother|mother)$/;
                attr.value = "dog";
                assert.strictEqual(attr.valid, false);
                attr.value = "dad";
                assert.strictEqual(attr.valid, true);

                attr.type = Array;
                attr.valueTest = /(dad|sister|brother|mother)/;
                attr.value = ["dad", "sister", "dog"];
                assert.strictEqual(attr.valid, true);
            });

            it("valid with primitive .valueTest", function(){
                attr = factory("bool");
                attr.valueTest = false;
                attr.value = false;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = /true/;
                assert.strictEqual(attr.valid, false);
                attr.valueTest = "false";
                assert.strictEqual(attr.valid, false);

                attr = factory("number");
                attr.valueTest = 5;
                attr.value = 5;
                assert.strictEqual(attr.valid, true);
                attr.valueTest = 4;
                assert.strictEqual(attr.valid, false);
                attr.valueTest = "5";
                assert.strictEqual(attr.valid, false);
            });

            it("valid with function .validTest", function(){
                attr = factory("number");
                attr.valueTest = lessThan10;
                attr.value = 4;
                assert.strictEqual(attr.valid, true);

                attr.value = 11;
                assert.strictEqual(attr.valid, false);

                attr = factory("array");
                attr.valueTest = allLessThan10;
                attr.value = [0,4,6];
                assert.strictEqual(attr.valid, true);

                attr.value = [0,4,16];
                assert.strictEqual(attr.valid, false);

                attr.valueTest = allFamily;
                attr.value = ["dad", "sister", "dog"];
                assert.strictEqual(attr.valid, false);
            });

            it("`valid` should accept and test an array of functions");

            describe("bad usage", function(){
                it("valid with function .validTest - function throws", function(){
                    attr = factory("array");
                    attr.valueTest = broken;
                    attr.value = ["test"];
                    assert.strictEqual(attr.valid, false);
                });
            });
        });

        describe(".validationMessages", function(){
            it("with no .invalidMsg", function(){
                attr = factory("string");
                attr.value = "ok";
                assert.strictEqual(attr.validationMessages.length, 0);

                attr.type = "number";
                assert.strictEqual(attr.validationMessages.length, 1);

                attr.type = RegExp;
                assert.strictEqual(attr.validationMessages.length, 1);
            });

            it("with .invalidMsg", function(){
                attr = factory("array");
                attr.valueTest = allLessThan10;
                attr.invalidMsg = "every value must be less than 10";

                attr.value = [11];
                assert.strictEqual(attr.validationMessages[1], "every value must be less than 10");

                attr.value = [1];
                assert.deepEqual(attr.validationMessages, []);
                
                attr = factory("regex");
                attr.invalidMsg = "pass a regex";
                attr.value = "ok";
                assert.strictEqual(attr.validationMessages.length, 0);

                attr.value = "+++";
                assert.strictEqual(attr.validationMessages.length, 2);
                assert.strictEqual(attr.validationMessages[1], "pass a regex");
            });

            it("raised from .validTest function", function(){
                attr = factory("array");
                attr.value = ["dad", "sister", "dog"];
                attr.valueTest = allFamilyElse;
                attr.invalidMsg = "every member must be valid";
                assert.strictEqual(attr.valid, false);
                assert.strictEqual(attr.validationMessages.length, 3);
            });
        });

        describe(".value", function(){
            it("typecasting with number", function(){
                attr = factory("number");
                attr.value = "3";
                assert.strictEqual(attr.value, 3);
                attr.value = "0";
                assert.strictEqual(attr.value, 0);
                attr.value = "-1";
                assert.strictEqual(attr.value, -1);
                attr.value = -1.5345;
                assert.strictEqual(attr.value, -1.5345);
                attr.value = "-1.5345";
                assert.strictEqual(attr.value, -1.5345);
                attr.value = "a";
                assert.strictEqual(attr.value, "a");
                attr.value = "";
                assert.strictEqual(attr.value, "");
                attr.value = true;
                assert.strictEqual(attr.value, true);
                attr.value = CustomClass;
                assert.strictEqual(attr.value, CustomClass);
                attr.value = null;
                assert.strictEqual(attr.value, null);
                attr.value = undefined;
                assert.strictEqual(attr.value, undefined);
            });

            it("typecasting with RegExp", function(){
                attr = factory("regex");
                attr.value = "\\w{4}";
                assert.ok(attr.value instanceof RegExp, attr.value);
                assert.deepEqual(attr.value, /\w{4}/);

                attr.value = "ok";
                assert.ok(attr.value instanceof RegExp);
                assert.deepEqual(attr.value, /ok/);

                attr.value = "+++";
                assert.ok(!(attr.value instanceof RegExp));
                assert.strictEqual(attr.value, "+++");

            });
        });
        
        describe(".type", function(){});
        describe(".valueTest", function(){});
        describe(".required", function(){});
        describe(".invalidMsg", function(){});
        describe(".groups", function(){});
        describe(".name", function(){});
        describe(".defaultOption", function(){});
        describe(".alias", function(){});
        describe(".throwOnInvalid", function(){});
        
    });
});
