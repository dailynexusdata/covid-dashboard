const path = require("path");

const config = {
  entry: "./src/plots/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [],
};

module.exports = () => config;
