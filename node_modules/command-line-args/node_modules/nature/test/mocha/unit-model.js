var assert = require("assert"),
    w = require("wodge"),
    Model = require("../lib/Model"),
    Attribute = require("../lib/Attribute"),
    l = console.log;

function factory(name, type){
    var definitions = {
        name:   { name: name },
        string: { name: name, type: "string" },
        number: { name: name, type: "number" },
        bool:   { name: name, type: "boolean" },
        func:   { name: name, type: "function" },
        obj:    { name: name, type: "object" },
        array:  { name: name, type: Array },
        custom: { name: name, type: CustomClass },
        date:   { name: name, type: Date },
        regex:  { name: name, type: RegExp }
    };
    return new Attribute(definitions[name]);
}

describe("Model", function(){
    var _thing;
    beforeEach(function(){
        _thing = new Model();
    });

    describe("properties:", function(){
        describe(".valid", function(){
            it("return true when all values valid", function(){
                _thing.define({ name: "one", type: "number", value: 1 });
                assert.strictEqual(_thing.valid, true);
                _thing.define({ name: "two", type: "number", value: -1034.1 });
                assert.strictEqual(_thing.valid, true);
                _thing.define({ name: "three", type: "number", value: "Cazzo" });
                assert.strictEqual(_thing.valid, false);
            });
        });

        describe(".validationMessages", function(){
            it("return array of invalid messages", function(){
                _thing.define({ name: "one", type: Array, value: 1 });
                _thing.define({ name: "two", type: "string", value: 1 });
                _thing.define({ name: "three", type: RegExp, value: 1 });
                _thing.define({ name: "four", type: "string", value: "clive", valueTest: /test/ });
                _thing.define({ name: "five", type: Array, value: "clive", valueTest: function (val){
                    return val.length === 0;
                }});
                _thing.define({ name: "six",type: "number", value: 1 });
                assert.ok(_thing.validationMessages.length === 5, JSON.stringify(_thing.validationMessages));
            });
        });
    });

    describe("methods: ", function(){
        describe(".define", function(){
            it("define(definition) and definition(name) should set and retrieve", function(){
                var definition = { name: "one", type: "string", value: "one" };
                _thing.define(definition);

                assert.strictEqual(definition.type, _thing._definitionList["one"].type);
                assert.strictEqual(definition.value, _thing._definitionList["one"].value);
                assert.strictEqual(_thing.one, "one");
            });

            it("define(existingAttribute) should redefine definition", function(){
                _thing.define({ name: "one", type: "number" });
                assert.strictEqual(_thing._definitionList["one"].type, "number");
                _thing.define({ name: "one", type: "string" });
                assert.strictEqual(_thing._definitionList["one"].type, "string");
            });

            it("define(PropertyAttribute) and retrieve with definition(name)", function(){
                var def = new Attribute({ name: "one", "type": "number" });
                _thing.define(def);

                assert.strictEqual(def, _thing._definitionList["one"]);
            });

            it("definition(name) should return defined properties", function(){
                function testValid(){}
                _thing.define({ name: "one", "type": "number", alias: "o", valueTest: testValid });

                assert.strictEqual(_thing._definitionList["one"].type, "number");
                assert.strictEqual(_thing._definitionList["one"].alias, "o");
                assert.strictEqual(_thing._definitionList["one"].valueTest, testValid);
            });

            it("define() should work the same with a `definition.value` as set()");

            it("grouping", function(){
                _thing
                    .define("group1", [
                        { name: "one", type: "boolean" },
                        { name: "two", type: "string" }
                    ])
                    .define("group2", { name: "three", type: "number"});

                assert.deepEqual(_thing._definitionList["one"].groups, ["group1"]);
                assert.deepEqual(_thing._definitionList["two"].groups, ["group1"]);
                assert.deepEqual(_thing._definitionList["three"].groups, ["group2"]);
            });

            it("define(definition) should not throw on duplicate property, updating it instead", function(){
                _thing.define({ name: "yeah", type: "string" });

                assert.doesNotThrow(function(){
                    _thing.define({ name: "yeah", type: "boolean", validTest: /\w+/ });
                });
                assert.strictEqual(_thing._definitionList["yeah"].type, "boolean");
                // assert.strictEqual(_thing._definitionList["yeah"].validTest, /\w+/);
            });

            it("define(definition) should throw on duplicate alias", function(){
                _thing.define({ name: "three", alias: "t" });

                assert.throws(function(){
                    _thing.define({ name: "four", alias: "t" });
                });
            });
        });
        
        describe(".undefine", function(){});
            
        describe("read property value", function(){
            it("read property with no value set", function(){
                _thing.define({ name: "one", type: "number" });
                assert.strictEqual(_thing.one, undefined);
            });

            it("read property with value set", function(){
                _thing.define({ name: "one", type: "number", value: 1 });
                assert.strictEqual(_thing.one, 1);
            });

            it("read property should return undefined on unregistered property", function(){
                assert.strictEqual(_thing.yeah, undefined);
            });
        });

        describe(".set", function(){
            it("set(property, array)", function(){
                _thing.define({ name: "one", type: Array });
                _thing.set("one", [0, 1]);

                assert.deepEqual(_thing.one, [0, 1]);
            })

            it("set(property, string)", function(){
                _thing.define({ name: "test", type: "string" });
                _thing.set("test", "testset");

                assert.strictEqual(_thing.test, "testset");
            });

            it("set(alias, string)", function(){
                var val = "test";
                _thing.define({ name: "test", type: "string", alias: "d" });
                _thing.set("d", val);

                assert.strictEqual(_thing.test, val);
            });

            it("set(string) on a type Array", function(){
                _thing.define({ name:"one", type: Array });
                _thing.set(["--one", "test ,1    , false"]);
                assert.deepEqual(_thing.one, ["test", "1", "false"]);
                _thing.set("one", "test ,  2    , false");
                assert.deepEqual(_thing.one, ["test", "2", "false"]);
            });

            describe("set values in bulk", function(){
                it("set(object)", function(){
                    _thing.define({ name: "one", type: "number" })
                        .define({ name: "two", type: "number" })
                        .define({ name: "three", type: "number" });

                    _thing.set({ one: 1, two: 2, three: 3 });

                    assert.strictEqual(_thing.one, 1);
                    assert.strictEqual(_thing.two, 2);
                    assert.strictEqual(_thing.three, 3);
                });

                it("set(thing)", function(){
                    _thing.define({ name: "one", type: "number" })
                        .define({ name: "two", type: "number" })
                        .define({ name: "three", type: "number" });

                    var thing2 = new Model()
                        .define({ name: "one", type: "number", value: -1 })
                        .define({ name: "two", type: "number", value: -2 })
                        .define({ name: "three", type: "number", value: -3 })

                    _thing.set(thing2);

                    assert.strictEqual(_thing.one, -1);
                    assert.strictEqual(_thing.two, -2);
                    assert.strictEqual(_thing.three, -3);

                });

                it("set(array)", function(){
                    var argv = ["-d", "--preset", "dope", "--recurse", "music", "film", "documentary"];
                    _thing
                        .define({ name: "detailed", alias: "d", type: "boolean" })
                        .define({ name: "recurse", type: "boolean" })
                        .define({ name: "preset", type: "string" })
                        .define({ name: "files", type: Array, defaultOption: true })
                        .set(argv);

                    assert.strictEqual(_thing.detailed, true);
                    assert.strictEqual(_thing.recurse, true);
                    assert.strictEqual(_thing.preset, "dope");
                    assert.deepEqual(_thing.files, ["music", "film", "documentary"]);
                });

                it("set(process.argv)", function(){
                    process.argv = ["node", "test.js", "-d", "--preset", "dope", "--recurse", "music", "film", "documentary"];
                    _thing
                        .define({ name: "detailed", alias: "d", type: "boolean" })
                        .define({ name: "recurse", type: "boolean" })
                        .define({ name: "preset", type: "string" })
                        .define({ name: "files", type: Array, defaultOption: true })
                        .set(process.argv);

                    assert.strictEqual(_thing.detailed, true);
                    assert.strictEqual(_thing.recurse, true);
                    assert.strictEqual(_thing.preset, "dope");
                    assert.deepEqual(_thing.files, ["music", "film", "documentary"]);
                });

                it("set(process.argv) should set correct defaults", function(){
                    process.argv = [
                        "/usr/local/bin/node", "/usr/local/bin/rename", "file1.test","file2.test",
                        "file3.test", "file4.test", "file5.test",
                        "-d", "-r"
                    ];
                    _thing
                        .define({
                            name: "files",
                            type: Array,
                            required: true,
                            defaultOption: true,
                            value: []
                        })
                        .define({ name: "find", type: "string" })
                        .define({ name: "make", type: "string", value: "pie" })
                        .define({ name: "num", type: "number" })
                        .define({ name: "num2", type: "number", value: 10 })
                        .define({ name: "replace", type: "string", alias: "r", value: "" })
                        .define({ name: "dry-run", type: "boolean", alias: "d" })
                        .set(process.argv);

                    assert.strictEqual(_thing.make, "pie");
                    assert.strictEqual(_thing.replace, "");
                    assert.strictEqual(_thing.num, undefined);
                    assert.strictEqual(_thing.num2, 10);
                    assert.strictEqual(_thing["dry-run"], true);
                    assert.deepEqual(_thing.files, ["file1.test", "file2.test", "file3.test", "file4.test", "file5.test"]);
                });

                it("set(['--property', '--value']) should set correctly, where 'property' expects a value", function(){
                    _thing.define({ name: "one", type: "string" });
                    _thing.set([ "--one", "--23" ]);
                    assert.deepEqual(_thing.one, "--23");
                    _thing.set([ "--one", "" ]);
                    assert.deepEqual(_thing.one, "");
                });

                it("set(array) with a defaultOption of type Array", function(){
                    _thing.define({ name: "one", type: Array, defaultOption: true });
                    _thing.set(["test", 1, false]);

                    assert.deepEqual(_thing.one, ["test", 1, false]);
                });

                it("set(array) with a defaultOption of type string", function(){
                    _thing.define({ name: "one", type: "string", defaultOption: true });
                    _thing.set(["test", 1, false]);

                    assert.strictEqual(_thing.one, "test");
                });

                it("set(array) with a `defaultOption` of type number", function(){
                    _thing.define({ name: "one", type: "number", defaultOption: true });
                    _thing.set([1, 4, 5]);

                    assert.strictEqual(_thing.one, 1);
                });

                it("set(array) should ammend defaultOption items", function(){
                    _thing.define({ name: "do", type: "string" });
                    _thing.define({ name: "when", type: Array, defaultOption: true });
                    _thing.define({ name: "change", type: "boolean" });
                    _thing.set([ 
                        '--do',
                        'tmp/balders.sh',
                        '--when',
                        'lib/Handbrake.js',
                        'lib/HandbrakeOptions.js',
                        'lib/handbrake-js.js',
                        'lib/progress.js',
                        '--change' 
                    ]);
                    /* --when is set initially with 'lib/Handbrake.js', the defaultOptions 
                    where overwriting the initial value  */
                    assert.strictEqual(_thing.when.length, 4);
                });

                it("should throw on empty property, i.e. 'rename -' or '--'");
            });

            describe("Error handling", function(){
                it("set(property, value) should emit 'error' on unregistered property", function(){
                    assert.throws(function(){
                        _thing.set("yeah", "test");
                    });
                    assert.strictEqual(_thing.valid, false);
                    assert.strictEqual(_thing._errors.length, 1);
                });

                it("catching 'error' surpresses throw on bad set()", function(){
                    _thing.on("error", function(err){
                        assert.ok(err);
                    });
                    assert.doesNotThrow(function(){
                        _thing.set("yeah", "test");
                    });
                    assert.strictEqual(_thing.valid, false);
                    assert.strictEqual(_thing._errors.length, 1);
                });

                it("set([--property, value]) should emit 'error' on unregistered property", function(){
                    assert.throws(function(){
                        _thing.set(["--asdklfjlkd"]);
                    });
                    assert.strictEqual(_thing.valid, false);
                    assert.strictEqual(_thing._errors.length, 1);
                });

                it("set(propertiesArray) should not alter propertiesArray itself", function(){
                    var args = [ "--one", 1, "--two", 2, "--three", 3 ];
                    _thing
                        .define({ name: "one", type: "number", value: -1 })
                        .define({ name: "two", type: "number", value: -2 })
                        .define({ name: "three", type: "number", value: -3 });

                    assert.deepEqual(args, [ "--one", 1, "--two", 2, "--three", 3 ]);
                    _thing.set(args);
                    assert.deepEqual(args, [ "--one", 1, "--two", 2, "--three", 3 ]);
                });
            });
        });

        describe(".mixin", function(){
            it("mixin(thing)", function(){
                _thing.define({ name: "year", type: "number", value: 2013 });
                var config2 = new Model().define({ name: "month", type: "string", value: "feb", alias: "m" });
                var config3 = new Model().define({ name: "day", type: "string", value: "Sunday", alias: "d" })

                _thing.mixIn(config2);
                _thing.mixIn(config3);

                assert.strictEqual(_thing.year, 2013);
                assert.strictEqual(_thing.month, "feb");
                assert.strictEqual(_thing.day, "Sunday");
            });

            it("mixin() must fail on duplicate propertyName or alias");

            it("mixin(thing, groups)", function(){
                _thing.define({ name: "year", type: "number", value: 2013 });
                var config2 = new Model().define({ name: "month", type: "string", value: "feb", alias: "m" });
                var config3 = new Model().define({ name: "day", type: "string", value: "Sunday", alias: "d" })

                _thing.mixIn(config2, "config2");
                _thing.mixIn(config3, ["config2", "config3"]);

                assert.strictEqual(_thing.year, 2013);
                assert.deepEqual(_thing._definitionList["year"].groups, []);
                assert.strictEqual(_thing.month, "feb");
                assert.deepEqual(_thing._definitionList["month"].groups, ["config2"]);
                assert.strictEqual(_thing.day, "Sunday");
                assert.deepEqual(_thing._definitionList["day"].groups, ["config2", "config3"]);
            });
        });

        describe(".group", function(){
            it("grouping summary", function(){
                // set group after defining
                _thing
                    .define({ name: "one", type: "number" })
                    .define({ name: "two", type: "number" })
                    .define({ name: "three", type: "number" })
                    .group("group1", ["one", "two", "three"]);

                // group during define
                _thing
                    .define({ name: "four" })
                    .define("group2", [
                        { name: "five", type: "boolean" },
                        { name: "six", type: "string" }
                    ])
                    .define("group3", { name: "title", type: "number"});

                // group during mixin
                var config2 = new Model().define({ name: "seven" });
                _thing.mixIn(config2, "group4");

                // ungroup specific properties
                _thing.ungroup("group1", ["one", "two"]);

                // ungroup all
                _thing.ungroup("group2");

                // retrieve group
                _thing.where({ group: "group3" }).toJSON();
            });

            it("group(groupName, propertyNameArray)", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", value: 1 })
                    .define({ name: "two", type: "number", alias: "t", value: 2 })
                    .define({ name: "three", type: "number", alias: "3", value: 3 })
                    .group("everything", ["one", "two", "three"])
                    .group("everything2", ["one", "two", "three"])
                    .group("smallest", "one")
                    .group("not the smallest", ["two", "three"]);

                assert.deepEqual(_thing.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_thing.where({ group: "everything2" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_thing.where({ group: "smallest" }).toJSON(), {one: 1 });
                assert.deepEqual(_thing.where({ group: "not the smallest" }).toJSON(), { two:2, three:3 });
            });

            it("group(groupName) groups all properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", value: 1 })
                    .define({ name: "two", type: "number", alias: "t", value: 2 })
                    .define({ name: "three", type: "number", alias: "3", value: 3 })
                    .group("everything");

                assert.deepEqual(_thing.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
            })

            it("ungroup(groupName) should remove all properties from groupName", function(){
                _thing
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"});
                assert.deepEqual(Object.keys(_thing.where({ group: "group1"})), ["one", "two"]);

                _thing.ungroup("group1");
                assert.deepEqual(Object.keys(_thing.where({ group: "group1"})), []);

            });

            it("ungroup(groupName, propertyNameArray) should remove propertyNames from groupName", function(){
                _thing
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"})
                    .define("group1", {name: "four"});
                assert.deepEqual(Object.keys(_thing.where({ group: "group1"})), ["one", "two", "four"]);

                _thing.ungroup("group1", "one");
                assert.deepEqual(Object.keys(_thing.where({ group: "group1"})), ["two", "four"]);

                _thing.ungroup("group1", ["two", "four"]);
                assert.deepEqual(Object.keys(_thing.where({ group: "group1"})), []);
            });

            it("where({group: groupName}) returns a Model clone, with reduced properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", value: 1 })
                    .define({ name: "two", type: "number", alias: "t", value: 2 })
                    .define({ name: "three", type: "number", alias: "3", value: 3 })
                    .group("group", ["two", "three"]);

                assert.strictEqual(_thing.where({ group: "group" }).one, undefined);
                assert.strictEqual(_thing.where({ group: "group" }).two, 2);
                assert.strictEqual(_thing.where({ group: "group" }).three, 3);
                assert.strictEqual(_thing.one, 1);
                assert.strictEqual(_thing.two, 2);
                assert.strictEqual(_thing.three, 3);
            });

            it("where({ name: {$ne: []}}) should exclude named properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", value: 1 })
                    .define({ name: "two", type: "number", alias: "t", value: 2 })
                    .define({ name: "three", type: "number", alias: "3", value: 3 });

                assert.throws(function(){
                    assert.strictEqual(_thing.where({ name: { $ne: ["one", "two"] }}).one, 1);
                }, null, JSON.stringify(_thing.where({ name: { $ne: ["one", "two"] }}).toJSON()));
                assert.throws(function(){
                    assert.strictEqual(_thing.where({ name: { $ne: ["one", "two"] }}).two, 2);
                });
                assert.strictEqual(_thing.three, 3);
            });

            it("define() with groups and subgroups");

            it("define(groupName, definitionArray) with groups", function(){
                _thing
                    .define({ name: "no group" })
                    .define("general", [
                        { name: "help", type: "boolean", alias: "h" },
                        { name: "input", type: "string", alias: "i" },
                        { name: "output", type: "string", alias: "o" }
                    ])
                    .define("source", [
                        {
                            name: "title",
                            type: "number",
                            alias: "t"
                        },
                        {
                            name: "start-at",
                            type: "string",
                            valid: /duration|frame|pts/,
                            invalidMsg: "please specify the unit, e.g. --start-at duration:10 or --start-at frame:2000"
                        },
                        {
                            name: "stop-at",
                            type: "string",
                            valid: /duration|frame|pts/,
                            invalidMsg: "please specify the unit, e.g. --stop-at duration:100 or --stop-at frame:3000"
                        }
                    ]);

                assert.deepEqual(_thing._definitionList["no group"].groups, []);
                assert.deepEqual(_thing._definitionList["title"].groups, ["source"], JSON.stringify(_thing._definitionList["title"]));
                assert.deepEqual(_thing._definitionList["start-at"].groups, ["source"]);
                assert.deepEqual(_thing._definitionList["stop-at"].groups, ["source"]);
            });

        });

        describe(".ungroup", function(){
        });

        describe(".where", function(){
        });

        describe(".toArray", function(){
        });

        describe(".toJSON", function(){
        });
        
        describe("._destroy", function(){});
        describe("._load", function(){});
    });
    
    describe("events: ", function(){
        
    });
});
