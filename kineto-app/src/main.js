// src/main.js

import './assets/css/landing.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Import vue-toastification
import Toast, { POSITION } from 'vue-toastification';
// Import the CSS or use your own!
import 'vue-toastification/dist/index.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Configure Toastification
const toastOptions = {
    position: POSITION.TOP_RIGHT, // Or other positions like TOP_CENTER, BOTTOM_RIGHT etc.
    timeout: 4000, // Default timeout in ms (4 seconds)
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true, // Show default icons
    rtl: false,
    transition: "Vue-Toastification__fade", // Default fade transition
    maxToasts: 5, // Max number of toasts active at once
    newestOnTop: true // Show newest toast on top
};
app.use(Toast, toastOptions); // Register the plugin with options

app.mount('#app');