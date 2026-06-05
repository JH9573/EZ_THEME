(async () => {
  try {
    // 外置模式:index.html 中的独立脚本会在本文件之前设置 window.EZ_CONFIG。
    // 打包模式:没有独立脚本,window.EZ_CONFIG 未定义,此时才回退导入打包的配置。
    // 用“是否已存在”判断,避免覆盖外置配置(不依赖 import.meta.env 的环境变量)。
    if (typeof window !== 'undefined' && !window.EZ_CONFIG) {
      const res = await import('./config/index.js');
      window.EZ_CONFIG = res.config || res.default || res;
    }

    // 確保在設定載入後再初始化應用。
    await import('./appInit.js');
  } catch (error) {
    console.error(error);
  }
})();
