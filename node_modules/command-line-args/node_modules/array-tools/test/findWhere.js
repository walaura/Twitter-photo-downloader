var test = require("tape"),
    a = require("../");

test("findWhere", function(t){
    var arr = [
        { result: false, number: 1 },
        { result: false, number: 2 }
    ];
    t.deepEqual(a.findWhere(arr, { result: true }), null);
    t.deepEqual(a.findWhere(arr, { result: false }), { result: false, number: 1 });
    t.deepEqual(a.findWhere(arr, { result: false, number: 3 }), null);
    t.deepEqual(a.findWhere(arr, { result: false, number: 2 }), { result: false, number: 2 });
    t.end();
});
