import type { CollectionConfig } from 'payload'
import { validateSlug } from '../lib/slug'

export const Rankings: CollectionConfig = {
  slug: 'rankings',
  labels: { singular: '榜单', plural: '榜单' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
    group: '内容',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', label: '榜单标题', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, unique: true, index: true, validate: validateSlug },
    {
      name: 'category',
      label: '分类',
      type: 'select',
      required: true,
      options: [
        { label: '综合推荐', value: 'overall' },
        { label: '性价比', value: 'value' },
        { label: '大陆优化', value: 'cn-optimized' },
        { label: '高性能', value: 'performance' },
        { label: '大硬盘 / 存储', value: 'storage' },
        { label: '廉价 / 年付小鸡', value: 'budget' },
      ],
    },
    { name: 'description', label: '榜单说明', type: 'textarea' },
    { name: 'methodology', label: '评选标准', type: 'textarea' },
    { name: 'featured', label: '首页精选', type: 'checkbox', defaultValue: false },
    {
      name: 'items',
      label: '上榜条目（按顺序即名次）',
      type: 'array',
      fields: [
        { name: 'provider', label: '服务商', type: 'relationship', relationTo: 'providers', required: true },
        { name: 'plan', label: '代表套餐', type: 'relationship', relationTo: 'plans' },
        { name: 'score', label: '评分', type: 'number', min: 0, max: 10 },
        { name: 'summary', label: '上榜理由', type: 'textarea' },
        { name: 'bestFor', label: '适合人群', type: 'text' },
      ],
    },
  ],
}
