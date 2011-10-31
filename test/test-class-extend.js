
var should = require("should"),
    Proteus = require("../lib/proteus"),
    BaseClass = Proteus.Class.derive({
        foo: "foo"
    }),
    OtherClass = Proteus.Class.derive({
        self: {
            fuz: "fuz"
        },
        
        baz: "baz"
    })
;

module.exports = {
    
    "Extend with other class": function () {
        var MyClass = Proteus.Class.derive({
                buz: "buz"
            });
        
        OtherClass.extend(MyClass);
        
        MyClass.fuz.should.eql("fuz");
    },
    
    "Extend with object": function () {
        Proteus.extend(BaseClass, {
            bug: "bug"
        });
        
        BaseClass.bug.should.eql("bug");
    }
    
};
