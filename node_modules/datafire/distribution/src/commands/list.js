'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');
var chalk = require('chalk');
var datafire = require('../index');
var logger = require('../util/logger');

var INTEGRATION_LOCATIONS = [path.join(process.cwd(), 'integrations'), path.join(process.cwd(), 'node_modules', '@datafire'), '@datafire'];

var INTEGRATION_LIST_URL = "https://raw.githubusercontent.com/DataFire/Integrations/master/json/list.json";
var getAllIntegrations = function getAllIntegrations(callback) {
  if (process.env.DATAFIRE_REGISTRY_DIR) {
    var list = require(process.env.DATAFIRE_REGISTRY_DIR + '/list.json');
    callback(null, list);
  } else {
    request.get(INTEGRATION_LIST_URL, { json: true }, function (err, resp, body) {
      callback(err, body);
    });
  }
};

module.exports = function (args) {
  return new Promise(function (resolve, reject) {
    if (args.all) {
      getAllIntegrations(function (err, list) {
        if (err) return reject(err);
        var keys = Object.keys(list);
        keys.forEach(function (k) {
          var api = list[k];
          if (args.query && !integrationMatchesQuery(k, api, args.query)) return;
          logger.logIntegration(k, { info: api });
          logger.log();
        });
        resolve();
      });
    } else {
      INTEGRATION_LOCATIONS.forEach(function (dir) {
        fs.readdir(dir, function (err, dirs) {
          if (err) {
            if (err.code === 'ENOENT') return;
            return reject(err);
          }
          dirs.forEach(function (name) {
            logger.log(chalk.magenta(name));
          });
          resolve();
        });
      });
    }
  });
};

var integrationMatchesQuery = function integrationMatchesQuery(name, info, query) {
  var searchText = name;
  if (info.title) searchText += info.title;
  if (info.description) searchText += info.description;
  searchText = searchText.toLowerCase();
  query = query.toLowerCase();
  return searchText.indexOf(query) !== -1;
};