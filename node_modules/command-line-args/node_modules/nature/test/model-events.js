var test = require("tape");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "colour" },
    { name: "number", type: Number },
    { name: "colours", type: Array }
];

test("changed", function(t){
    t.plan(1);
    var model = new Model(attributes);
    model.on("changed", function(prop, value, old){
        t.equal(prop, "colour");
        t.equal(value, "blue");
        t.equal(old, "red");
    });
});
