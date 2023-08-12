const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

function makeEntry() {
    const entry = {};
    const projects = fs.readdirSync('./src/content');

    projects.forEach((project) => {
        entry[project] = path.resolve(__dirname, './src/content', project, 'index.js')
    })

    return entry;
}

function makeHtmlPlugin(plugins, entry) {
    Object.keys(entry).forEach((name) => {
        const htmlplugin = new HtmlWebpackPlugin({
            inject: true,
            template: './template/index.html',
            filename: `../html/${name}.html`,
            chunks: [name],
            templateParameters: {
                title: name,
            },
        });
        plugins.push(htmlplugin);
    });
}

const entry = makeEntry();
const plugins = [];
makeHtmlPlugin(plugins, entry);

module.exports = {
    entry,
    output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: '[name].js',
    },
    resolve: {
        extensions: [".js"],
    },
    module: {
        rules: [
            {
              test: /\.(glsl|vs|fs)$/,
              loader: 'shader-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules\/.*/,
                use: {
                  loader: 'babel-loader',
                  options: {babelrc: true},
                },
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[ext]',
                },
            },
        ],
    },
    plugins: [
        ...plugins,
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        static: path.resolve(__dirname, './dist'),
        hot: true,
    },
    watch: false,
};
  