/**
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentLogger
 */

var Es6Map = (typeof Map !== 'undefined' ? Map : require('es6-collections').Map);

var ReactElement = require('ReactElement');

var rootElement = null;
var elementMap = new Es6Map();
var classNameMap = new Es6Map();

var assign = require('Object.assign');

var startTime = 0;
var totalPerfTime = 0;

function perfStartRender()
{
   startTime = performance.now();
}

function perfEndRender()
{
  totalPerfTime += (performance.now()-startTime);
}

function startRender(element)
{
  totalPerfTime = 0;
  rootElement = element;
}

function log(sourceElement, resultElement)
{
  elementMap.set(sourceElement, resultElement);
}

function endRender()
{
  var data = createClasses(rootElement);
  if(data.indexOf('Ads Manager') > 0)
  {
    var oMyBlob = new Blob([data], {type : 'text/plain'}); // the blob
    var objectURL = URL.createObjectURL(oMyBlob);
    console.log(objectURL+" "+data.length);
  }
  console.log("component render: "+totalPerfTime);
}

function createClasses(sourceElement)
{
  var output = '';
  if(window.classNumber == null) window.classNumber = 0;
  var startClassNumber = window.classNumber;
  var classNumber = startClassNumber;
  for(var key of elementMap.keys())
  {
    var originalDisplayName = key.type.displayName;
    if(originalDisplayName == null && elementMap.get(key) === sourceElement) originalDisplayName = "ApplicationRootComponentFromReactRender";
    var name = originalDisplayName != null ? originalDisplayName+classNumber : 'UnknownComponent'+classNumber;
     classNameMap.set(key, name);
    classNumber++;
  }
  classNumber = startClassNumber;
  for(var key of elementMap.keys())
  {
    output = output + 'class '+classNameMap.get(key)+' { render() { if('+classNameMap.get(key)+'._internalElements == null) '+classNameMap.get(key)+'._internalElements = reElement(JSON.retrocycle(refunctionize('+JSON.stringify(defunctionize(JSON.decycle(elementMap.get(key))))+'))); return '+classNameMap.get(key)+'._internalElements; } };\n';
    classNumber++;
  }
  classNumber = startClassNumber;
  for(var key of elementMap.keys())
  {
    output = output + 'React.renderToString(React.createElement('+classNameMap.get(key)+'));\n';
    classNumber++;
  }
  window.classNumber = classNumber;

  return output;
}

function reElement(obj, seen)
{
  if(seen == null) seen = new Map();
  else seen.set(obj, true);
  if(obj == null) return obj;
  if(typeof obj === 'string') return obj;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'function') return obj;
  if(Array.isArray(obj)) return
  {
    obj.map(function(elem){reElement(elem, seen);});
    return obj;
  }
  if(obj._mymagicrewrite)
  {
    reElement(obj.props, seen);
    var element = React.createElement(eval(obj.name), obj.props);
    for(key in element)
    {
      obj[key] = element[key];
    }
    return obj;
  }
  Object.keys(obj).map(function(key, index) {
    reElement(obj[key], seen);
  });
  return obj;
}

function deElement(obj)
{
  if(obj == null) return obj;
  if(typeof obj === 'string') return obj;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'function') return obj;
  if(Array.isArray(obj)) return obj.map(function(elem){return deElement(elem);});
  if(obj.type != null)
  {
    var element = obj;
    var elementName = typeof element.type === 'string' ? "'"+element.type+"'" : classNameMap.get(element);
    return {"_mymagicrewrite": true, "name": elementName, "props": deElement(element.props)};
  }
  var newobj = {};
  Object.keys(obj).map(function(key, index) {
   newobj[key] = deElement(obj[key]);
  });
  return newobj;
}

function refunctionize(obj)
{
  if(obj == null) return obj;
  if(obj === "%%%%NOISE%%%%") return function(){};
  if(typeof obj === 'string') return obj;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'function') return obj;
  if(Array.isArray(obj)) return obj.map(function(elem){return refunctionize(elem);});
  var newobj = {};
  Object.keys(obj).map(function(key, index) {
   newobj[key] = refunctionize(obj[key]);
  });
  return newobj;
}

function defunctionize(obj)
{
  if(obj == null) return obj;
  if(typeof obj === 'string') return obj;
  if(typeof obj === 'number') return obj;
  if(typeof obj === 'function') return "%%%%NOISE%%%%";
  if(Array.isArray(obj)) return obj.map(function(elem){return defunctionize(elem);});
  var newobj = {};
  Object.keys(obj).map(function(key, index) {
   newobj[key] = defunctionize(obj[key]);
  });
  return newobj;
}






/*
    cycle.js
    2015-02-25
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint eval, for */

/*property 
    $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object) {
        'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {

// The derez recurses through the object, producing the deep copy.

            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date) &&
                    !(value instanceof Number) &&
                    !(value instanceof RegExp) &&
                    !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }

// Otherwise, accumulate the unique value and its path.

                objects.push(value);
                paths.push(path);

// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {
                  if(value.type != null)
                  {
                      var element = value;
                      var elementName = typeof element.type === 'string' ? "'"+element.type+"'" : classNameMap.get(element);
                      nu = {"_mymagicrewrite": true, "name": elementName, "props": derez(element.props,
                                      path + '[' + JSON.stringify("props") + ']')};
                  }
                  else
                  {
                    // If it is an object, replicate the object.
                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                    path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                  }
                }
                return nu;
            }
            return value;
        }(object, '$'));
    };
}


if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}

module.exports = { perfStartRender, perfEndRender, startRender, log, endRender };

