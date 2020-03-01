const { override, fixBabelImports, addLessLoader, overrideDevServer } = require('customize-cra');
const devConfig = () => config => {
  return {
    ...config,
    proxy: {
      '/api': {
        target: 'http://localhost:30080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
  }
};
module.exports = {
  webpack: override(
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }),
    addLessLoader({
      javascriptEnabled: true,
    }),
  ),
  devServer: overrideDevServer(
    devConfig()
  )
};