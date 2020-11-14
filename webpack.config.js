const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app/startup.js',

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/i,
                use: [
                    {
                        loader: 'raw-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(gif|png|ttf|eot|svg|woff|woff2)(\?[\s\S]+)?$/,
                use: 'file-loader',
            },
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],

    resolve: {
        extensions: ['.js'],
        alias: {
            kendo: 'kendo-ui-core',
            colour: 'tinycolor2'
        }
    },

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000
    }
}
