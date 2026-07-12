import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  // H5 生产构建部署在 /app/ 子路径下，小程序等其他平台使用 /
  // UNI_PLATFORM 由 uni-app CLI 注入（h5 | mp-weixin | app-plus 等）
  // 本地预览时设置 PREVIEW=1 使用 / 根路径
  base: process.env.UNI_PLATFORM === 'h5' ? (process.env.PREVIEW ? '/' : '/app/') : '/',
  plugins: [uni()],
  build: {
    // 使用 Terser 压缩以获得更好的压缩率（比 esbuild 压缩率更高）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // 生产环境剔除 console.log
        drop_debugger: true,  // 剔除 debugger 语句
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      output: {
        comments: false,      // 剔除注释以减小体积
      },
    },
    // CSS 压缩（默认已开启，显式声明确保）
    cssMinify: true,
    // chunk 大小警告阈值，便于及时发现体积膨胀
    chunkSizeWarningLimit: 300,
  },
});
