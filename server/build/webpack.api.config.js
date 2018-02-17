
'use strict';

var path = require('path');
var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
    entry: [
        path.join(__dirname, '../scripts/server.js')
    ],
    target: "node",
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: 'api.js'
    },
    plugins: [
        //new webpack.optimize.OccurrenceOrderPlugin(),
        /*
        new StatsPlugin('webpack.stats.json', {
            source: false,
            modules: false
        }),
        */
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ],
    node: {
        __dirname: false,
        __filename: false,
        fs: "empty",
        net: "empty",
        tls: "empty"
    }
};