/*!
 *
 * Copyright (c) 2013 Sebastian Golasch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

// ext. libs
var fs = require('fs');
var Q = require('q');

// int. libs
var WD = require('dalek-internal-webdriver');
var Browser = require('./lib/browser');

/**
 * Initializes the sauce labs driver & the remote browser instance
 *
 * @param {object} opts Initializer options
 * @constructor
 */

var Sauce = function (opts) {
  // get the browser configuration & the browser module
  var browserConf = {name: null};
  var browser = opts.browserMo;

  // prepare properties
  this._initializeProperties(opts);

  // create a new webdriver client instance
  this.webdriverClient = new WD(browser, this.events);

  // listen on browser events
  this._startBrowserEventListeners(browser);

  // assign the current browser name
  browserConf.name = this.browserName;

  // store desired capabilities of this session
  this.desiredCapabilities = browser.getDesiredCapabilities(this.browserName, this.config);
  this.browserDefaults = browser.driverDefaults;
  this.browserDefaults.status = browser.getStatusDefaults(this.desiredCapabilities);
  this.browserData = browser;

  // set auth data
  var driverConfig = this.config.get('driver.sauce');
  browser.setAuth(driverConfig.user, driverConfig.key);

  // launch the browser & when the browser launch
  // promise is fullfilled, issue the driver:ready event
  // for the particular browser
  browser
    .launch(browserConf, this.reporterEvents, this.config)
    .then(this.events.emit.bind(this.events, 'driver:ready:sauce:' + this.browserName, browser));
};

/**
 * This module is a driver plugin for [DalekJS](//github.com/dalekjs/dalek).
 * It connects Daleks testsuite with the remote testing environment of [Sauce Labs](https://saucelabs.com).
 *
 * The driver can be installed with the following command:
 *
 * ```bash
 * $ npm install dalek-driver-sauce --save-dev
 * ```
 *
 * You can use the driver by adding a config option to the your [Dalekfile](/docs/config.html)
 *
 * ```javascript
 * "driver": ["sauce"]
 * ```
 *
 * Or you can tell Dalek that it should run your tests via sauces service via the command line:
 *
 * ```bash
 * $ dalek mytest.js -d sauce
 * ```
 *
 * In order to run your tests within the Sauce Labs infrastructure, you must add your sauce username & key 
 * to your dalek configuration. Those two parameters must be set in order to get this driver up & running.
 * You can specifiy them within your [Dalekfile](/docs/config.html) like so:
 *
 * ```javascript
 * "driver.sauce": {
 *   "user": "dalekjs",
 *   "key": "aaaaaa-1234-567a-1abc-1br6d9f68689"
 * }
 * ```
 *
 * It is also possible to specify a set of other extra saucy parameters like `name` & `tags`:
 *
 * ```javascript
 * "driver.sauce": {
 *   "user": "dalekjs",
 *   "key": "aaaaaa-1234-567a-1abc-1br6d9f68689",
 *   "name": "Guineapig",
 *   "tags": ["dalek", "testproject"]
 * }
 * ```
 *
 * If you would like to have a more control over the browser/OS combinations that are available, you are able 
 * to configure you custom combinations:
 *
 * ```javascript
 * "browsers": [{
 *   "chrome": {
 *     "platform": "OS X 10.6",
 *     "actAs": "chrome",
 *     "version": 27
 *   },
 *   "chromeWin": {
 *     "platform": "Windows 7",
 *     "actAs": "chrome",
 *     "version": 27
 *   },
 *   "chromeLinux": {
 *     "platform": "Linux",
 *     "actAs": "chrome",
 *     "version": 26
 *   }
 * ```
 * 
 * You can then call your custom browsers like so:
 *
 * ```bash
 * $ dalek mytest.js -d sauce -b chrome,chromeWin,chromeLinux
 * ```
 *
 * or you can define them in your Dalekfile:
 *
 * ```javascript
 * "browser": ["chrome", "chromeWin", "chromeLinux"]
 * ```
 *
 * A list of all available browser/OS combinations, can be found [here](https://saucelabs.com/docs/platforms).
 * 
 * @module Driver
 * @class Sauce
 * @namespace Dalek
 * @part Sauce
 * @api
 */

Sauce.prototype = {

  /**
   * Initializes the driver properties
   *
   * @method _initializeProperties
   * @param {object} opts Options needed to kick off the driver
   * @chainable
   * @private
   */

  _initializeProperties: function (opts) {
    // prepare properties
    this.actionQueue = [];
    this.config = opts.config;
    this.lastCalledUrl = null;
    this.driverStatus = {};
    this.sessionStatus = {};
    // store injcted options in object properties
    this.events = opts.events;
    this.reporterEvents = opts.reporter;
    this.browserName = opts.browser;
    return this;
  },

  /**
   * Binds listeners on browser events
   *
   * @method _initializeProperties
   * @param {object} browser Browser module
   * @chainable
   * @private
   */

  _startBrowserEventListeners: function (browser) {
    // issue the kill command to the browser, when all tests are completed
    this.events.on('tests:complete:sauce:' + this.browserName, browser.kill.bind(browser));
    // clear the webdriver session, when all tests are completed
    this.events.on('tests:complete:sauce:' + this.browserName, this.webdriverClient.closeSession.bind(this.webdriverClient));
    return this;
  },

  /**
   * Checks if a webdriver session has already been established,
   * if not, create a new one
   *
   * @method start
   * @return {object} promise Driver promise
   */

  start: function () {
    var deferred = Q.defer();

    // store desired capabilities of this session
    this.desiredCapabilities = this.browserData.getDesiredCapabilities(this.browserName, this.config);
    this.browserDefaults = this.browserData.driverDefaults;
    this.browserDefaults.status = this.browserData.getStatusDefaults(this.desiredCapabilities);

    // start a browser session
    this._startBrowserSession(deferred, this.desiredCapabilities, this.browserDefaults);

    return deferred.promise;
  },

  /**
   * Creates a new webdriver session
   * Gets the driver status
   * Gets the session status
   * Resolves the promise (e.g. let them tests run)
   *
   * @method _startBrowserSession
   * @param {object} deferred Browser session deferred
   * @chainable
   * @private
   */

  _startBrowserSession: function (deferred, desiredCapabilities, defaults) {
    var viewport = this.config.get('viewport');

    // start a session, transmit the desired capabilities
    var promise = this.webdriverClient.createSession({desiredCapabilities: desiredCapabilities});
    
    // set the default viewport if supported by the browser
    if (defaults.viewport) {
      promise = promise.then(this.webdriverClient.setWindowSize.bind(this.webdriverClient, viewport.width, viewport.height));
    }

    // get the driver status if supported by the browser
    if (defaults.status === true) {
      promise = promise
        .then(this.webdriverClient.status.bind(this.webdriverClient))
        .then(this._driverStatus.bind(this));
    } else {
      promise = promise.then(this._driverStatus.bind(this, JSON.stringify({value: defaults.status})));
    }

    // get the session info if supported by the browser
    if (defaults.sessionInfo === true) {
      promise = promise
        .then(this.webdriverClient.sessionInfo.bind(this.webdriverClient))
        .then(this._sessionStatus.bind(this));
    } else {
      promise = promise.then(this._driverStatus.bind(this, JSON.stringify({value: defaults.sessionInfo})));
    }

    // finally resolve the deferred
    promise.then(deferred.resolve);
    return this;
  },

  /**
   * Starts to execution of a batch of tests
   *
   * @method end
   * @chainable
   */

  end: function () {
    var result = Q.resolve();

    // loop through all promises created by the remote methods
    // this is synchronous, so it waits if a method is finished before
    // the next one will be executed
    this.actionQueue.forEach(function (f) {
      result = result.then(f);
    });

    // flush the queue & fire an event
    // when the queue finished its executions
    result.then(this.flushQueue.bind(this));
    return this;
  },

  /**
   * Flushes the action queue (e.g. commands that should be send to the wbdriver server)
   *
   * @method flushQueue
   * @chainable
   */

  flushQueue: function () {
    // clear the action queue
    this.actionQueue = [];
    
    // kill the session
    var promise = this.webdriverClient.deleteSession();

    // emit the run.complete event
    promise.then(function () {
      this.events.emit('driver:message', {key: 'run.complete', value: null});
    }.bind(this));

    return this;
  },

  /**
   * Loads the browser session status
   *
   * @method _sessionStatus
   * @param {object} sessionInfo Session information
   * @return {object} promise Browser session promise
   * @private
   */

  _sessionStatus: function (sessionInfo) {
    var defer = Q.defer();
    this.sessionStatus = JSON.parse(sessionInfo).value;
    this.events.emit('driver:sessionStatus:sauce:' + this.browserName, this.sessionStatus);
    defer.resolve();
    return defer.promise;
  },

  /**
   * Loads the browser driver status
   *
   * @method _driverStatus
   * @param {object} statusInfo Driver status information
   * @return {object} promise Driver status promise
   * @private
   */

  _driverStatus: function (statusInfo) {
    var defer = Q.defer();
    this.driverStatus = JSON.parse(statusInfo).value;
    this.events.emit('driver:status:sauce:' + this.browserName, this.driverStatus);
    defer.resolve();
    return defer.promise;
  },

  /**
   * Creates an anonymus function that calls a webdriver
   * method that has no return value, emits an empty result event
   * if the function has been run
   * TODO: Name is weird, should be saner
   *
   * @method _createNonReturnee
   * @param {string} fnName Name of the webdriver function that should be called
   * @return {function} fn
   * @private
   */

  _createNonReturnee: function (fnName) {
    return this._actionQueueNonReturneeTemplate.bind(this, fnName);
  },

  /**
   * Generates a chain of webdriver calls for webdriver
   * methods that don't have a return value
   * TODO: Name is weird, should be saner
   *
   * @method _actionQueueNonReturneeTemplate
   * @param {string} fnName Name of the webdriver function that should be called
   * @param {string} hash Unique action hash
   * @param {string} uuid Unique action hash
   * @chainable
   * @private
   */

  _actionQueueNonReturneeTemplate:function (fnName, hash, uuid) {
    this.actionQueue.push(this.webdriverClient[fnName].bind(this.webdriverClient));
    this.actionQueue.push(this._generateDummyDriverMessageFn.bind(this, fnName, hash, uuid));
    return this;
  },

  /**
   * Creates a driver notification with an empty value
   * TODO: Name is weird, should be saner
   *
   * @method _generateDummyDriverMessageFn
   * @param {string} fnName Name of the webdriver function that should be called
   * @param {string} hash Unique action hash
   * @param {string} uuid Unique action hash
   * @return {object} promise Driver message promise
   * @private
   */

  _generateDummyDriverMessageFn: function (fnName, hash, uuid) {
    var deferred = Q.defer();
    this.events.emit('driver:message', {key: fnName, value: null, uuid: uuid, hash: hash});
    deferred.resolve();
    return deferred.promise;
  }
};

/**
 * Determines if the driver is a "multi" browser driver,
 * e.g. can handle more than one browser
 *
 * @method isMultiBrowser
 * @return {bool} isMultiBrowser Driver can handle more than one browser
 */

module.exports.isMultiBrowser = function () {
  return true;
};

/**
 * Verifies a browser request
 * TODO: Still a noop, need to add "verify the browser" logic
 *
 * @method verifyBrowser
 * @return {bool} isVerifiedBrowser Driver can handle this browser
 */

module.exports.verifyBrowser = function () {
  return true;
};

/**
 * Determines if the driver comes with its own browsers bundled
 *
 * @method dummyBrowser
 * @return {bool} isDummyBrowser Driver does not rely on Dalek browser modules
 */

module.exports.dummyBrowser = function () {
  return true;
};

/**
 * Returnes the browser that comes bundled with the driver
 *
 * @method getBrowser
 * @param {object} driver Driver instance
 * @return {object} Browser module
 */

module.exports.getBrowser = function (driver) {
  return {configuration: null, module: new Browser(driver)};
};

/**
 * Creates a new driver instance
 *
 * @method create
 * @param {object} opts Options needed to kick off the driver
 * @return {Sauce} driver
 */

module.exports.create = function (opts) {
  // load the remote command helper methods
  var dir = __dirname + '/lib/commands/';
  fs.readdirSync(dir).forEach(function (file) {
    require(dir + file)(Sauce);
  });

  return new Sauce(opts);
};
