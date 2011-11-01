
var should = require("should"),
    Proteus = require("../lib/proteus"),
    objA, objB, objC
;

module.exports = {
    
    "Apply next prototype method": function () {
        objA = Proteus.create({
            init: function () {
                this.objAInited = true;
            }
        });

        objB = Proteus.create(objA, {
            init: function () {
                this.objBInited = true;
                Proteus.applyProto(this, "init");
            }
        });

        objC = Proteus.create(objB, {
            init: function () {
                this.objCInited = true;
                Proteus.applyProto(this, "init");
            }
        });

        objC.init();
        
        objC.objCInited.should.eql(true);
        objC.objBInited.should.eql(true);
        objC.objAInited.should.eql(true);
    },

    "Call next prototype method": function () {
        objA = Proteus.create({
            init: function () {
                this.objAInited = true;
            }
        });

        objB = Proteus.create(objA, {
            init: function () {
                this.objBInited = true;
                Proteus.callProto(this, "init");
            }
        });

        objC = Proteus.create(objB, {
            init: function () {
                this.objCInited = true;
                Proteus.callProto(this, "init");
            }
        });

        objC.init();
        
        objC.objCInited.should.eql(true);
        objC.objBInited.should.eql(true);
        objC.objAInited.should.eql(true);
    },
    
    "Using named methods": function () {
        objA = Proteus.create({
            init: function init () {
                this.objAInited = true;
            }
        });

        objB = Proteus.create(objA, {
            init: function init () {
                this.objBInited = true;
                Proteus.applyProto(this);
            }
        });

        objC = Proteus.create(objB, {
            init: function init () {
                this.objCInited = true;
                Proteus.applyProto(this);
            }
        });

        objC.init();
        
        objC.objCInited.should.eql(true);
        objC.objBInited.should.eql(true);
        objC.objAInited.should.eql(true);
    },
    
    "Skipping a prototype": function () {
        objA = Proteus.create({
            init: function init () {
                this.objAInited = true;
            }
        });

        objB = Proteus.create(objA);

        objC = Proteus.create(objB, {
            init: function init () {
                this.objCInited = true;
                Proteus.applyProto(this);
            }
        });

        objC.init();
        
        objC.objCInited.should.eql(true);
        objC.objAInited.should.eql(true);
    }
    
};
