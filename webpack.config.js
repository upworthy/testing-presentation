/* eslint-env node */

var webpack = require('webpack');

module.exports = {
  entry: 'mocha!./index.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel?cacheDirectory' },
      { test: /\.json$/, loader: "json"  }
    ]
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    hot: true,
    inline: true,
    progress: true,
    stats: 'error-only'
  },
  // enzyme compat
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
