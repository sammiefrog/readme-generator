"use strict";

var expect = require('chai').expect;
var datafire = require('../entry');

describe('Flow', function () {
  it('should keep track of results', function () {
    var context = new datafire.Context();
    var resultSet = ['result0', ['foo', 'bar'], 23];
    var results = {
      0: resultSet[0],
      1: resultSet[1],
      2: resultSet[2],
      r0: resultSet[0],
      r1: resultSet[1]
    };
    return Promise.resolve().then(function (_) {
      return datafire.flow(context).then(function (_) {
        return results[0];
      }).then(function (r0) {
        expect(r0).to.equal(results[0]);
        expect(r0).to.equal(results.r0);
        return new Promise(function (resolve, reject) {
          setTimeout(function (_) {
            return resolve(results[1], 10);
          });
        });
      }).then(function (r1) {
        expect(r1).to.equal(results[1]);
        expect(r1).to.equal(results.r1);
        return results[2];
      });
    }).then(function (_) {
      var version = require('../util/node-version');
      if (version <= 4) {
        delete results[2]; // FIXME: last result not getting added in node v4.2
      }
      expect(context.results).to.deep.equal(results);
    });
  });

  it('should allow nested flows', function () {
    var action1 = new datafire.Action({
      handler: function handler(input, context) {
        return datafire.flow(context).then(function (_) {
          return "action1";
        }).then(function (a1) {
          expect(context.results.a1).to.equal("action1");
          return "result1";
        });
      }
    });
    var action2 = new datafire.Action({
      handler: function handler(input, context) {
        return datafire.flow(context).then(function (_) {
          return "action2";
        }).then(function (a2) {
          expect(context.results.a1).to.equal(undefined);
          expect(context.results.a2).to.equal("action2");
          return "result2";
        });
      }
    });
    var mainContext = new datafire.Context();
    return datafire.flow(mainContext).then(function (_) {
      return action1.run(null, mainContext);
    }).then(function (_) {
      return "result1.5";
    }).then(function (_) {
      return action2.run(null, mainContext);
    }).then(function (_) {
      expect(mainContext.results[0]).to.equal('result1');
      expect(mainContext.results[1]).to.equal('result1.5');
      expect(mainContext.results[2]).to.equal('result2');
      expect(mainContext.results.a1).to.equal(undefined);
      expect(mainContext.results.a2).to.equal(undefined);
    });
  });

  it('should allow nested promises', function () {
    var context = new datafire.Context();
    return Promise.resolve().then(function (_) {
      return datafire.flow(context).then(function (_) {
        return new Promise(function (resolve) {
          setTimeout(function (_) {
            return resolve(0);
          }, 10);
        }).then(function (zero) {
          return 1;
        });
      }).then(function (result) {
        expect(result).to.equal(1);
        expect(context.results).to.deep.equal({
          0: 1,
          result: 1
        });
      });
    });
  });

  it('should allow error handling', function () {
    var context = new datafire.Context();
    return datafire.flow(context).then(function (_) {
      return Promise.reject('err1');
    }).then(function (_) {
      throw new Error("shouldn't reach here");
    }).catch(function (e) {
      expect(e).to.equal('err1');
    });
  });

  it('should allow nested error handling', function () {
    var context = new datafire.Context();
    return datafire.flow(context).then(function (_) {
      return Promise.resolve().then(function (_) {
        return Promise.reject("err2");
      });
    }).then(function (_) {
      throw new Error("shouldn't reach here");
    }).catch(function (e) {
      expect(e).to.equal('err2');
    });
  });
});