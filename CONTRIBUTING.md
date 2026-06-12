# 贡献指南

感谢你对 NodeBuy 的兴趣!Issue、PR、文档修订都欢迎。

## 开发环境

```bash
docker compose up -d        # PostgreSQL 16(宿主端口 5434)
pnpm install
cp .env.example .env        # 按需修改 PAYLOAD_SECRET
npx tsx src/seed.ts         # 演示数据(幂等,必须用 tsx 跑)
pnpm dev
```

详见 [docs/开发手册.md](docs/开发手册.md)。

## 提交流程

1. Fork 本仓库,从 `main` 切出分支:`feat/<功能>`、`fix/<问题>` 或 `docs/<内容>`;
2. Commit message 使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 格式(`feat:` / `fix:` / `docs:` / `chore:` …);
3. 提交前确认本地通过:

   ```bash
   pnpm lint                # ESLint,0 error
   npx tsc --noEmit         # 类型检查
   pnpm test:int            # 集成测试(需要数据库)
   pnpm build               # 生产构建
   ```

4. 发起 PR,按模板说明改动动机与验证方式。CI 会自动跑上述检查。

## 代码约定

- 页面全部是 React Server Components,数据直接走 Payload Local API,不发 HTTP;
- 颜色、字体、间距只能引用 `src/app/(frontend)/tokens.css` 里的变量,禁止裸 hex;
- 修改集合定义后执行 `pnpm generate:types` 重新生成 `src/payload-types.ts`(生成文件不要手改);
- 所有出站推广链接必须经过 `/go/<slug>` 路由并带 `rel="nofollow sponsored"`。

## 报告问题

- Bug 请附复现步骤、期望行为与实际行为;
- 安全问题请勿公开提 issue,直接联系维护者。
