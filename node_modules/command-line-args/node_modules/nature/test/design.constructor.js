var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "dry", type: Boolean }
];

test("constructor returns design instance", function(t){
    var design = Design();
    t.ok(design instanceof Design);
    t.end();
});

test("constructor(attributes)", function(t){
    var design = Design(attributes);
    t.deepEqual(design._attributes, attributes);
    t.end();
});

test("constructor(attributes) grouped", function(t){
    var attributes = [
        {
            groups: "test1",
            attributes: [
                { name: "verbose", type: Boolean },
                { name: "dry", type: Boolean }
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
    t.deepEqual(design._attributes, [
        { name: "verbose", type: Boolean, groups: ["test1"] },
        { name: "dry", type: Boolean, groups: ["test1"] },
        { name: "three", type: Boolean, groups: ["test2"] },
        { name: "four", type: Boolean, groups: ["test2"] }
    ]);
    t.end();
});
