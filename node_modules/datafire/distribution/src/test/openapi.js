"use strict";

var express = require('express');
var request = require('request');
var expect = require('chai').expect;
var datafire = require('../entry');
var swaggerMiddleware = require('swagger-express-middleware');

var OPENAPI = {
  swagger: '2.0',
  host: 'localhost:3333',
  schemes: ['http'],
  info: {
    version: '1.0'
  },
  paths: {
    '/pets': {
      get: {
        parameters: [{
          name: 'ids',
          in: 'query',
          type: 'array',
          items: { type: 'string' },
          collectionFormat: 'pipes'
        }],
        responses: {
          '200': {
            description: 'ok'
          }
        }
      }
    }
  }
};

var server = null;
var integration = null;

describe('Open API', function () {
  before(function (done) {
    var router = express.Router();
    var middleware = new swaggerMiddleware.Middleware(router);
    middleware.init(OPENAPI, function (err) {
      if (err) return done(err);
      router.use(middleware.metadata());
      router.use(middleware.parseRequest(router, { json: { strict: false } }), middleware.validateRequest());
      router.use(function (req, res) {
        res.json({
          body: req.body,
          query: req.query
        });
      });
      var app = express();
      app.use(router);
      integration = datafire.Integration.fromOpenAPI(OPENAPI, 'petstore');
      server = app.listen(3333, done);
    });
  });

  after(function () {
    return server.close();
  });

  it('should respond', function (done) {
    request.get('http://localhost:3333/pets', { json: true }, function (err, resp, body) {
      if (err) return done(err);
      expect(resp.statusCode).to.equal(200);
      expect(body.body).to.equal(undefined);
      expect(body.query).to.deep.equal({});
      done();
    });
  });

  it('should return pet IDs', function (done) {
    request.get('http://localhost:3333/pets?ids=foo|bar', { json: true }, function (err, resp, body) {
      if (err) return done(err);
      expect(resp.statusCode).to.equal(200);
      expect(body.body).to.equal(undefined);
      expect(body.query).to.deep.equal({ ids: ['foo', 'bar'] });
      done();
    });
  });

  it('should create integration', function () {
    expect(integration.allActions.length).to.equal(1);
    expect(integration.actions.pets.get.action instanceof datafire.Action).to.equal(true);
  });

  it('should accept array input', function () {
    return integration.actions.pets.get({ ids: ['foo', 'bar'] }).then(function (resp) {
      expect(resp.query).to.deep.equal({ ids: ['foo', 'bar'] });
    });
  });
});