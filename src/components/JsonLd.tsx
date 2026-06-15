import React from 'react'

// 渲染一段 JSON-LD <script>。data 为已构造好的结构化数据对象。
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
