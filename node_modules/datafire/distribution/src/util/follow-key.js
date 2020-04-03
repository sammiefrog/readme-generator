"use strict";

module.exports = function (keyString, obj) {
  if (!keyString) return obj;
  var keys = keyString.split('.');
  var value = obj;
  keys.forEach(function (key) {
    value = value[key];
    if (value === undefined) {
      throw new Error("Key " + keyString + " not found, missing " + key);
    }
  });
  return value;
};