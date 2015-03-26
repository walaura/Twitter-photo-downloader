/* loading data */
var cat = new Cat({
    name: "Meow",
    colour: "ginger",
    personality: "calm"
})

Cat.load(cat, "http://localhost:3000/cat/1");
Cat.load(cat, { name: "tabby" })
argv.load(cat, [ "--name", "tabby", "-c", "white" ]);
