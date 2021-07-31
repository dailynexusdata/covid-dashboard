const path = require("path");

const config = {
  entry: "./src/plots/index.js",
  output: {
    filename: "covid-dashboard-bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
};

module.exports = () => config;
