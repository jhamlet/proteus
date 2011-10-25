
var should = require("should"),
    Proteus = require("proteus")
;

module.exports = {

    "Loaded": function () {
        should.exist(Proteus);
        Proteus.create.should.be.a("function");
    },
    
    "Simple Object creation": function () {
        var obj = Proteus.create({
            property: ["foo", {}, {configurable: false}],
            property: ["bag", {value: {}}],
            method: ["baz", function () {}],
            getter: ["color"],
            setter: ["hair"],
            getset: ["hat"]
        });
        
    }
}