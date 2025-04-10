import './assets/css/landing.css' // Import landing page styles globally
// Optional: Create and import another CSS file for app-specific styles:
// import './assets/css/app.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')