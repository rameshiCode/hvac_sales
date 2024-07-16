// import './assets/main.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'vuetify/dist/vuetify.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from '../plugins/vuetify'
import router from './router'
import 'vuetify/styles' 



import axios from 'axios'
import VueAxios from 'vue-axios'


// Load environment variable
const apiUrl = import.meta.env.VITE_API_URL;

const app = createApp(App)
app.config.globalProperties.$apiUrl = apiUrl;


app.use(router)
app.use(VueAxios, axios)
// app.use(bootstrap)
app.use(vuetify)

app.mount('#app')

// Vue.config.devtools = true;
