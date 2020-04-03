'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var openapiUtil = require('../util/openapi');
var request = require('request');
var Action = require('./action');
var Response = require('./response');
var rssParser = require('rss-parser');
var zlib = require('zlib');
var ZLIB_OPTIONS = {
  flush: zlib.Z_SYNC_FLUSH,
  finishFlush: zlib.Z_SYNC_FLUSH
};

var BODY_METHODS = ['put', 'patch', 'post'];

var getActionFromOperation = module.exports = function (method, path, openapi, integration, modifyReq) {
  var op = openapi.paths[path][method];
  var params = op.parameters || [];
  var hasRequiredParam = !!params.filter(function (p) {
    return p.required;
  }).length;
  var inputSchema = {
    type: hasRequiredParam ? 'object' : ['object', 'null'],
    properties: {},
    additionalProperties: false,
    definitions: openapi.definitions
  };
  var names = openapiUtil.getUniqueNames(params);
  params.forEach(function (param, idx) {
    var name = names[idx];
    inputSchema.properties[name] = getSchemaFromParam(param);
    if (param.required) {
      inputSchema.required = inputSchema.required || [];
      inputSchema.required.push(name);
    }
  });
  var response = getDefaultResponse(op);
  var outputSchema = Object.assign({ definitions: openapi.definitions }, response.schema);
  var actionSecurity = {};
  if (!op.security || op.security.length) {
    actionSecurity = integration.security;
  } else {
    actionSecurity[integration.id] = false;
  }
  return new Action({
    title: op.operationId || method.toUpperCase() + ' ' + path,
    description: op.description || op.summary,
    inputSchema: params.length ? inputSchema : {},
    outputSchema: outputSchema,
    security: actionSecurity,
    ajv: integration.ajv,
    handler: function handler(input, ctx) {
      input = input || {};
      var account = ctx.accounts[integration.id];
      var scheme = openapiUtil.getBestScheme(openapi.schemes);
      if (!openapi.host && (!account || !account.host)) {
        throw new Error("The 'host' field must be specified in the " + integration.id + " account");
      }
      var url = account && account.host || scheme + '://' + openapi.host;
      var reqOpts = {
        method: method,
        url: url,
        qs: {},
        qsStringifyOptions: {},
        headers: {},
        form: {},
        formData: {},
        body: null,
        encoding: null
      };
      if (openapi.basePath && openapi.basePath !== '/') reqOpts.url += openapi.basePath;
      reqOpts.url += path;
      var addParam = function addParam(loc, name, val, isFile) {
        if (val === undefined) return;
        if (loc === 'query') {
          reqOpts.qs[name] = val;
        } else if (loc === 'header') {
          reqOpts.headers[name] = val;
        } else if (loc === 'path') {
          reqOpts.url = reqOpts.url.replace('{' + name + '}', val);
        } else if (loc === 'body') {
          reqOpts.body = JSON.stringify(val);
        } else if (loc === 'formData') {
          if (isFile) {
            if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
              var content = val.encoding ? new Buffer(val.content, val.encoding) : val.content;
              val = {
                value: content,
                options: {
                  filename: val.filename || name,
                  contentType: val.contentType,
                  knownLength: val.knownLength
                }
              };
            } else {
              val = {
                value: val,
                options: {
                  filename: name
                }
              };
            }
            reqOpts.formData[name] = val;
          } else {
            reqOpts.form[name] = val;
          }
        }
      };
      var names = openapiUtil.getUniqueNames(params);
      params.forEach(function (param, idx) {
        var val = input[names[idx]];
        if (param.in === 'query' && Array.isArray(val)) {
          if (param.collectionFormat === 'multi') {
            reqOpts.qsStringifyOptions.arrayFormat = 'repeat';
          } else {
            reqOpts.qsStringifyOptions.sep = openapiUtil.getCollectionFormatSeparator(param.collectionFormat);
          }
        }
        addParam(param.in, param.name, val, param.type === 'file');
      });

      var hasRefreshToken = false;
      var oauthDef = null;
      if (account) {
        for (var key in openapi.securityDefinitions || {}) {
          var def = openapi.securityDefinitions[key];
          if (def.type === 'basic' && account.username && account.password) {
            var details = account.username + ':' + account.password;
            addParam('header', 'Authorization', "Basic " + new Buffer(details, 'utf8').toString('base64'));
          } else if (def.type === 'apiKey' && account[key]) {
            addParam(def.in, def.name, account[key]);
          } else if (def.type === 'oauth2' && account.access_token) {
            hasRefreshToken = !!account.refresh_token;
            if (!oauthDef || oauthDef.flow === 'implicit') {
              oauthDef = def;
            }
            if (def.in) {
              addParam(def.in, def.name, account.access_token);
            } else {
              addParam('header', 'Authorization', "Bearer " + account.access_token);
            }
          }
        }
      }

      if (Object.keys(reqOpts.formData).length === 0) {
        delete reqOpts.formData;
      }
      if (Object.keys(reqOpts.form).length === 0) {
        delete reqOpts.form;
      }

      var refreshOAuthToken = function refreshOAuthToken(callback) {
        var form = {
          client_id: account.client_id,
          client_secret: account.client_secret,
          refresh_token: account.refresh_token,
          grant_type: 'refresh_token'
        };
        request.post({
          url: account.refresh_url || oauthDef.refreshUrl || oauthDef.tokenUrl,
          headers: account.refresh_headers || {},
          json: true,
          form: form
        }, function (err, resp, body) {
          if (err) return callback(err);
          if (resp.statusCode >= 300) return callback(new Error(resp.statusCode));
          account.access_token = body.access_token;
          account.refresh_token = body.refresh_token || account.refresh_token;
          Action.callOAuthRefreshCallbacks(account);
          addParam('header', 'Authorization', "Bearer " + body.access_token);
          callback();
        });
      };
      if (BODY_METHODS.indexOf(method) !== -1 && reqOpts.body !== null) {
        var consumes = op.consumes || ['application/json'];
        var cType = consumes.indexOf('application/json') === -1 ? consumes[0] : 'application/json';
        addParam('header', 'Content-Type', cType);
      }

      addParam('header', 'User-Agent', 'DataFire');

      var sendRequest = function sendRequest(resolve, reject, isRetry) {
        request(reqOpts, function (err, resp, body) {
          if (err) {
            return reject(err);
          }
          if (body) {
            var encoding = resp.headers['content-encoding'];
            if (encoding === 'gzip') {
              body = zlib.gunzipSync(body, ZLIB_OPTIONS).toString('utf8');
            } else if (encoding === 'deflate') {
              body = zlib.inflateSync(body, ZLIB_OPTIONS).toString('utf8');
            } else {
              body = body.toString('utf8');
            }
          }
          if (!isRetry && resp.statusCode === 401 && hasRefreshToken) {
            refreshOAuthToken(function (err) {
              if (err) reject(new Response({ statusCode: 401 }));else sendRequest(resolve, reject, true);
            });
            return;
          } else if (resp.statusCode >= 300) {
            return reject(new Response({ statusCode: resp.statusCode, body: body }));
          }
          var ctype = resp.headers['content-type'] || '';
          if (body && ctype.indexOf('application/json') !== -1) {
            body = JSON.parse(body);
            resolve(body);
          } else if (openapi.info['x-datafire'] && openapi.info['x-datafire'].type === 'rss') {
            rssParser.parseString(body, function (err, feed) {
              if (err) reject(err);else resolve(feed);
            });
          } else {
            resolve(body);
          }
        });
      };
      if (modifyReq) modifyReq(reqOpts, ctx);
      return new Promise(sendRequest);
    }
  });
};

var getSchemaFromParam = function getSchemaFromParam(param) {
  if (param.in === 'body' && param.schema) return param.schema;
  var schema = {
    type: param.type
  };
  if (param.type === 'file') {
    schema.type = ['string', 'object'];
    schema.properties = {
      content: { type: 'string' },
      encoding: { type: 'string', enum: ['ascii', 'utf8', 'utf16le', 'base64', 'binary', 'hex'] },
      contentType: { type: 'string' },
      filename: { type: 'string' }
    };
  }
  schema.type = param.type === 'file' ? ['string', 'object'] : param.type;
  openapiUtil.PARAM_SCHEMA_FIELDS.forEach(function (f) {
    if (param[f] !== undefined) schema[f] = param[f];
  });
  return schema;
};

var getDefaultResponse = function getDefaultResponse(op) {
  var keys = Object.keys(op.responses).sort();
  return op.responses[keys[0]];
};