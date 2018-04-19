import Vue from "vue";
import Router from "vue-router";
import Public from "./layouts/Public.vue";
import Dashboard from "./layouts/Dashboard.vue";

import Home from "./views/Home.vue";
import DashboardHome from "./views/DashboardHome.vue";
import About from "./views/About.vue";
import Login from "./views/Login.vue";
import Page404 from "./views/Page404.vue";

import store from "./store";
import ajax from "./services/ajax";
import vue from "./main";

Vue.use(Router);

console.log('ajax', ajax);
console.log('Vue', vue);

export default new Router({
  linkExactActiveClass: 'active',
  mode: 'history',
  routes: [
    {
      path: "/dashboard",
      component: Dashboard,
      beforeEnter: (to, from, next) => {
        console.log('before enter');
        ajax.fetch('auth')
            .then((res) => {
              console.log(res);
              if (res.ok) {
                next();
              } else {
                next('/login');
              }
            })
            .catch(err => {
              console.log('router err', err);
              next('/login');
            })
      },
      children: [
        {
          path: "/",
          name: "dashboard",
          component: DashboardHome,
        },
        {
          path: "/documentation",
          name: "documentation",
          component: About
        },
      ]
    },
    {
      path: "/",
      component: Public,
      children: [
        {
          path: "/",
          name: "home",
          component: Login
        },
        {
          path: "/login",
          name: "login",
          component: Login
        },
        {
          path: "*",
          name: "404",
          component: Page404
        }
      ]
    },
  ]
});
