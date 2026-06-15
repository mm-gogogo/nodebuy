// 通用「带上限的多选切换」纯函数:已选则移除,未选且未达上限则追加(保序)。
export function toggleCapped<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item)
  if (arr.length >= max) return arr
  return [...arr, item]
}
