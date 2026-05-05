const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  entry: './src/index.ts',
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'lguCivic',
      filename: 'remoteEntry.js',
      exposes: {
        './CitizenDirectory': './src/modules/CitizenDirectory/index.tsx',
        './PermitQueue': './src/modules/PermitQueue/index.tsx',
        './ServiceRequestDispatch': './src/modules/ServiceRequestDispatch/index.tsx',
        './FinanceBatches': './src/modules/FinanceBatches/index.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        'react-router-dom': { singleton: true },
        '@reduxjs/toolkit': { singleton: true },
        'react-redux': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: { port: 4201, historyApiFallback: true },
};
