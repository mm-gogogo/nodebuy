import type { CollectionConfig } from 'payload'
import { validateSlug } from '../lib/slug'

export const Providers: CollectionConfig = {
  slug: 'providers',
  labels: { singular: '服务商', plural: '服务商' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'overallScore', 'updatedAt'],
    group: '内容',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', label: '名称', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true, index: true, validate: validateSlug },
    { name: 'tagline', label: '一句话定位', type: 'text' },
    { name: 'description', label: '简介', type: 'textarea' },
    { name: 'website', label: '官网', type: 'text' },
    { name: 'affUrl', label: 'AFF 推广链接', type: 'text', admin: { description: '/go/<slug> 将 302 跳转到此链接' } },
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    {
      name: 'brandColor',
      label: '品牌色 (hex)',
      type: 'text',
      admin: { description: '无 Logo 时用于生成字母徽标底色' },
    },
    { name: 'founded', label: '成立年份', type: 'number' },
    { name: 'headquarters', label: '总部', type: 'text' },
    {
      name: 'paymentMethods',
      label: '付款方式',
      type: 'select',
      hasMany: true,
      options: [
        { label: '支付宝', value: 'alipay' },
        { label: '微信支付', value: 'wechat' },
        { label: 'PayPal', value: 'paypal' },
        { label: '信用卡', value: 'card' },
        { label: '加密货币', value: 'crypto' },
        { label: '银联', value: 'unionpay' },
      ],
    },
    {
      name: 'datacenters',
      label: '数据中心',
      type: 'array',
      fields: [
        { name: 'city', label: '城市', type: 'text', required: true },
        { name: 'region', label: '区域', type: 'select', options: [
          { label: '北美', value: 'na' },
          { label: '欧洲', value: 'eu' },
          { label: '亚太', value: 'apac' },
          { label: '中国大陆', value: 'cn' },
        ] },
        { name: 'cnOptimized', label: '大陆优化线路', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'scores',
      label: '评分（0–10）',
      type: 'group',
      fields: [
        { name: 'performance', label: '性能', type: 'number', min: 0, max: 10 },
        { name: 'network', label: '网络', type: 'number', min: 0, max: 10 },
        { name: 'value', label: '性价比', type: 'number', min: 0, max: 10 },
        { name: 'support', label: '售后', type: 'number', min: 0, max: 10 },
      ],
    },
    { name: 'overallScore', label: '综合评分', type: 'number', min: 0, max: 10, admin: { position: 'sidebar' } },
    { name: 'pros', label: '优点', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    { name: 'cons', label: '缺点', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
  ],
}
