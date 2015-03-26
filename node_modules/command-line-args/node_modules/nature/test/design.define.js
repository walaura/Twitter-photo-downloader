var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "dry", type: Boolean }
];

test("design.define(attribute)", function(t){
    var design = Design();
    design.define(attributes[0]);
    t.equal(design._attributes[0], attributes[0]);
    t.end();
});

test("design.define(attributes)", function(t){
    var design = Design();
    design.define(attributes);
    t.deepEqual(design._attributes, attributes);
    t.end();
});

test("design.define(attributes, { group: 'test'})", function(t){
    var design = Design();
    design.define(attributes, { groups: "test" });
    t.deepEqual(design._attributes, [
        { name: "verbose", type: Boolean, groups: [ "test" ] },
        { name: "dry", type: Boolean, groups: [ "test" ] }
    ]);
    t.end();
});
