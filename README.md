dalek-driver-sauce
===================

> DalekJS driver bindings for [Sauce Labs](https://saucelabs.com) integration

[![Build Status](https://travis-ci.org/dalekjs/dalek-driver-sauce.png)](https://travis-ci.org/dalekjs/dalek-driver-sauce)
[![Build Status](https://drone.io/github.com/dalekjs/dalek-driver-sauce/status.png)](https://drone.io/github.com/dalekjs/dalek-driver-sauce/latest)
[![Dependency Status](https://david-dm.org/dalekjs/dalek-driver-sauce.png)](https://david-dm.org/dalekjs/dalek-driver-sauce)
[![devDependency Status](https://david-dm.org/dalekjs/dalek-driver-sauce/dev-status.png)](https://david-dm.org/dalekjs/dalek-driver-sauce#info=devDependencies)
[![NPM version](https://badge.fury.io/js/dalek-driver-sauce.png)](http://badge.fury.io/js/dalek-driver-sauce)
[![Coverage](http://dalekjs.com/package/dalek-driver-sauce/master/coverage/coverage.png)](http://dalekjs.com/package/dalek-driver-sauce/master/coverage/index.html)
[![unstable](https://rawgithub.com/hughsk/stability-badges/master/dist/unstable.svg)](http://github.com/hughsk/stability-badges)

[![NPM](https://nodei.co/npm/dalek-driver-sauce.png)](https://nodei.co/npm/dalek-driver-sauce/)
[![NPM](https://nodei.co/npm-dl/dalek-driver-sauce.png)](https://nodei.co/npm/dalek-driver-sauce/)

## Ressources

[API Docs](http://dalekjs.com/package/dalek-driver-sauce/master/api/index.html) -
[Trello](https://trello.com/b/896PxIhS/dalek-driver-sauce) -
[Code coverage](http://dalekjs.com/package/dalek-driver-sauce/master/coverage/index.html) -
[Code complexity](http://dalekjs.com/package/dalek-driver-sauce/master/complexity/index.html) -
[Contributing](https://github.com/dalekjs/dalek-driver-sauce/blob/master/CONTRIBUTING.md) -
[User Docs](http://dalekjs.com/docs/sauce.html) -
[Homepage](http://dalekjs.com) -
[Twitter](http://twitter.com/dalekjs)

## Docs

This module is a driver plugin for [DalekJS](//github.com/dalekjs/dalek).
It connects Daleks testsuite with the remote testing environment of [Sauce Labs](https://saucelabs.com).

The driver can be installed with the following command:

```
$ npm install dalek-driver-sauce --save-dev
```

You can use the driver by adding a config option to the your [Dalekfile](http://dalekjs.com/docs/config.html)

```js
"driver": ["sauce"]
```

Or you can tell Dalek that it should run your tests via sauces service via the command line:

```
$ dalek mytest.js -d sauce
```

In order to run your tests within the Sauce Labs infrastructure, you must add your sauce username & key 
to your dalek configuration. Those two parameters must be set in order to get this driver up & running.
You can specifiy them within your [Dalekfile](http://dalekjs.com/docs/config.html) like so:

```js
"driver.sauce": {
  "user": "dalekjs",
  "key": "aaaaaa-1234-567a-1abc-1br6d9f68689"
}
```

It is also possible to specify a set of other extra saucy parameters like `name` & `tags`:

```js
"driver.sauce": {
  "user": "dalekjs",
  "key": "aaaaaa-1234-567a-1abc-1br6d9f68689",
  "name": "Guineapig",
  "tags": ["dalek", "testproject"]
}
```

If you would like to have a more control over the browser/OS combinations that are available, you are able 
to configure you custom combinations:

```js
"browsers": [{
  "chrome": {
    "platform": "OS X 10.6",
    "actAs": "chrome",
    "version": 27
  },
  "chromeWin": {
    "platform": "Windows 7",
    "actAs": "chrome",
    "version": 27
  },
  "chromeLinux": {
    "platform": "Linux",
    "actAs": "chrome",
    "version": 26
  }
```

You can then call your custom browsers like so:

```
$ dalek mytest.js -d sauce -b chrome,chromeWin,chromeLinux
```

or you can define them in your Dalekfile:

```js
"browser": ["chrome", "chromeWin", "chromeLinux"]
```

A list of all available browser/OS combinations, can be found [here](https://saucelabs.com/docs/platforms).

## Help Is Just A Click Away

### #dalekjs on FreeNode.net IRC

Join the `#daleksjs` channel on [FreeNode.net](http://freenode.net) to ask questions and get help.

### [Google Group Mailing List](https://groups.google.com/forum/#!forum/dalekjs)

Get announcements for new releases, share your projects and ideas that are
using DalekJS, and join in open-ended discussion that does not fit in
to the Github issues list or StackOverflow Q&A.

**For help with syntax, specific questions on how to implement a feature
using DalekJS, and other Q&A items, use StackOverflow.**

### [StackOverflow](http://stackoverflow.com/questions/tagged/dalekjs)

Ask questions about using DalekJS in specific scenarios, with
specific features. For example, help with syntax, understanding how a feature works and
how to override that feature, browser specific problems and so on.

Questions on StackOverflow often turn in to blog posts or issues.

### [Github Issues](//github.com/dalekjs/dalek-driver-sauce/issues)

Report issues with DalekJS, submit pull requests to fix problems, or to
create summarized and documented feature requests (preferably with pull
requests that implement the feature).

**Please don't ask questions or seek help in the issues list.** There are
other, better channels for seeking assistance, like StackOverflow and the
Google Groups mailing list.

![DalekJS](https://raw.github.com/dalekjs/dalekjs.com/master/img/logo.png)

## Legal FooBar (MIT License)

Copyright (c) 2013 Sebastian Golasch

Distributed under [MIT license](https://github.com/dalekjs/dalek-driver-sauce/blob/master/LICENSE-MIT)

