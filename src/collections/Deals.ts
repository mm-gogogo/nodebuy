import type { CollectionConfig } from 'payload'
import { validateOptionalUrl } from '../lib/urlValidation'
import { dealStatus } from '../lib/deals'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: { singular: '优惠', plural: '优惠速递' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'provider', 'code', 'expiresAt', 'expiryStatus'],
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
    { name: 'url', label: '推广链接（覆盖服务商默认）', type: 'text', validate: validateOptionalUrl },
    {
      name: 'expiryStatus',
      label: '状态 (自动)',
      type: 'text',
      virtual: true,
      admin: { readOnly: true, description: '据失效日期自动判定:已过期 / 即将过期(≤3天)/ 有效 / 长期有效' },
      hooks: { afterRead: [({ data }) => dealStatus(data?.expiresAt as string | null | undefined)] },
    },
    { name: 'featured', label: '首页置顶', type: 'checkbox', defaultValue: false },
  ],
}
