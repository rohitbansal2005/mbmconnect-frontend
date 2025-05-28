const { override, addWebpackPlugin } = require('customize-cra');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = override(
  (config, env) => {
    if (env === 'production') {
      // Basic optimization
      config.optimization = {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true
              },
              mangle: true,
              output: {
                comments: false
              }
            }
          })
        ],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
      };

      // Add compression
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8
        })
      );
    }

    return config;
  }
); 