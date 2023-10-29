import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios';
import TreeTable from "vue-table-with-tree-grid"
// 导入富文本编辑器
import VueQuillEditor from "vue-quill-editor";
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"


Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueQuillEditor)
Vue.filter("dateFormat", function (originValue) {
    const date = new Date(originValue)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1 + "").padStart(2, "0")
    const day = (date.getDay() + "").padStart(2, "0")
    const hours = (date.getHours() + "").padStart(2, "0")
    const minute = (date.getMinutes() + "").padStart(2, "0")
    const second = (date.getSeconds() + "").padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minute}:${second}`
})
Vue.component("tree-table", TreeTable)
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.prototype.$http = axios
// 全局引入的ElementUI，默认会为我们在原型对象中添加$message，并不需要单独添加
Vue.prototype.$message = ElementUI.Message
// 全局引入的ElementUI，与$message一样，引入时已经配置好$confirm，也不需要单独添加
Vue.prototype.$confirm = ElementUI.MessageBox.confirm
new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
