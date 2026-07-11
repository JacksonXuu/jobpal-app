import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  // H5 生产构建部署在 /app/ 子路径下，小程序等其他平台使用 /
  // UNI_PLATFORM 由 uni-app CLI 注入（h5 | mp-weixin | app-plus 等）
  base: process.env.UNI_PLATFORM === 'h5' ? '/app/' : '/',
  plugins: [uni()],
});
