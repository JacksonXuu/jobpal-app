/**
 * Markdown 懒加载解析器
 * 仅在实际调用时才动态 import marked 库（~42KB），避免首屏加载。
 */

let _markedPromise: Promise<typeof import('marked')> | null = null

function getMarked(): Promise<typeof import('marked')> {
  if (!_markedPromise) {
    _markedPromise = import('marked')
  }
  return _markedPromise
}

/**
 * 将 Markdown 文本解析为 HTML 字符串
 * 首次调用时异步加载 marked，后续调用复用缓存
 */
export async function renderMarkdown(text: string): Promise<string> {
  if (!text) return ''
  const { marked } = await getMarked()
  return marked.parse(text) as string
}
