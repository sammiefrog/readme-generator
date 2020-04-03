"use strict";

var expect = require('chai').expect;

var datafire = require('../entry');

describe("Response", function () {
  it('should allow json option', function () {
    var resp = new datafire.Response({
      statusCode: 401,
      json: { error: "Foo" }
    });
    expect(resp.headers['Content-Type']).to.equal('application/json');
    expect(resp.body).to.equal(JSON.stringify({ error: "Foo" }, null, 2));
  });
});