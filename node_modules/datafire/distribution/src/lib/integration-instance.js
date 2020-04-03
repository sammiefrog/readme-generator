'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = require('./context');

/**
 * @class
 * returned by Integration.create(). Allows the user to set
 * integration account and options once instead of passing
 * a new context each time an action is called
 */

var IntegrationInstance = function IntegrationInstance(integration, account) {
  var _this = this;

  _classCallCheck(this, IntegrationInstance);

  this._integration = integration;

  var accounts = {};
  accounts[integration.id] = account;
  this._context = new Context({ accounts: accounts });

  var addActions = function addActions(fromObj, toObj) {
    var _loop = function _loop(key) {
      if (fromObj[key] instanceof Function) {
        toObj[key] = function (input, context) {
          var mergedContext = new Context(context);
          mergedContext.accounts = Object.assign({}, _this._context.accounts);
          return fromObj[key](input, mergedContext);
        };
      } else {
        toObj[key] = toObj[key] || {};
        addActions(fromObj[key], toObj[key]);
      }
    };

    for (var key in fromObj) {
      _loop(key);
    }
  };

  addActions(integration.actions, this);
};

module.exports = IntegrationInstance;