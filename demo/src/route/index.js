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