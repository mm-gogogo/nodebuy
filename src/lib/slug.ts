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
