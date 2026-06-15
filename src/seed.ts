/* eslint-disable @typescript-eslint/no-explicit-any -- 种子脚本对演示数据使用宽松类型，避免为一次性 fixture 写大量接口 */
// 种子数据：npx tsx src/seed.ts （payload run 无法解析 @payload-config 别名，会静默失败）
// 数据为演示用途，价格与跑分为编辑整理的典型值。
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

// —— Lexical 富文本构造工具 ——
const text = (t: string) => ({
  type: 'text' as const,
  text: t,
  version: 1,
  format: 0,
  style: '',
  mode: 'normal' as const,
  detail: 0,
})

const p = (t: string) => ({
  type: 'paragraph' as const,
  version: 1,
  format: '' as const,
  indent: 0,
  direction: 'ltr' as const,
  children: [text(t)],
})

const h2 = (t: string) => ({
  type: 'heading' as const,
  tag: 'h2' as const,
  version: 1,
  format: '' as const,
  indent: 0,
  direction: 'ltr' as const,
  children: [text(t)],
})

const rich = (...children: unknown[]) =>
  ({
    root: {
      type: 'root' as const,
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }) as any

async function seed() {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'providers', limit: 1 })
  if (existing.totalDocs > 0) {
    console.log('已有数据，跳过种子（如需重置请清空数据库）')
    process.exit(0)
  }

  // —— 管理员 ——
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@nodebuy.local', password: 'nodebuy123' },
    })
    console.log('管理员: admin@nodebuy.local / nodebuy123')
  }

  // —— 服务商 ——
  const providerData = [
    {
      name: '搬瓦工 BandwagonHost',
      slug: 'bandwagonhost',
      tagline: 'CN2 GIA 线路的老牌标杆，KiwiVM 面板自助迁移机房',
      description:
        '搬瓦工是 IT7 Networks 旗下的 VPS 品牌，2012 年上线，以洛杉矶 CN2 GIA-E 与香港 CN2 GIA 线路著称。KiwiVM 面板支持自助更换机房、快照与一键重装，是大陆用户买美西线路机的默认答案之一。缺点是热门套餐常年缺货、价格逐年上调。',
      website: 'https://bandwagonhost.com',
      affUrl: 'https://bandwagonhost.com/aff.php?aff=00000',
      brandColor: '#2b6cb0',
      founded: 2012,
      headquarters: '加拿大 · IT7 Networks',
      paymentMethods: ['alipay', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '洛杉矶 DC6', region: 'na', cnOptimized: true },
        { city: '洛杉矶 DC9', region: 'na', cnOptimized: true },
        { city: '圣何塞', region: 'na', cnOptimized: true },
        { city: '弗里蒙特', region: 'na', cnOptimized: false },
        { city: '纽约', region: 'na', cnOptimized: false },
        { city: '阿姆斯特丹', region: 'eu', cnOptimized: false },
        { city: '东京', region: 'apac', cnOptimized: true },
        { city: '香港', region: 'apac', cnOptimized: true },
      ],
      scores: { performance: 8.2, network: 9.6, value: 7.6, support: 7.8 },
      overallScore: 8.9,
      pros: [
        { item: '三网回程 CN2 GIA，晚高峰表现稳定' },
        { item: 'KiwiVM 面板可自助迁移机房，不丢数据' },
        { item: '运营十三年，跑路风险低' },
      ],
      cons: [
        { item: '热门 GIA 套餐长期缺货，需要蹲补货' },
        { item: '价格连年上涨，性价比不如从前' },
        { item: '工单响应一般，无中文客服' },
      ],
    },
    {
      name: 'DMIT',
      slug: 'dmit',
      tagline: '高端 CN2 GIA / CMIN2 专线，万兆口与原生 IP',
      description:
        'DMIT 成立于 2017 年，主打洛杉矶与香港的高端大陆优化线路。Pro 系列三网回程 CN2 GIA 且默认万兆口，Lite 系列走 CMIN2，价格高于同行但网络质量与抗投诉口碑在圈内属第一梯队。',
      website: 'https://www.dmit.io',
      affUrl: 'https://www.dmit.io/aff.php?aff=0000',
      brandColor: '#1a365d',
      founded: 2017,
      headquarters: '美国 · 洛杉矶',
      paymentMethods: ['alipay', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '洛杉矶', region: 'na', cnOptimized: true },
        { city: '圣何塞', region: 'na', cnOptimized: true },
        { city: '香港', region: 'apac', cnOptimized: true },
        { city: '东京', region: 'apac', cnOptimized: true },
      ],
      scores: { performance: 8.8, network: 9.7, value: 7.2, support: 8.0 },
      overallScore: 9.1,
      pros: [
        { item: 'Pro 系列万兆口 + 三网 CN2 GIA，国内峰值速度天花板' },
        { item: 'AMD EPYC 平台，单核性能强' },
        { item: '原生 IP，流媒体解锁情况好' },
      ],
      cons: [{ item: '价格显著高于同级配置' }, { item: '流量包偏小，超量计费贵' }],
    },
    {
      name: 'RackNerd',
      slug: 'racknerd',
      tagline: '年付十美元级别的促销小鸡之王',
      description:
        'RackNerd 成立于 2019 年，以高频次的年付促销著称——黑五、新年、周年庆的 10–30 美元年付套餐是无数人的第一台 VPS。线路为普通 163 直连，适合做测试机、备份机和对线路不敏感的轻量应用。',
      website: 'https://www.racknerd.com',
      affUrl: 'https://my.racknerd.com/aff.php?aff=0000',
      brandColor: '#276749',
      founded: 2019,
      headquarters: '美国 · 加利福尼亚',
      paymentMethods: ['alipay', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '洛杉矶 DC02', region: 'na', cnOptimized: false },
        { city: '圣何塞', region: 'na', cnOptimized: false },
        { city: '西雅图', region: 'na', cnOptimized: false },
        { city: '达拉斯', region: 'na', cnOptimized: false },
        { city: '芝加哥', region: 'na', cnOptimized: false },
        { city: '纽约', region: 'na', cnOptimized: false },
        { city: '阿什本', region: 'na', cnOptimized: false },
      ],
      scores: { performance: 7.4, network: 6.8, value: 9.6, support: 8.2 },
      overallScore: 8.5,
      pros: [
        { item: '年付价格全网最低档，促销季 11 美元拿 1C1G' },
        { item: '工单响应快，老板亲自下场处理' },
        { item: '续费同价，不玩首年套路' },
      ],
      cons: [
        { item: '普通 163 线路，晚高峰丢包明显' },
        { item: '超售存在，磁盘性能波动' },
      ],
    },
    {
      name: 'V.PS',
      slug: 'v-ps',
      tagline: 'xTom 旗下精品线，9929 / CMIN2 中端甜点',
      description:
        'V.PS 是 xTom 旗下的 VPS 品牌，主打 CUII 9929 与 CMIN2 等中端优化线路，圣何塞、东京、大阪等机房对联通和移动用户特别友好。价格介于廉价鸡与 DMIT 之间，是线路与预算折中的常见选择。',
      website: 'https://v.ps',
      affUrl: 'https://v.ps/?aff=0000',
      brandColor: '#553c9a',
      founded: 2021,
      headquarters: '香港 · xTom',
      paymentMethods: ['alipay', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '圣何塞', region: 'na', cnOptimized: true },
        { city: '东京', region: 'apac', cnOptimized: true },
        { city: '大阪', region: 'apac', cnOptimized: true },
        { city: '香港', region: 'apac', cnOptimized: true },
        { city: '阿姆斯特丹', region: 'eu', cnOptimized: false },
        { city: '法兰克福', region: 'eu', cnOptimized: false },
      ],
      scores: { performance: 8.0, network: 9.0, value: 7.8, support: 8.4 },
      overallScore: 8.6,
      pros: [
        { item: '9929 回程对联通用户接近专线体验' },
        { item: 'xTom 自有 ASN 与机房，网络工程能力强' },
        { item: '支持小时计费与随时退款余额' },
      ],
      cons: [{ item: '流量包偏小' }, { item: '热门机房经常售罄' }],
    },
    {
      name: 'CloudCone',
      slug: 'cloudcone',
      tagline: '洛杉矶 MC 机房，常年闪购的按需计费商家',
      description:
        'CloudCone 成立于 2017 年，机房位于洛杉矶 Multacom。特点是按小时计费 + 常年不断的闪购促销，年付十几美元的套餐频繁出现。线路普通，适合预算极低的场景。',
      website: 'https://cloudcone.com',
      affUrl: 'https://app.cloudcone.com/?ref=0000',
      brandColor: '#2c5282',
      founded: 2017,
      headquarters: '美国 · 洛杉矶',
      paymentMethods: ['alipay', 'paypal', 'card'],
      datacenters: [{ city: '洛杉矶 MC', region: 'na', cnOptimized: false }],
      scores: { performance: 6.8, network: 6.5, value: 8.8, support: 7.5 },
      overallScore: 7.6,
      pros: [{ item: '闪购价格极低，按小时计费灵活' }, { item: '面板功能完整，快照免费' }],
      cons: [{ item: '单机房，线路一般' }, { item: '磁盘 IO 波动大' }],
    },
    {
      name: 'Vultr',
      slug: 'vultr',
      tagline: '32 个机房的国际大厂，小时计费随开随删',
      description:
        'Vultr 成立于 2014 年，全球 32 个机房，控制台与 API 成熟，支持支付宝。东京、首尔、新加坡等亚太节点对大陆为普通直连或绕路，适合全球业务部署与临时开机测试，不适合对大陆线路敏感的用途。',
      website: 'https://www.vultr.com',
      affUrl: 'https://www.vultr.com/?ref=0000000',
      brandColor: '#007bfc',
      founded: 2014,
      headquarters: '美国 · 新泽西',
      paymentMethods: ['alipay', 'wechat', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '东京', region: 'apac', cnOptimized: false },
        { city: '首尔', region: 'apac', cnOptimized: false },
        { city: '新加坡', region: 'apac', cnOptimized: false },
        { city: '洛杉矶', region: 'na', cnOptimized: false },
        { city: '硅谷', region: 'na', cnOptimized: false },
        { city: '法兰克福', region: 'eu', cnOptimized: false },
        { city: '阿姆斯特丹', region: 'eu', cnOptimized: false },
      ],
      scores: { performance: 8.6, network: 7.6, value: 7.0, support: 8.8 },
      overallScore: 8.2,
      pros: [
        { item: '机房多、API 完善，基础设施即代码友好' },
        { item: '新用户送测试金，按小时计费' },
        { item: '支持支付宝与微信' },
      ],
      cons: [{ item: '大陆方向线路普通，晚高峰绕路' }, { item: '流量超量计费，账单容易失控' }],
    },
    {
      name: 'DigitalOcean',
      slug: 'digitalocean',
      tagline: '开发者云的代名词，文档与生态无出其右',
      description:
        'DigitalOcean 成立于 2012 年，Droplet、托管数据库、K8s、对象存储等产品线完整，社区教程质量是行业标杆。大陆访问线路随缘，更适合面向海外用户的正经业务。',
      website: 'https://www.digitalocean.com',
      affUrl: 'https://m.do.co/c/000000000000',
      brandColor: '#0069ff',
      founded: 2012,
      headquarters: '美国 · 纽约',
      paymentMethods: ['paypal', 'card'],
      datacenters: [
        { city: '纽约', region: 'na', cnOptimized: false },
        { city: '旧金山', region: 'na', cnOptimized: false },
        { city: '新加坡', region: 'apac', cnOptimized: false },
        { city: '伦敦', region: 'eu', cnOptimized: false },
        { city: '法兰克福', region: 'eu', cnOptimized: false },
        { city: '班加罗尔', region: 'apac', cnOptimized: false },
      ],
      scores: { performance: 8.5, network: 7.2, value: 6.6, support: 8.6 },
      overallScore: 8.0,
      pros: [
        { item: '产品线完整，从 VPS 到托管 K8s 一站式' },
        { item: '文档与社区教程质量极高' },
      ],
      cons: [{ item: '单位价格偏贵' }, { item: '大陆访问质量不稳定' }],
    },
    {
      name: 'Hetzner',
      slug: 'hetzner',
      tagline: '德国老厂，欧洲性价比天花板，20T 流量起步',
      description:
        'Hetzner 成立于 1997 年，自建数据中心与网络，云主机 20T 流量起步，独服拍卖区常有高配捡漏。欧洲方向网络优秀，大陆方向延迟高且绕路，适合欧洲业务、备份与重计算任务。',
      website: 'https://www.hetzner.com',
      affUrl: 'https://hetzner.cloud/?ref=00000000',
      brandColor: '#d50c2d',
      founded: 1997,
      headquarters: '德国 · 贡岑豪森',
      paymentMethods: ['paypal', 'card'],
      datacenters: [
        { city: '法尔肯施泰因', region: 'eu', cnOptimized: false },
        { city: '纽伦堡', region: 'eu', cnOptimized: false },
        { city: '赫尔辛基', region: 'eu', cnOptimized: false },
        { city: '阿什本', region: 'na', cnOptimized: false },
        { city: '新加坡', region: 'apac', cnOptimized: false },
      ],
      scores: { performance: 9.0, network: 6.2, value: 9.4, support: 8.0 },
      overallScore: 8.4,
      pros: [
        { item: '4 美元级别拿 2C4G + 20T 流量，规格碾压同行' },
        { item: '自建机房，硬件新、超售少' },
        { item: 'ARM 实例性价比突出' },
      ],
      cons: [
        { item: '大陆延迟 250ms 起，晚高峰绕路严重' },
        { item: '新账号风控严格，可能要求护照验证' },
      ],
    },
    {
      name: 'GreenCloudVPS',
      slug: 'greencloudvps',
      tagline: '东南亚节点丰富的促销型商家',
      description:
        'GreenCloudVPS 成立于 2013 年，新加坡、雅加达、胡志明等东南亚节点丰富，常年有大硬盘与高配年付促销。适合东南亚业务与离岸备份。',
      website: 'https://greencloudvps.com',
      affUrl: 'https://greencloudvps.com/billing/aff.php?aff=0000',
      brandColor: '#2f855a',
      founded: 2013,
      headquarters: '美国 · 特拉华',
      paymentMethods: ['alipay', 'paypal', 'card', 'crypto'],
      datacenters: [
        { city: '新加坡', region: 'apac', cnOptimized: false },
        { city: '雅加达', region: 'apac', cnOptimized: false },
        { city: '胡志明', region: 'apac', cnOptimized: false },
        { city: '达拉斯', region: 'na', cnOptimized: false },
        { city: '阿姆斯特丹', region: 'eu', cnOptimized: false },
      ],
      scores: { performance: 7.0, network: 7.2, value: 8.9, support: 7.4 },
      overallScore: 7.8,
      pros: [{ item: '东南亚节点多，年付促销规格大' }, { item: '大硬盘套餐单位成本低' }],
      cons: [{ item: '部分节点超售明显' }, { item: '面板老旧' }],
    },
    {
      name: 'HostHatch',
      slug: 'hosthatch',
      tagline: '存储型 VPS 专业户，冷备数据的好去处',
      description:
        'HostHatch 成立于 2011 年，总部斯德哥尔摩，以大容量存储 VPS 闻名，促销季 2TB 存储年付不到 50 美元。面板简洁、工单慢，适合放冷数据而不是跑生产。',
      website: 'https://hosthatch.com',
      affUrl: 'https://hosthatch.com/a/0000',
      brandColor: '#744210',
      founded: 2011,
      headquarters: '瑞典 · 斯德哥尔摩',
      paymentMethods: ['paypal', 'card', 'crypto'],
      datacenters: [
        { city: '斯德哥尔摩', region: 'eu', cnOptimized: false },
        { city: '维也纳', region: 'eu', cnOptimized: false },
        { city: '洛杉矶', region: 'na', cnOptimized: false },
        { city: '芝加哥', region: 'na', cnOptimized: false },
        { city: '新加坡', region: 'apac', cnOptimized: false },
      ],
      scores: { performance: 7.8, network: 7.0, value: 8.8, support: 6.5 },
      overallScore: 7.7,
      pros: [{ item: '存储单价行业最低档' }, { item: 'NVMe 系列性能不俗' }],
      cons: [{ item: '工单响应以天计' }, { item: '促销套餐不支持退款' }],
    },
    {
      name: '腾讯云轻量',
      slug: 'tencent-lighthouse',
      tagline: '国内建站与轻量应用的默认选项，香港免备案',
      description:
        '腾讯云轻量应用服务器覆盖国内主要区域与香港、新加坡、东京等境外节点。国内节点延迟与稳定性无可挑剔但需要备案；香港 30M 套餐是免备案建站的热门选择，流量包偏小是主要短板。',
      website: 'https://cloud.tencent.com/product/lighthouse',
      affUrl: 'https://curl.qcloud.com/XXXXXXXX',
      brandColor: '#006eff',
      founded: 2013,
      headquarters: '中国 · 深圳',
      paymentMethods: ['wechat', 'alipay', 'unionpay'],
      datacenters: [
        { city: '上海', region: 'cn', cnOptimized: true },
        { city: '北京', region: 'cn', cnOptimized: true },
        { city: '广州', region: 'cn', cnOptimized: true },
        { city: '成都', region: 'cn', cnOptimized: true },
        { city: '香港', region: 'apac', cnOptimized: true },
        { city: '新加坡', region: 'apac', cnOptimized: false },
        { city: '东京', region: 'apac', cnOptimized: false },
      ],
      scores: { performance: 8.0, network: 9.2, value: 7.0, support: 8.5 },
      overallScore: 8.3,
      pros: [
        { item: '国内访问延迟与稳定性第一梯队' },
        { item: '香港节点免备案，中文工单' },
        { item: '新用户活动价格极低' },
      ],
      cons: [
        { item: '流量包小，超量按 GB 计费' },
        { item: '续费价格比活动价高数倍' },
        { item: '国内节点需要备案' },
      ],
    },
    {
      name: '阿里云国际',
      slug: 'alibabacloud',
      tagline: '阿里云国际版，香港轻量与全球骨干网',
      description:
        '阿里云国际版面向海外注册用户，香港、新加坡轻量应用服务器走自家骨干网，大陆方向表现稳定。适合既要免备案又要稳定回国线路、同时希望背靠大厂的用户。',
      website: 'https://www.alibabacloud.com',
      affUrl: 'https://www.alibabacloud.com/campaign?affiliate=0000',
      brandColor: '#ff6a00',
      founded: 2009,
      headquarters: '中国 · 杭州（国际版新加坡）',
      paymentMethods: ['alipay', 'card', 'paypal'],
      datacenters: [
        { city: '香港', region: 'apac', cnOptimized: true },
        { city: '新加坡', region: 'apac', cnOptimized: false },
        { city: '东京', region: 'apac', cnOptimized: false },
        { city: '硅谷', region: 'na', cnOptimized: false },
        { city: '法兰克福', region: 'eu', cnOptimized: false },
      ],
      scores: { performance: 8.2, network: 8.8, value: 6.8, support: 7.8 },
      overallScore: 8.1,
      pros: [{ item: '香港节点回国走自家骨干，稳定' }, { item: '大厂兜底，不会跑路' }],
      cons: [{ item: '国际版风控严，账号容易被审核' }, { item: '价格不便宜，流量计费复杂' }],
    },
  ]

  const providers: Record<string, any> = {}
  for (const data of providerData) {
    const doc = await payload.create({ collection: 'providers', data: data as any })
    providers[data.slug] = doc
    console.log(`服务商: ${data.name}`)
  }

  // —— 套餐 ——
  const planData: Array<any> = [
    // 搬瓦工
    { name: 'CN2 GIA ECOMMERCE 20G', provider: 'bandwagonhost', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 2500, location: '洛杉矶 DC6', priceMonthly: 16.99, priceYearly: 169.99, route: 'cn2gia', highlight: '三网 GIA 回程 + 2.5G 口，标杆套餐', inStock: true },
    { name: 'CN2 20G KVM', provider: 'bandwagonhost', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 1000, location: '洛杉矶 DC8', priceYearly: 49.99, route: 'cn2gt', highlight: '入门款，去程 CN2 回程 163', inStock: false },
    { name: 'HK 70G PLUS', provider: 'bandwagonhost', cpuCores: 2, ramMB: 2048, storageGB: 70, storageType: 'ssd', trafficTB: 0.5, bandwidthMbps: 1000, location: '香港 MEGA', priceMonthly: 89.99, route: 'cn2gia', highlight: '香港 CN2 GIA，延迟 10ms 级', inStock: true },
    // DMIT
    { name: 'PVM.LAX.Pro.TINY', provider: 'dmit', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'nvme', trafficTB: 2, bandwidthMbps: 10000, location: '洛杉矶', priceMonthly: 14.9, priceYearly: 149, route: 'cn2gia', highlight: '万兆口 + 三网 GIA', inStock: true },
    { name: 'PVM.LAX.Pro.MICRO', provider: 'dmit', cpuCores: 2, ramMB: 2048, storageGB: 40, storageType: 'nvme', trafficTB: 4, bandwidthMbps: 10000, location: '洛杉矶', priceMonthly: 25.9, route: 'cn2gia', highlight: '建站与中转一步到位', inStock: true },
    { name: 'PVM.HKG.Lite.STARTER', provider: 'dmit', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'nvme', trafficTB: 0.4, bandwidthMbps: 1000, location: '香港', priceMonthly: 18.9, route: 'cmin2', highlight: '香港 CMIN2，移动用户福音', inStock: true },
    // RackNerd
    { name: '768MB 年付特价', provider: 'racknerd', cpuCores: 1, ramMB: 768, storageGB: 10, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 1000, location: '洛杉矶 DC02', priceYearly: 10.99, route: 'direct', highlight: '十美元级入门小鸡', inStock: true },
    { name: '1GB KVM 新年款', provider: 'racknerd', cpuCores: 1, ramMB: 1024, storageGB: 24, storageType: 'ssd', trafficTB: 2, bandwidthMbps: 1000, location: '圣何塞', priceYearly: 11.49, route: 'direct', highlight: '常年返场的爆款', inStock: true },
    { name: '2GB KVM', provider: 'racknerd', cpuCores: 2, ramMB: 2048, storageGB: 45, storageType: 'ssd', trafficTB: 4, bandwidthMbps: 1000, location: '达拉斯', priceYearly: 18.93, route: 'direct', highlight: '两核两 G，挂机跑任务', inStock: true },
    { name: '4.5GB KVM', provider: 'racknerd', cpuCores: 3, ramMB: 4608, storageGB: 60, storageType: 'ssd', trafficTB: 8, bandwidthMbps: 1000, location: '芝加哥', priceYearly: 32.49, route: 'direct', highlight: '促销季高配款', inStock: true },
    // V.PS
    { name: 'San Jose Mini', provider: 'v-ps', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'nvme', trafficTB: 1, bandwidthMbps: 1000, location: '圣何塞', priceMonthly: 5.95, priceYearly: 59.5, route: '9929', highlight: '联通 9929 甜点机', inStock: true },
    { name: 'Tokyo Mini', provider: 'v-ps', cpuCores: 1, ramMB: 1024, storageGB: 20, storageType: 'nvme', trafficTB: 1, bandwidthMbps: 500, location: '东京', priceMonthly: 7.95, route: 'cmin2', highlight: '东京 CMIN2，延迟 60ms 级', inStock: true },
    { name: 'Hong Kong Starter', provider: 'v-ps', cpuCores: 2, ramMB: 2048, storageGB: 40, storageType: 'nvme', trafficTB: 0.75, bandwidthMbps: 500, location: '香港', priceMonthly: 11.95, route: 'cmin2', highlight: '香港免备案建站', inStock: false },
    // CloudCone
    { name: 'SC2 闪购款', provider: 'cloudcone', cpuCores: 1, ramMB: 1024, storageGB: 40, storageType: 'ssd', trafficTB: 3, bandwidthMbps: 1000, location: '洛杉矶 MC', priceYearly: 16.5, route: 'direct', highlight: '闪购常客，16 美元一年', inStock: true },
    { name: 'Hashtag 2G', provider: 'cloudcone', cpuCores: 2, ramMB: 2048, storageGB: 60, storageType: 'ssd', trafficTB: 5, bandwidthMbps: 1000, location: '洛杉矶 MC', priceYearly: 29.5, route: 'direct', highlight: '黑五返场款', inStock: true },
    // Vultr
    { name: 'Cloud Compute 1G', provider: 'vultr', cpuCores: 1, ramMB: 1024, storageGB: 25, storageType: 'nvme', trafficTB: 1, bandwidthMbps: 1000, location: '东京', priceMonthly: 6, route: 'direct', highlight: '随开随删，小时计费', inStock: true },
    { name: 'High Frequency 2G', provider: 'vultr', cpuCores: 1, ramMB: 2048, storageGB: 64, storageType: 'nvme', trafficTB: 2, bandwidthMbps: 1000, location: '首尔', priceMonthly: 12, route: 'direct', highlight: '高主频系列，单核更强', inStock: true },
    // DigitalOcean
    { name: 'Basic Droplet 1G', provider: 'digitalocean', cpuCores: 1, ramMB: 1024, storageGB: 25, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 1000, location: '新加坡', priceMonthly: 6, route: 'bgp', highlight: '开发者起步款', inStock: true },
    { name: 'Premium AMD 2G', provider: 'digitalocean', cpuCores: 1, ramMB: 2048, storageGB: 50, storageType: 'nvme', trafficTB: 2, bandwidthMbps: 1000, location: '旧金山', priceMonthly: 14, route: 'bgp', highlight: 'EPYC + NVMe 高配线', inStock: true },
    // Hetzner
    { name: 'CX22', provider: 'hetzner', cpuCores: 2, ramMB: 4096, storageGB: 40, storageType: 'nvme', trafficTB: 20, bandwidthMbps: 1000, location: '法尔肯施泰因', priceMonthly: 4.5, route: 'bgp', highlight: '4 美元 2C4G + 20T 流量', inStock: true },
    { name: 'CAX11 (ARM)', provider: 'hetzner', cpuCores: 2, ramMB: 4096, storageGB: 40, storageType: 'nvme', trafficTB: 20, bandwidthMbps: 1000, location: '纽伦堡', priceMonthly: 4.2, route: 'bgp', highlight: 'Ampere ARM，性价比离谱', inStock: true },
    // GreenCloud
    { name: 'Budget KVM SEA', provider: 'greencloudvps', cpuCores: 2, ramMB: 2048, storageGB: 30, storageType: 'nvme', trafficTB: 2, bandwidthMbps: 1000, location: '新加坡', priceYearly: 25, route: 'direct', highlight: '东南亚年付促销款', inStock: true },
    { name: 'Storage KVM 1T', provider: 'greencloudvps', cpuCores: 2, ramMB: 4096, storageGB: 1000, storageType: 'hdd', trafficTB: 4, bandwidthMbps: 1000, location: '达拉斯', priceYearly: 55, route: 'direct', highlight: '1TB 大硬盘备份机', inStock: true },
    // HostHatch
    { name: 'Storage 2TB', provider: 'hosthatch', cpuCores: 1, ramMB: 2048, storageGB: 2000, storageType: 'hdd', trafficTB: 5, bandwidthMbps: 1000, location: '斯德哥尔摩', priceYearly: 47, route: 'bgp', highlight: '2TB 冷存储，年付不到 50 刀', inStock: true },
    { name: 'NVMe 4G', provider: 'hosthatch', cpuCores: 2, ramMB: 4096, storageGB: 50, storageType: 'nvme', trafficTB: 3, bandwidthMbps: 1000, location: '洛杉矶', priceYearly: 36, route: 'direct', highlight: '促销季 NVMe 高配', inStock: false },
    // 腾讯云轻量
    { name: '轻量 2C2G 上海', provider: 'tencent-lighthouse', cpuCores: 2, ramMB: 2048, storageGB: 50, storageType: 'ssd', trafficTB: 0.3, bandwidthMbps: 4, location: '上海', priceYearly: 16, route: 'direct', highlight: '新用户活动价，需备案', inStock: true },
    { name: '轻量香港 30M', provider: 'tencent-lighthouse', cpuCores: 2, ramMB: 2048, storageGB: 60, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 30, location: '香港', priceMonthly: 8, priceYearly: 80, route: 'direct', highlight: '免备案建站热门款', inStock: true },
    // 阿里云
    { name: '轻量应用服务器 香港', provider: 'alibabacloud', cpuCores: 2, ramMB: 1024, storageGB: 25, storageType: 'ssd', trafficTB: 1, bandwidthMbps: 30, location: '香港', priceMonthly: 7, route: 'direct', highlight: '回国走自家骨干', inStock: true },
  ]

  const plans: Record<string, any> = {}
  for (const data of planData) {
    const doc = await payload.create({
      collection: 'plans',
      data: { ...data, provider: providers[data.provider].id },
    })
    plans[`${data.provider}/${data.name}`] = doc
  }
  console.log(`套餐 ×${planData.length}`)

  // —— 测评 ——
  const reviewData: Array<any> = [
    {
      title: '搬瓦工 CN2 GIA-E 洛杉矶 DC6 实测：三网 GIA 回程，晚高峰依旧稳',
      slug: 'bandwagonhost-cn2-gia-e-dc6-review',
      provider: 'bandwagonhost',
      plan: 'bandwagonhost/CN2 GIA ECOMMERCE 20G',
      excerpt:
        '169.99 美元一年的 1C1G 贵不贵？看完晚高峰的三网测速再下结论。DC6 的 2.5G 口在工作日 21 点到 23 点依然能跑出八成速度，这就是 GIA 的溢价所在。',
      publishedAt: '2026-05-28',
      author: '老周',
      readingMinutes: 9,
      scores: { performance: 8.3, network: 9.6, value: 7.4, support: 8.0 },
      verdict:
        '如果预算允许且业务依赖大陆访问质量，DC6 仍然是闭眼买的选择。预算紧张就别硬上——GIA 的钱花在晚高峰，白天用不出差别。',
      benchmarks: {
        cpuModel: 'Intel Xeon E5-2690 v4 (共享)',
        gb5Single: 716,
        gb5Multi: 702,
        diskReadMBs: 842,
        diskWriteMBs: 781,
        speedtests: [
          { node: '上海电信', downloadMbps: 2310, uploadMbps: 980, latencyMs: 132 },
          { node: '北京联通', downloadMbps: 1860, uploadMbps: 940, latencyMs: 141 },
          { node: '广州移动', downloadMbps: 1620, uploadMbps: 870, latencyMs: 152 },
        ],
        routes: [
          { isp: 'ct', path: '回程 59.43 CN2 GIA 全程' },
          { isp: 'cu', path: '回程 CN2 GIA（联通侧出口小绕）' },
          { isp: 'cm', path: '回程 CN2 GIA，移动侧偶发跳 163' },
        ],
      },
      content: rich(
        h2('购买与开通'),
        p('套餐为洛杉矶 DC6 机房的 CN2 GIA ECOMMERCE 20G，下单后即时开通。KiwiVM 面板老而弥坚：快照、一键迁移机房、两步验证都在，迁移到 DC9 或香港不需要工单。'),
        h2('性能'),
        p('共享 E5 平台的单核成绩中规中矩，Geekbench 5 单核 716，跑 Nginx 反代和中小型博客绰绰有余，重计算就别想了。磁盘是企业级 SSD 阵列，顺序读写稳定在 800 MB/s 上下，未见明显邻居干扰。'),
        h2('网络与线路'),
        p('重点全在网络。工作日 21:30 实测：上海电信下载 2.3 Gbps，北京联通 1.86 Gbps，广州移动 1.62 Gbps——这是 2.5G 口的套餐，能在晚高峰保住八成带宽的美西商家一只手数得过来。回程三网全走 59.43，移动侧偶发跳 163 但占比不高。'),
        h2('适合谁'),
        p('面向大陆用户的外贸站、需要稳定回源的 CDN 源站、对延迟敏感的远程办公中转。纯海外业务用户请绕道——这溢价对你毫无意义。'),
      ),
    },
    {
      title: 'DMIT LAX.Pro 万兆口实测：贵有贵的道理',
      slug: 'dmit-lax-pro-review',
      provider: 'dmit',
      plan: 'dmit/PVM.LAX.Pro.TINY',
      excerpt:
        'EPYC 平台 + 万兆口 + 三网 CN2 GIA，DMIT Pro 系列把美西线路机的硬件规格拉到了顶。14.9 美元一个月的 1C1G，值不值看你怎么用。',
      publishedAt: '2026-05-19',
      author: '老周',
      readingMinutes: 8,
      scores: { performance: 9.0, network: 9.7, value: 7.0, support: 8.2 },
      verdict:
        '同样是 GIA，DMIT 用 EPYC 和万兆口和搬瓦工拉开了身位。如果你的业务吃单核性能或者峰值带宽，多花的钱能看见回报；只是挂个博客的话，这配置是杀鸡用牛刀。',
      benchmarks: {
        cpuModel: 'AMD EPYC 9654 (共享)',
        gb5Single: 1176,
        gb5Multi: 1148,
        diskReadMBs: 3240,
        diskWriteMBs: 2810,
        speedtests: [
          { node: '上海电信', downloadMbps: 4820, uploadMbps: 2100, latencyMs: 128 },
          { node: '北京联通', downloadMbps: 3960, uploadMbps: 1850, latencyMs: 138 },
          { node: '广州移动', downloadMbps: 3420, uploadMbps: 1690, latencyMs: 147 },
        ],
        routes: [
          { isp: 'ct', path: '回程 59.43 CN2 GIA 全程' },
          { isp: 'cu', path: '回程 CN2 GIA' },
          { isp: 'cm', path: '回程 CN2 GIA' },
        ],
      },
      content: rich(
        h2('硬件'),
        p('EPYC 9654 共享平台，Geekbench 5 单核 1176——这是很多商家旗舰独服才有的单核水平。NVMe 顺序读 3.2 GB/s，4K 随机也漂亮，数据库友好。'),
        h2('网络'),
        p('万兆口不是摆设：晚高峰上海电信能跑到 4.8 Gbps，是本站美西线路机的最高纪录。三网回程全程 GIA，没有移动绕路的小毛病。'),
        h2('适合谁'),
        p('高并发 API 源站、视频回源、对单核性能有要求的轻量数据库。预算敏感型用户看下一篇 RackNerd。'),
      ),
    },
    {
      title: 'RackNerd 年付 11.49 美元小鸡测评：能用，但别指望线路',
      slug: 'racknerd-1gb-annual-review',
      provider: 'racknerd',
      plan: 'racknerd/1GB KVM 新年款',
      excerpt:
        '一年 11.49 美元，月均不到一美元。这个价位谈线路是奢侈，谈的是「它居然真的能用」——以及哪些用途千万别碰。',
      publishedAt: '2026-05-12',
      author: '阿茂',
      readingMinutes: 7,
      scores: { performance: 7.2, network: 6.4, value: 9.7, support: 8.4 },
      verdict:
        '11.49 美元买不来 GIA，但买得来一台 24 小时在线的测试机、备份机、监控探针。把预期放对位置，它是真香；把它当主力生产机，你会在第一个晚高峰崩溃。',
      benchmarks: {
        cpuModel: 'Intel Xeon E5-2697 v2 (共享)',
        gb5Single: 574,
        gb5Multi: 556,
        diskReadMBs: 412,
        diskWriteMBs: 387,
        speedtests: [
          { node: '上海电信', downloadMbps: 320, uploadMbps: 180, latencyMs: 158 },
          { node: '北京联通', downloadMbps: 540, uploadMbps: 260, latencyMs: 165 },
          { node: '广州移动', downloadMbps: 210, uploadMbps: 120, latencyMs: 178 },
        ],
        routes: [
          { isp: 'ct', path: '回程 163 普通线路，晚高峰丢包 5–8%' },
          { isp: 'cu', path: '回程 4837，白天可用' },
          { isp: 'cm', path: '回程 CMI，绕日本' },
        ],
      },
      content: rich(
        h2('开通与面板'),
        p('SolusVM 面板，下单秒开。控制台功能朴素但齐全，重装系统模板更新得很勤。'),
        h2('性能'),
        p('E5-2697 v2 是 2013 年的 CPU，单核 574 的成绩放在 2026 年属于「能跑」。SSD 缓存阵列读写 400 MB/s 上下，偶有波动，跑定时任务和轻量服务没问题。'),
        h2('网络'),
        p('普通 163 回程，白天测速尚可，晚高峰电信丢包 5–8%，移动绕日本延迟拉到 178ms。SSH 操作晚上会卡顿，套 CDN 做站倒是无所谓。'),
        h2('适合谁'),
        p('测试环境、监控探针、异地备份、学习 Linux 的第一台机器。预算每加 5 美元，体验都会有质变——但如果你就是要最便宜的，买它。'),
      ),
    },
    {
      title: 'V.PS 圣何塞 9929 测评：联通用户的甜点机',
      slug: 'v-ps-san-jose-9929-review',
      provider: 'v-ps',
      plan: 'v-ps/San Jose Mini',
      excerpt:
        'CUII 9929 是联通的「平民 GIA」，V.PS 圣何塞把它做到了月付 5.95 美元。联通宽带用户的回程体验接近专线，电信移动则要降一档预期。',
      publishedAt: '2026-04-30',
      author: '老周',
      readingMinutes: 7,
      scores: { performance: 8.1, network: 8.9, value: 8.2, support: 8.6 },
      verdict:
        '家里是联通宽带就直接买，这个价位没有对手。电信用户体验打七折，移动用户建议看东京 CMIN2 款。',
      benchmarks: {
        cpuModel: 'AMD EPYC 7763 (共享)',
        gb5Single: 968,
        gb5Multi: 942,
        diskReadMBs: 1860,
        diskWriteMBs: 1620,
        speedtests: [
          { node: '北京联通', downloadMbps: 890, uploadMbps: 460, latencyMs: 148 },
          { node: '上海电信', downloadMbps: 520, uploadMbps: 280, latencyMs: 156 },
          { node: '广州移动', downloadMbps: 380, uploadMbps: 190, latencyMs: 169 },
        ],
        routes: [
          { isp: 'cu', path: '回程 CUII 9929 全程' },
          { isp: 'ct', path: '回程 163，白天流畅' },
          { isp: 'cm', path: '回程 CMI 绕港' },
        ],
      },
      content: rich(
        h2('线路背景'),
        p('9929 是联通的国际精品网，拥塞控制比 4837 激进得多，晚高峰表现接近电信 CN2 GIA 之于电信用户的地位。V.PS 背靠 xTom 的自有网络，9929 接入质量在一众商家里属于第一档。'),
        h2('实测'),
        p('北京联通晚高峰 890 Mbps（1G 口），延迟 148ms 且抖动小。EPYC 7763 平台单核 968，NVMe 读 1.8 GB/s，性能在这个价位明显超纲。'),
        h2('适合谁'),
        p('联通宽带用户的建站机、中转机。支持小时计费，先开一台测一晚再决定年付，这点比大多数同行厚道。'),
      ),
    },
    {
      title: 'CloudCone SC2 闪购实测：16.5 美元一年还要啥自行车',
      slug: 'cloudcone-sc2-flash-sale-review',
      provider: 'cloudcone',
      plan: 'cloudcone/SC2 闪购款',
      excerpt:
        '闪购页面常年挂着的 SC2 系列到底什么水平？40G 硬盘 3T 流量的规格在 16.5 美元这个价位没什么可挑的，IO 波动是唯一需要提前知道的事。',
      publishedAt: '2026-04-21',
      author: '阿茂',
      readingMinutes: 6,
      scores: { performance: 6.6, network: 6.5, value: 9.0, support: 7.6 },
      verdict:
        '与 RackNerd 同生态位，规格略大、IO 略飘。两家选谁看促销时谁便宜——这个价位的正确策略是别恋战，谁打折买谁。',
      benchmarks: {
        cpuModel: 'Intel Xeon Gold 6148 (共享)',
        gb5Single: 622,
        gb5Multi: 608,
        diskReadMBs: 356,
        diskWriteMBs: 298,
        speedtests: [
          { node: '上海电信', downloadMbps: 280, uploadMbps: 150, latencyMs: 162 },
          { node: '北京联通', downloadMbps: 460, uploadMbps: 240, latencyMs: 170 },
        ],
        routes: [
          { isp: 'ct', path: '回程 163' },
          { isp: 'cu', path: '回程 4837' },
          { isp: 'cm', path: '回程 CMI 绕美西' },
        ],
      },
      content: rich(
        h2('购买'),
        p('闪购页不定期补货，按小时计费的特性让它适合「先开后决定」。面板自研，快照免费这点在廉价商家里少见。'),
        h2('性能与网络'),
        p('Gold 6148 单核 622，磁盘写入 298 MB/s 且深夜会掉到 200 以下——超售痕迹明显但没到影响使用的程度。线路与 RackNerd 同级，晚高峰电信不理想。'),
        h2('适合谁'),
        p('备份、探针、低频访问的工具站。3T 月流量在这个价位算大方，跑点离线下载也够。'),
      ),
    },
    {
      title: 'Vultr 东京 NVMe 测评：直连但晚高峰绕，适合面板不适合看视频',
      slug: 'vultr-tokyo-nvme-review',
      provider: 'vultr',
      plan: 'vultr/Cloud Compute 1G',
      excerpt:
        '东京机房 60ms 的白天延迟很诱人，但 NTT 出口晚高峰的表现会教做人。把它当亚太业务节点用是合格的，当大陆优化线路用是误会。',
      publishedAt: '2026-04-09',
      author: '小满',
      readingMinutes: 7,
      scores: { performance: 8.4, network: 7.0, value: 7.2, support: 8.8 },
      verdict:
        '基础设施成熟度满分，大陆线路及格线。新用户测试金期间值得开一台感受，长期持有取决于你的用户在哪边。',
      benchmarks: {
        cpuModel: 'Intel Xeon (Skylake 共享)',
        gb5Single: 892,
        gb5Multi: 874,
        diskReadMBs: 1640,
        diskWriteMBs: 1420,
        speedtests: [
          { node: '上海电信', downloadMbps: 410, uploadMbps: 260, latencyMs: 64 },
          { node: '北京联通', downloadMbps: 380, uploadMbps: 220, latencyMs: 78 },
          { node: '广州移动', downloadMbps: 520, uploadMbps: 310, latencyMs: 58 },
        ],
        routes: [
          { isp: 'ct', path: '去程直连，回程 NTT 晚高峰绕美' },
          { isp: 'cu', path: '回程 NTT → 4837' },
          { isp: 'cm', path: '回程 CMI 直连，表现最好' },
        ],
      },
      content: rich(
        h2('开通体验'),
        p('控制台和 API 是教科书级别的：ISO 自定义、防火墙组、快照、浮动 IP 一应俱全，Terraform Provider 维护活跃。'),
        h2('网络'),
        p('白天三网延迟 58–78ms，移动用户体验最好。晚高峰电信回程绕美，延迟翻倍丢包上来，看视频卡顿明显。NTT 的老毛病，换商家解决不了，换线路才行。'),
        h2('适合谁'),
        p('面向日韩与东南亚用户的业务、需要快速起停的 CI 节点、配合对象存储做的媒体处理管线。大陆用户自用请看 V.PS 东京或 DMIT。'),
      ),
    },
    {
      title: 'Hetzner CX22 测评：4 美元拿 2C4G + 20T，欧洲性价比天花板',
      slug: 'hetzner-cx22-review',
      provider: 'hetzner',
      plan: 'hetzner/CX22',
      excerpt:
        '同样的钱在美西只能买到 1C1G 的年付鸡，在 Hetzner 能月付拿 2C4G 外加 20T 流量。代价是 250ms 的大陆延迟和严格的新账号风控。',
      publishedAt: '2026-03-27',
      author: '小满',
      readingMinutes: 8,
      scores: { performance: 9.1, network: 6.0, value: 9.5, support: 8.0 },
      verdict:
        '把延迟敏感的活留给亚太机器，把吃配置的活全丢给它：CI 构建、数据处理、游戏面板、大流量分发。规格价格比没有对手，前提是过得了风控。',
      benchmarks: {
        cpuModel: 'Intel Xeon Gold (共享 vCPU)',
        gb5Single: 1042,
        gb5Multi: 1986,
        diskReadMBs: 2180,
        diskWriteMBs: 1890,
        speedtests: [
          { node: '上海电信', downloadMbps: 240, uploadMbps: 180, latencyMs: 254 },
          { node: '北京联通', downloadMbps: 310, uploadMbps: 210, latencyMs: 246 },
          { node: '法兰克福本地', downloadMbps: 940, uploadMbps: 920, latencyMs: 5 },
        ],
        routes: [
          { isp: 'ct', path: '回程 163 绕英美' },
          { isp: 'cu', path: '回程 4837 经法兰克福' },
          { isp: 'cm', path: '回程 CMI 绕新加坡' },
        ],
      },
      content: rich(
        h2('规格'),
        p('CX22 月付 4.5 美元：2 vCPU、4G 内存、40G NVMe、20T 流量。这个规格表在美西商家那里要花三到四倍的钱。多核 1986 的成绩跑 CI 和编译任务非常舒服。'),
        h2('网络'),
        p('欧洲本地满血千兆，大陆方向 250ms 起步且三网全绕。这台机器的正确用法是后端算力节点，前面用亚太小鸡或 CDN 做接入层。'),
        h2('风控提醒'),
        p('新账号可能被要求护照验证，使用海外住宅 IP 和真实信息注册通过率高。账号一旦养成，后续加机器畅通无阻。'),
      ),
    },
    {
      title: '腾讯云轻量香港 30M 实测：免备案建站首选，流量是硬伤',
      slug: 'tencent-lighthouse-hk-30m-review',
      provider: 'tencent-lighthouse',
      plan: 'tencent-lighthouse/轻量香港 30M',
      excerpt:
        '广州电信 ping 35ms、走自家骨干回国、月付 8 美元——香港轻量几乎是免备案中文建站的标准答案。唯一要算清楚的账是那 1TB 月流量。',
      publishedAt: '2026-03-15',
      author: '老周',
      readingMinutes: 6,
      scores: { performance: 7.9, network: 9.3, value: 7.2, support: 8.8 },
      verdict:
        '中小博客、企业官网、微信生态工具站的舒适区。流量大户（视频、下载站）请自觉绕行，超量计费会让账单变成惊吓。',
      benchmarks: {
        cpuModel: 'Intel Xeon Platinum (共享)',
        gb5Single: 818,
        gb5Multi: 1546,
        diskReadMBs: 980,
        diskWriteMBs: 860,
        speedtests: [
          { node: '广州电信', downloadMbps: 29.8, uploadMbps: 29.5, latencyMs: 35 },
          { node: '上海联通', downloadMbps: 29.6, uploadMbps: 29.2, latencyMs: 48 },
          { node: '北京移动', downloadMbps: 29.4, uploadMbps: 28.9, latencyMs: 52 },
        ],
        routes: [
          { isp: 'ct', path: '回程腾讯自家骨干，稳定' },
          { isp: 'cu', path: '回程腾讯骨干' },
          { isp: 'cm', path: '回程腾讯骨干' },
        ],
      },
      content: rich(
        h2('定位'),
        p('30M 带宽看着寒酸，但三网都能跑满且延迟极低，对网页类业务完全够用。中文控制台、中文工单、微信支付，运维心智成本是所有商家里最低的。'),
        h2('流量账'),
        p('1TB 月流量按 30M 带宽折算约等于每天 9 小时满速——正常网站用不完，但凡涉及视频或大文件分发就会超。超量按 GB 计费，记得设告警。'),
        h2('适合谁'),
        p('第一次建站的新手、需要微信生态对接的工具站、不想折腾备案的企业官网。'),
      ),
    },
    {
      title: 'HostHatch 斯德哥尔摩 2TB 存储机测评：冷备神器',
      slug: 'hosthatch-stockholm-storage-review',
      provider: 'hosthatch',
      plan: 'hosthatch/Storage 2TB',
      excerpt:
        '年付 47 美元买 2TB 硬盘空间，每 GB 成本两分钱。HDD 的速度、以天计的工单响应，都在提醒你：这是仓库，不是跑车。',
      publishedAt: '2026-02-28',
      author: '阿茂',
      readingMinutes: 6,
      scores: { performance: 6.8, network: 7.0, value: 9.2, support: 6.2 },
      verdict:
        '拿来放 restic / borg 的加密备份仓库正合适，配合欧洲到全球都不错的网络，异地容灾的最后一块拼图。别拿它跑数据库。',
      benchmarks: {
        cpuModel: 'AMD EPYC 7402P (共享)',
        gb5Single: 884,
        gb5Multi: 862,
        diskReadMBs: 184,
        diskWriteMBs: 161,
        speedtests: [
          { node: '上海电信', downloadMbps: 180, uploadMbps: 140, latencyMs: 268 },
          { node: '法兰克福本地', downloadMbps: 890, uploadMbps: 870, latencyMs: 18 },
        ],
        routes: [
          { isp: 'ct', path: '回程 163 绕欧美' },
          { isp: 'cu', path: '回程 4837' },
          { isp: 'cm', path: '回程 CMI' },
        ],
      },
      content: rich(
        h2('规格与定位'),
        p('1C2G 配 2TB HDD，RAID 阵列顺序读写 160–180 MB/s，随机 IO 就别看了。网络千兆口，欧洲方向跑满无压力。'),
        h2('使用建议'),
        p('restic 增量备份 + 定时校验是标准用法。注意促销套餐不可退款，工单平均响应两三天，重要数据务必再做一层异地冗余。'),
      ),
    },
    {
      title: 'DigitalOcean Premium AMD 测评：开发者生态无敌，大陆访问随缘',
      slug: 'digitalocean-premium-amd-review',
      provider: 'digitalocean',
      plan: 'digitalocean/Premium AMD 2G',
      excerpt:
        'DO 的价值从来不在跑分表上：一键应用市场、托管数据库、文档和社区构成的生态，让它成为海外业务起步的默认选项。',
      publishedAt: '2026-02-10',
      author: '小满',
      readingMinutes: 7,
      scores: { performance: 8.6, network: 7.0, value: 6.8, support: 8.6 },
      verdict:
        '如果你的用户在海外、团队习惯基础设施即代码，DO 的开发体验值回溢价。如果只是想要一台大陆访问快的 VPS，这里不是你的菜。',
      benchmarks: {
        cpuModel: 'AMD EPYC 7542 (Premium)',
        gb5Single: 1094,
        gb5Multi: 1072,
        diskReadMBs: 2460,
        diskWriteMBs: 2120,
        speedtests: [
          { node: '上海电信', downloadMbps: 340, uploadMbps: 220, latencyMs: 188 },
          { node: '新加坡本地', downloadMbps: 920, uploadMbps: 900, latencyMs: 2 },
        ],
        routes: [
          { isp: 'ct', path: '回程 163，旧金山节点偶走 CN2 GT' },
          { isp: 'cu', path: '回程 4837' },
          { isp: 'cm', path: '回程 CMI' },
        ],
      },
      content: rich(
        h2('生态'),
        p('Marketplace 一键部署、App Platform、托管 Postgres/Redis、Spaces 对象存储——一个人的小团队可以在 DO 里完成整条产品线的部署，这是廉价商家给不了的东西。'),
        h2('性能'),
        p('Premium AMD 系列单核 1094，NVMe 读 2.4 GB/s，规格货真价实。普通 Basic 系列性能约打七折，建站建议直接上 Premium。'),
        h2('适合谁'),
        p('面向海外用户的 SaaS、独立开发者的第一套生产环境、需要托管数据库兜底的小团队。'),
      ),
    },
  ]

  const reviews: Record<string, any> = {}
  for (const data of reviewData) {
    const { provider, plan, ...rest } = data
    const doc = await payload.create({
      collection: 'reviews',
      data: {
        ...rest,
        provider: providers[provider].id,
        plan: plan ? plans[plan]?.id : undefined,
        _status: 'published',
      },
    })
    reviews[data.slug] = doc
    console.log(`测评: ${data.title}`)
  }

  // —— 榜单 ——
  const rankingData: Array<any> = [
    {
      title: '2026 年 6 月 · VPS 综合推荐榜',
      slug: 'overall-2026-06',
      category: 'overall',
      featured: true,
      description: '网络质量、硬件性能、价格与商家口碑加权排序，只收录本站实测过且仍在售的套餐。',
      methodology: '网络 40% + 性能 25% + 性价比 25% + 售后口碑 10%，数据来自本站当月实测，缺货超过两周的套餐自动出榜。',
      items: [
        { provider: 'dmit', plan: 'dmit/PVM.LAX.Pro.TINY', score: 9.1, summary: '万兆口 + 三网 GIA + EPYC 单核 1176，规格全方位碾压，唯一的门槛是价格。', bestFor: '预算充足的生产业务' },
        { provider: 'bandwagonhost', plan: 'bandwagonhost/CN2 GIA ECOMMERCE 20G', score: 8.9, summary: '十三年老店，DC6 晚高峰依旧能打，可自助迁移机房的容错能力独一份。', bestFor: '稳字当头的建站用户' },
        { provider: 'v-ps', plan: 'v-ps/San Jose Mini', score: 8.6, summary: '9929 线路 5.95 美元起，联通用户的性价比之王，支持小时计费试错成本低。', bestFor: '联通宽带用户' },
        { provider: 'racknerd', plan: 'racknerd/1GB KVM 新年款', score: 8.5, summary: '11.49 美元一年，工单秒回，续费同价。线路普通但这个价位无可指摘。', bestFor: '预算十美元档的入门用户' },
        { provider: 'hetzner', plan: 'hetzner/CX22', score: 8.4, summary: '4.5 美元月付 2C4G20T，规格价格比无对手，大陆延迟是唯一短板。', bestFor: '吃配置不吃延迟的任务' },
        { provider: 'tencent-lighthouse', plan: 'tencent-lighthouse/轻量香港 30M', score: 8.3, summary: '三网满速 + 35ms 延迟 + 中文工单，免备案建站的标准答案。', bestFor: '中文站长' },
        { provider: 'vultr', plan: 'vultr/Cloud Compute 1G', score: 8.2, summary: '32 机房 + 成熟 API，全球部署的基础设施首选，大陆线路一般。', bestFor: '全球业务与临时开机' },
        { provider: 'digitalocean', plan: 'digitalocean/Premium AMD 2G', score: 8.0, summary: '生态与文档行业标杆，海外 SaaS 起步的默认选项。', bestFor: '海外业务开发者' },
      ],
    },
    {
      title: '性价比榜 · 把每一分钱花在规格上',
      slug: 'best-value',
      category: 'value',
      description: '按「单位美元能买到的综合规格」排序，线路权重调低——这份榜单上的机器都默认你不挑线路。',
      methodology: '规格/价格比 60% + 实测性能 25% + 商家口碑 15%。',
      items: [
        { provider: 'racknerd', plan: 'racknerd/1GB KVM 新年款', score: 9.6, summary: '月均 0.96 美元的 1C1G24G，地球上最便宜的能用 VPS 之一。', bestFor: '第一台 VPS' },
        { provider: 'hetzner', plan: 'hetzner/CAX11 (ARM)', score: 9.4, summary: 'ARM 平台 4.2 美元拿 2C4G40G + 20T，跑容器工作负载极舒服。', bestFor: '容器与 CI 工作负载' },
        { provider: 'cloudcone', plan: 'cloudcone/SC2 闪购款', score: 8.9, summary: '16.5 美元年付 40G 盘 3T 流量，闪购规格常年坚挺。', bestFor: '备份与探针' },
        { provider: 'greencloudvps', plan: 'greencloudvps/Budget KVM SEA', score: 8.7, summary: '25 美元年付的新加坡 2C2G，东南亚业务的廉价立足点。', bestFor: '东南亚轻量业务' },
        { provider: 'hosthatch', plan: 'hosthatch/Storage 2TB', score: 8.6, summary: '每 GB 两分钱的存储单价，冷备场景无敌。', bestFor: '异地备份' },
      ],
    },
    {
      title: '大陆优化线路榜 · 晚高峰见真章',
      slug: 'cn-optimized',
      category: 'cn-optimized',
      description: 'CN2 GIA、CMIN2、9929——只看回程优化线路，排名以工作日 21:00–23:00 的实测表现为准。',
      methodology: '晚高峰三网测速 60% + 延迟与抖动 25% + 线路纯度（绕路/跳 163 比例）15%。',
      items: [
        { provider: 'dmit', plan: 'dmit/PVM.LAX.Pro.TINY', score: 9.7, summary: '晚高峰上海电信 4.8 Gbps，三网 GIA 无短板，当前美西线路的天花板。', bestFor: '不计成本要最好' },
        { provider: 'bandwagonhost', plan: 'bandwagonhost/CN2 GIA ECOMMERCE 20G', score: 9.6, summary: '2.5G 口晚高峰保住八成带宽，GIA 老牌的稳定性背书。', bestFor: '长期持有的主力机' },
        { provider: 'v-ps', plan: 'v-ps/San Jose Mini', score: 9.0, summary: '联通 9929 接近专线体验，价格只有 GIA 的一半。', bestFor: '联通用户' },
        { provider: 'tencent-lighthouse', plan: 'tencent-lighthouse/轻量香港 30M', score: 8.9, summary: '自家骨干回国三网满速，带宽小但质量极高。', bestFor: '免备案网页业务' },
        { provider: 'alibabacloud', plan: 'alibabacloud/轻量应用服务器 香港', score: 8.5, summary: '香港回国走阿里骨干，稳定性大厂兜底。', bestFor: '要大厂背书的业务' },
      ],
    },
    {
      title: '高性能榜 · 单核与磁盘说话',
      slug: 'high-performance',
      category: 'performance',
      description: '按 Geekbench 5 单核与磁盘实测排序，给吃 CPU 的业务选机器。',
      methodology: 'GB5 单核 50% + 磁盘顺序/随机 IO 30% + 内存与平台代际 20%。',
      items: [
        { provider: 'dmit', plan: 'dmit/PVM.LAX.Pro.TINY', score: 9.2, summary: 'EPYC 9654 单核 1176 + NVMe 读 3.2 GB/s，共享平台里的独服体验。', bestFor: '高并发 API' },
        { provider: 'digitalocean', plan: 'digitalocean/Premium AMD 2G', score: 8.8, summary: 'EPYC 7542 单核 1094，NVMe 2.4 GB/s，Premium 系列名副其实。', bestFor: '生产级 Web 服务' },
        { provider: 'hetzner', plan: 'hetzner/CX22', score: 8.7, summary: '多核 1986 的成绩在这个价位是降维打击，编译构建神器。', bestFor: 'CI 与批处理' },
        { provider: 'v-ps', plan: 'v-ps/San Jose Mini', score: 8.3, summary: 'EPYC 7763 单核 968，性能与线路难得兼得。', bestFor: '性能线路都要的均衡党' },
        { provider: 'vultr', plan: 'vultr/High Frequency 2G', score: 8.2, summary: '高主频系列单核表现稳定，配合 API 适合弹性算力。', bestFor: '弹性扩缩容场景' },
      ],
    },
    {
      title: '大硬盘存储榜 · 每 GB 成本排序',
      slug: 'big-storage',
      category: 'storage',
      description: '备份、网盘、媒体库——按每 GB 存储的年成本排序，速度只设及格线。',
      methodology: '每 GB 年成本 70% + 网络吞吐 20% + 商家稳定性 10%。',
      items: [
        { provider: 'hosthatch', plan: 'hosthatch/Storage 2TB', score: 9.2, summary: '2TB 年付 47 美元，每 GB 约 0.023 美元，存储单价业界最低档。', bestFor: 'restic/borg 冷备' },
        { provider: 'greencloudvps', plan: 'greencloudvps/Storage KVM 1T', score: 8.6, summary: '1TB 年付 55 美元带 4G 内存，能顺便跑点轻量服务。', bestFor: '备份 + 轻量应用一体机' },
        { provider: 'hetzner', plan: 'hetzner/CX22', score: 8.0, summary: '盘不大但 20T 流量适合做中转分发层，配 Storage Box 扩容便宜。', bestFor: '流量型分发' },
      ],
    },
    {
      title: '廉价年付榜 · 30 美元以内能买到什么',
      slug: 'budget-annual',
      category: 'budget',
      description: '年付 30 美元封顶，只收实测「能正常用」的套餐——便宜但开机即卡的不收。',
      methodology: '年付价格硬门槛 30 美元，按实测可用性与规格排序。',
      items: [
        { provider: 'racknerd', plan: 'racknerd/1GB KVM 新年款', score: 9.7, summary: '11.49 美元的标杆，工单快、续费同价，廉价档的安全牌。', bestFor: '入门首选' },
        { provider: 'racknerd', plan: 'racknerd/2GB KVM', score: 9.2, summary: '18.93 美元拿 2C2G45G，加 7 美元规格翻倍。', bestFor: '稍微正经点的小项目' },
        { provider: 'cloudcone', plan: 'cloudcone/SC2 闪购款', score: 8.9, summary: '16.5 美元 3T 流量，闪购时常有更低价。', bestFor: '蹲促销的玩家' },
        { provider: 'greencloudvps', plan: 'greencloudvps/Budget KVM SEA', score: 8.5, summary: '25 美元的新加坡 2C2G NVMe，东南亚延迟优势。', bestFor: '东南亚方向' },
        { provider: 'tencent-lighthouse', plan: 'tencent-lighthouse/轻量 2C2G 上海', score: 8.4, summary: '新用户活动 16 美元一年的国内 2C2G，需备案但质量没得说。', bestFor: '愿意备案的国内站' },
      ],
    },
  ]

  for (const data of rankingData) {
    const { items, ...rest } = data
    await payload.create({
      collection: 'rankings',
      data: {
        ...rest,
        items: items.map((item: any) => ({
          ...item,
          provider: providers[item.provider].id,
          plan: item.plan ? plans[item.plan]?.id : undefined,
        })),
      },
    })
    console.log(`榜单: ${data.title}`)
  }

  // —— 优惠 ——
  const dealData: Array<any> = [
    { title: '搬瓦工循环优惠码', provider: 'bandwagonhost', code: 'BWHCGLUKKB', discount: '全场 6.58% 循环折扣', description: '续费同样生效，下单前记得粘贴。', expiresAt: '2026-12-31', featured: true },
    { title: 'RackNerd 周年庆年付特惠', provider: 'racknerd', discount: '年付 10.99 美元起', description: '周年庆专属页面下单，库存售完即止。', expiresAt: '2026-07-15', featured: true },
    { title: 'DMIT Lite 系列九五折', provider: 'dmit', code: 'LITE-5OFF-2026', discount: '95 折（仅 Lite 系列）', description: 'Pro 系列不参与，月付年付均可用。', expiresAt: '2026-08-01', featured: false },
    { title: 'Vultr 新用户测试金', provider: 'vultr', discount: '注册送 100 美元 / 30 天', description: '新账号绑卡即送，30 天内有效，适合短期压测。', expiresAt: '2026-12-31', featured: true },
    { title: 'CloudCone 仲夏闪购', provider: 'cloudcone', discount: '年付 14.5 美元起', description: '闪购页轮换补货，先到先得。', expiresAt: '2026-07-31', featured: false },
    { title: 'Hetzner 新用户额度', provider: 'hetzner', discount: '注册送 20 欧元额度', description: '云面板新账号自动到账，可抵扣前两个月。', expiresAt: '2026-12-31', featured: false },
    { title: '腾讯云轻量新用户专享', provider: 'tencent-lighthouse', discount: '香港 30M 首年 5 折', description: '限新用户首单，续费恢复原价，注意算清长期成本。', expiresAt: '2026-06-30', featured: true },
    { title: 'GreenCloud 夏季促销', provider: 'greencloudvps', code: 'SUMMER26', discount: '指定套餐 8 折', description: '新加坡与达拉斯机房参与。', expiresAt: '2026-08-15', featured: false },
    { title: 'HostHatch 存储款加量', provider: 'hosthatch', discount: '年付存储款容量 +25%', description: '下单后开工单领取加量，老用户同享。', expiresAt: '2026-07-20', featured: false },
  ]

  for (const data of dealData) {
    await payload.create({
      collection: 'deals',
      data: { ...data, provider: providers[data.provider].id },
    })
  }
  console.log(`优惠 ×${dealData.length}`)

  console.log('—— 种子完成 ——')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
