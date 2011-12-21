Proteus
=======

Declaratively define JavaScript objects and constructor functions (A.K.A. "Classes"), and the instances they produce.

### ˈprōtēəs; ˈprōˌt(y)oōs

>   In Greek Mythology a minor sea god (son of Oceanus and Tethys) who had the
>   power of prophecy but who would assume different shapes to avoid answering
>   questions.

>   From the Greek protos "first."


Object Creation and Extension Methods
-------------------------------------

### Proteus.create(proto, props)

Interface to Object.create, however, the props argument is a plain object of properties to copy over to the newly created object.  Getters and setters will be preserved.

### Proteus.defineProperty(obj, name, val, [spec])

Utility method for creating 'plain' properties on an object. Plain being {enumerable: true, writable: true, configurable: true}, the passed spec can override these defaults.

~~~js
Proteus.defineProperty(obj, "propName", 42);

Proteus.defineProperty(
    obj,
    "methodName",
    function () { /*...*/ },
    {enumerable: false}
);
~~~

### Proteus.defineProperties(obj, list)

Define multiple properties.

### Proteus.defineGetter(obj, name, fn, [spec])

Utility method for creating a getter on an object. The property definition will default to {enumerable: true, configurable: true} unless overridden with the spec object.

### Proteus.defineSetter(obj, name, fn, [spec])

Utility method for creating a setter on an object. The property definition will default to {enumerable: true, configurable: true} unless overridden with the spec object.

### Proteus.defineGetSet(obj, name, getter, [setter], [spec])

Utility method for creating both a getter and a setter on an object. The property definition will default to {enumerable: true, configurable: true} unless overridden with the spec object.

if `setter` is not given, then the `getter` function will be used for both getting and setting

### Proteus.getPropertyNames(obj)

Get all property names for an object, all the way up the prototyep chain.

### Proteus.getPropertyDescriptor(obj, name)

Get a property descriptor for an object whereever it may exist in the prototype chain.

### Proteus.copyOwnProperties(hidden = false, overwrite = true, supplier, receiver)

Copy properties from `supplier` to `receiver`. This method will preserve the property definitions from `supplier` to `receiver` (uses `Object.getOwnPropertyDescriptor` under the hood).

### Proteus.copyAllProperties(supplier, receiver)

Copy all properties from `supplier` to `receiver`.

### Proteus.applyProperties(supplier, receiver)

Copy all *enumerable* properties from `supplier` to `receiver` only if the property *does not* exist on the `receiver` object.

### Proteus.applyAllProperties(supplier, receiver)

Copy all properties from `supplier` to `receiver`, but do not overwrite existing properties on `receiver`.

### Proteus.merge(receiver, arg1, ..., argN)

Merge *enumerable* properties from all objects passed as arguments onto `receiver`.

### Proteus.mergeAll

Merge all properties from all objects passed as arguments onto `reciever`.

### Proteus.apply

Merge *enumerable* properties from all objects passed as arguments onto `receiver`, only if they do not exist on `receiver`.

### Proteus.applyAll

Merge all properties from all objects passed as arguments onto `receiver`, only if they do not exist on `receiver`.

Proteus Utility Methods
-----------------------

### Proteus.extend(extendee, extender1, ..., extenderN)

Extend one object with the properties of another.

If the extending object (`extender1, ..., extenderN`) has a function named `extended`, it will be called with one argument, the object that was extended (`extendee`).

### Proteus.include(self, obj1, ..., objN)

Include properties onto the prototype of 'self' from a *Constructor* function or a plain object. If `obj` has a property named `self`, the properties of `self` will be merged into the passed 'self'.

If the supplying object, `obj`, has a function named `included` it will be called with one argument, the 'self' object that was just modified.

### Proteus.derive(parent, props)

Derive a new *Constructor* function from another, optionally adding the supplied properties to its prototype.

If the parent *Constructor* has a function named `inherited` it will be called with one argument, the new *Constructor* function.

### Proteus.slice(list, offset = 0, end = list.length)

Return a portion of the *array-like* object.

### Proteus.aliasMethod(name, [scope])

Return a function that is bound to call another function on the current object, or the supplied one.

### Proteus.delegateMethod(obj, name, [args, ...])

Delegate a function call to another object. Additional arguments will be *prepended* to the function call.

### Proteus.applyProto(self, [name], args = [])

Apply a method from the `self` object's prototype chain.

The `name` argument is optional if the function you are invoking from, and the one up the prototype chain you wish to invoke is named. i.e:

~~~js
var Proteus = require("proteus"),
    objA = {
        someMethod: function someMethod () {
            console.log("I'm object A");
        }
    },
    objB = Proteus.create(objA, {
        someMethod: function someMethod () {
            Proteus.applyProto(this, arguments);
            console.log("I'm object B");
        }
    })
;

objB.someMethod();

// => I'm object A
// => I'm object B
~~~

### Proteus.callProto(self, name, [arg1], [...], [argN])

Call a method `name` from the `self` object's prototype chain passing the remaining arguments as arguments.

*Note:* the `name` parameter is **not** optional.


Proteus.Class
-------------

