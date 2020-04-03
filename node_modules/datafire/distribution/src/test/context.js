'use strict';

var datafire = require('../entry');
var expect = require('chai').expect;

describe('Context', function () {
  it('should copy accounts object', function () {
    var accounts = { user: { id: 3 } };
    var ctx = new datafire.Context({ accounts: accounts });
    accounts.user = { id: 4 };
    expect(ctx.accounts.user.id).to.equal(3);
  });
});