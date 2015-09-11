/*
DefineClass

Copyright (c) 2015 NovaIdeas LLC.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

function __get_callee( arg ){
    return arg.callee;
}

function __call_method(object, methodName, args) {
    var method = typeof( methodName ) === 'function' ? methodName : this.window[methodName];
    if (typeof method !== 'function') {
        throw new Error(methodName + " is not method of class - " + object);
    }
    return method.apply(object || methodName, args);
}

function __CreateClassTemplate() {
    return function (args) {
        if (this instanceof __get_callee(arguments)) {
            if (typeof this.__construct == "function") {
                this.__flag = true;
                this.__callContext = [];
                this.__currentContext = 0;
                this.__callContext[this.__currentContext] = null; //outside call

                var classHierarchy = __get_callee(arguments).prototype.__classHierarchy;

                if (classHierarchy.length > 0) {
                    var proxy = function (This, Clazz) {
                        this.This = This;
                        this.Clazz = Clazz;
                        this.__callContext = This.__callContext;
                        this.__currentContext = This.__currentContext;
                    };

                    proxy.prototype.__append = function (key) {
                        proxy.prototype[key] = function () {
                            var hierarchy = this.Clazz.prototype.__classHierarchy;
                            for (var i = 0; i < hierarchy.length - 1; ++i) {
                                var superClass = hierarchy[i];
                                if (superClass === this.This.__callContext[this.This.__currentContext]) {
                                    return this.Clazz.prototype.__execute(this.This, (i + 1), key, arguments);
                                }
                            }
                            throw Error("Error for super");
                        };
                    };

                    this.__super = new proxy(this, classHierarchy[0]);
                    for (var i = classHierarchy.length - 1; i > 0; --i) {
                        __CopyMembers(classHierarchy[i].prototype.__protected, proxy.prototype);
                        __CopyMembers(classHierarchy[i].prototype.__public, proxy.prototype);
                        var superClass = classHierarchy[i].prototype;
                        try {
                            this.__currentContext++;
                            this.__callContext[this.__currentContext] = superClass;
                            if (superClass.__defaultConstructor) {
                                superClass.__defaultConstructor.apply(this, arguments);
                            } else if (superClass.__construct) {
                                superClass.__construct.apply(this, arguments);
                            }
                        } finally {
                            this.__currentContext--;
                        }
                    }

                    __CopyMembers(classHierarchy[0].prototype.__protected, proxy.prototype);
                    __CopyMembers(classHierarchy[0].prototype.__public, proxy.prototype);
                }
                try {
                    this.__currentContext++;
                    this.__callContext[this.__currentContext] = classHierarchy[0];
                    if (this.__defaultConstructor) {
                        this.__defaultConstructor.apply(this, arguments);
                    }
                    this.__construct.apply(this, arguments);
                } finally {
                    this.__currentContext--;
                }
                this.__flag = false;
            }
        } else {
            return new __get_callee(arguments)(arguments);
        }
    };
}

function __CopyMembersWithDestination(members, dest, prototype) {
    for (var key in members) {
        dest[key] = members[key];
        prototype.__append(key);
    }
}

function __CopyMembers(members, prototype) {
    for (var key in members) {
        prototype.__append(key);
    }
}

/**
 * @param {String} className
 * @param {String} baseClass
 * @param {Function} constructor
 * @param {Function} defaultConstructor
 * @param {Object} privateMembers
 * @param {Object} protectedMembers
 * @param {Object} publicMembers
 */
function DefineClass(className, baseClass, constructor, defaultConstructor, privateMembers, protectedMembers, publicMembers) {

    if (arguments.length != 7) {
        throw Error("Error in declaration of class '" + className + "' there is wrong amount of parameters.");
    }

    if ( baseClass && !window[baseClass] ){
        console.error( "Error to define class: " + className + ". Base class is not defined: " + baseClass );
    }

    var clazz = __CreateClassTemplate();

    clazz.prototype.__class = className;
    clazz.prototype.__construct = constructor;
    clazz.prototype.__constructor = [];
    clazz.prototype.__constructor["constructor"] = constructor;
    clazz.prototype.__defaultConstructor = defaultConstructor;
    clazz.prototype.__classHierarchy = [];
    clazz.prototype.__classHierarchy[0] = clazz;

    clazz.prototype.__private = [];
    clazz.prototype.__protected = [];
    clazz.prototype.__public = [];

    clazz.prototype.__flag = false;

    clazz.prototype.__executeWithScope = function (object, funcObject, func, members, scope, args) {
        try {
            object.__currentContext++;
            object.__callContext[object.__currentContext] = scope;
            return __call_method(object, funcObject, args);
        } finally {
            object.__currentContext--;
        }
    };

    clazz.prototype.__execute = function (object, startPosition, func, args) {

        for (var i = startPosition; i < clazz.prototype.__classHierarchy.length; ++i) {
            var currentClass = clazz.prototype.__classHierarchy[i];
            if (typeof( currentClass.prototype.__public[func] ) === 'function') {
                return currentClass.prototype.__executeWithScope(object, currentClass.prototype.__public[func], func, currentClass.prototype.__public, currentClass, args);
            }
        }
        if (!object.__callContext[object.__currentContext]) {
            throw Error("Method: '" + func + "' is not in public interface of class '" + clazz.prototype.__class + "'.");
        }
        for (var j = startPosition; j < clazz.prototype.__classHierarchy.length; ++j) {
            var classProtected = clazz.prototype.__classHierarchy[j];
            if (typeof( classProtected.prototype.__protected[func] ) === 'function') {
                return classProtected.prototype.__executeWithScope(object, classProtected.prototype.__protected[func], func, classProtected.prototype.__protected, classProtected, args);
            }
        }

        if (startPosition != 0) {
            throw Error("Method: '" + func + "' cannot be invoked from method of class '" + object.__callContext[object.__currentContext].prototype.__class + "' through '__super' pointer because there is no such methods in public or protected scopes.");
        }

        var classPrivate = object.__callContext[object.__currentContext];
        if (typeof( classPrivate.prototype.__private[func] ) === 'function') {
            return classPrivate.prototype.__executeWithScope(object, classPrivate.prototype.__private[func], func, classPrivate.prototype.__private, classPrivate, args);
        }

        throw Error("Method: '" + func + "' cannot be invoked from call context of class '" + object.__callContext[object.__currentContext].prototype.__class + "'.");
    };

    clazz.prototype.__append = function (key) {
        clazz.prototype[key] = function () {
            return clazz.prototype.__execute(this, 0, key, arguments);
        };
    };

    if (baseClass) {
        //namespace
        var namespace = baseClass.split(".");
        var location = window;
        for (var j = 0; j < namespace.length - 1; j++) {
            location = location[namespace[j]];
        }
        var base = location[namespace[namespace.length - 1]];

        clazz.prototype.__classHierarchy = clazz.prototype.__classHierarchy.concat(base.prototype.__classHierarchy);

        for (var i = 1; i < clazz.prototype.__classHierarchy.length; ++i) {
            var currentClass = clazz.prototype.__classHierarchy[i];
            __CopyMembers(currentClass.prototype.__private, clazz.prototype);
            __CopyMembers(currentClass.prototype.__protected, clazz.prototype);
            __CopyMembers(currentClass.prototype.__public, clazz.prototype);
        }

        clazz.prototype.__super = base.prototype;
    } else {
        clazz.prototype.__super = null;
    }

    __CopyMembersWithDestination(privateMembers, clazz.prototype.__private, clazz.prototype);
    __CopyMembersWithDestination(protectedMembers, clazz.prototype.__protected, clazz.prototype);
    __CopyMembersWithDestination(publicMembers, clazz.prototype.__public, clazz.prototype);
    __CopyMembersWithDestination(clazz.prototype.__constructor, clazz.prototype.__public, clazz.prototype);

    //namespace
    var namespace2 = className.split(".");
    var location2 = window;
    for (var a = 0; a < namespace2.length - 1; a++) {
        location2[namespace2[a]] = location2[namespace2[a]] || {};
        location2 = location2[namespace2[a]];
    }
    location2[namespace2[namespace2.length - 1]] = clazz;
}

function createNameSpace(path) {
    var namespace = path.split(".");
    var location = window;
    for (var a = 0; a < namespace.length; a++) {
        location[namespace[a]] = location[namespace[a]] || {};
        location = location[namespace[a]];
    }
}


