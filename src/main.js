import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'          // tema Aura do PrimeVue     // estilos base do PrimeVue
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice'

const app = createApp(App);
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.mount('#app');
