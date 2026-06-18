import type { CollectionConfig } from 'payload'
import { autoSlug, validateSlug } from '../lib/slug'
import { reviewDataStatus, reviewOverallDisplay } from '../lib/reviewComputed'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: '测评', plural: '测评' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'provider', 'overall', 'dataStatus', 'publishedAt', '_status'],
    group: '内容',
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', label: '标题', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      hooks: { beforeValidate: [({ value, data }) => autoSlug(value, data?.title)] },
      admin: { description: '留空将根据标题自动生成；纯中文标题需手填' },
    },
    { name: 'provider', label: '服务商', type: 'relationship', relationTo: 'providers', required: true },
    { name: 'plan', label: '关联套餐', type: 'relationship', relationTo: 'plans' },
    { name: 'excerpt', label: '摘要', type: 'textarea' },
    { name: 'content', label: '正文', type: 'richText' },
    {
      type: 'row',
      fields: [
        { name: 'publishedAt', label: '发布日期', type: 'date', required: true },
        { name: 'author', label: '作者', type: 'text', defaultValue: '主站编辑' },
        { name: 'readingMinutes', label: '阅读分钟', type: 'number' },
      ],
    },
    {
      name: 'scores',
      label: '分项评分（0–10）',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'performance', label: '性能', type: 'number', min: 0, max: 10 },
            { name: 'network', label: '网络', type: 'number', min: 0, max: 10 },
            { name: 'value', label: '性价比', type: 'number', min: 0, max: 10 },
            { name: 'support', label: '售后', type: 'number', min: 0, max: 10 },
          ],
        },
      ],
    },
    {
      name: 'overall',
      label: '综合评分 (自动)',
      type: 'number',
      virtual: true,
      admin: { readOnly: true, description: '性能/网络/性价比/售后四项均值,仅供后台速览,不入库' },
      hooks: { afterRead: [({ data }) => reviewOverallDisplay(data?.scores)] },
    },
    {
      name: 'dataStatus',
      label: '数据完整度 (自动)',
      type: 'text',
      virtual: true,
      admin: { readOnly: true, description: '据是否有 GB5 跑分 / 测速节点判定:缺数据的测评进不了跑分榜与测速榜' },
      hooks: { afterRead: [({ data }) => reviewDataStatus(data?.benchmarks)] },
    },
    { name: 'verdict', label: '结论', type: 'textarea' },
    {
      name: 'benchmarks',
      label: '跑分数据',
      type: 'group',
      fields: [
        { name: 'cpuModel', label: 'CPU 型号', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'gb5Single', label: 'Geekbench 5 单核', type: 'number' },
            { name: 'gb5Multi', label: 'Geekbench 5 多核', type: 'number' },
            { name: 'diskReadMBs', label: '磁盘读 (MB/s)', type: 'number' },
            { name: 'diskWriteMBs', label: '磁盘写 (MB/s)', type: 'number' },
          ],
        },
        {
          name: 'speedtests',
          label: '测速节点',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'node', label: '节点', type: 'text', required: true },
                { name: 'downloadMbps', label: '下载 (Mbps)', type: 'number' },
                { name: 'uploadMbps', label: '上传 (Mbps)', type: 'number' },
                { name: 'latencyMs', label: '延迟 (ms)', type: 'number' },
              ],
            },
          ],
        },
        {
          name: 'routes',
          label: '回程线路',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'isp', label: '运营商', type: 'select', options: [
                  { label: '电信', value: 'ct' },
                  { label: '联通', value: 'cu' },
                  { label: '移动', value: 'cm' },
                ] },
                { name: 'path', label: '线路', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
