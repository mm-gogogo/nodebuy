import type { CollectionConfig } from 'payload'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: { singular: '优惠', plural: '优惠速递' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'provider', 'code', 'expiresAt'],
    group: '内容',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', label: '优惠标题', type: 'text', required: true },
    { name: 'provider', label: '服务商', type: 'relationship', relationTo: 'providers', required: true },
    { name: 'description', label: '说明', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'code', label: '优惠码', type: 'text' },
        { name: 'discount', label: '折扣描述', type: 'text' },
        { name: 'expiresAt', label: '失效日期', type: 'date' },
      ],
    },
    { name: 'url', label: '推广链接（覆盖服务商默认）', type: 'text' },
    { name: 'featured', label: '首页置顶', type: 'checkbox', defaultValue: false },
  ],
}
