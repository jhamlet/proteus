(function (exports) {

    var // a handy re-useable object
        _empty = {},
        // short-cut scope lookup
        O = Object,
        OP = O.prototype,
        hasOwnProp = OP.hasOwnProperty,
        // a re-useable property definition to create 'open' properties. By
        // default, Object.defineProperty creates closed properties (i.e: not
        // enumerable, writable, or configurable)
        openSpec = {
            enumerable: true,
            configurable: true
        },
        // property definition for plain properties
        // (strings, numbers, booleans, etc...)
        // defined further down...
        plainSpec,
        // some things defined further down...
        callProto,
        copyAllProperties,
        applyProperties,
        applyAllProperties,
        merge, mergeAll,
        apply, applyAll,
        Proteus
    ;

    function slice (list, offset, end) {
        return Array.prototype.slice.call(list, offset || 0, end || list.length);
    }
    
    function copyOwnProperties (hidden, overwrite, supplier, receiver) {
        var hasOwn = hasOwnProp,
            names, spec, len, i,
            key, get, set;

        if (!supplier) { return; }

        hidden = hidden === true ? true : false;
        overwrite = overwrite === false ? false : true;

        names = Object.getOwnPropertyNames(supplier);

        for (i = 0, len = names.length; i < len; i++) {
            key = names[i];
            spec = Object.getOwnPropertyDescriptor(supplier, key);
            if ((spec.enumerable || hidden) &&
                (!hasOwn.call(receiver, key) || overwrite)
            ) {
                Object.defineProperty(receiver, key, spec);
            }
        }

        return receiver;
    }

    function _copy (fn) {
        var args = slice(arguments, 1),
            receiver = args.shift(),
            len = args.length,
            i = 0,
            key, supplier, get, set;

        for (; i < len; i++) {
            fn.apply(this, [args[i], receiver]);
        }

        return receiver;
    }

    copyAllProperties  = copyOwnProperties.bind(Proteus, true, true);
    applyProperties    = copyOwnProperties.bind(Proteus, false, false);
    applyAllProperties = copyOwnProperties.bind(Proteus, true, false);

    merge    = _copy.bind(Proteus, copyOwnProperties.bind(Proteus, false, true));
    mergeAll = _copy.bind(Proteus, copyAllProperties);
    apply    = _copy.bind(Proteus, applyProperties);
    applyAll = _copy.bind(Proteus, applyAllProperties);

    /**
     * Extend one object with the properties of another.
     * 
     * If the extending object, 'xtndr', has a function named 'extended', it
     * will be called with one argument, the object that was extended.
     * 
     * @param xtnd {object} object to extend
     * @param rest {object} one, or more objects to extend with
     * @returns {object} the extended object
     */
    function extend (xtnd /*, rest */) {
        var len = arguments.length,
            i = 1,
            xtndr
        ;
        
        for (; i < len; i++) {
            xtndr = arguments[i];
            merge(xtnd, xtndr);
            if (xtndr.extended === "function") {
                xtndr.extended(xtnd);
            }
        }
        
        return xtnd;
    }

    /**
     * Include properties onto the prototype of 'self' from another Constructor
     * function or a plain object. If the 'props' has a property named 'self',
     * the properties of 'self' will be merged into 'self' directly.
     * 
     * If the supplying object, 'props', has a function named 'included' it will
     * be called with one argument, the 'self' Constructor function that was
     * just modified.
     * 
     * @param self {function} Constructor function
     * @param props {function|object} either a Constructor function, or an
     *      object of properties to include
     * @returns {function} self
     */
    function include (self /*, props1, ..., propsN */) {
        var hasOwn = hasOwnProp,
            proto = self.prototype,
            len = arguments.length,
            i = 1,
            props, name
        ;

        for (; i < len; i++) {
            props = arguments[i];

            if (typeof props === "function") {
                merge(proto, props.prototype);
            }
            else {
                if (hasOwn.call(props, "self")) {
                    merge(self, props.self);
                }
                
                merge(proto, props);
            }
            
            if (typeof props.included === "function") {
                props.included(self);
            }
        }

        return self;
    }

    /**
     * Create a Constructor function, optionally setting its prototype to
     * the supplied object.
     * 
     * When the Constructor function is called by 'new' it will attempt to
     * initialize the instance.  First by calling the Constructor's "initialize"
     * method, passing the new instance and the arguments object.  If that
     * returns a value, that will be returned as the new instance.  Otherwise,
     * it will attempt to apply the instance's "init" method passing all
     * arguments as they were passed to the constructor function.
     * 
     * @param proto {object} optional, object to use as the prototype
     * @returns {function} the new constructor function
     */
    function makeCtor (proto) {
        var Ctor = function Proteus () {
                var fn, inst;

                if (arguments[0] !== _empty) {
                    if (typeof this.constructor.initialize === "function" &&
                        (inst = this.constructor.initialize(this, arguments))
                    ) {
                        return inst;
                    }

                    if (typeof (fn = this.init) === "function") {
                        fn.apply(this, arguments);
                    }
                }
            }
        ;

        if (proto) {
            Ctor.prototype = proto;
        }
        
        Ctor.prototype.constructor = Ctor;
        
        return Ctor;
    }

    /**
     * Derive a new Constructor function from another, optionally adding the
     * supplied properties to its prototype.
     * 
     * If the parent Constructor has a function named 'inherited' it will be
     * called with one argument, the new Constructor function.
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

        extend(Ctor, parent);

        if (props) {
            include(Ctor, props);
        }

        if (typeof parent.inherited === "function") {
            parent.inherited(Ctor);
        }

        return Ctor;
    }

    /**
     * Interface to Object.create, however, the props argument is a plain
     * object of properties to copy over to the newly created object.
     * Getters and setters will be preserved.
     *  
     * @param proto {object} optional, prototype to use for the new object
     * @param props {object} properties to merge onto the new object
     * @returns {object}
     */
    function create (proto, props) {
        var obj, p;

        obj = O.create(proto || OP);
        
        if (props) {
            obj = extend(obj, props);
        }

        return obj;
    }

    plainSpec = extend({writable: true}, openSpec);

    /**
     * Utility method for creating 'plain' properties on an object. Plain
     * being {enumerable: true, writable: true, configurable: true}, the
     * passed spec can override these defaults.
     * 
     * @param obj {object} object to define property on
     * @param name {string} property name
     * @param val {mixed} the value for the property
     * @param spec {object} optional, property specification
     * @returns {object} obj
     */
    function defineProperty(obj, name, val, spec) {
        spec = extend({value: val}, plainSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    /**
     * Utility method for creating a getter on an object. The property
     * definition will default to {enumerable: true, configurable: true}
     * unless overridden with the spec object.
     * 
     * @param obj {object} object to define property on
     * @param name {string} property name
     * @param fn {function} the getter function
     * @param spec {object} optional, property specification
     * @returns {object} obj
     */
    function defineGetter (obj, name, fn, spec) {
        spec = extend({get: fn}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    /**
     * Utility method for creating a setter on an object. The property
     * definition will default to {enumerable: true, configurable: true}
     * unless overridden with the spec object.
     * 
     * @param obj {object} object to define property on
     * @param name {string} property name
     * @param fn {function} the setter function
     * @param spec {object} optional, property specification
     * @returns {object} obj
     */
    function defineSetter (obj, name, fn, spec) {
        spec = extend({set: fn}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }

    /**
     * Utility method for creating both a getter and a setter on an object.
     * The property definition will default to {enumerable: true,
     * configurable: true} unless overridden with the spec object.
     * 
     * @param obj {object} object to define property on
     * @param name {string} property name
     * @param getter {function} the getter function, or if 'setter' is not
     *      given, then the function will be used for both getting and 
     *      setting.
     * @param setter {function} optional, the setter function
     * @param spec {object} optional, property specification
     * @returns {object} obj
     */
    function defineGetSet (obj, name, getter, setter, spec) {
        if (typeof setter !== "function") {
            spec = setter;
            setter = getter;
        }
        spec = extend({get: getter, set: setter}, openSpec, spec || _empty);
        return O.defineProperty(obj, name, spec);
    }
    
    /**
     * Apply a method from the objects prototype.
     * 
     * @param self {object} the scope object
     * @param name {string} name of the method to call, optional if the calling
     *      function is named i.e: 
     *          {
     *              init: function init () {...}
     *          }
     * @param args {array-like} arguments to pass to the method
     * @returns {mixed} whatever the prototype method would return
     */
    function applyProto (self, name, args) {
        var hasOwn = hasOwnProp,
            caller = applyProto.caller === callProto ?
                        callProto.caller :
                        applyProto.caller,
            callerFound, p
        ;
        
        if (typeof name !== "string") {
            args = name;
            name = caller.name;
        }
        
        if (!name) {
            throw new Error("Can not call prototype method without a name");
        }
        
        p = self;
        do {
            if (p[name] === caller) {
                callerFound = true;
                p = Object.getPrototypeOf(p);
            }
            
            if (p && callerFound && hasOwn.call(p, name)) {
                return p[name].apply(self, args);
            }
            
        }
        while ((p = Object.getPrototypeOf(p)));
        
        throw new Error("Can not call '" + name + "' on undefined.");
    }
    
    /**
     * Call a method from an objects prototype.
     * 
     * @param self {object} the scope object
     * @param name {string} name of the method to call
     * @returns {mixed}
     */
    callProto = function callProto (self, name) {
        return applyProto(
            self,
            name,
            slice(arguments, 2));
    };
    
    Proteus = extend(exports, {

        create:  create,
        
        defineProperty: defineProperty,
        defineGetter:   defineGetter,
        defineSetter:   defineSetter,
        defineGetSet:   defineGetSet,
        
        copyOwnProperties: copyOwnProperties,
        copyAllProperties: copyAllProperties,
        
        slice:      slice,
        merge:      merge,
        mergeAll:   mergeAll,
        apply:      apply,
        applyAll:   applyAll,

        applyProto: applyProto,
        callProto:  callProto,
        
        extend:     extend,
        include:    include,
        derive:     derive,
        
        Class: derive(O, {
            self: {
                /**
                 * 'include' scoped to the current object
                 * @param props {object} properties to include
                 * @returns {object}
                 */
                include: function () {
                    return include.apply(
                        this,
                        [this].concat(slice(arguments))
                    );
                },
                /**
                 * 'extend' scoped to the current object
                 * @param xtnd {object} object to extend
                 * @returns {object} the extended object
                 */
                extend:  function (xtnd) {
                    return extend(xtnd, this);
                },
                /**
                 * 'derive' scoped to the current constructor function
                 * @param props {object}
                 * @returns {function}
                 */
                derive:  function (props) {
                    return derive(this, props);
                }
            }
        })
    });
    
}(exports || (window.Proteus = {})));
