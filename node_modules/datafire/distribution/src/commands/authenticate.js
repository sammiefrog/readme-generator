'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var inquirer = require('inquirer');
var urlParser = require('url');
var querystring = require('querystring');
var request = require('request');
var YAML = require('yamljs');

var DEFAULT_OAUTH_PORT = 3333;
var CALLBACK_HTML_FILE = path.join(__dirname, '..', 'www', 'oauth_callback.html');

var datafire = require('../index');
var logger = require('../util/logger');

module.exports = function (args) {
  var project = datafire.Project.fromDirectory(args.directory);
  var integration = datafire.Integration.fromName(args.integration);
  var security = integration.security;
  if (!security || !Object.keys(security).length) {
    return Promise.reject(new Error("No security needed for " + args.integration));
  }
  security = security[integration.id];

  var aliasQuestion = [{
    type: 'input',
    name: 'alias',
    message: "Choose an alias for this account:",
    validate: function validate(alias) {
      return (/^\w+$/.test(alias) || "Alias can only contain letters, numbers, and _"
      );
    },
    default: integration.id
  }];
  if (args.alias) {
    aliasQuestion = [];
  }
  console.log(args.port);
  return inquirer.prompt(aliasQuestion).then(function (answers) {
    var alias = args.alias || answers.alias;
    var accountToEdit = project.accounts[alias] = project.accounts[alias] || {};
    if (accountToEdit.integration && accountToEdit.integration !== args.integration) {
      throw new Error("Account " + alias + " is for integration " + accountToEdit.integration + ", not " + args.integration);
    }
    accountToEdit.integration = args.integration;
    if (security.oauth) {
      return inquirer.prompt([{
        type: 'confirm',
        name: 'generate_token',
        message: "This integration supports OAuth 2.0. Do you want to generate a new token? (press 'n' to enter manually): ",
        default: true
      }]).then(function (results) {
        if (results.generate_token) {
          return generateToken(project, integration, security.oauth, accountToEdit, accountToEdit, args.port);
        } else {
          return promptAllFields(project, integration, security, accountToEdit);
        }
      });
    } else {
      return promptAllFields(project, integration, security, accountToEdit);
    }
  });
};

var promptAllFields = function promptAllFields(project, integration, security, account) {
  var questions = Object.keys(security.fields).map(function (field) {
    return {
      type: 'input',
      name: field,
      message: field + ' - ' + security.fields[field] + ':'
    };
  });
  return inquirer.prompt(questions).then(function (answers) {
    for (var k in answers) {
      if (answers[k]) account[k] = answers[k];
    }
    account.integration = integration.id;
    saveAccounts(project);
  });
};

var generateToken = function generateToken(project, integration, secOption, accountToEdit, clientAccount, port) {
  var questions = [];
  if (!clientAccount.client_id || !clientAccount.client_secret) {
    questions.push({
      type: 'input',
      name: 'client_id',
      default: clientAccount.client_id,
      message: "Please enter a client_id to use when generating the token"
    });
    questions.push({
      type: 'input',
      name: 'client_secret',
      default: clientAccount.client_secret,
      message: "Please enter a client_secret to use when generating the token"
    });
  }
  return inquirer.prompt(questions).then(function (answers) {
    if (answers.client_id) clientAccount.client_id = answers.client_id;
    if (answers.client_secret) clientAccount.client_secret = answers.client_secret;
    return startOAuthServer(project, integration, secOption, accountToEdit, clientAccount, port);
  });
};
var saveAccounts = function saveAccounts(project) {
  var file = path.join(project.directory, 'DataFire-accounts.yml');
  logger.log('Saving credentials to ' + file.replace(process.cwd(), '.'));
  fs.writeFileSync(file, YAML.stringify({ accounts: project.accounts }, 10));
};

var getOAuthURL = function getOAuthURL(integration, secDef, clientAccount, scopes, redirectURI) {
  var flow = secDef.flow;
  var url = secDef.authorizationUrl;
  var state = Math.random();
  url += url.indexOf('?') === -1 ? '?' : '&';
  url += 'response_type=' + (flow === 'implicit' ? 'token' : 'code');
  url += '&redirect_uri=' + encodeURIComponent(redirectURI);
  url += '&client_id=' + encodeURIComponent(clientAccount.client_id);

  // FIXME: google hack - no refresh token unless these parameters are included
  if (secDef.authorizationUrl.match(/accounts\.google\.com/)) {
    if (flow === 'accessCode') url += '&access_type=offline';
    url += '&approval_prompt=force';
  }

  if (scopes.length > 0) {
    url += '&scope=' + encodeURIComponent(scopes.join(' '));
  }
  url += '&state=' + encodeURIComponent(state);
  return url;
};

var startOAuthServer = function startOAuthServer(project, integration, secDef, accountToEdit, clientAccount, port) {
  port = port || DEFAULT_OAUTH_PORT;
  var redirectURI = clientAccount.redirect_uri || 'http://localhost:' + port;
  return new Promise(function (resolve, reject) {
    var server = http.createServer(function (req, res) {
      var urlObj = urlParser.parse(req.url);
      if (urlObj.pathname !== '/') {
        res.writeHead(404);
        res.end();
        return;
      }
      var search = urlParser.parse(req.url).search || '?';
      search = search.substring(1);
      search = querystring.parse(search);
      if (search.code) {
        request.post({
          url: secDef.tokenUrl,
          form: {
            code: search.code,
            client_id: clientAccount.client_id,
            client_secret: clientAccount.client_secret,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code'
          },
          json: true
        }, function (err, resp, body) {
          if (err) return reject(err);
          if (resp.statusCode >= 300) return reject(resp.statusCode);
          var newURL = '/?saved=true#access_token=' + encodeURIComponent(body.access_token);
          newURL += '&refresh_token=' + encodeURIComponent(body.refresh_token);
          newURL += '&saved=true';
          res.writeHead(302, {
            'Location': newURL
          });
          res.end();
          accountToEdit.access_token = body.access_token;
          accountToEdit.refresh_token = body.refresh_token;
          accountToEdit.client_id = clientAccount.client_id;
          accountToEdit.client_secret = clientAccount.client_secret;
          saveAccounts(project);
        });
      } else {
        fs.readFile(CALLBACK_HTML_FILE, 'utf8', function (err, data) {
          if (err) return reject(err);
          res.end(data);
          if (!search.saved) {
            inquirer.prompt([{
              type: 'input',
              name: 'access_token',
              message: 'access_token:'
            }, {
              type: 'input',
              name: 'refresh_token',
              message: 'refresh_token:'
            }]).then(function (answers) {
              if (answers.access_token) accountToEdit.access_token = answers.access_token;
              if (answers.refresh_token) accountToEdit.refresh_token = answers.refresh_token;
              saveAccounts(project);
              server.close();
              resolve();
            });
          } else {
            server.close();
            resolve();
          }
        });
      }
    }).listen(port, function (err) {
      if (err) throw err;
      function finish(scopes) {
        var url = getOAuthURL(integration, secDef, clientAccount, scopes, redirectURI);
        logger.log("Visit the URL below to generate access and refresh tokens");
        logger.logInfo("Be sure to set redirect_uri to " + redirectURI + " in your OAuth client's settings page");
        logger.logURL(url);
      }
      var scopes = Object.keys(secDef.scopes || {});
      if (!scopes.length) return finish(scopes);
      var scopeQuestions = [{
        type: 'checkbox',
        name: 'scopes',
        message: "Choose which scopes to enable for this account",
        choices: scopes.map(function (s) {
          var name = s;
          if (secDef.scopes[s]) name += ' (' + secDef.scopes[s] + ')';
          return { name: name, value: s };
        })
      }];
      inquirer.prompt(scopeQuestions).then(function (answers) {
        return finish(answers.scopes);
      });
    });
  });
};