"use strict";

var expect = require('chai').expect;
var datafire = require('../entry');

var PORT = 3333;

var RSS_BODY = '\n<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">\n  <channel>\n    <title>ACME RSS</title>\n    <link>http://www.acme.com</link>\n    <item>\n      <link>https://acme.com/link</link>\n      <description>An article</description>\n    </item>\n  </channel>\n</rss>\n\n';

var project = new datafire.Project({
  paths: {
    '/rss': {
      get: {
        action: {
          handler: function handler(input) {
            return new datafire.Response({
              headers: {
                'Content-Type': 'application/rss+xml'
              },
              statusCode: 200,
              body: RSS_BODY
            });
          }
        }
      }
    }
  },
  openapi: {
    host: 'localhost:' + PORT,
    schemes: ['http'],
    info: {
      'x-datafire': { type: 'rss' }
    }
  }
});

describe('RSS', function () {
  before(function () {
    return project.serve(PORT);
  });
  after(function () {
    project.server.close();
  });
  it('should return a JS object', function () {
    return project.integration.actions.rss.get().then(function (feed) {
      expect(feed.feed).to.be.an('object');
      expect(feed.feed.entries.length).to.equal(1);
    });
  });
});