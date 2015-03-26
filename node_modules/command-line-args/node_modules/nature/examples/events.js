/* in the style of an MVC controller.. or Presenter..  */

/* model */
var cat = new Cat({
    name: "Meow",
    colour: "ginger",
    personality: "calm"
})

Cat.load(cat, "http://localhost:3000/cat/1");

/* view.. input: model, output: DOM */
function CatView(cat, element){
    this.cat = cat;
    cat.on("update", this.update)
    
    this.update = function(prop, value){
        self[prop] = value;
    }
}
var view = new CatView()

/* controller.. input: DOM, output: Model */
function CatController(element, cat){
    element.name.attachEventListener("change", function(){
        cat.name = this.value;
    });
}
var controller = new CatController(element){}
