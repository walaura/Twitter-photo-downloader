[![view on npm](http://img.shields.io/npm/v/nature.svg)](https://www.npmjs.org/package/nature)
[![npm module downloads per month](http://img.shields.io/npm/dm/nature.svg)](https://www.npmjs.org/package/nature)
[![Build Status](https://travis-ci.org/75lb/nature.svg?branch=master)](https://travis-ci.org/75lb/nature)
[![Dependency Status](https://david-dm.org/75lb/nature.svg)](https://david-dm.org/75lb/nature)
![Analytics](https://ga-beacon.appspot.com/UA-27725889-9/nature/README.md?pixel)

Nature
======
abstract validation tests, for re-usabilty. 

Model
-----
A plain object with 

- validation per property
- validation per whole object (e.g. values must not match)
- observable, emit change events

Collection
----------

- validation (e.g. all files in a collection exist)

nature module
-------------
provides extra features on models and collections.. 

- test valid:   nature.isValid(model)
- group:        nature.group(model, [ "name", "type" ], "groupA")
- mixin:        nature.merge(commandLineArgs, fileArgs)
- extract:      nature.where(model, "fileArgs")
- create

    var argv = nature.create([
        { name: "one", alias: "a" },
        { name: "files", alias: "a", required: true, defaultOption: true },
        { name: "verbose", type: "boolean" }
    ]);
