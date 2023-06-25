/**
 * @typedef {import("webpack").Configuration} WebpackConf
 */

/**
 * @type {WebpackConf}
 */
const commonConf = {
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx)$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: { reportFiles: ['src/**/*.ts'] },
          },
        ],
      },
      {
        test: /\.[cm]?js$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.cjs', '.mjs', '...'],
  },
};

/**
 * @type {WebpackConf[]}
 */
const finalConfs = [
  {
    ...commonConf,
    entry: './src/appLogics.tsx',
    output: {
      path: __dirname + '/dist',
      filename: 'appLogics.browser.js',
    },
    externals: {
      react: 'React',
    },
  },
  {
    ...commonConf,
    entry: './src/appLogics.tsx',
    output: {
      path: __dirname + '/dist',
      filename: 'appLogics.node.js',
    },
    externals: {
      react: 'commonjs react',
    },
  },
  {
    ...commonConf,
    entry: {
      'index.browser-bundle-cjs': './src/index.browser-bundle-cjs.ts',
      'index.browser-bundle-esm-by-default': './src/index.browser-bundle-esm-by-default.ts',
      'index.browser-bundle-umd': './src/index.browser-bundle-umd.ts',
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
    },
  },
];

module.exports = finalConfs;
