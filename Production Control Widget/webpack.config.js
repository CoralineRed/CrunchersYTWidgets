const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const isDevServer = process.env.NODE_ENV === 'development'
const isProduction = !isDevServer

const plugins = () => {
    return base = [
        new HtmlWebpackPlugin({
            template: "./index.html",
            minify: {
                collapseWhitespace: isProduction
            }
        }),
        new CleanWebpackPlugin(),
    ]
}


const optimizations = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProduction) {
        config.minimizer = [
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = ext => isDevServer ? `[name].${ext}` : `[name].[hash].${ext}`


module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './index.js']
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.png'],
        alias: {
            "@": path.resolve(__dirname, 'src')
        }
    },
    optimization: optimizations(),
    devServer: {
        port: 4200,
        hot: isDevServer
    },
    devtool: isDevServer ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }]
            }
        ]
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }

}
