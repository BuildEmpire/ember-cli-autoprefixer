'use strict';

const Autoprefixer = require('broccoli-autoprefixer');
const funnel       = require('broccoli-funnel');
const merge        = require('broccoli-merge-trees');
const defaults     = require('lodash/defaults');

module.exports = {
  name: require('./package').name,

  included(app) {
    this.app = app;

    if (typeof app.import !== 'function' && app.app) {
      this.app = app = app.app;
    }

    this._super.included.apply(this, arguments);

    this.options = defaults(this.app.options.autoprefixer || {}, {
      overrideBrowserslist: this.project.targets && this.project.targets.browsers,
      enabled: true
    });

    this.enabled = this.options.enabled;
    delete this.options.enabled;
  },

  postprocessTree(type, tree) {
    if (type === 'css' && this.enabled) {
      // To stop autoprefixer processing map files and crashing,
      // split the files into two trees and merge after prefixing
      const cssFilesTree = funnel(tree, { include: [/\.css$/] });
      const nonCssFilesTree = funnel(tree, { exclude: [/\.css$/] });

      tree = merge([
        new Autoprefixer(cssFilesTree, this.options),
        nonCssFilesTree
      ]);
    }

    return tree;
  }
};
