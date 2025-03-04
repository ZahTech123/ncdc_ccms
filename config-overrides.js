const { override, addWebpackModuleRule } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  // Add fallback configuration
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      fs: false
    };

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]);

    return config;
  }
); 