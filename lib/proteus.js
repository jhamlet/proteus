(function (exports) {

    var _empty = {},
        // short-cut scope lookup
        O = Object,
        OP = O.prototype,
        hasOwnProp = OP.hasOwnProperty,
        // a re-useable property definition to create 'open' properties. By
        // default, Object.defineProperty creates closed properties (i.e: not
        // enumerable or configurable)
        openSpec = {
            enumerable: true,
            configurable: true
        },
        // property definition for plain properties
        // (strings, numbers, booleans, etc...)
        plainSpec
    ;

    /**
     * Extend one object with the properties of another
     * @param xtnd {object} object to extend
     * @param xtndr {object} the object to extend with
     * @returns {object} the extended object
     */
    function extend (xtnd, xtndr) {
        var hasOwn = hasOwnProp,
            name, getter, setter;

        for (name in xtndr) {
            if (hasOwn.call(xtndr, name) && name !== "self") {
                getter = xtndr.__lookupGetter__(name);
                setter = xtndr.__lookupSetter__(name);
                
                if (getter || setter) {
                    if (getter) {
                        xtnd.__defineGetter__(name, getter);
                    }
                    if (setter) {
                        xtnd.__defineSetter__(name, setter);
                    }
                }
                else {
                    xtnd[name] = xtndr[name];
                }
            }
        }

        if (xtndr.extended) {
            xtndr.extended(xtnd);
        }

        return xtnd;
    }

    /**
     * 'extend' scoped to the current object
     * @param xtnd {object} object to extend
     * @returns {object} the extended object
     */
    function _extend (xtnd) {
        return extend(xtnd, this);
    }

    
    /**
     * Include properties onto the prototype, if the supplier (props) has a
     * property named 'self', the properties of 'self' will be included into
     * the base object and not the prototype.
     * 
     * @param self {object} object to include onto
     * @param props {object} properties to include
     * @returns {object}
     */
    function include (self, props) {
        var hasOwn = hasOwnProp,
            proto = self.prototype,
            name
        ;

        if (typeof props === "function" || hasOwn.call(props, "self")) {
            extend(self, props.self || props);
        }

        for (name in props) {
            extend(proto, props);
        }

        if (props.included) {
            props.included(this);
        }

        return this;
    }

    /**
     * 'include' scoped to the current object
     * @param props {object} properties to include
     * @returns {object}
     */
    function _include (props) {
        return include(this, props);
    }

    /**
     * Create a constructor function, optionally setting its prototype to the
     * supplied object
     * @param proto {object} optional, object to use as the prototype
     * @returns {function} the new constructor function
     */
    function makeCtor (proto) {
        var Ctor = function Proteus () {
                var fn;

                if (arguments[0] !== _empty) {

                    if ((fn = this.init)) {
                        fn.apply(this, arguments);
                    }

                    if (this.constructor.initialize) {
                        this.constructor.initialize(this, arguments);
                    }
                }
            }
        ;

        if (proto) {
            Ctor.prototype = proto;
            proto.constructor = Ctor;
        }

        return Ctor;
    }

    /**
     * Dervie a new Constructor function from another, optionally adding the
     * supplied properties to its prototype
     * 
     * @param parent {function} a constructor object to derive from
     * @param props {object} optional, properties to add to the constructors prototype
     * @returns {function} a constructor function
     */
    function derive (parent, props) {
        var Ctor = makeCtor(new parent(_empty));

        O.defineProperty(Ctor, "__super__", {
            value: parent.prototype
        });

        if (props) {
            include(Ctor, props);
        }

        extend(Ctor, parent);
        
        if (parent.inherited) {
            parent.inherited(Ctor);
        }

        return Ctor;
    }

    /**
     * 'derive' scoped to the current constructor function
     * @param props {object}
     * @returns {function}
     */
    function _derive (props) {
        return derive(this, props);
    }

    /**
     * 
     * @param proto {object} optional, prototype object
     * @param props {object} properties to create on the new object
     * @returns {object}
     */
    function create (proto, props) {
        var obj;

        if (!props) {
            props = proto;
            proto = OP;
        }

        obj = extend(O.create(proto), props);

        if (typeof obj.created === "function") {
            obj.created(obj);
        }
        
        return obj;
    }

    function defineProperty (obj, name, spec) {
        O.defineProperty(obj, name, spec);
    }

    plainSpec = extend({writable: true}, openSpec);

    function definePlainProperty(obj, name, val, spec) {
        spec = extend({value: val}, plainSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    function defineGetter (obj, name, fn, spec) {
        spec = extend({value: fn}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    function defineSetter (obj, name, fn, spec) {
        spec = extend({value: fn}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    function defineGetSet (obj, name, getter, setter, spec) {
        if (typeof setter !== "function") {
            spec = setter;
            setter = getter;
        }
        spec = extend({get: getter, set: setter}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    extend(exports, {

        create:  create,
        
        defineProperty: defineProperty,
        definePlainProperty: definePlainProperty,
        defineGetter: defineGetter,
        defineSetter: defineSetter,
        defineGetSet: defineGetSet,

        Class: derive(O, {
            self: {
                include: _include,
                extend:  _extend,
                derive:  _derive
            }
        })
    });
    
}(exports || (window.Proteus = {})));