// import './assets/main.css'

// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import 'bootstrap/dist/css/bootstrap.min.css';
// // import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
// const app = createApp(App)

// app.use(router)
// // app.use(bootstrap)

// app.mount('#app')

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// import VueCookies from 'vue3-cookies';

// Third-party libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@mdi/font/css/materialdesignicons.css'


// Make sure jQuery is imported before Bootstrap's JavaScript
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Vuetify
import vuetify from "@/components/plugins/vuetify";

// Custom CSS
// import '../src/assets/css/stylesheet.css';

import {setAuthToken} from './utils/apiClient';

// After setting the token in localStorage (e.g., after successful login)
// Call setAuthToken() to update the token in apiClient's header
setAuthToken();

const app = createApp(App);
app.use(router);
app.use(store);
app.use(vuetify);
// app.use(VueCookies);
app.mount('#app');

