# 变更记录

本仓库为 EZ THEME 的自部署分支,以下记录相对上游的改动与修复。

## 2026-06-05

### Bug 修复

- **外置配置(config.js)修改不生效**
  - 现象:开启外置模式后,在服务器上编辑生成的配置文件、刷新页面无任何变化。
  - 根因:`vite.config.js` 未设置 `envPrefix`,运行时 `import.meta.env.VUE_APP_CONFIGJS` 读不到,
    `main.js` 误判外置为关闭,从而 `import` 打包进去的配置并覆盖了 `index.html` 注入的 `window.EZ_CONFIG`。
  - 修复:`main.js` 改为「`window.EZ_CONFIG` 已存在则不再导入打包配置」,不再依赖该环境变量;
    两种模式(外置 / 打包)均正确。

- **刷新时标题短暂显示 `%VUE_APP_TITLE%`**
  - 现象:刷新页面时浏览器标签先闪现 `%VUE_APP_TITLE%`,随后才变为正常标题。
  - 根因:同样因缺少 `envPrefix`,vite 不替换 `index.html` 中的 `%VUE_APP_TITLE%` 占位符。
  - 修复:`vite.config.js` 增加 `envPrefix: ['VITE_', 'VUE_APP_']`;
    `VUE_APP_TITLE` 作为首屏占位标题(JS 加载后由配置中的 `siteName` 覆盖)。

### 自部署相关改动(相对上游)

- 移除全部授权保护:域名授权检测(白屏锁死)、反调试(disable-devtool)、生产构建代码混淆
  (javascript-obfuscator)、失效的 DomainAuthAlert(NO LICENSE)遮罩组件,以及相关死代码。
- 配置文件不入库:仓库仅保留模板 `src/config/index.example.js`;真实配置放在本地
  `src/config/index.js`(已 gitignore),首次部署由 `deploy/deploy.sh` 从模板创建。
- 新增部署工具(`deploy/`):
  - `deploy.sh`:拉取 / 安装 / 构建 / 部署 / 重载一键发版,含低内存自动 swap 保护。
  - `setup-nginx-selfsigned.sh`:自签证书 + catch-all Nginx 配置(配合 Cloudflare Full 模式),
    按 nginx 版本自动选用 `http2` 写法。
  - `nginx.conf.example`:Nginx 配置参考。
- API 地址在仓库中使用占位符,真实地址不入库。
