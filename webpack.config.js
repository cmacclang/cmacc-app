const path = require('path');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "bundle.js",

    libraryTarget: "var",
    library: "Cmacc",

  },
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: "style!css"}
    ]
  }
};
