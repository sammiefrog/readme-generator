"use strict";

var expect = require('chai').expect;
var zlib = require('zlib');
var datafire = require('../entry');

var echo = new datafire.Action({
  handler: function handler(input, context) {
    return context.request;
  }
});

var encode = new datafire.Action({
  inputs: [{
    title: 'encoding',
    type: 'string',
    enum: ['gzip', 'deflate']
  }, {
    title: 'message',
    type: 'string'
  }],
  handler: function handler(input) {
    var message = null;
    if (input.encoding === 'gzip') {
      message = zlib.gzipSync(input.message);
    } else if (input.encoding === 'deflate') {
      message = zlib.deflateSync(input.message);
    }
    return new datafire.Response({
      headers: {
        'Content-Encoding': input.encoding
      },
      body: message
    });
  }
});

var project = new datafire.Project({
  id: 'test_project',
  paths: {
    '/hello': {
      get: {
        action: echo
      }
    },
    '/bye/{name}': {
      post: {
        action: echo
      }
    },
    '/dupeParam/{foo}': {
      get: {
        action: echo
      }
    },
    '/encode': {
      get: {
        action: encode
      }
    },
    '/form': {
      post: {
        action: echo
      }
    }
  }
});

var integration = datafire.Integration.fromOpenAPI({
  host: 'localhost:3333',
  swagger: '2.0',
  info: { version: '1.0' },
  schemes: ['http'],
  paths: {
    '/hello': {
      get: {
        responses: {
          200: {
            description: "OK"
          }
        },
        parameters: [{
          name: 'name',
          in: 'query',
          type: 'string'
        }, {
          name: 'head',
          in: 'header',
          type: 'string'
        }]
      }
    },
    '/bye/{name}': {
      post: {
        responses: {
          200: {
            description: "OK"
          }
        },
        parameters: [{
          name: 'name',
          in: 'path',
          required: true,
          type: 'string'
        }, {
          name: 'body',
          in: 'body',
          schema: {
            properties: {
              bar: { type: 'string' }
            }
          }
        }]
      }
    },
    '/encode': {
      get: {
        parameters: [{
          name: 'encoding',
          type: 'string',
          in: 'query'
        }, {
          name: 'message',
          type: 'string',
          in: 'query'
        }],
        responses: {
          200: { description: 'OK' }
        }
      }
    },
    '/dupeParam/{foo}': {
      parameters: [{
        name: 'foo',
        in: 'path',
        type: 'string',
        required: true
      }, {
        name: 'foo',
        in: 'header',
        type: 'string'
      }],
      get: {
        parameters: [{
          name: 'foo',
          in: 'query',
          type: 'string'
        }],
        responses: {
          200: {
            description: "OK"
          }
        }
      }
    },
    '/form': {
      post: {
        parameters: [{
          name: 'foo',
          in: 'formData',
          type: 'boolean',
          required: true
        }],
        responses: {
          200: {
            description: "OK"
          }
        }
      }
    }
  }
}, 'test_integration');

describe('Integration', function () {

  before(function () {
    return project.serve(3333);
  });

  after(function () {
    project.server.close();
  });

  it("should build from OpenAPI", function () {
    expect(integration instanceof datafire.Integration).to.equal(true);
    expect(Object.keys(integration.actions).length).to.equal(5);
    var action = integration.actions.hello.get.action;
    expect(action instanceof datafire.Action).to.equal(true);
  });

  it("should pass query parameters", function () {
    return integration.actions.hello.get({ name: 'world' }).then(function (data) {
      expect(data.query).to.deep.equal({ name: 'world' });
    });
  });

  it("should pass header parameters", function () {
    return integration.actions.hello.get({ head: 'foo' }).then(function (data) {
      expect(data.headers.head).to.equal('foo');
    });
  });

  it("should pass body parameter", function () {
    return integration.actions.bye.name.post({
      name: 'foo',
      body: { 'bar': 'baz' }
    }).then(function (data) {
      expect(data.path).to.equal('/bye/foo');
      expect(data.body).to.deep.equal({ bar: 'baz' });
    });
  });

  it('should allow overriding the host', function () {
    var ctx = new datafire.Context({
      accounts: {
        test_integration: {
          host: 'http://localhost:3334'
        }
      }
    });
    return integration.actions.hello.get({ name: 'world' }, ctx).then(function (_) {
      throw new Error("shouldn't reach here");
    }).catch(function (e) {
      return expect(e.message).to.contain('ECONNREFUSED 127.0.0.1:3334');
    });
  });

  it('should handle duplicate parameter names', function () {
    var action = integration.actions.dupeParam.foo.get.action;
    expect(Object.keys(action.inputSchema.properties)).to.deep.equal(['foo_query', 'foo', 'foo_header']);
    return action.run({
      foo: 'a',
      foo_query: 'b',
      foo_header: 'c'
    }).then(function (data) {
      expect(data.path).to.equal('/dupeParam/a');
      expect(data.query).to.deep.equal({ foo: 'b' });
      expect(data.headers.foo).to.equal('c');
    });
  });

  it('should parse boolean form parameters', function () {
    var action = integration.actions.form.post.action;
    return action.run({
      foo: true
    }).then(function (data) {
      expect(data.body).to.deep.equal({ foo: 'true' });
    });
  });

  it('should decode gzip', function () {
    var action = integration.actions.encode.get.action;
    return action.run({
      encoding: 'gzip',
      message: 'hello'
    }).then(function (data) {
      expect(data).to.equal('hello');
    });
  });

  it('should decode deflate', function () {
    var action = integration.actions.encode.get.action;
    return action.run({
      encoding: 'deflate',
      message: 'hello'
    }).then(function (data) {
      expect(data).to.equal('hello');
    });
  });

  it('should handle circular refs', function () {
    var openapi = {
      host: 'api.acme.com',
      swagger: '2.0',
      info: { version: 'v1' },
      definitions: {
        Circle: {
          type: 'object',
          properties: {
            circles: {
              type: 'array',
              items: { $ref: '#/definitions/Circle' }
            }
          }
        }
      },
      parameters: {
        CircleBody: {
          in: 'body',
          name: 'body',
          required: true,
          schema: { $ref: '#/definitions/Circle' }
        }
      },
      paths: {
        '/foo': {
          get: {
            parameters: [{
              $ref: '#/parameters/CircleBody'
            }],
            responses: {
              200: {
                description: "OK",
                schema: { $ref: '#/definitions/Circle' }
              }
            }
          }
        }
      }
    };
    var integration = datafire.Integration.fromOpenAPI(JSON.parse(JSON.stringify(openapi)));
    var action = integration.actions.foo.get.action;
    expect(action.inputSchema).to.deep.equal({
      type: 'object',
      additionalProperties: false,
      required: ['body'],
      properties: {
        body: {
          $ref: '#/definitions/Circle'
        }
      },
      definitions: openapi.definitions
    });
    expect(action.outputSchema).to.deep.equal({
      definitions: openapi.definitions,
      $ref: '#/definitions/Circle'
    });
  });
});