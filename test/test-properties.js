var should = require("should"),
    Proteus = require("../lib/proteus")
;

module.exports = {
    
    "getPropertyNames": function () {
        var baseObj = {
                foo: "foo"
            },
            obj2 = Proteus.create(baseObj, {
                baz: "baz"
            }),
            obj3 = Proteus.create(obj2, {
                bar: "bar"
            }),
            props
        ;
        
        Proteus.defineGetter(obj3, "cho", function () {
            return "cho";
        }, {
            enumerable: false
        });
        
        props = Proteus.getPropertyNames(obj3);
        
        props.should.contain("foo");
        props.should.contain("baz");
        props.should.contain("bar");
        props.should.not.contain("cho");
    }
};
