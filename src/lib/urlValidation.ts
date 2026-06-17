import { normalizeAffUrl } from './aff'

// 外链校验(纯函数,Payload 字段 validate 复用)。
// 用于 affUrl / website / 推广 url:破链会让 /go 跳转失效、丢失 AFF 转化;
// 同时挡掉 javascript:/data: 等非 http(s) 协议(防止经外链注入脚本)。
//
// 口径与 /go 的 normalizeAffUrl 一致:能被收敛成 http(s) 绝对地址即视为合法
//(因此裸域名 example.com/aff、协议相对 //x 都接受 —— 与跳转时的处理保持一致),
// 收敛不出 http(s) 的(javascript:、含空格的乱串等)才拒绝。
export function validateOptionalUrl(value: unknown): true | string {
  if (value == null || value === '') return true // 可空,空值放行
  if (typeof value !== 'string') return '必须是文本'
  if (value.trim() === '') return true
  if (normalizeAffUrl(value) == null) {
    return '无法识别为 http(s) 链接(可填裸域名如 example.com/aff,但不支持 javascript: 等协议)'
  }
  return true
}
