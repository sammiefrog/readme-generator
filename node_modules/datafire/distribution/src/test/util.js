"use strict";

var expect = require('chai').expect;
var openapiUtil = require('../util/openapi');
var getOpId = openapiUtil.getOperationId;

describe("OpenAPI Util", function () {
  it('should generate sensible operationIDs', function () {
    expect(getOpId('get', '/foo', {})).to.equal('foo.get');
    expect(getOpId('get', '/foo/', {})).to.equal('foo.get');
    expect(getOpId('post', '/foo/{name}/bar', {})).to.equal('foo.name.bar.post');
    expect(getOpId('get', '/foo/{name}.json', {})).to.equal('foo.name.json.get');
    expect(getOpId('get', '/foo-bar/baz', {})).to.equal('foo_bar.baz.get');
    expect(getOpId('get', '/foo--bar/baz', {})).to.equal('foo_bar.baz.get');
  });

  it('should use operationId when possible', function () {
    expect(getOpId('get', '/foo', { operationId: 'foo' })).to.equal('foo');
    expect(getOpId('get', '/foo', { operationId: 'foo.bar' })).to.equal('foo.bar');
    expect(getOpId('get', '/foo', { operationId: 'foo.bar[baz]' })).to.equal('foo.get');
    expect(getOpId('get', '/foo', { operationId: 'Foo Bar' })).to.equal('foo.get');
  });
});