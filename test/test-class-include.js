
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
    
    "Include other class": function () {
        var MyClass = Proteus.Class.derive({
                buz: "buz"
            }),
            instance = new MyClass()
        ;
        
        MyClass.include(BaseClass, OtherClass);
        
        should.not.exist(MyClass.fuz);
        
        instance.foo.should.eql("foo");
        instance.baz.should.eql("baz");
    },
    
    "Include into self": function () {
        BaseClass.include({
            self: {
                fiz: "fiz"
            }
        });
        
        BaseClass.fiz.should.eql("fiz");
    }
    
};
