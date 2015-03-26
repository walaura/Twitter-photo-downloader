var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

test("design.groups()", function(t){
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
    t.deepEqual(design.groups(), [ "test1", "test2" ]);
    t.end();
});

test("design.groups() with attributes with multiple groups", function(t){
    var attributes = [
        {
            groups: ["test1", "all"],
            attributes: [
                { name: "verbose", type: Boolean },
                { name: "colour", type: String }
            ]
        },
        {
            groups: ["test2", "all"],
            attributes: [
                { name: "three", type: Boolean },
                { name: "four", type: Boolean }
            ]
        }
    ];

    var design = Design(attributes);
    t.deepEqual(design.groups(), [ "test1", "all", "test2" ]);
    t.end();
});
