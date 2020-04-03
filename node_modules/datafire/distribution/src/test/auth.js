"use strict";

var request = require('request');
var expect = require('chai').expect;

var project = require('./auth/project');
var saas1 = require('./auth/saas1');
var saas2 = require('./auth/saas2');
var oauth = require('./auth/oauth');

var PROJECT_URL = 'http://localhost:3333';
var SAAS1_URL = 'http://localhost:3334';
var SAAS2_URL = 'http://localhost:3335';
var OAUTH_URL = 'http://localhost:3336';

var datafire = require('../entry');

describe('Authorization', function () {

  before(function () {
    return Promise.all([project.serve(3333), saas1.serve(3334), saas2.serve(3335), oauth.serve(3336)]);
  });

  after(function () {
    project.server.close();
    saas1.server.close();
    saas2.server.close();
    oauth.server.close();
  });

  it('should return 401 for no auth', function (done) {
    request.get(PROJECT_URL + '/me', { json: true }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(401, body);
      done();
    });
  });

  it('should return 200 for auth', function (done) {
    request.get(PROJECT_URL + '/me', { json: true, headers: { Authorization: 'jack' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.equal("You are logged in as Jack White");
      done();
    });
  });

  it('should return 200 for public endpoint with no auth', function (done) {
    request.get(PROJECT_URL + '/public', { json: true }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  it('should show user files from saas2', function (done) {
    request.get(PROJECT_URL + '/saas2/files', { json: true, headers: { Authorization: 'jack' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.deep.equal(['foo.txt', 'bar.md']);
      done();
    });
  });

  it('should clear authorization on a second call', function (done) {
    request.get(PROJECT_URL + '/saas2/files', { json: true, headers: { Authorization: 'meg' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.deep.equal([]);
      done();
    });
  });

  it('should return 401 from saas1', function (done) {
    request.get(SAAS1_URL + '/secret', { json: true }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(401, body);
      done();
    });
  });

  it('should proxy from project to saas1', function (done) {
    request.get(PROJECT_URL + '/saas1/secret', { json: true, headers: { Authorization: 'jack' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.equal('foobar');
      done();
    });
  });

  it('should return 401 for invalid oauth', function (done) {
    request.get(PROJECT_URL + '/oauth/invalid', { json: true, headers: { Authorization: 'jack' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(401, body.error);
      done();
    });
  });

  it('should return 200 for valid oauth', function (done) {
    request.get(PROJECT_URL + '/oauth/valid', { json: true, headers: { Authorization: 'jack' } }, function (err, resp, body) {
      expect(err).to.equal(null);
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.equal('OK');
      done();
    });
  });

  it('should respect different accounts', function () {
    var jack = new datafire.Context({ accounts: { project: { api_key: 'jack' } } });
    var meg = new datafire.Context({ accounts: { project: { api_key: 'meg' } } });
    return Promise.resolve().then(function (_) {
      return project.integration.actions.me({}, jack);
    }).then(function (msg) {
      expect(msg).to.equal("You are logged in as Jack White");
    }).then(function (_) {
      return project.integration.actions.me({}, meg);
    }).then(function (msg) {
      expect(msg).to.equal("You are logged in as Meg White");
    }).then(function (_) {
      return project.integration.actions.me();
    }).then(function (msg) {
      throw new Error("shouldn't reach here");
    }).catch(function (e) {
      expect(e.message).to.contain("Account project not specified");
    });
  });
});