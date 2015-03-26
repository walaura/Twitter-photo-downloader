var test = require("tape"),
    a = require("../");

test("exists: search for object value", function(t){
    var arr = [
        { result: false, number: 1 },
        { result: false, number: 2 }    
    ];
    t.equal(a.exists(arr, { result: true }), false);
    t.equal(a.exists(arr, { result: false }), true);
    t.equal(a.exists(arr, { result: false, number: 3 }), false);
    t.equal(a.exists(arr, { result: false, number: 2 }), true);
    t.end();
});

test("exists: search for scalar", function(t){
    var arr = [ 1, 2, "three" ];
    t.equal(a.exists(arr, 0), false);
    t.equal(a.exists(arr, 1), true);
    t.equal(a.exists(arr, "1"), false);
    t.equal(a.exists(arr, "three"), true);
    t.end();
});
