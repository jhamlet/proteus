
var should = require("should"),
    Proteus = require("lib/proteus")
;

module.exports = {

    "Loaded": function () {
        should.exist(Proteus);
        Proteus.create.should.be.a("function");
    },
    
    "Simple Object creation": function () {
        var tmp = {},
            obj = Proteus.create(function () {
                this.property("foo", 42);
                this.property("tmp", tmp, {enumerable: false});
            })
        ;
        
        should.exist(obj);
        obj.should.have.ownProperty("foo");
        obj.foo.should.eql(42);
        obj.tmp.should.eql(tmp);
    },
    
    "Create methods": function () {
        var obj = Proteus.create(function () {
            this.method("foo", function () {
                return "foo";
            });
            
            this.method("baz", function () {
                return "baz";
            }, {
                enumerable: false
            });
        });
        
        obj.foo.should.be.a("function");
        obj.baz.should.be.a("function");
        
        Object.getOwnPropertyDescriptor(obj, "baz").enumerable.should.eql(false);
    },
    
    "Create getters": function () {
        var obj = Proteus.create(function () {

            this.getter("foo", function () {
                return "foo";
            });

        });
        
        obj.foo.should.eql("foo");
        Object.getOwnPropertyDescriptor(obj, "foo").get.should.be.a("function");
    },
    
    "Create setters": function () {
        var obj = Proteus.create(function () {
            
            this.getter("foo", function () { return this._foo; })
            this.setter("foo", function (v) { this._foo = v; });
            
            this.getter("baz", function () { return this._baz; });
            this.setter("baz", {set: function (v) { this._baz = v; }});
        });
        
        Object.getOwnPropertyDescriptor(obj, "foo").get.should.be.a("function");
        Object.getOwnPropertyDescriptor(obj, "foo").set.should.be.a("function");

        Object.getOwnPropertyDescriptor(obj, "baz").get.should.be.a("function");
        Object.getOwnPropertyDescriptor(obj, "baz").set.should.be.a("function");
        
        obj.foo = 5;
        obj.foo.should.eql(5);
        
        obj.baz = 10;
        obj.baz.should.eql(10);
    },
    
    "Get/Set": function () {
        var key,
            obj = Proteus.create(function () {
            
                this.getset("foo", function (v) {
                    if (arguments.length) {
                        this._foo = v;
                    }
                    else {
                        return this._foo;
                    }
                });
            
                this.getset("baz",
                    function () {
                        return this._baz;
                    },
                    function (v) {
                        this._baz = v;
                    }
                );
            
                this.getset("bar",
                    function (v) {
                        if (arguments.length) {
                            this._bar = v;
                        }
                        else {
                            return this._bar;
                        }
                    }, {
                        enumerable: false
                    }
                );
            })
        ;
        
        Object.getOwnPropertyDescriptor(obj, "foo").get.should.be.a("function");
        Object.getOwnPropertyDescriptor(obj, "foo").set.should.be.a("function");

        obj.foo = 5;
        obj.foo.should.eql(5);
        
        should.not.exist(obj.baz);
        obj.baz = 10;
        obj.baz.should.eql(10);
        
        should.not.exist(obj.bar);
        obj.bar = 5;
        obj.bar.should.eql(5);
        
        for (key in obj) {
            obj[key].should.not.eql("bar");
        }
    },
    
    "Internal extend": function () {
        var obj = Proteus.create(function () {
            this.extend({
                foo: {
                    get: function () {
                        return "foo";
                    }
                },
                baz: "baz"
            });
        });
        
        obj.foo.should.eql("foo");
        obj.baz.should.eql("baz");
    },
    
    "Create off another object": function () {
        var objA, objB;
        
        objA = Proteus.create(function () {
            
            this.property("id", "obj A");

            this.method("foo", function () {
                return "foo: (" + this.id + ")";
            });
            
        });
        
        objB = Proteus.create(objA, function (proto, _super) {
            
            this.property("id", "obj B");
            
            this.method("foo", function () {
                return _super.foo.call(this);
            });
        });
        
        objA.foo().should.eql("foo: (obj A)");
        objB.foo().should.eql("foo: (obj B)");
        
    }
};
