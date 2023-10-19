import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios';
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"


Vue.config.productionTip = false
Vue.use(ElementUI)
axios.interceptors.request.use(config =>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
// 全局引入的ElementUI，默认会为我们在原型对象中添加$message，并不需要单独添加
// Vue.prototype.$message = ElementUI.Message
// 全局引入的ElementUI，与$message一样，引入时已经配置好$confirm，也不需要单独添加
Vue.prototype.$confirm = ElementUI.MessageBox.confirm
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
