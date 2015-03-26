var test = require("tape"),
    o = require("../");

test("exists: primative", function(t){
    var object = { result: "clive", hater: true };
    t.deepEqual(o.exists(object, { result: "clive" }), true);
    t.deepEqual(o.exists(object, { hater: true }), true);
    t.deepEqual(o.exists(object, { result: "clive", hater: true }), true);
    t.deepEqual(o.exists(object, { ibe: true }), false);
    t.end();
});

test("not exists: primative", function(t){
    var object = { result: "clive", hater: true };
    t.deepEqual(o.exists(object, { "!result": "clive" }), false);
    t.deepEqual(o.exists(object, { "!result": "ian" }), true);
    t.deepEqual(o.exists(object, { "!result": "ian", "!hater": false }), true);
    t.end();
});

test("exists: regexp", function(t){
    var object = { result: "red-ish" };
    t.deepEqual(o.exists(object, { result: /red/ }), true);
    t.deepEqual(o.exists(object, { result: /black/ }), false);
    t.deepEqual(o.exists(object, { result: /blue/ }), false);
    t.end();
});

test("not exists: regexp", function(t){
    var object = { result: "red-ish" };
    t.deepEqual(o.exists(object, { "!result": /red/ }), false);
    t.deepEqual(o.exists(object, { "!result": /black/ }), true);
    t.deepEqual(o.exists(object, { "!result": /blue/ }), true);
    t.end();
});

test("undefined value with regexp", function(t){
    var object = { one: "somthing" };
    t.deepEqual(o.exists(object, { one: /.+/ }), true);
    t.deepEqual(o.exists(object, { two: /.+/ }), false);
    t.end();
});

test("object value with regexp", function(t){
    var object = { one: { a: "somthing"} };
    t.deepEqual(o.exists(object, { one: /.+/ }), false);
    t.end();
});

test("null value with regexp", function(t){
    var object = { one: null };
    t.deepEqual(o.exists(object, { one: /.+/ }), false);
    t.end();
});

test("boolean value with regexp", function(t){
    var object = { one: true };
    t.deepEqual(o.exists(object, { one: /true/ }), true);
    t.deepEqual(o.exists(object, { one: /addf/ }), false);
    t.end();
});
