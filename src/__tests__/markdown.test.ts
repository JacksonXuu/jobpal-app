import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../utils/markdown";

describe("renderMarkdown", () => {
  // === 空输入 ===
  it("空字符串返回空字符串", () => {
    expect(renderMarkdown("")).toBe("");
  });

  // === Markdown 正常解析 ===
  it("粗体语法正常解析", () => {
    const result = renderMarkdown("**hello**");
    expect(result).toContain("<strong>hello</strong>");
  });

  it("斜体语法正常解析", () => {
    const result = renderMarkdown("*world*");
    // marked 可能生成 <em> 或 <i>，两者都是斜体表示
    expect(result).toMatch(/<em>world<\/em>|<i>world<\/i>/);
  });

  it("标题语法正常解析", () => {
    const result = renderMarkdown("# Title");
    expect(result).toContain("<h1");
    expect(result).toContain("Title");
  });

  it("链接语法正常解析", () => {
    const result = renderMarkdown("[click](https://example.com)");
    expect(result).toContain("href");
    expect(result).toContain("click");
  });

  it("代码块语法正常解析", () => {
    const result = renderMarkdown("```js\nconst a = 1;\n```");
    // marked 3.0+ 生成 <pre><code class="language-js">...</code></pre>
    expect(result).toContain("const a = 1");
  });

  it("无序列表正常解析", () => {
    const result = renderMarkdown("- item1\n- item2");
    expect(result).toContain("<li>item1</li>");
    expect(result).toContain("<li>item2</li>");
  });

  it("换行符正常保留", () => {
    const result = renderMarkdown("line1\nline2");
    // 验证两行内容都在输出中（marked 可能生成 <br> 或段落分隔）
    expect(result).toMatch(/line1[\s\S]*line2/);
  });

  // === plainTextToHtml 降级：纯文本不含 Markdown 语法时 ===
  it("纯文本应保留原文内容", () => {
    const result = renderMarkdown("hello world");
    expect(result).toContain("hello world");
  });

  it("含 HTML 标签的文本应可正常输出", () => {
    const result = renderMarkdown("<script>alert(1)</script>");
    // marked 可能原样保留 HTML 或转义，但内容应可见
    expect(result).toMatch(/script|lt;script|&#/);
  });
});
