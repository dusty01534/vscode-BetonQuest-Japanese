/* eslint-disable @typescript-eslint/naming-convention */

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

"use strict";

const path = require("path");
const webpack = require("webpack");

/** @type WebpackConfig */
const extensionConfig = {
  context: path.join(__dirname, "extension"),
  target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: "./src/extension.node.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    uniqueName: "betonquest_extension",
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "extension", "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
};

/** @type WebpackConfig */
const webExtensionConfig = {
  context: path.join(__dirname, "extension"),
  target: 'webworker', // extensions run in a webworker context
  entry: './src/extension.web.ts',
  output: {
    uniqueName: "betonquest_extension",
    filename: 'extension.js',
    path: path.resolve(__dirname, "extension", "dist", "web"),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      'assert': require.resolve('assert'),
      'path': require.resolve('path-browserify'),
      // 'process': require.resolve('process/browser'),
      'process/browser': require.resolve('process/browser'),
    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader'
      }]
    }]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1 // disable chunks by default since web extensions must be a single bundle
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // provide a shim for the global `process` variable
    }),
  ],
  externals: {
    'vscode': 'commonjs vscode', // ignored because it doesn't exist
  },
  performance: {
    hints: false
  },
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

/** @type WebpackConfig */
const webviewConfig = {
  context: path.join(__dirname, "webview"),
  target: "web",

  entry: {
    // exampleEditor: "./src/exampleEditor/index.tsx",
    conversationEditor: "./src/conversationEditor/index.tsx",
    eventsEditor: "./src/eventsEditor/index.tsx",
    conditionsEditor: "./src/conditionsEditor/index.tsx",
    objectivesEditor: "./src/objectivesEditor/index.tsx",
    packageEditor: "./src/packageEditor/index.tsx",
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        // test: {
        //   test: async (module) => {
        //     if (module.resource.includes("betonquest")) {
        //       // for (let i = 0; i < 1000; i++) {
        //         console.log("module:", module.resource);
        //       // }
        //       console.log("wait...");
        //       await new Promise(r => setTimeout(r, 2000));
        //     }
        //     // console.log("module:", module.resource);
        //     return false;
        //   },
        // },
        betonquest: {
          test: /[\\/]utils[\\/]out[\\/]betonquest[\\/]/,
          name: "lib/betonquest",
          chunks: "all",
        },
        bukkit: {
          test: /[\\/]utils[\\/]out[\\/]bukkit[\\/]/,
          name: "lib/bukkit",
          chunks: "all",
        },
        i18n: {
          test: /[\\/]utils[\\/]out[\\/]i18n[\\/]/,
          name: "lib/i18n",
          chunks: "all",
        },
        yaml: {
          test: /[\\/]utils[\\/]out[\\/]yaml[\\/]/,
          name: "lib/yaml",
          chunks: "all",
        },
        viewComponents: {
          test: /[\\/]webview[\\/]src[\\/]components[\\/]/,
          name: "view/components",
          chunks: "all",
        },
        viewStyle: {
          test: /[\\/]webview[\\/]src[\\/]style[\\/]/,
          name: "view/style",
          chunks: "all",
        },
        viewLegacyListEditor: {
          test: /[\\/]webview[\\/]src[\\/]legacyListEditor[\\/]/,
          name: "view/legacyListEditor",
          chunks: "all",
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "lib/vendor",
          chunks: "all",
        },
      },
    },
  },
  output: {
    uniqueName: "betonquest_webview",
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    // path: path.resolve(__dirname, 'dist', 'extension'),
    // filename: 'extension.js',
    // libraryTarget: 'commonjs2'
    path: path.resolve(__dirname, "webview", "dist"),
    filename: "[name].js",
    // library: {
    //   type: "var",
    //   name: "[name]"
    // }
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".tsx", ".jsx", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.module\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-modules-typescript-loader",
          },
          {
            loader: "css-loader",
            options: { modules: true },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      process: {
        env: {
          LOG_TOKENS: undefined
        }
      }
    })
  ]
};

/** @type WebpackConfig */
const lspServerNodeConfig = {
	context: path.join(__dirname, 'server'),
	mode: 'none',
	target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	entry: './src/server.node.ts',
	output: {
		filename: 'server.node.js',
		path: path.join(__dirname, "server", "dist"),
		library: {
      name: 'betonquest_server',
      type: "var"
      // type: "commonjs2"
    },
	},
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.ts', '.js'], // support ts-files and js-files
		alias: {},
		fallback: {
			//path: require.resolve("path-browserify")
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
		],
	},
	externals: {
		vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
	},
};

/** @type WebpackConfig */
const lspServerWebConfig = {
	context: path.join(__dirname, 'server'),
	mode: 'none',
	target: 'webworker', // web extensions run in a webworker context
	entry: './src/server.web.ts',
	output: {
		filename: 'server.web.js',
		path: path.join(__dirname, "server", "dist"),
		library: {
      name: 'betonquest_server',
      type: 'var'
    },
	},
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.ts', '.js'], // support ts-files and js-files
		alias: {},
		fallback: {
			//path: require.resolve("path-browserify")
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
		],
	},
	externals: {
		vscode: 'commonjs vscode', // ignored because it doesn't exist
	},
	performance: {
		hints: false,
	},
};

module.exports = [extensionConfig, webExtensionConfig, webviewConfig, lspServerNodeConfig, lspServerWebConfig];
