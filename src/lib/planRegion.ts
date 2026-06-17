// 把套餐机房(自由文本,如「洛杉矶 DC6」「香港 MEGA」)归一到与服务商一致的区域分类。
// 关键词命中即归类;命中不到返回 null(视为「其它/未分类」)。纯函数,便于单测。

export type Region = 'na' | 'eu' | 'apac' | 'cn'

export const REGION_LABELS: Record<Region, string> = {
  na: '北美',
  eu: '欧洲',
  apac: '亚太',
  cn: '中国大陆',
}

// 判定顺序:Region[] 的顺序即匹配优先级。各区关键词不重叠,故顺序仅为可读性。
export const REGIONS: Region[] = ['na', 'eu', 'apac', 'cn']

// 各区域的城市/地名关键词(按需扩充;命中即归该区)。
const REGION_KEYWORDS: Record<Region, string[]> = {
  na: ['洛杉矶', '圣何塞', '旧金山', '达拉斯', '芝加哥', '纽约', '西雅图', '凤凰城', '迈阿密', '阿什本', '硅谷', '西雅图'],
  eu: ['法尔肯施泰因', '纽伦堡', '斯德哥尔摩', '伦敦', '法兰克福', '阿姆斯特丹', '巴黎', '赫尔辛基', '华沙', '马德里', '维也纳'],
  apac: ['东京', '大阪', '首尔', '新加坡', '香港', '台湾', '台北', '悉尼', '墨尔本', '曼谷', '雅加达', '孟买', '迪拜', '吉隆坡'],
  cn: ['上海', '北京', '广州', '深圳', '杭州', '南京', '成都', '青岛'],
}

export function planRegion(location: string | null | undefined): Region | null {
  if (!location) return null
  for (const region of REGIONS) {
    if (REGION_KEYWORDS[region].some((kw) => location.includes(kw))) return region
  }
  return null
}
