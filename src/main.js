const env = import.meta.env;
const isProd = env.MODE === "production";
const enableConfigJS = env.VUE_APP_CONFIGJS == "true";

(async () => {
  try {
    if (!isProd || !enableConfigJS) {
      const res = await import('./config/index.js');
      if (typeof window !== 'undefined') {
        window.EZ_CONFIG = res.config || res.default || res;
      }
    }

    // 確保在設定載入後再初始化應用。
    await import('./appInit.js');
  } catch (error) {
    console.error(error);
  }
})();
