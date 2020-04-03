"use strict";

var fs = require('fs');
var expect = require('chai').expect;
var request = require('request');
var swaggerParser = require('swagger-parser');
var lib = require('../entry');

var lastError = null;
var storeError = new lib.Action({
  handler: function handler(input) {
    return lastError = input.error;
  }
});

var lastHttpEvent = null;
var storeHttpEvent = new lib.Action({
  handler: function handler(input) {
    return lastHttpEvent = input;
  }
});

var ping = new lib.Action({
  handler: function handler(_) {
    return Promise.resolve('pong');
  }
});

var echoInputs = new lib.Action({
  handler: function handler(input) {
    return input;
  }
});

var throwError = new lib.Action({
  inputs: [{ title: 'message', type: 'string' }],
  handler: function handler(input) {
    throw new Error(input.message);
  }
});

var respondWithStatus = new lib.Action({
  inputs: [{ title: 'statusCode', type: 'integer' }],
  handler: function handler(input) {
    return new lib.Response({ statusCode: input.statusCode });
  }
});

var hello = new lib.Action({
  inputs: [{
    title: 'name',
    type: 'string',
    maxLength: 20
  }, {
    title: 'uppercase',
    type: 'boolean',
    default: false
  }],
  handler: function handler(input, context) {
    var message = 'Hello, ' + input.name;
    if (input.uppercase) message = message.toUpperCase();
    return message;
  }
});

var respond = new lib.Action({
  handler: function handler(input) {
    return Promise.resolve(new lib.Response({
      statusCode: input.statusCode,
      body: JSON.stringify(input.message),
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

var player = new lib.Action({
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      aliases: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  },
  handler: function handler(input) {
    return Promise.resolve(input);
  }
});
player.outputSchema = player.inputSchema;

var paths = {
  '/ping': {
    get: {
      action: ping
    }
  },

  '/statusCode': {
    get: {
      action: respondWithStatus
    }
  },

  '/throw': {
    get: {
      action: throwError
    }
  },

  '/hello': {
    get: {
      action: hello,
      parameters: [{
        name: 'name',
        type: 'string',
        in: 'query',
        required: true,
        maxLength: 10
      }, {
        name: 'uppercase',
        type: 'boolean',
        in: 'query'
      }]
    }
  },

  '/hello_world': {
    get: {
      action: hello,
      input: {
        name: 'world'
      }
    }
  },

  '/respond': {
    get: {
      action: respond,
      parameters: [{
        name: 'statusCode',
        in: 'query',
        type: 'integer'
      }, {
        name: 'message',
        in: 'query',
        type: 'string'
      }]
    }
  },

  '/player/{id}': {
    post: {
      action: player,
      parameters: [{
        in: 'query',
        name: 'insert',
        type: 'boolean'
      }]
    }
  },

  '/files': {
    get: {
      extendPath: 1,
      action: echoInputs
    }
  },

  '/directory/{filename}': {
    get: {
      extendPath: 1,
      action: echoInputs
    }
  }
};

var BASE_URL = 'http://localhost:3333';

describe("Project", function () {
  var project = null;
  before(function () {
    project = new lib.Project({
      paths: paths,
      openapi: { host: 'localhost:3333' },
      events: {
        error: {
          action: storeError
        },
        http: {
          action: storeHttpEvent
        }
      }
    });
    return project.serve(3333);
  });

  after(function () {
    return project.server.close();
  });

  it('should serve ping', function (done) {
    request.get(BASE_URL + '/ping', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(200);
      expect(body).to.equal('pong');
      done();
    });
  });

  it('should serve hello with parameter', function (done) {
    request.get(BASE_URL + '/hello?name=world', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(200);
      expect(body).to.equal('Hello, world');
      done();
    });
  });

  it('should validate parameter', function (done) {
    request.get(BASE_URL + '/hello?name=reallylongname', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(400);
      console.log(body.error);
      expect(body.error).to.equal('name: String is too long (14 chars), maximum 10');
      done();
    });
  });

  it('should pass input from config', function (done) {
    request.get(BASE_URL + '/hello_world', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.equal("Hello, world");
      done();
    });
  });

  it('should not allow HTTP input if config input is specified', function (done) {
    request.get(BASE_URL + '/hello_world?uppercase=true', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(200, body.error);
      expect(body).to.equal("Hello, world");
      done();
    });
  });

  it('should allow custom response', function (done) {
    request.get(BASE_URL + '/respond?statusCode=418&message=I+am+a+teapot', { json: true }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(418);
      expect(body).to.equal('I am a teapot');
      done();
    });
  });

  it('should combine parameters and body', function (done) {
    var obj = {
      name: 'Jordan',
      aliases: ['MJ', 'His Airness']
    };
    request.post(BASE_URL + '/player/23', { json: true, body: obj }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(200);
      obj.id = 23;
      expect(body).to.deep.equal(obj);
      done();
    });
  });

  it('should return error on non-int in path', function (done) {
    var obj = {
      name: 'Jordan',
      aliases: ['MJ', 'His Airness']
    };
    request.post(BASE_URL + '/player/MIKE', { json: true, body: obj }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(400);
      expect(body).to.deep.equal({ error: 'id: "MIKE" is not a properly-formatted whole number' });
      done();
    });
  });

  it('should extend parameters with inputSchema', function (done) {
    request.get(BASE_URL + '/hello?uppercase=true&name=world', { json: true }, function (err, resp, body) {
      if (err) throw err;
      expect(resp.statusCode).to.equal(200);
      expect(body).to.equal("HELLO, WORLD");
    });
    done();
  });

  it('should prefer parameter.maxLength to schema.maxLength', function (done) {
    var name = '1234567890abcd'; // max is 10 for param but 20 for inputSchema
    request.get(BASE_URL + '/hello', { qs: { name: name }, json: true }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(400);
      expect(resp.body).to.deep.equal({ error: 'name: String is too long (14 chars), maximum 10' });
      done();
    });
  });

  it('should extend path', function (done) {
    request.get(BASE_URL + '/files/foo.txt', { json: true }, function (err, resp, body) {
      expect(body.extendedPath).to.equal('foo.txt');
      done();
    });
  });

  it('should not extend path too far', function (done) {
    request.get(BASE_URL + '/files/foo/bar.txt', { json: true }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(404);
      done();
    });
  });

  it('should extend existing path param when possible', function (done) {
    request.get(BASE_URL + '/directory/foo.txt', { json: true }, function (err, resp, body) {
      expect(body.filename).to.equal('foo.txt');
      done();
    });
  });

  it('should call error event handler', function (done) {
    request.get(BASE_URL + '/throw?message=test', { json: true }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(500);
      expect(lastError).to.not.equal(null);
      expect(lastError.message).to.equal('test');
      done();
    });
  });

  it('should call http event handler', function (done) {
    request.get(BASE_URL + '/statusCode?statusCode=418', { json: true }, function (err, resp, body) {
      expect(resp.statusCode).to.equal(418);
      expect(lastHttpEvent.statusCode).to.equal(418);
      done();
    });
  });

  it('should produce OpenAPI JSON', function (done) {
    swaggerParser.validate(project.openapi, function (err, api) {
      if (process.env.WRITE_GOLDEN) {
        fs.writeFileSync(__dirname + '/golden.openapi.json', JSON.stringify(api || project.openapi, null, 2));
        expect(err).to.equal(null);
      } else {
        expect(err).to.equal(null);
        expect(api).to.deep.equal(require('./golden.openapi.json'));
      }
      done();
    });
  });
});