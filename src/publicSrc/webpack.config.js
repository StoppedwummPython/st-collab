const path = require('path');

module.exports = {
  entry: './ably.js',
  output: {
    path: path.resolve(__dirname, '../public/app/ably'),
    filename: 'ably.js',
  },
  mode: "production",
  resolve: {
    fallback: {
      util: false,
      vm: false,
      fs: false,
      path: false
    }
  }
};