/* no constructor, therefore use default constructor which loads data */
var Cat = nature.design({
    attributes: [
        { name: "name" },
        { name: "colour" },
        { name: "personality", test: /calm|aggressive|afraid/ }
    ]
})

Cat.load(model, data)
Cat.valid(model)
Cat.store(model)
Cat.getAttributeDefinition(name) // { name: "name", type: String }
