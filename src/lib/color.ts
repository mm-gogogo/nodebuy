// 品牌色校验：用于无 Logo 时的字母徽标底色，会直接写进 inline CSS。
// 非法值会被浏览器丢弃，导致徽标无底色、白字白底不可见，所以两端都要把关。

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

// Payload 字段 validate：brandColor 为可选字段，留空允许。
export function validateHexColor(value: unknown): true | string {
  if (value == null || value === '') return true
  if (typeof value === 'string' && isHexColor(value)) return true
  return '品牌色需为十六进制颜色，例如 #2b6cb0 或 #abc'
}
