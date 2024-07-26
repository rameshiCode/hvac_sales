import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import 'vuetify/styles' 

const apiUrl = import.meta.env.VITE_API_URL;

const app = createApp(App)
app.config.globalProperties.$apiUrl = apiUrl;

app.use(router)
app.use(vuetify)
app.mount('#app')