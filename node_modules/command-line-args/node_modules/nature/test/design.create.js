var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "dry", type: Boolean }
];

test("design.create() returns Model instance", function(t){
    var design = Design(attributes);
    t.ok(design.create() instanceof Model);
    t.end();
});

test("Model instance has correct properties", function(t){
    var design = Design(attributes);
    var model = design.create();
    t.deepEqual(Object.keys(model), [ "verbose", "dry" ]);
    t.end();
});
