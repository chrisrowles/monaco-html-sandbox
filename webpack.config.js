const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

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
        new CopyWebpackPlugin({
            patterns: [
                // Codicons font file for monaco editor icons
                { from: 'node_modules/@godeploy/impala/*.ttf', to: path.join(__dirname, 'public/assets/[name].ttf') },
                // Language workers scripts for monaco editor codelens, folding, error highlighting etc.
                { from: 'node_modules/@godeploy/impala/*.worker.js', to: path.join(__dirname, 'public/assets/[name].js') },
                // ...
                { from: 'frontend/index.html', to: path.join(__dirname, 'public/') }
            ]
        })
    ]
}