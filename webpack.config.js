require('dotenv').config()

const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        main: ['./frontend/js/index.js', './frontend/scss/index.scss']
    },
    output: {
        publicPath: "",
        path: path.join(__dirname, 'public/assets'),
        filename: 'main.js'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {name: 'main.css'}
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                // Codicons font file for monaco editor icons
                { from: 'node_modules/@chrisrowles/impala/*.ttf', to: path.join(__dirname, 'public/assets/[name].ttf') },
                // Language workers scripts for monaco editor codelens, folding, error highlighting etc.
                { from: 'node_modules/@chrisrowles/impala/*.worker.js', to: path.join(__dirname, 'public/assets/[name].js') },
                // Images
                { from: 'frontend/img/*', to: path.join(__dirname, 'public/assets/[name][ext]') },
                // Views
                { from: 'frontend/views/*.pug', to: path.join(__dirname, 'public/[name].pug') }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.APP_URL': JSON.stringify(process.env.APP_URL)
        })
    ]
}