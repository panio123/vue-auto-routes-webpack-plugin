export default [{
  "name": "Login",
  "path": "/",
  "components": {
    default: () => import( /*webpackChunkName:"login"*/ "/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/Login.vue")
  },
  "meta": null
}, {
  "path": "/main",
  "children": [{
    "name": "listPage",
    "path": "List",
    "components": {
      default: () => import("/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/main/List.vue")
    },
    "meta": {}
  }, {
    "name": "Order",
    "path": "order/:id",
    "components": {
      default: () => import("/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/main/Order.vue")
    },
    "meta": null
  }, {
    "name": "Redirect",
    "path": "Redirect",
    "components": {
      default: require('/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/main/Redirect.vue').default
    },
    "redirect": "/",
    "meta": null
  }, {
    "path": "sub",
    "children": [],
    "components": {
      default: require('/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/main/sub/Index.vue').default
    },
    "name": "sub/Index",
    "meta": null
  }],
  "components": {
    default: require('/Users/mac/Documents/project-formal/vue-auto-routes-webpack-plugin/demo/src/views/main/Index.vue').default
  },
  "name": "/main/Index",
  "meta": null
}]