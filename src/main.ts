/**
 * main.ts
 * This is the entry point of the Vue application.
 * It initializes the Vue app, integrates the Pinia state management library,
 * imports global styles, and mounts the root App component to the DOM.
 */
import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import {createPinia} from "pinia";

const app = createApp(App);
app.use(createPinia())
app.mount('#app')