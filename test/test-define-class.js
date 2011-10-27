
var should = require("should"),
    Proteus = require("proteus"),
    BaseClass,
    SubClass
;

BaseClass = Proteus.define(function (meta, proto, _super) {
    
    this.method("foo", function () {
        return "foo";
    });
    
});

SubClass = BaseClass.extend(function (meta, proto, _super) {
    
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
        // console.log(SubClass.prototype);
        inst.foo().should.eql("foo foo");
    }
}