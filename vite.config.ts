import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // H5 生产构建部署在 /app/ 子路径下，小程序等其他平台使用 /
  // UNI_PLATFORM 由 uni-app CLI 注入（h5 | mp-weixin | app-plus 等）
  // 本地预览时设置 PREVIEW=1 使用 / 根路径
  base: process.env.UNI_PLATFORM === 'h5' ? (process.env.PREVIEW ? '/' : '/app/') : '/',
  plugins: [
    uni(),
    // 净化 Vite dep chunk 文件名：将以 ".." 开头的 chunk 重命名为 "__" 开头，
    // 避免部分 Web 服务器（Nginx）因路径遍历安全规则拦截 .js 文件导致 404
    {
      name: 'sanitize-dep-chunk-names',
      enforce: 'post',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist/build/h5/assets')
        if (!fs.existsSync(outDir)) return

        const files = fs.readdirSync(outDir)
        const renameMap: Record<string, string> = {}

        // 第一步：重命名文件
        for (const file of files) {
          if (file.startsWith('..') && (file.endsWith('.js') || file.endsWith('.css'))) {
            const newName = file.replace(/^\.\./, '__')
            const oldPath = path.join(outDir, file)
            const newPath = path.join(outDir, newName)
            fs.renameSync(oldPath, newPath)
            renameMap[file] = newName
            console.log(`[sanitize-dep-chunk-names] Renamed: ${file} → ${newName}`)
          }
        }

        // 第二步：更新 JS/CSS 文件中对旧 chunk 名的引用
        for (const file of fs.readdirSync(outDir)) {
          if (!file.endsWith('.js') && !file.endsWith('.css')) continue
          const filePath = path.join(outDir, file)
          let content = fs.readFileSync(filePath, 'utf-8')
          let changed = false
          for (const [oldName, newName] of Object.entries(renameMap)) {
            if (content.includes(oldName)) {
              content = content.replaceAll(oldName, newName)
              changed = true
            }
          }
          if (changed) {
            fs.writeFileSync(filePath, content, 'utf-8')
          }
        }
      },
    },
  ],
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
