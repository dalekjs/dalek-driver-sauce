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
var Q = require('q');

/**
 * Loads the webdriver client,
 * launches the browser,
 * initializes al object properties,
 * binds to browser events
 *
 * @param {object} opts Options needed to kick off the driver
 * @constructor
 */

var DummyBrowser = function (driver) {
  this.driver = driver;
};

/**
 * Verfies a given browser config & mimics a
 * real browser while using the Sauce infrstructure
 *
 * @module Driver
 * @class Browser
 * @namespace Dalek
 */

DummyBrowser.prototype = {

  /**
   * Sauce labs authentication realm (user:key)
   *
   * @property auth
   * @type {string|null}
   */

  auth: null,

  /**
   * Browser session config
   *
   * @property sessionConfig
   * @type {object}
   */

  sessionConfig: {},

  /**
   * Saucelabs remote webdriver path
   *
   * @property path
   * @type {string}
   * @default /wd/hub
   */

  path: '/wd/hub',

  /**
   * Saucelabs remote port
   *
   * @property port
   * @type {integer}
   * @default 80
   */

  port: 80,

  /**
   * Saucelabs remote host
   *
   * @property host
   * @type {string} 
   * @default host
   */

  host: 'ondemand.saucelabs.com',

  /**
   * Available browsers with their default capabilities
   *
   * @property browsers
   * @type {object}
   */

  browsers: {
    'iphone': {platform: 'OS X 10.8', version: '6', longName: 'iOS Safari (iPhone)'},
    'ipad': {platform: 'OS X 10.8', version: '6', longName: 'iOS Safari (iPad)'},
    'android': {platform: 'Linux', version: '4.0', longName: 'Chrome on Android'},
    'firefox': {platform: 'OS X 10.6', version: '25', longName: 'Mozilla Firefox'},
    'internet explorer': {platform: 'Windows 8', version: '10', longName: 'Internet Explorer'},
    'chrome': {platform: 'OS X 10.6', version: '28', longName: 'Google Chrome'},
    'opera': {platform: 'Windows 7', version: '12', longName: 'Opera'},
    'safari': {platform: 'OS X 10.8', version: '6', longName: 'Safari'}
  },

  /**
   * Default verbose browser name
   *
   * @property longName
   * @type {string}
   */
  
  longName: 'Mozilla Firefox',
  
  /**
   * Default desired capabilities
   *
   * @property desiredCapabilities
   * @type {object}
   */

  desiredCapabilities: {
    platform: 'OS X 10.8',
    browserName: 'chrome',
    'browser-version': 'latest',
    name: 'Dalek Testsuite'
  },

  /**
   * Driver defaults
   *
   * @property driverDefaults
   * @type {object}
   */

  driverDefaults: {
    viewport: true,
    status: {
      os: {
        name: 'Linux',
        version: null,
        arch: null
      }
    },
    sessionInfo: true
  },

  /**
   * Available platforms
   *
   * @property platforms
   * @type {array}
   */

  platforms: ['Windows 8.1', 'Windows 8', 'Windows 7', 'Windows XP', 'OS X 10.9', 'OS X 10.8', 'OS X 10.6', 'Linux'],

  /**
   * Stores & validates the incoming browser config
   *
   * @method launch
   * @param {object} configuration Browser configuration
   * @param {EventEmitter2} events EventEmitter (Reporter Emitter instance)
   * @param {Dalek.Internal.Config} config Dalek configuration class
   * @return {object} Browser promise
   */

  launch: function (configuration, events, config) {
    var deferred = Q.defer();

    // override desired capabilities, status & browser longname
    this.desiredCapabilities = this._generateDesiredCaps(configuration.name, config);
    this.driverDefaults.status = this._generateStatusInfo(this.desiredCapabilities);
    this.longName = this._generateLongName(this.desiredCapabilities);

    // store injected configuration/log event handlers
    this.reporterEvents = events;
    this.configuration = configuration;
    this.config = config;
    
    // immediatly resolve the deferred
    deferred.resolve();
    return deferred.promise;
  },

  /**
   * Kills the remote browser
   * TODO: Close the remote session
   *
   * @method kill
   * @return {object} Promise
   */

  kill: function () {
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
  },

  /**
   * Generates the status defaults for the OS configuration
   *
   * @method getStatusDefaults
   * @param {object} desiredCapabilities Desired capabilities 
   * @param {object} desiredCapabilities Desired capabilities 
   * @return {object} OS status information
   */

  getDesiredCapabilities: function (browserName, config) {
    return this._generateDesiredCaps(browserName, config);
  },

  /**
   * Generates the status defaults for the OS configuration
   *
   * @method getStatusDefaults
   * @param {object} desiredCapabilities Desired capabilities 
   * @return {object} OS status information
   */

  getStatusDefaults: function (desiredCapabilities) {
    return this._generateStatusInfo(desiredCapabilities);
  },

  /**
   * Sets the sauce authentication token
   *
   * @method setAuth
   * @param {string} user Sauce labs username
   * @param {string} key Sauce labs key
   * @chainable
   */

  setAuth: function (user, key) {
    this.auth = user + ':' + key;
    return this;
  },

  /**
   * Verifies the browser config
   * 
   * @method _verfiyBrowserConfig
   * @param {string} browserName Name of the browser to verify
   * @param {object} config Daleks internal config helper
   * @return {object} Browser config
   * @private
   */

  _verfiyBrowserConfig: function (browserName, config) {
    var browser = null;
    // load and assign browser configuration if it exists
    var browsers = config.get('browsers') || null;
    if (browsers) {
      browser = browsers[0][browserName];
    }

    // check if we couldnt find a configured alias,
    // check and apply if there is a default config
    if (!browser && this.browsers[browserName]) {
      browser = this.browsers[browserName];
    }
    // check if we couldnt find a configured alias,
    // set to defaults otherwise
    if (!browser) {
      return {actAs: this.desiredCapabilities.browserName, version: this.desiredCapabilities['browser-version']};
    }

    // check if the actas property has been set, if not
    // use the given browser name
    if (!browser.actAs) {
      browser.actAs = browserName;
    }

    return browser;
  },

  /**
   * Verfies the OS platform config
   * 
   * @method _verfiyPlatformConfig
   * @param {object} browser Browser information
   * @return {string} Platform
   * @private
   */
  
  _verfiyPlatformConfig: function (browser) {
    var isValid = this.platforms.reduce(function (previousValue, platform) {
      if (previousValue === browser.platform || platform === browser.platform) {
        return browser.platform;
      }
    });

    return isValid || this.desiredCapabilities.platform;
  },

  /**
   * Generates the desired capabilities for this session
   * 
   * @method _generateDesiredCaps
   * @param {string} browserName The browser name
   * @param {object} config Daleks internal config helper
   * @return {object} The sessions desired capabilities
   * @private
   */

  _generateDesiredCaps: function (browserName, config) {
    var browser = this._verfiyBrowserConfig(browserName, config);
    var platform = this._verfiyPlatformConfig(browser);
    var driverConfig = config.get('driver.sauce');
    var desiredCaps = {
      browserName: browser.actAs,
      platform: platform,
      'browser-version': (browser.version || this.desiredCapabilities['browser-version']),
      name: driverConfig.name || this.desiredCapabilities.name
    };

    // check if the user added tags
    if (driverConfig.tags) {
      desiredCaps.tags = driverConfig.tags;
    }

    // check if the user added a build id
    if (driverConfig.build) {
      desiredCaps.build = driverConfig.build;
    }

    return desiredCaps;
  },

  /**
   * Generates OS status information
   * 
   * @method _generateStatusInfo
   * @param {object} desiredCaps The sessions desired capabilities
   * @return {object} OS status information
   * @private
   */

  _generateStatusInfo: function (desiredCaps) {
    return {os: {name: desiredCaps.platform, arch: null, version: null}};
  },

  /**
   * Generates the verbose name of the current remote browser in use
   * 
   * @method _generateLongName
   * @param {object} desiredCaps The sessions desired capabilities
   * @return {string} Verbose browser name
   * @private
   */

  _generateLongName: function (desiredCaps) {
    return this.browsers[desiredCaps.browserName].longName || null;
  }
};

module.exports = DummyBrowser;