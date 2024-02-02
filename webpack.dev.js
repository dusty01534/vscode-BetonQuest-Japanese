/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

/** @type WebpackConfig */
const extensionConfig = merge(common[0], {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  devtool: 'nosources-source-map', // create a source map that points to the original source file
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
});

/** @type WebpackConfig */
const webExtensionConfig = merge(common[1], {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  devtool: 'nosources-source-map', // create a source map that points to the original source file
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  }
});

/** @type WebpackConfig */
const reactConfig = merge(common[2], {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  devtool: "inline-source-map",
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  }
});

/** @type WebpackConfig */
const lspServerNodeConfig = merge(common[3], {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  devtool: "inline-source-map",
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  }
});

/** @type WebpackConfig */
const lspServerWebConfig = merge(common[4], {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  devtool: "inline-source-map",
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  }
});

module.exports = [extensionConfig, webExtensionConfig, reactConfig, lspServerNodeConfig, lspServerWebConfig];
