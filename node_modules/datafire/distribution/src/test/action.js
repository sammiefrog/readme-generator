"use strict";

var expect = require('chai').expect;
var datafire = require('../entry');
var Action = datafire.Action;

describe('Action', function () {
  it('should have a default handler', function () {
    var action = new Action();
    return action.run().then(function (result) {
      expect(result).to.equal(null);
    });
  });

  it('should use argument handler', function () {
    var action = new Action({
      handler: function handler(input) {
        return Promise.resolve('foo');
      }
    });
    return action.run().then(function (result) {
      expect(result).to.equal('foo');
    });
  });

  it('should allow any input with no schema', function () {
    var action = new Action({
      handler: function handler(input) {
        return Promise.resolve('foo');
      }
    });
    return Promise.all([action.run().then(function (result) {
      expect(result).to.equal('foo');
    }), action.run({}).then(function (result) {
      expect(result).to.equal('foo');
    }), action.run('bar').then(function (result) {
      expect(result).to.equal('foo');
    }), action.run(['bar', 'baz']).then(function (result) {
      expect(result).to.equal('foo');
    })]);
  });

  it('should validate against inputSchema', function (done) {
    var action = new Action({
      inputSchema: { type: 'string', maxLength: 3 },
      handler: function handler(input) {
        return Promise.resolve('foo');
      }
    });
    Promise.all([action.run().then(function (_) {
      throw new Error("Should not succeed");
    }).catch(function (e) {
      expect(e.message).to.be.a('string');
    }), action.run('bar').then(function (result) {
      expect(result).to.equal('foo');
    }), action.run('bars').then(function (_) {
      throw new Error("Should not succeed");
    }).catch(function (e) {
      expect(e.message).to.be.a('string');
    })]).then(function (_) {
      return done();
    });
  });

  it('should accept inputs as array', function () {
    var action = new Action({
      inputs: [{
        title: 'name',
        type: 'string',
        default: 'Unknown'
      }, {
        title: 'age',
        type: 'integer',
        minimum: 0
      }],
      handler: function handler(input) {
        return input.name + ' is age ' + input.age;
      }
    });

    return Promise.all([action.run({
      name: 'Lucy',
      age: 2
    }).then(function (msg) {
      return expect(msg).to.equal('Lucy is age 2');
    }), action.run({
      name: 'Lucy'
    }).then(function (_) {
      throw new Error("Shouldn't reach here");
    }).catch(function (e) {
      expect(e.message).to.equal("data should have required property 'age'");
    }), action.run({
      name: 'Lucy',
      age: -2
    }).then(function (_) {
      throw new Error("Shouldn't reach here");
    }).catch(function (e) {
      return expect(e.message).to.equal("data.age should be >= 0");
    }), action.run({ age: 1 }).then(function (msg) {
      return expect(msg).to.equal('Unknown is age 1');
    })]);
  });

  it('should allow error handling', function () {
    var action = new Action({
      handler: function handler(input) {
        return Promise.resolve().then(function (_) {
          return Promise.reject("err1");
        }).then(function (_) {
          throw new Error("shouldn't reach here");
        }).catch(function (e) {
          expect(e).to.equal("err1");
        });
      }
    });
    return action.run();
  });

  it('should allow thrown errors', function () {
    var action = new Action({
      handler: function handler(input) {
        return Promise.resolve().then(function (_) {
          throw new Error("err1");
        }).then(function (_) {
          throw new Error("shouldn't reach here");
        }).catch(function (e) {
          expect(e.message).to.equal('err1');
        });
      }
    });
    return action.run();
  });

  it('should require accounts', function () {
    var action = new Action({
      security: {
        acct1: {},
        acct2: { optional: true }
      },
      handler: function handler(_) {
        return "Success";
      }
    });

    var validContext = new datafire.Context({
      accounts: {
        acct1: {}
      }
    });
    var invalidContext = new datafire.Context({
      accounts: {
        acct2: {}
      }
    });

    return action.run().then(function (_) {
      throw new Error("shouldn't reach here");
    }).then(function (_) {
      return action.run(null, invalidContext);
    }).catch(function (e) {
      return expect(e.message).to.contain('Account acct1 not specified');
    }).then(function (_) {
      return action.run(null, invalidContext);
    }).then(function (_) {
      throw new Error("shouldn't reach here");
    }).catch(function (e) {
      return expect(e.message).to.contain('Account acct1 not specified');
    }).then(function (_) {
      return action.run(null, validContext);
    }).then(function (msg) {
      return expect(msg).to.equal("Success");
    });
  });

  it('should allow null input if there are no required inputs', function () {
    var action = new Action({
      inputs: [{
        title: 'foo',
        type: 'string',
        default: ''
      }],
      handler: function handler(input) {
        return input.foo;
      }
    });
    return action.run(null).then(function (msg) {
      return expect(msg).to.equal('');
    });
  });
});