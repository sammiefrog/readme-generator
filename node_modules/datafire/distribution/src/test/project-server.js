"use strict";

var fs = require('fs');
var expect = require('chai').expect;
var request = require('request');
var swaggerParser = require('swagger-parser');
var lib = require('../entry');

var DEFAULT_CACHE_TIME = 100;

var echo = new lib.Action({
  handler: function handler(input) {
    return input;
  }
});

var getTime = new lib.Action({
  handler: function handler(_) {
    return Promise.resolve(Date.now());
  }
});

var getPerson = new lib.Action({
  inputs: [{
    title: 'name',
    type: 'string',
    minLength: 1
  }, {
    title: 'age',
    type: 'integer',
    default: -1
  }]
});

var makePerson = new lib.Action({
  inputSchema: {
    type: 'object',
    required: ['name', 'age'],
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        minLength: 1
      },
      age: {
        type: 'integer',
        minimum: 0
      },
      nicknames: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
          minLength: 1
        }
      },
      address: {
        type: 'object',
        required: ['street', 'city'],
        properties: {
          street: {
            type: 'object',
            required: ['number', 'name'],
            properties: {
              number: { type: 'integer' },
              name: { type: 'string' }
            }
          },
          city: { type: 'string', minLength: 1 },
          zip: { type: 'integer' }
        }
      }
    }
  },
  handler: function handler(_) {
    return "Success";
  }
});

var paths = {
  '/time': {
    get: {
      action: getTime
    }
  },
  '/time_delayed': {
    get: {
      action: getTime,
      cache: DEFAULT_CACHE_TIME * 2
    }
  },
  '/time_fresh': {
    get: {
      action: getTime,
      cache: false
    }
  },
  '/person': {
    get: {
      action: getPerson
    },
    post: {
      action: makePerson
    }
  },
  '/echo': {
    post: {
      action: echo
    }
  }
};
var BASE_URL = 'http://localhost:3333';

function req(path, opts) {
  opts = opts || {};
  if (opts.json === undefined) opts.json = true;
  opts.method = opts.method || 'get';
  return new Promise(function (resolve, reject) {
    request(BASE_URL + path, opts, function (err, resp, body) {
      if (err) reject(err);else if (resp.statusCode >= 300) reject({ statusCode: resp.statusCode, body: body });else resolve(body);
    });
  });
}

function timeoutPromise(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      return resolve();
    }, ms);
  });
}
describe("Project Server", function () {
  var project = null;
  before(function () {
    project = new lib.Project({
      paths: paths,
      options: {
        cache: DEFAULT_CACHE_TIME,
        bodyLimit: 1000
      },
      openapi: { host: 'localhost:3333' }
    });
    return project.serve(3333);
  });

  after(function () {
    return project.server.close();
  });

  it('should respect top-level cache option', function () {
    var firstTime = null;
    return req('/time').then(function (time) {
      expect(time).to.be.a('number');
      firstTime = time;
      return req('/time');
    }).then(function (time) {
      expect(time).to.equal(firstTime);
      return timeoutPromise(DEFAULT_CACHE_TIME + 10).then(function (_) {
        return req('/time');
      });
    }).then(function (time) {
      expect(time).to.be.a('number');
      expect(time).to.not.equal(firstTime);
    });
  });

  it('should respect cache override for path', function () {
    var firstTime = null;
    return req('/time_delayed').then(function (time) {
      expect(time).to.be.a('number');
      firstTime = time;
      return req('/time_delayed');
    }).then(function (time) {
      expect(time).to.equal(firstTime);
      return timeoutPromise(DEFAULT_CACHE_TIME + 10).then(function (_) {
        return req('/time_delayed');
      });
    }).then(function (time) {
      expect(time).to.equal(firstTime);
      return timeoutPromise(DEFAULT_CACHE_TIME + 10).then(function (_) {
        return req('/time_delayed');
      });
    }).then(function (time) {
      expect(time).to.be.a('number');
      expect(time).to.not.equal(firstTime);
    });
  });

  it('should respet cache disable for path', function () {
    var firstTime = null;
    return req('/time_fresh').then(function (time) {
      expect(time).to.be.a('number');
      return req('/time_fresh');
    }).then(function (time) {
      expect(time).to.be.a('number');
      expect(time).to.not.equal(firstTime);
    });
  });

  it('should respect bodyLimit', function () {
    var name = "a";
    for (var i = 0; i < 10; ++i) {
      name += name;
    }return req('/person', { body: { name: name }, method: 'post' }).then(function (_) {
      throw new Error("Shouldn't reach here");
    }).catch(function (e) {
      expect(e.statusCode).to.equal(413);
      expect(e.body.error).to.equal('request entity too large');
    });
  });

  it('should return pretty errors for bad query param', function () {
    function checkError(qs, expected) {
      return req('/person', { qs: qs }).then(function (_) {
        throw new Error("Shouldn't reach here");
      }).catch(function (e) {
        expect(e.statusCode).to.equal(400);
        expect(e.body.error).to.equal(expected);
      });
    }
    return Promise.all([checkError({}, "Missing required query parameter \"name\""), checkError({ name: '' }, "name: String is too short (0 chars), minimum 1")]);
  });

  it('should return pretty errors for bad body param', function () {
    function checkError(person, expected) {
      var opts = { method: 'post', body: person };
      return req('/person', opts).then(function (_) {
        throw new Error("Shouldn't reach here");
      }).catch(function (e) {
        expect(e.statusCode).to.equal(400);
        expect(e.body.error).to.equal(expected);
      });
    }

    return Promise.all([checkError({ name: "Morty" }, "body: Missing required property: age"), checkError({ name: "Morty", age: -1 }, "age: Value -1 is less than minimum 0"), checkError({ name: "Morty", age: 'Rick' }, "age: Invalid type: string (expected integer)"), checkError({ name: "Morty", age: 14, nicknames: [] }, 'nicknames: Array is too short (0), minimum 1'), checkError({ name: "Morty", age: 14, nicknames: ['foo', ''] }, 'nicknames.1: String is too short (0 chars), minimum 1'), checkError({ name: "Morty", age: 14, address: {} }, 'address: Missing required property: street'), checkError({ name: "Morty", age: 14, address: { street: {}, city: 'NYC' } }, 'address.street: Missing required property: number'), checkError({ name: "Morty", age: 14, address: { street: { name: '', number: 0 }, city: '' } }, 'address.city: String is too short (0 chars), minimum 1')]);
  });

  it('should allow JSON input for POST operation', function () {
    var body = { name: 'foo' };
    return req('/echo', { method: 'post', body: body }).then(function (input) {
      expect(input).to.deep.equal(body);
    });
  });

  it('should allow form-encoded input for POST operation', function () {
    var form = { name: 'foo' };
    return req('/echo', { method: 'post', form: form }).then(function (input) {
      expect(input).to.deep.equal(form);
    });
  });
});