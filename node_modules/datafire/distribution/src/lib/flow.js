'use strict';

var getParameterNames = require('@captemulation/get-parameter-names');
var Context = require('./context');

/**
 * Returns a Promise. Each time .then() is called on the resulting
 * promise, the flow will record the result in 'context'.
 *
 * @param {Context} context
 */
var Flow = module.exports = function (context) {
  context = context || new Context();
  var nextResultIdx = -1;
  var results = {};

  function wrapPromise(promise, resultName) {
    var then = promise.then.bind(promise);
    promise.then = function (fn, reject) {
      var params = fn ? getParameterNames(fn) : [];
      var fnWrapper = function fnWrapper(result) {
        if (nextResultIdx >= 0) {
          results[nextResultIdx++] = result;
          if (params[0]) results[params[0]] = result;
        } else {
          ++nextResultIdx;
        }
        context.results = results;
        if (fn) {
          return fn(result);
        }
      };
      var newPromise = then(fnWrapper, reject);
      return wrapPromise(newPromise);
    };
    return promise;
  }

  return wrapPromise(Promise.resolve());
};