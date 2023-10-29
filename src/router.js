import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Categories from "./components/goods/Categories.vue";
import Params from "./components/goods/Params.vue";
import GoodsList from "./components/goods/List.vue";
import Add from './components/goods/Add.vue'
import Orders from "./components/order/Orders.vue";


Vue.use(Router)
const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            redirect:'/welcome',
            children:[
                { path:'/welcome', component: Welcome },
                { path:'/users', component: Users },
                { path:'/rights', component: Rights },
                { path:'/roles', component: Roles },
                { path:'/categories', component: Categories },
                { path:'/params', component: Params },
                { path:'/goods', component: GoodsList },
                { path:'/goods/add', component: Add },
                { path:'/orders', component: Orders }
            ]
        }
    ]
})
router.beforeEach(
    (to, from, next) => {
        if (to.path === '/login') { return next() }
        const tokenStr = window.sessionStorage.getItem('token')
        if (!tokenStr) { return next('/login') }
        next()
    }
)
export default router