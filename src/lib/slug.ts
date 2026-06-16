// Slug 校验：必须是 URL 安全的小写串（字母/数字/单连字符），
// 否则会生成 /providers/My%20Provider 这类破损链接。

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

// Payload 字段 validate：slug 字段为 required，这里一并处理空值与格式。
export function validateSlug(value: unknown): true | string {
  if (typeof value !== 'string' || value.length === 0) return 'Slug 不能为空'
  if (!isValidSlug(value)) {
    return 'Slug 只能包含小写字母、数字和连字符（例如 my-provider），不能有空格、大写或其它符号'
  }
  return true
}

// 从任意文本生成 URL 安全 slug：转小写，非 [a-z0-9] 的连续段（空格、符号、CJK 等)折叠成单连字符，
// 去掉首尾连字符。纯中文标题会得到空串（无 ASCII 字母数字)，由 autoSlug 交回 required 校验提示人工填写。
export function slugify(input: unknown): string {
  return String(input ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// slug 字段 beforeValidate：已有人工填写值则原样保留（保持链接稳定）；为空才用来源字段（标题/名称)自动生成。
export function autoSlug(current: unknown, source: unknown): string {
  if (typeof current === 'string' && current.trim()) return current.trim()
  return slugify(source)
}
