# DefineClass - OOP support for Javascript.

Class have default constructor and parametrized constructor.

Default constructors are called by inheritance chain, starting from most base class.

Super constructor is accessible with following call:

```js
    this.__super.constructor( parameterA );
```

Also, ``` this.__super ``` can be used to access overriden super method:

```js
    doLogic:function(){
        this.__super.doLogic();
    }
```


## Controlling Access to Methods of a Class:

The privateMembers specifies methods can only be accessed in its own class.
The protectedMembers specifies methods can only be accessed in its own class and, in addition, by a subclass of its class.
The publicMembers specifies methods can be accessed from any contexts.


## Usage:

```js
/**
 * @param {String} className
 * @param {String} baseClass
 * @param {Function} constructor
 * @param {Function} defaultConstructor
 * @param {Object} privateMembers
 * @param {Object} protectedMembers
 * @param {Object} publicMembers
 */
DefineClass(className, baseClass, constructor, defaultConstructor, privateMembers, protectedMembers, publicMembers);
```

## Example:

```js
"use strict";

DefineClass("ClassA", null,

    /*constructor =*/ function( parameterA ) {
        console.log( "constructorA begin" );
        this.myParameterA = parameterA;
        console.log( "constructorA end" );
    },

    /*constructorDef =*/ function () {
        console.log( "default constructorA" );
    },

    /*privateMethods =*/ {
    },

    /*protectedMethods =*/ {
    },

    /*publicMethods =*/ {
        getParameterA:function(){
            return this.myParameterA;
        },
        doLogic:function(){
            console.log( "doLogicA" );
        }
    }
);
```

```js
DefineClass("ClassB", "ClassA",

    /*constructor =*/ function( parameterB, parameterA ) {
        console.log( "constructorB begin" );
        this.__super.constructor( parameterA );
        this.myParameterB = parameterB;
        console.log( "constructorB end" );
    },

    /*constructorDef =*/ function () {
        console.log( "default constructorB" );
    },

    /*privateMethods =*/ {
    },

    /*protectedMethods =*/ {
    },

    /*publicMethods =*/ {
        getParameterB:function(){
            return this.myParameterB;
        },
        doLogic:function(){
            console.log( "doLogic before logic A" );
            this.__super.doLogic();
            console.log( "doLogic after logic A" );
        }
    }
);
```

```js
var a = new ClassA( "paramA" );
console.log( a.getParameterA() );
a.doLogic();

var b = new ClassB( "paramB", "paramA from B" );
console.log( b.getParameterA() );
console.log( b.getParameterB() );
b.doLogic();
```


# HashTable.

Hash table uses numbers and strings as keys.

# HashMap.

Hash map uses objects as keys.

There are two ways to provide function to get key value.

1. object provides function hashCode

2. HashMap receives function hashFunction in constructor
