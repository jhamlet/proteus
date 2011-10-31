
var should = require("should"),
    Proteus = require("../lib/proteus")
;

module.exports = {

    "Loaded": function () {
        should.exist(Proteus);
        Proteus.should.be.a("object");
    },
    
    "Created callback": function () {
        var obj = Proteus.create({
                created: function (obj) {}
            });
            
        var subobj = Proteus.create(obj, {foo: "foo"});

        subobj.foo.should.eql("foo");
        subobj.created.should.be.a("function");
    }
    
};
