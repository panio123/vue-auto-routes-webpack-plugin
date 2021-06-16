let path = require('path');
// let VueAutoRoutePlugin = require('vue-auto-routes-webpack-plugin');
let VueAutoRoutePlugin = require('../index.js');

function resolve(_path) {
  return path.resolve(__dirname, _path);
}

module.exports = {
  chainWebpack(config) {
    config.plugin('VueAutoRoutePlugin').use(VueAutoRoutePlugin, [{
      entry: resolve('src/views/'),
      output: resolve('src/route/routes.js'),
      rootComponent: 'Login',
      indexComponent: 'Index',
      useFileName: true,
      layouts: {
        main: resolve('src/layout/index.vue')
      }
    }]);
  }
}