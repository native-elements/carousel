const path = require('path')
const webpack = require('webpack')
const package = require('./package.json')

module.exports = {
    entry: './dist/index.js',
    mode: 'production',
    devtool: 'inline-source-map',
    output: {
        filename: 'native-elements-carousel.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.BannerPlugin(`${package.name} - ${package.version} | © 2018-${new Date().getFullYear()} ${package.author} | ${package.license} | ${package.homepage}`)
    ],
}