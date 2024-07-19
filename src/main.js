import Vue from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/assets/css/main.css';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(vSelect);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
