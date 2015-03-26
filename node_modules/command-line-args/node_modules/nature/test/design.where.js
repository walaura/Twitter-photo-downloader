var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

test("design.where(model, { groups: 'blah' })", function(t){
    var attributes = [
        {
            groups: "test1",
            attributes: [
                { name: "verbose", type: Boolean },
                { name: "colour", type: String }
            ]
        },
        {
            groups: "test2",
            attributes: [
                { name: "three", type: Boolean },
                { name: "four", type: Boolean }
            ]
        }
    ];

    var design = Design(attributes);
    var model = design.create();
    model.verbose = true;
    model.colour = "red";
    t.deepEqual(design.where("return attribute.groups && attribute.groups.indexOf('test1') > -1;", model), {
        verbose: true,
        colour: "red"
    });
    t.end();
});
