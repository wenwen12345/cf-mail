# CF-Mail

Just Simple One CF-MAIL

## 特色

- **单用户** - 专为个人设计，无需复杂的多用户管理
- **仅收件** - 不支持发件，简单纯粹
- **验证码提取** - 自动识别邮件中的验证码，一键复制
- **Telegram 转发** - 新邮件实时推送到 TG（开发中）

## 一键部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lyon-le/cf-mail)

## 部署后配置

### 1. 环境变量

部署时会提示填写以下变量：

| 变量名 | 说明 |
|--------|------|
| `ADMIN_PASSWORD` | 登录密码 |
| `JWT_SECRET` | JWT 签名密钥（随机字符串） |
| `MAIL_DOMAIN` | 邮箱域名（如 `example.com`） |

> 数据库表会在首次访问时自动创建，无需手动初始化。

### 2. 配置 Email Routing

1. Cloudflare Dashboard → 你的域名 → Email → Email Routing
2. 启用 Email Routing
3. 添加规则：Catch-all → Send to Worker → 选择 `cf-mail`

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **前端**: Tailwind CSS + Alpine.js

## 鸣谢

- [cloud-mail](https://github.com/maillab/cloud-mail) - Telegram 转发功能
- [freemail](https://github.com/idinging/freemail) - 验证码提取逻辑, 一键部署逻辑

## License

MIT
