'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var path = require('path');
var chalk = require('chalk');
var datafire = require('../index');
var logger = require('../util/logger');
var openapiUtil = require('../util/openapi');

module.exports = function (args) {
  var integrationName = args.integration;
  if (!integrationName) {
    var slash = args.action.indexOf('/');
    integrationName = args.action.substring(0, slash);
    args.action = args.action.substring(slash + 1, args.action.length);
  }
  var integration = datafire.Integration.fromName(integrationName);
  logger.log();
  if (!args.action) {
    var logAction = function logAction(name, action) {
      if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === 'object') {
        for (var a in action) {
          var newName = name ? name + '.' + a : a;
          logAction(newName, action[a]);
        }
      } else {
        if (args.query && !actionMatchesQuery(name, action.action, args.query)) return;
        logger.logAction(name, action.action);
        logger.log();
      }
    };

    logger.log(chalk.blue(integration.title));
    logger.logDescription(integration.description);
    logger.log();

    logAction('', integration.actions);
  } else {
    var action = integration.action(args.action);
    var input = openapiUtil.dereferenceSchema(JSON.parse(JSON.stringify(action.inputSchema)));
    var output = openapiUtil.dereferenceSchema(JSON.parse(JSON.stringify(action.outputSchema)));
    logger.logAction(args.action, action);
    if (input) {
      logger.logHeading('\nInput');
      logger.logSchema(input);
    }
    if (output) {
      logger.logHeading('\nOutput');
      logger.logSchema(output);
    }
    logger.log();
  }
  return Promise.resolve();
};

var actionMatchesQuery = function actionMatchesQuery(name, op, q) {
  q = q.toLowerCase();
  var searchText = name + '\n';
  if (op.title) searchText += op.title + '\n';
  if (op.description) searchText += op.description + '\n';
  searchText = searchText.toLowerCase();
  return searchText.indexOf(q) !== -1;
};