const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
module.exports = {
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    context: __dirname,
    entry: './src/index.js',
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'sdp-ds-widget.js',
        publicPath: '/',
    },
    devServer: {
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|j?g|svg|gif)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        limit: 25000,
                    },
                },
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve( __dirname, 'public/index.html' ),
            filename: 'index.html'
        })
    ]
};
