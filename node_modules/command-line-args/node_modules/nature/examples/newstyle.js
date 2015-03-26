/*
nature module knows about all creatures great and small.. nature creates and nature can taketh away.
nature like a registry of instances.. a business layer.. instances can talk to each other, locally and remotely.. there is an environment, a singleton god-object all model instances know about. 

don't throw on error, throw when trying to access a broken model.

Model is a regular Object with tighter semantics.. 

Attribute
*/

var Recipe = nature.design({
    constructor: function(data){
        nature.load(this, data);
    },
    inherits: EventEmitter,
    attributes: [
        { name: "ingredients", collection: Ingredients },
        { name: "dishType" }, // default type: "string"
        { name: "region" },
        { name: "minutes", type: Number },
        { name: "method", collection: MethodList }
    ],
    prototype: {
        cook: function(){ this.emit("ready"); },
        eat: function(){ }
    }
});

function Recipe(data){
    nature.load(this, data);
};
util.inherits(EventEmitter, Recipe);
Recipe.prototype.cook = function(){ this.emit("ready"); };
Recipe.prototype.eat = function(){ };
Recipe.prototype.isValid = function(receipe) { 
    return nature.instance(receipe).attributes.every(function(attr){
        return attr.valid;
    });
}
/* Naturise existing class.. instance "life" is now tracked, Recipe receives static
methods like .valid  */
var NaturisedRecipe = nature.design(Recipe, {
    attributes: [
        { name: "ingredients", collection: Ingredients },
        { name: "dishType" }, // default type: "string"
        { name: "region" },
        { name: "minutes", type: Number },
        { name: "method", collection: MethodList }
    ]
});

function Ingredient(data){
    nature.load(this, data);
};
var NaturisedIngredient = nature.design(Ingredient, [
    { name: "ingredient" },
    { name: "quantity", type: Number },
    { name: "chopped", type: Boolean }
]);


/* Create, load data options */
var data = {
    ingredients: 
}
var sauce = new Receipe(data);
sauce._load(data);
nature.load(sauce, data);


/* Test valid options*/
nature.valid(sauce)
sauce._valid
Recipe.isValid(sauce);

} else {
    log(sauce._errorLog)
}

/* variants */
var Caracciera = nature.evolve(Recipe, [
    { name: "region", test: /Napoli|Sicilia/ },
    { name: "ingredients", type: CaraccieraIngredients }
]);

var CaraccieraIngredients = nature.design({ attributes: [
    { name: "onion", value: 1, test: lessThanThree, invalidMsg: "too much onion" },
    { name: "choppedTomatoCans", value: 1, test: 1 },
]});

// OR
var CaraccieraIngredients = nature.collection({ 
    tests: [
        {
            test: function(array){
                return !array.some(function(ingr){ return ingr.name === "garlic"; })
            },
            failMsg: "NEVER include garlic"
        }
    ],
    itemType: Ingredient,
    data: [
        { ingredient: "onion", quantity: 1 },
        { ingredient: "tomatoes", quantity: 4, chopped: true }
    ]
});
CaraccieraIngredients.push({ ingredient: "garlic", quantity: 1 });
nature.valid(caraccieraIngredients) // false
caraccieraIngredients.remove({ ingredient: "garlic" });
nature.valid(caraccieraIngredients) // true


/* mixture */
var RedSauce = nature.merge(Caracciera, Basil)

/* grouping */
var HandbrakeOptions = nature.design([
        { group: "general", attributes: [
            { name: "help", type: "boolean", alias: "h" },
            { name: "verbose", type: "boolean", alias: "v" },
            { name: "input", type: "string", alias: "i" },
        ]},
        { group: "source", attributes: [
            { name: "title", type: "number", alias: "t" },
            { name: "min-duration", type: "number" },
            { name: "scan", type: "boolean" },
        ]}
    ]
);

/* Nature registery */
nature.classes = [] // constructors
nature.life = {} // distionary of model metadata, keyed by the model instance

// example: Bigot Machine, change person attributes, state event fires ("four-eyed speccy twat/jerk")
