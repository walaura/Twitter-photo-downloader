/* no constructor, therefore use default constructor which loads data */
var Cat = nature.design({
    attributes: [
        { name: "name" },
        { name: "colour" },
        { name: "personality", test: /calm|aggressive|afraid/ }
    ]
})
var Cat = nature.design("http://localhost:3000/cat/design")

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
