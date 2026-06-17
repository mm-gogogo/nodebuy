// 套餐字段校验(纯函数,Payload 字段 validate 复用)。
// 目的:挡住会让前台计算/排序出问题的脏数据——缺价套餐(effectiveMonthly=Infinity)、
// 非正的 vCPU/内存/硬盘、负流量等。空值一律交给字段自身的 required 处理。

// 必填正数:仅校验「若有值则 > 0」,空值放行(由 required 兜底)。用于 vCPU/内存/硬盘等。
export function validatePositive(value: unknown): true | string {
  if (value == null) return true
  if (typeof value !== 'number' || Number.isNaN(value)) return '必须是数字'
  if (value <= 0) return '必须大于 0'
  return true
}

// 非负数:可空;若填则 >= 0。用于月流量(0=不限)。
export function validateNonNegative(value: unknown): true | string {
  if (value == null) return true
  if (typeof value !== 'number' || Number.isNaN(value)) return '必须是数字'
  if (value < 0) return '不能为负'
  return true
}

// 价格校验(挂在「月付」字段上,otherPrice 传「年付」):
// 月付与年付都空 → 至少填一个;本字段有值则必须 > 0。
export function validatePrice(value: unknown, otherPrice: unknown): true | string {
  const hasValue = typeof value === 'number' && !Number.isNaN(value)
  const hasOther = typeof otherPrice === 'number' && !Number.isNaN(otherPrice)
  if (!hasValue && !hasOther) return '月付与年付至少填一个'
  if (hasValue && (value as number) <= 0) return '价格必须大于 0'
  return true
}

// Payload 字段 validate 形态的包装:从 siblingData 取出年付,校验月付。
// 参数放宽以适配 Payload 的 validate 槽(用函数引用避开联合类型字段里的上下文推断缺失)。
export function validateMonthlyPrice(value: unknown, options: { siblingData?: unknown }): true | string {
  const sibling = options?.siblingData as { priceYearly?: number | null } | undefined
  return validatePrice(value, sibling?.priceYearly)
}
