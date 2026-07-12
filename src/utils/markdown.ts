/**
 * Markdown 解析器
 * 静态导入 marked 库（~42KB）。
 * 由于仅 ChatBubble、简历详情/表单、优化结果页使用，这些页面本身已做 code-split，
 * static import 不会影响其他页面（首页、登录等）的首屏体积。
 */
import { marked } from 'marked'

/** 将纯文本转为安全的 HTML（转义 + 保留换行） */
function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return `<p>${escaped.replace(/\n/g, '<br>')}</p>`
}

/**
 * 将 Markdown 文本解析为 HTML 字符串
 * 若 marked 解析失败，自动降级为纯文本 HTML（转义后保留换行）。
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''
  try {
    return (marked.parse(text) as string) || plainTextToHtml(text)
  } catch {
    // 解析异常时降级为纯文本，确保内容始终可见
    return plainTextToHtml(text)
  }
}
