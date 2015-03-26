var test = require("tape");
var Design = require("../lib/Design");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "colour" },
    { name: "number", type: Number },
    { name: "colours", type: Array }
];

test("Model has correct values", function(t){
    var design = Design(attributes);
    var model = design.create();
    t.equal(Object.keys(model).length, 4);
    t.equal(model.verbose, undefined);
    t.equal(model.colour, undefined);
    t.equal(model.number, undefined);
    t.equal(model.colours, undefined);
    t.end();
});

test("Model has correct values", function(t){
    var design = Design(attributes);
    var model = design.create();

    model.verbose = null;
    model.colour = null;
    model.number = null;
    model.colours = null;
    
    t.equal(model.verbose, null);
    t.equal(model.colour, null);
    t.equal(model.number, null);
    t.equal(model.colours, null);
    t.end();
});

test("boolean values", function(t){
    var design = Design(attributes);
    var model = design.create();

    model.verbose = "verbose";
    t.equal(model.verbose, true);
    model.verbose = "";
    t.equal(model.verbose, false);
    model.verbose = true;
    t.equal(model.verbose, true);
    model.verbose = 0;
    t.equal(model.verbose, false);
    t.end();
});

test("array values", function(t){
    var design = Design(attributes);
    var model = design.create();

    model.colours = [ "red", "green" ];
    t.deepEqual(model.colours, [ "red", "green" ]);
    model.colours = "red";
    t.deepEqual(model.colours, [ "red" ]);
    t.end();
});
