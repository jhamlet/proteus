
(function (exports) {
    
    var Proteus = require("proteus"),
        EM      = require("events").EventEmitter,
        Model
    ;
    
    module.exports = Model = Proteus.derive({
        self: {
            // Class props
            id: "Model",

            inherited: function (subclass) {
                Object.defineProperty(subclass, "__records__", {value: {}});
                Object.defineProperty(subclass, "__uuid__", {value: 0});
            },

            initialize: function (rec, args) {
                var id = rec.id = this.__uuid__++;
                Object.defineProperty(rec, "__model__", {value: this});
                this.defineProperties(rec, args);
                this.__records__[id] = rec;
            },

            defineProperties: function (rec, args) {
                var props = args[0];
            },
            
            get: function (id) {
                return this.__records__[id];
            },

            has: function (id) {
                return this.__records__.hasOwnProperty(id);
            },

            getAll: function () {
                var recs;
                // temporarily assign a length property so slice will work
                this.__records__.length = this.__uuid__;
                recs = Array.prototype.slice.call(this, this.__records__);
                delete this.__records__.length;
                return recs;
            },

            /**
             * 
             * @method find
             * @param args {object|function} an object with key/value pairs
             *      to match, or a function that 
             * @param sortFn {type} description
             * @returns {type}
             */
            find: function (args, sortFn) {
                var records = this.records,
                    ret = [],
                    rec, key
                ;

                for (rec in records) {
                    rec = records[rec];
                    if (rec.matches(args)) {
                        ret.push(rec);
                    }
                }

                if (sortFn) {
                    ret.sort(sortFn);
                }

                return ret;
            },

            destroy: function (id) {
                delete this.__records__[id];
            }
        }, // end self

        // Instance props
        init: function () {
            this.constructor.emit("created", this);
        },

        destroy: function () {
            this.__model__.destroy(this.id);
        },

        matches: function (args) {
            var key;

            if (util.isFunction(args)) {
                return args(this);
            }

            for (key in args) {
                if (this[key] !== args[key]) {
                    return false;
                }
            }

            return true;
        }
        
    });
    
    //-----------------------------------------------------------------------
    // Extend Model with EventEmitter
    //-----------------------------------------------------------------------
    Proteus.extend(Model, EM);
}(exports));