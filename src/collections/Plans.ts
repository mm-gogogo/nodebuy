import type { CollectionConfig } from 'payload'
import { validateMonthlyPrice, validateNonNegative, validatePositive } from '../lib/planValidation'

export const Plans: CollectionConfig = {
  slug: 'plans',
  labels: { singular: '套餐', plural: '套餐' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'provider', 'priceYearly', 'location', 'inStock'],
    group: '内容',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', label: '套餐名', type: 'text', required: true },
    { name: 'provider', label: '服务商', type: 'relationship', relationTo: 'providers', required: true },
    {
      type: 'row',
      fields: [
        { name: 'cpuCores', label: 'vCPU 核数', type: 'number', required: true, validate: validatePositive },
        { name: 'ramMB', label: '内存 (MB)', type: 'number', required: true, validate: validatePositive },
        { name: 'storageGB', label: '硬盘 (GB)', type: 'number', required: true, validate: validatePositive },
        {
          name: 'storageType', label: '硬盘类型', type: 'select', defaultValue: 'nvme',
          options: [
            { label: 'NVMe', value: 'nvme' },
            { label: 'SSD', value: 'ssd' },
            { label: 'HDD', value: 'hdd' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'trafficTB', label: '月流量 (TB)', type: 'number', validate: validateNonNegative, admin: { description: '0 表示不限' } },
        { name: 'bandwidthMbps', label: '带宽 (Mbps)', type: 'number', validate: validatePositive },
        { name: 'location', label: '机房', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceMonthly',
          label: '月付 (USD)',
          type: 'number',
          validate: validateMonthlyPrice,
          admin: { description: '月付与年付至少填一个' },
        },
        { name: 'priceYearly', label: '年付 (USD)', type: 'number', validate: validatePositive },
      ],
    },
    { name: 'route', label: '线路', type: 'select', options: [
      { label: 'CN2 GIA', value: 'cn2gia' },
      { label: 'CN2 GT', value: 'cn2gt' },
      { label: 'CMIN2', value: 'cmin2' },
      { label: '9929', value: '9929' },
      { label: '4837', value: '4837' },
      { label: '普通直连', value: 'direct' },
      { label: '国际 BGP', value: 'bgp' },
    ] },
    { name: 'highlight', label: '卖点', type: 'text' },
    { name: 'affUrl', label: 'AFF 链接（覆盖服务商默认）', type: 'text' },
    { name: 'inStock', label: '有货', type: 'checkbox', defaultValue: true },
  ],
}
