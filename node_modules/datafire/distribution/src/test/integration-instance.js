'use strict';

var datafire = require('../entry');
var expect = require('chai').expect;

var integ = new datafire.Integration({
  id: 'test_integration',
  security: {
    test_integration: {
      fields: {
        password: 'your password'
      }
    }
  }
});

integ.addAction('password.get', {
  handler: function handler(input, context) {
    return context.accounts.test_integration.password;
  }
});

integ.addAction('echoContext', {
  handler: function handler(input, context) {
    return context;
  }
});

var integInstance = integ.create({ password: 'foobar' });

describe('IntegrationInstance', function () {
  it('should use account set at top level', function () {
    return integInstance.password.get().then(function (pw) {
      return expect(pw).to.equal('foobar');
    });
  });

  it('should not use account passed to action', function () {
    var ctx = new datafire.Context({
      accounts: {
        test_integration: { password: 'baz' }
      }
    });
    return integInstance.password.get({}, ctx).then(function (pw) {
      return expect(pw).to.equal('foobar');
    });
  });

  it('should still have access to local context', function () {
    var ctx = new datafire.Context({
      type: 'http',
      accounts: {
        test_integration: { password: 'baz' }
      }
    });
    return integInstance.echoContext({}, ctx).then(function (ctxOut) {
      expect(ctxOut.accounts.test_integration.password).to.equal('foobar');
      expect(ctxOut.type).to.equal('http');
    });
  });

  it('should not have access to extra accounts', function () {
    var ctx = new datafire.Context({
      accounts: {
        other_integration: { password: 'baz' }
      }
    });
    return integInstance.echoContext({}, ctx).then(function (ctx) {
      return expect(ctx.accounts.other_integration).to.equal(undefined);
    });
  });
});