/*
 HashMap

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

"use strict";

var HashMap = function( hashFunction ){
    var c = 0;
    var t = Object.create(null);
    var f = hashFunction;

    var h = function( key ){
        var hc = key["hashCode"];
        if ( hc ){
            key = hc( key );
        } else if ( f ){
            key = f(key);
        }
        return key;
    };

    this.put = function(key,value){
        key = h(key);
        if ( t[key] === undefined ){
            c++;
        }
        t[key] = value;
    };

    this.contains=function(key){
        key = h(key);
        return t[key] !== undefined;
    };

    this.get=function(key){
        key = h(key);
        return t[key];
    };

    this.remove=function(key){
        key = h(key);
        if ( t[key] !== undefined ){
            c--;
            delete t[key];
        }
    };

    this.count=function(){
        return c;
    };
};
