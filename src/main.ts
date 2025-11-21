import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import {createPinia} from "pinia";

const app = createApp(App);
app.use(createPinia())
app.mount('#app')
