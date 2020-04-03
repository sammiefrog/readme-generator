"use strict";

var util = require('../util');
var jsf = require('json-schema-faker-bb');
jsf.option({
  failOnInvalidFormat: false,
  failOnInvalidTypes: false
});

var Action = require('./action');
var Response = require('./response');
var IntegrationInstance = require('./integration-instance');
var openapiUtil = require('../util/openapi');
var path = require('path');
var fs = require('fs');
var request = require('request');

/**
 * Represents a set of related actions
 * @class Integration
 * @param {Object} opts
 * @param {string} [opts.id] - This integration's id
 * @param {string} [opts.description]
 * @param {Object} [opts.security] - security object
 * @param {Object} [opts.security[id].fields] - List of fields that are expected in an account. Values are descriptions.
 * @param {Ajv} [opts.ajv] - An Ajv instance to use for compiling schemas
 */
var Integration = module.exports = function (opts) {
  this.id = opts.id || '';
  this.title = opts.title || '';
  this.description = opts.description || '';
  this.security = opts.security || {};
  this.ajv = opts.ajv;
  this.logo = opts.logo;
  this.definitions = opts.definitions;

  this.actions = {};
  this.allActions = [];
  for (var key in opts.actions || {}) {
    this.addAction(key, opts.actions[key]);
  }
  this.addOAuthActions();
};

var MODULE_NOT_FOUND = "MODULE_NOT_FOUND";
/**
 * Gets an integration by its common name, e.g. github
 */
Integration.fromName = function (name) {
  var localLocation = path.join(process.cwd(), 'integrations', name);
  if (fs.existsSync(localLocation)) {
    return require(localLocation);
  }
  var packageName = '@datafire/' + name;
  var datafireLocation = path.join(process.cwd(), 'node_modules', packageName);
  try {
    return require(datafireLocation);
  } catch (e) {
    if (e.code === MODULE_NOT_FOUND && e.message.indexOf(packageName) !== -1) throw new Error("Couldn't find integration " + name);
    throw e;
  }
};

Integration.prototype.create = function (account) {
  return new IntegrationInstance(this, account);
};

/**
 * Gets JSON-serializable details
 */
Integration.prototype.getDetails = function () {
  var _this = this;

  var withActions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var details = {
    id: this.id,
    title: this.title,
    description: this.description,
    security: this.security,
    logo: this.logo,
    actionCount: this.allActions.length
  };
  if (!withActions) return details;
  if (this.definitions) details.definitions = this.definitions;
  details.actions = this.allActions.map(function (action) {
    details.definitions = details.definitions || action.inputSchema.definitions || action.outputSchema.definitions;
    var actionDetails = {
      id: action.id.split('/')[1],
      title: action.title,
      description: action.description,
      inputSchema: Object.assign({ definitions: null }, action.inputSchema),
      outputSchema: Object.assign({ definitions: null }, action.outputSchema)
    };
    if (action.security && action.security[_this.id]) {
      actionDetails.security = {};
      actionDetails.security[_this.id] = { integration: _this.id };
    }
    delete actionDetails.inputSchema.definitions;
    delete actionDetails.outputSchema.definitions;
    return actionDetails;
  });
  return details;
};

/**
 * Replaces all actions with mock output
 */
Integration.prototype.mockAll = function () {
  var _this2 = this;

  var mockActions = function mockActions(actions) {
    var _loop = function _loop(id) {
      if (actions[id] instanceof Function) {
        var action = actions[id].action;
        actions[id] = function (input, context) {
          var schema = action.outputSchema;
          // FIXME: see https://github.com/BigstickCarpet/json-schema-ref-parser/issues/40
          if (_this2.id === 'google_gmail' && id === 'send') {
            schema = JSON.parse(JSON.stringify(schema));
            schema.definitions.MessagePart = {};
          }
          return jsf(schema);
        };
        actions[id].action = action;
      } else {
        mockActions(actions[id]);
      }
    };

    for (var id in actions) {
      _loop(id);
    }
  };
  mockActions(this.actions);
};

/**
 * Gets action by id, e.g. 'users.get'
 * @param {string} id - Action ID
 */
Integration.prototype.action = function (id) {
  var _this3 = this;

  var parts = id.split('.');
  var obj = this.actions;
  parts.forEach(function (part) {
    obj = obj[part];
    if (!obj) throw new Error("Action " + _this3.id + "/" + id + " not found.");
  });
  if (!(obj.action instanceof Action)) throw new Error(this.id + "/" + id + " is not an action");
  return obj.action;
};

/**
 * Adds a new action to the integration
 * @param {string} id - Action ID
 * @param {Action|Object} - The action to add
 */
Integration.prototype.addAction = function (id, action) {
  if (!(action instanceof Action)) action = new Action(action);
  this.allActions.push(action);
  action.id = this.id + '/' + id;
  action.security = Object.assign({}, this.security, action.security);
  var parts = id.split('.');
  var obj = this.actions;
  parts.forEach(function (part, idx) {
    if (idx === parts.length - 1) {
      obj[part] = function (input, ctx) {
        return action.run(input, ctx).catch(function (e) {
          var message = "Action " + action.id + " failed";
          if (Response.isResponse(e)) {
            message += " with status code " + e.statusCode + ': ' + e.body;
          } else if (e.message) {
            message += ': ' + e.message;
          }
          var error = new Error(message);
          if (Response.isResponse(e)) {
            error.statusCode = e.statusCode;
            error.body = e.body;
          } else if (e instanceof Error) {
            error.stack = e.stack;
          }
          throw error;
        });
      };
      obj[part].action = action;
    } else {
      obj = obj[part] = obj[part] || {};
    }
  });
};

/**
 * Auto-generate actions for responding to OAuth callbacks and
 * and getting tokens, if applicable.
 */
Integration.prototype.addOAuthActions = function () {
  var sec = this.security[this.id] || {};
  if (!sec || !sec.oauth || sec.oauth.flow === 'implicit') return;

  var integID = this.id;
  function getToken(grantType, input, context) {
    return new Promise(function (resolve, reject) {
      var acct = context.accounts[integID];
      var form = {
        client_id: acct.client_id,
        client_secret: acct.client_secret,
        redirect_uri: acct.redirect_uri,
        grant_type: grantType
      };
      if (grantType === 'authorization_code') {
        form.code = input.code;
      } else {
        form.refresh_token = acct.refresh_token;
      }
      request.post({
        url: sec.oauth.tokenUrl,
        headers: { 'Accept': 'application/json' },
        form: form
      }, function (err, resp, body) {
        if (err) {
          return reject(err);
        } else if (resp.statusCode >= 300) {
          var message = 'Token error ' + resp.statusCode;
          try {
            body = JSON.parse(body);
          } catch (e) {}
          if (body && body.error) {
            message += ' ' + body.error;
            if (body.error_description) {
              message += ': ' + body.error_description;
            }
          }
          return reject(new Error(message));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }
  var security = Object.assign({}, this.security);
  var outputSchema = {
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      refresh_token: { type: 'string' },
      token_type: { type: 'string' },
      scope: { type: 'string' },
      expiration: { type: 'string' }
    }
  };

  this.addAction('oauthCallback', new Action({
    description: "Exchange the code passed to your redirect URI for an access_token",
    security: security,
    outputSchema: outputSchema,
    inputs: [{
      title: 'code',
      type: 'string'
    }],
    handler: function handler(input, context) {
      return getToken('authorization_code', input, context);
    }
  }));

  this.addAction('oauthRefresh', new Action({
    description: "Exchange a refresh_token for an access_token",
    security: security,
    outputSchema: outputSchema,
    handler: function handler(input, context) {
      return getToken('refresh_token', input, context);
    }
  }));
};

/**
 * Builds an integration from an Open API specification.
 */
Integration.fromOpenAPI = function (openapi, id, modifyReq) {
  openapiUtil.initialize(openapi);
  id = id || openapi.host;
  var security = {};
  if (openapi.securityDefinitions && Object.keys(openapi.securityDefinitions).length) {
    security[id] = buildSecurityFromSecurityDefs(id, openapi.securityDefinitions);
  }
  var integration = new Integration({
    id: id,
    security: security,
    title: openapi.info.title || openapi.host,
    description: openapi.info.summary || openapi.info.description,
    logo: openapi.info['x-logo'],
    ajv: util.ajv.getInstance()
  });
  for (var _path in openapi.paths) {
    for (var method in openapi.paths[_path]) {
      if (util.openapi.METHODS.indexOf(method) === -1) continue;
      var op = openapi.paths[_path][method];
      var opID = openapiUtil.getOperationId(method, _path, op);
      integration.addAction(opID, Action.fromOpenAPI(method, _path, openapi, integration, modifyReq));
    }
  }
  return integration;
};

var FLOW_PREFERENCES = ['implicit', 'password', 'application', 'accessCode'];
function isBetterFlow(toCheck, base) {
  if (!base) return true;
  return FLOW_PREFERENCES.indexOf(toCheck) > FLOW_PREFERENCES.indexOf(base);
}

/**
 * Picks the best Open API security definition to use for this integration
 */
function buildSecurityFromSecurityDefs(id, defs) {
  var security = { integration: id, fields: {} };
  for (var key in defs) {
    var def = defs[key];
    if (def.type === 'oauth2') {
      if (!security.oauth || isBetterFlow(def.flow, security.oauth.flow)) {
        security.oauth = def;
        if (security.oauth['x-location']) {
          security.oauth.name = security.oauth['x-location'].name;
          security.oauth.in = security.oauth['x-location'].in;
          delete security.oauth['x-location'];
        }
      }
      security.fields = Object.assign(security.fields, {
        access_token: 'An OAuth access token',
        refresh_token: 'An OAuth refresh token (optional)',
        client_id: 'An OAuth client ID (optional)',
        client_secret: 'An OAuth client secret (optional)',
        redirect_uri: 'The callback URL for your application'
      });
    } else if (def.type === 'basic') {
      security.fields.username = "Your username";
      security.fields.password = "Your password";
    } else if (def.type === 'apiKey') {
      security.fields[key] = def.description || "API key";
    }
  }
  return security;
}