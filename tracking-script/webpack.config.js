const path = require('path');

const env = "production";

const ENV = require('./env.json');

const config = {
  mode: env,
  output: {
    filename: 'build/tracking.js'
  },
  plugins: [
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(env) }),
    new webpack.DefinePlugin({ "process.env.ENV": JSON.stringify(ENV) }),
  ],
  module: {
    rules: [
      { test: /src\/\.js/, use: 'rawloader' }
    ]
  }
};

module.exports = config;