
var should = require("should"),
    Proteus = require("lib/proteus"),
    BaseClass,
    SubClass
;

BaseClass = Proteus.define(function (proto, meta, _super) {
    
    this.method("foo", function () {
        return "foo";
    });
    
});

SubClass = BaseClass.extend(function (proto, meta, _super) {
    
    this.method("foo", function () {
        return "foo " + _super.foo.call(this);
    });
    
});

module.exports = {
    "Exists": function () {
        should.exist(BaseClass);
        should.exist(SubClass);
        
        BaseClass.should.be.a("function");
        SubClass.should.be.a("function");
    },
    
    "Super methods work": function () {
        var inst = new SubClass();
        inst.foo().should.eql("foo foo");
    }
}