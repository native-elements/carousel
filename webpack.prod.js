const extend = require('webpack-merge')

module.exports = extend(require('./webpack.config'), {
    mode: 'production',
    devtool: false,
})