window.__VUE_OPTIONS_API__ = true;
window.__VUE_PROD_DEVTOOLS__ = false;
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia, useAuthStore } from './stores';
import i18n from './i18n';
import { MotionPlugin } from '@vueuse/motion';
import { useToast } from './composables/useToast';
import initPageTitle from './utils/exposeConfig';

const initApp = async () => {
  try {
    initPageTitle();

    await import('./assets/styles/index.scss');

    const app = createApp(App);

    const toast = useToast();

    app.provide('$toast', toast);

    app.use(router)
       .use(pinia)
       .use(i18n)
       .use(MotionPlugin);

    app.mount('#app');

    useAuthStore().initUserInfo();
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
};

initApp();

window.router = router;
