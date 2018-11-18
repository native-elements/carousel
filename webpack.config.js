const path = require('path')
const webpack = require('webpack')
const package = require('./package.json')

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    devtool: 'inline-source-map',
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'native-elements-carousel.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.BannerPlugin(`${package.name} - ${package.version} | © 2018-${new Date().getFullYear()} ${package.author} | ${package.license} | ${package.homepage}`)
    ],
}