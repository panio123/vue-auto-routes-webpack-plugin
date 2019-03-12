# vue-auto-routes-webpack-plugin
根据指定目录自动生成 vue-router 配置


<h2 align="center">安装</h2>

```bash
  npm i --save-dev vue-auto-routes-webpack-plugin
```

```bash
  yarn add --dev vue-auto-routes-webpack-plugin
```

<h2 align="center">使用方法</h2>

插件会从指定入口遍历读取[.vue]文件并在指定目录输出一个 vue-router 配置文件。部分路由配置也可在组件内通过 [$$route] 属性声明。

**webpack.config.js**
```js
const path = require('path');
const VueAutoRouteWebpackPlugin = require('vue-auto-routes-webpack-plugin')

function resolve(_path) {
  return path.resolve(__dirname, _path);
}

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new VueAutoRouteWebpackPlugin({
      entry: resolve('src/views/'),
      output: resolve('src/route/routes.js'),
      rootComponent: 'Login',
      indexComponent: 'Index',
      useFileName: true
    })
  ]
}
```
插件会在 [output] 目录下生成 [routes.js] 文件，大概像这样

**src/route/routes.js**
```js

export default [{
  "name": "Login",
  "path": "/",
  "components": {
    default: require('/Users/mac/Documents/project-formal/auto-vue-router/src/views/Login.vue').default
  },
  "meta": null
}, {
  "path": "/main",
  "children": [{
    "name": "List",
    "path": "List",
    "components": {
      default: require('/Users/mac/Documents/project-formal/auto-vue-router/src/views/main/List.vue').default
    },
    "meta": null
  }, {
    "path": "sub",
    "children": [],
    "components": {
      default: require('/Users/mac/Documents/project-formal/auto-vue-router/src/views/main/sub/Index.vue').default
    },
    "name": "sub/Index",
    "meta": null
  }],
  "components": {
    default: require('/Users/mac/Documents/project-formal/auto-vue-router/src/views/main/Index.vue').default
  },
  "name": "/main/Index",
  "meta": null
}]

```

然后你就可以直接使用这份配置了

**src/route/index.js**
```js

import Vue from 'vue'
import Router from 'vue-router'

import routes from './routes'

Vue.use(Router);

routes.push({
  path: '*',
  redirect: '/'
})

export default new Router({
  routes: routes
});

```

你还可以在 [.vue] 组件内定义路由的相关信息，但这也不是必须的，只有你需要时才这么做

```js
export default {
  name:'login',
  $$route:{
    name:'Login',
    lazy:true,
    meta:{
      label:'登录'
    }
  }

}

```

<h2 align="center">插件配置参数</h2>

|Name|Type|Default|Description|require|
|:--:|:--:|:-----:|:----------|:--|
|**`entry`**|`{String}`|`无`|路由页面的入口路径|yes|
|**`output`**|`{String}`|`无`|配置文件输出路径|yes|
|**`rootComponent`**|`{String}`|`Login`|根路由下的组件，也就是当路由为`/`时的页面，【不要】带有`.vue`后缀哦|no|
|**`indexComponent`**|`{String}`|`Index`|多级路由时，需要为每级路由提供一个入口，用于放置`<router-view />`承载子路由，【不要】带有`.vue`后缀哦|no|
|**`useFileName`**|`{Boolea}`|`false`|是否使用`文件名`作为`路由名称`|no|
|**`ignoreDir`**|`{String}`|`components`|在插件遍历目录时，需要忽略的目录|no|
|**`propsKeyName`**|`{String}`|`$$route`|组件内的路由配置key name|no|



