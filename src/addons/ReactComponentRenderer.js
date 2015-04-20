/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 * @providesModule ReactComponentRenderer
 */

'use strict';

var React = require('React');

var assign = require('Object.assign');
var warning = require('warning');

/**
 * Provided as a temporary helper to assist in upgrading legacy code
 * to a new version of React.
 * React.render() is the preferred solution.
 */
class ReactComponentRenderer {
  constructor(klass, container) {
    this.klass = klass;
    this.container = container;
    this.props = {};
    this.component = null;
  }

  setProps(partialProps, callback) {
    if (this.klass == null) {
      if (__DEV__) {
        warning(
          false,
          'setProps(...): Can only update a mounted or ' +
          'mounting component. This usually means you called setProps() on an ' +
          'unmounted component. This is a no-op.'
        );
      }
      return;
    }
    assign(this.props, partialProps);
    var element = React.createElement(this.klass, this.props);
    this.component = React.render(element, this.container, callback);
  }

  unmount() {
    React.unmountComponentAtNode(this.container);
    this.klass = null;
  }
}

module.exports = ReactComponentRenderer;
