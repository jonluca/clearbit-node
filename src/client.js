'use strict';

var assert  = require('assert');
var util    = require('util');
var _       = require('lodash');
var Promise = require('bluebird');
var needle  = Promise.promisifyAll(require('needle'));
var pkg     = require('../package.json');

function ClearbitClient (config) {
  config = config || {};
  assert(this instanceof ClearbitClient, 'Client must be called with new');
  assert(!!config.key, 'An API key must be provided');
  this.key = config.key;
}

var base = 'https://%s%s.clearbit.co/v%s';
ClearbitClient.prototype.base = function (options) {
  options = _.defaults(options, {
    version: '1',
    stream: false
  });
  assert(options.api, 'An API must be specified');
  return util.format.apply(util, [
    base,
    options.api,
    options.stream ? '-stream' : '',
    options.version
  ]);
};

ClearbitClient.prototype.url = function (options) {
  _.defaults(options, {
    path: ''
  });
  return this.base(options) + options.path;
};

function generateQuery (objects) {
  var query = _.pick(_.extend.apply(_, [{}].concat([].slice.apply(arguments))), _.identity);
  return _.isEmpty(query) ? undefined : query;
}

ClearbitClient.prototype.request = function (options) {
  options = _.defaults(options || {}, {
    method: 'get',
    query: {}
  });
  return needle.requestAsync(
    options.method,
    this.url(options),
    generateQuery({
      webhook_id: options.webhook_id
    }, options.query),
    {
      username: this.key,
      user_agent: 'ClearbitNode/v' + pkg.version
    }
  )
  .spread(function (response) {
    return response.body;
  });
};

module.exports = ClearbitClient;
