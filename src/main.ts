import { createApp } from 'vue'
import App from '@/App.vue';
import '@/assets/sass/style.scss';
import router from "@/router.js";


const app = createApp(App);
app.use(router);
app.mount('#app');
