var test = require("tape"),
    o = require("../");

test(".extend", function(t){
    var output = o.extend({}, { one: 1 });
    t.deepEqual(output, { one: 1 });

    output = o.extend({}, { one: 1, three: 3 }, { one: "one", two: 2 }, { four: 4 });
    t.deepEqual(output, { one: "one", two: 2, three: 3, four: 4 });

    t.end();
});

test(".extend, bad input", function(t){
    var output = o.extend({}, { one: 1 });
    t.deepEqual(output, { one: 1 });

    output = o.extend({}, "clive", { one: 1 });
    t.deepEqual(output, { one: 1 });

    output = o.extend({}, undefined, { one: 1 });
    t.deepEqual(output, { one: 1 });

    t.end();
});
