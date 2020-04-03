'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');
var cors = require('cors');
var swaggerMiddleware = require('swagger-express-middleware');
var openapiUtil = require('../util/openapi');
var memCache = require('memory-cache');
var Response = require('./response');
var Context = require('./context');

/**
 * @class
 * Creates an Express server or router for a given DataFire project
 */

var ProjectServer = function () {
  /**
   * @param {Project} project
   */
  function ProjectServer(project) {
    _classCallCheck(this, ProjectServer);

    this.project = project;
    this.app = express();
  }

  /**
   * Initializes and starts the server
   * @returns {Promise}
   */


  _createClass(ProjectServer, [{
    key: 'start',
    value: function start(port) {
      var _this = this;

      if (this.close) this.close();
      return this.getRouter().then(function (r) {
        _this.app.use(r);
        return new Promise(function (resolve, reject) {
          var server = _this.app.listen(port, function (err) {
            if (err) return reject(err);
            resolve();
          });
          _this.close = server.close.bind(server);
        });
      });
    }

    /**
     * Builds an Express Router that can be used in another Express server, e.g.
     * app.use('/api/v1', projectServer.getRouter());
     *
     * @returns {Promise<Router>}
     */

  }, {
    key: 'getRouter',
    value: function getRouter() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var router = express.Router();
        router.use('/openapi.json', function (req, res) {
          res.set("Content-type", "application/json; charset=utf-8");
          res.send(JSON.stringify(_this2.project.openapi, null, 2));
        });
        var middleware = new swaggerMiddleware.Middleware(_this2.router);
        middleware.init(_this2.project.openapi, function (err) {
          if (err) return reject(err);
          router.use(middleware.metadata());
          if (_this2.project.options.cors) {
            router.use(middleware.CORS());
          }
          var parserOpts = {
            json: { strict: false, limit: _this2.project.options.bodyLimit }
          };
          router.use(middleware.parseRequest(router, parserOpts), middleware.validateRequest());
          router.use(function (err, req, res, next) {
            var message = err.message || "Unknown Error";
            var errorPath = message.match(/Data path: "\/([^"]*)"/);
            var paramPath = message.match(/The "([^"]*)" (\w+) parameter is invalid/);
            message = message.split('\n').pop();
            if (errorPath) {
              message = errorPath[1].replace(/\//g, '.') + ': ' + message;
            } else if (paramPath) {
              message = paramPath[1] + ': ' + message;
            }
            res.set("Content-type", "application/json; charset=utf-8");
            var statusCode = err.status || 500;
            res.status(statusCode);
            res.send(JSON.stringify({ error: message }, null, 2));
            var event = _this2.project.monitor.startEvent('http', {
              method: req.method,
              path: req.path,
              id: req.method.toUpperCase() + ' ' + req.path,
              statusCode: statusCode
            });
            event.end();
          });
          _this2.setPaths(router);
          resolve(router);
        });
      });
    }

    /**
     * Internal method to set each path on the router
     */

  }, {
    key: 'setPaths',
    value: function setPaths(router) {
      var _this3 = this;

      for (var path in this.project.paths) {
        var _loop = function _loop(method) {
          if (method === 'parameters') return 'continue';
          var op = _this3.project.paths[path][method];
          var allAuthorizers = Object.assign({}, _this3.project.authorizers || {}, op.authorizers || {});
          var expressPath = path.replace(openapiUtil.PATH_PARAM_REGEX, ':$1');
          var swaggerOp = _this3.project.openapi.paths[path][method];
          var cacheTime = op.cache || _this3.project.options.cache;
          if (cacheTime && op.cache !== false) {
            router[method](expressPath, function (req, res, next) {
              req.cacheKey = JSON.stringify({ method: req.method, url: req.url, query: req.query, body: req.body, headers: req.headers });
              var cached = memCache.get(req.cacheKey);
              if (cached) {
                res.header(cached.headers);
                res.send(cached.body);
                return;
              }
              var origEnd = res.end.bind(res);
              res.end = function (body, encoding) {
                var toCache = { body: body, headers: res.header()._headers };
                memCache.put(req.cacheKey, toCache, cacheTime);
                return origEnd(body, encoding);
              };
              next();
            });
          }
          router[method](expressPath, _this3.requestHandler(method, path, op, swaggerOp, allAuthorizers));
          if (op.extendPath) {
            for (var i = 0; i < op.extendPath; ++i) {
              path += '/{' + openapiUtil.EXTENDED_PATH_PARAM_NAME + i + '}';
              expressPath += '/:' + openapiUtil.EXTENDED_PATH_PARAM_NAME + i;
              swaggerOp = _this3.project.openapi.paths[path][method];
              router[method](expressPath, _this3.requestHandler(method, path, op, swaggerOp, allAuthorizers));
            }
          }
        };

        for (var method in this.project.paths[path]) {
          var _ret = _loop(method);

          if (_ret === 'continue') continue;
        }
      }
    }

    /**
     * Internal method that builds the express middleware to pass to the router.
     */

  }, {
    key: 'requestHandler',
    value: function requestHandler(method, path, op, swaggerOp, authorizers) {
      var _this4 = this;

      var parameters = swaggerOp.parameters || [];
      return function (req, res) {
        var context = _this4.project.getContext({
          type: 'http',
          accounts: op.accounts,
          request: {
            query: req.query,
            headers: req.headers,
            body: req.body,
            path: req.path,
            pathTemplate: path,
            method: req.method
          }
        });
        var event = _this4.project.monitor.startEvent('http', {
          method: method,
          path: path,
          context: context,
          id: method.toUpperCase() + ' ' + path,
          errorHandler: op.errorHandler
        });
        var respond = function respond(result, success) {
          var resp = Response.isResponse(result) ? result : Response.default(result);
          event.statusCode = resp.statusCode;
          event.end(success || Response.isResponse(result) ? null : result);
          resp.send(res);
        };
        var input = op.input;
        if (op.input === undefined) {
          input = {};
          var extendedPathParts = [];
          parameters.forEach(function (param) {
            if (param.in === 'body') {
              Object.assign(input, req.body, input);
            } else {
              var val = null;
              if (param.in === 'query') val = req.query[param.name];else if (param.in === 'header') val = req.get(param.name);else if (param.in === 'path') val = req.params[param.name];else if (param.in === 'formData') val = req.body[param.name];

              var pathPartMatch = param.name.match(openapiUtil.EXTENDED_PATH_PARAM_REGEX);
              if (param.in === 'path' && pathPartMatch) {
                extendedPathParts[+pathPartMatch[1]] = val;
              } else {
                input[param.name] = val;
              }
            }
          });
          if (extendedPathParts.length) {
            var extendedPath = extendedPathParts.join('/');
            var paramToEdit = null;
            var finalParamMatch = path.match(openapiUtil.EXTENDED_PATH_FINAL_PARAM_REGEX);
            if (finalParamMatch) {
              paramToEdit = parameters.filter(function (p) {
                return p.name === finalParamMatch[1];
              })[0];
              if (!paramToEdit) throw new Error("Parameter " + finalParamMatch[1] + " not found");
              input[paramToEdit.name] += '/' + extendedPath;
            } else {
              input.extendedPath = extendedPath;
            }
          }
        }
        Promise.all(Object.keys(authorizers).map(function (key) {
          var authorizer = authorizers[key];
          if (authorizer === null || context.accounts[key]) return Promise.resolve();
          return authorizer.action.run(input, context).then(function (acct) {
            if (Response.isResponse(acct)) throw acct;
            if (acct) context.accounts[key] = acct;
          });
        })).then(function (_) {
          return op.action.run(input, context);
        }).then(function (result) {
          respond(result, true);
        }, function (result) {
          if (!(result instanceof Error || Response.isResponse(result))) {
            result = new Error(result);
          }
          respond(result, false);
        });
      };
    }
  }]);

  return ProjectServer;
}();

module.exports = ProjectServer;