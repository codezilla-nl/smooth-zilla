var webpack = require('webpack')

module.exports = {
  entry: './src/SmoothZilla.js',
  output: {
    path: './dist',
    publicPath: 'dist/',
    filename: 'SmoothZilla.js',
    library: 'SmoothZilla',
    libraryTarget: 'umd'
  },
  devServer: {
    inline: true,
    contentBase: 'example/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ]
}