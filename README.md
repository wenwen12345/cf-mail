# CF-Mail 极简版 v2.0

**一个极致简单的邮件转发工具：收到邮件 → 自动推送到 Telegram**

## ✨ 特性

- **极致简单** - 无需数据库、无需存储、无需Web界面
- **自动转发** - 任意邮件自动推送到 Telegram
- **验证码提取** - 智能识别并高亮显示验证码
- **Catch-all 模式** - 域名下所有邮箱地址自动接收
- **零维护** - 部署后无需任何管理操作

## 📋 工作流程

```
收到邮件 → 解析内容 → 提取验证码 → 推送到 Telegram
```

就这么简单！ฅ'ω'ฅ

## 🚀 快速部署

### 步骤 1：Fork 本仓库

点击右上角 **Fork** 按钮，将仓库复制到你的 GitHub 账号。

### 步骤 2：创建 Cloudflare Workers 项目

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create** → **Pages** → **Connect to Git**
4. 选择你 Fork 的 `cf-mail` 仓库

### 步骤 3：配置构建设置

保持默认设置即可，框架选择 `None`，其他什么都不用改！

### 步骤 4：配置 Telegram Bot

**创建 Bot**

1. 打开 Telegram，搜索 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot`，按提示设置名称
3. 获取 `Bot Token`（格式：`1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`）

**获取 Chat ID**

1. 与你的 Bot 对话，发送任意消息（如：`你好`）
2. 访问 `https://api.telegram.org/bot<你的TOKEN>/getUpdates`
3. 在返回的 JSON 中找到 `"chat":{"id": 123456789}`

### 步骤 5：设置环境变量

在 Cloudflare 项目的 **Settings** → **Variables and Secrets** 中添加：

| 变量名 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `MAIL_DOMAIN` | 你的邮箱域名 | `example.com` | ✅ |
| `TG_BOT_TOKEN` | Telegram Bot Token | `1234567890:ABC...` | ✅ |
| `TG_CHAT_ID` | Telegram Chat ID | `123456789` | ✅ |
| `TG_TOPIC_ID` | Telegram 群组 Topic ID（可选） | `456` | ❌ |

> **注意**：
> - 不需要配置数据库和 R2 存储，这个版本已经移除了这些依赖！
> - `TG_TOPIC_ID` 仅在需要发送到群组的特定 Topic 时配置

### 步骤 6：配置 Email Routing

1. 进入 Cloudflare Dashboard → 你的域名 → **Email** → **Email Routing**
2. 启用 Email Routing
3. 添加路由规则：
   - 选择 **Catch-all**
   - 动作选择 **Send to Worker**
   - 选择你的 `cf-mail` Worker

完成！现在任何发送到 `xxx@你的域名.com` 的邮件都会自动推送到你的 Telegram。

## 📱 效果预览

收到邮件后，Telegram 会显示：

```
📬 新邮件

📤 发件人: noreply@service.com
📥 收件人: test@yourdomain.com
📋 主题: 您的验证码
🔑 验证码: 123456

您的验证码是 123456，请在10分钟内使用...
```

验证码会自动识别并高亮显示，方便复制！

## 🔧 技术细节

**项目结构**
```
cf-mail/
├── src/
│   ├── index.ts              # 主入口（Email Worker）
│   ├── services/
│   │   ├── email.ts          # 邮件处理和TG推送
│   │   ├── parser.ts         # MIME邮件解析
│   │   └── verification.ts   # 验证码提取算法
│   └── types.d.ts            # 类型定义
├── wrangler.toml             # Cloudflare Workers配置
└── package.json              # 项目依赖
```

**核心功能**
- 📧 MIME 邮件解析（支持 multipart、Base64、Quoted-Printable）
- 🔍 智能验证码识别（支持中英文关键词、多种格式）
- 📲 Telegram API 推送

**无需的组件**
- ❌ 数据库（不保存历史）
- ❌ 对象存储（不存储文件）
- ❌ Web 界面（不需要管理）
- ❌ 身份认证（无管理后台）

## 🤔 常见问题

**Q: 为什么收不到邮件推送？**

A: 检查三点：
1. Email Routing 是否配置了 Catch-all 规则指向 Worker
2. 环境变量 `TG_BOT_TOKEN` 和 `TG_CHAT_ID` 是否正确
3. 查看 Worker 的日志（Cloudflare Dashboard → Workers → 你的项目 → Logs）

**Q: 支持多个域名吗？**

A: 支持！`MAIL_DOMAIN` 可以用逗号分隔多个域名，如：`domain1.com,domain2.com`

**Q: 邮件历史会保存吗？**

A: 不会！极简版只推送到 Telegram，不保存任何数据。如果需要历史记录，请查看 Telegram 的聊天记录。

**Q: 可以自定义推送格式吗？**

A: 可以！修改 `src/services/email.ts` 中的 `sendTelegramNotification` 函数即可。

**Q: 附件怎么办？**

A: 极简版不处理附件，只推送邮件文本内容。如果需要附件，可以回到旧版本。

**Q: 如何发送到 Telegram 群组的特定 Topic？**

A: 按以下步骤操作：
1. 确保你的 Bot 已添加到群组，并且群组启用了 Topics（话题）功能
2. 在目标 Topic 中发送任意消息
3. 右键点击消息选择"复制消息链接"，链接格式为 `https://t.me/c/群组ID/Topic消息ID`
4. Topic 消息ID 中的第一段数字即为 Topic ID（例如链接 `https://t.me/c/123456/456/789` 中的 `456` 就是 Topic ID）
5. 将 Topic ID 添加到环境变量 `TG_TOPIC_ID` 中

> **提示**：也可以通过 Bot API `getUpdates` 方法获取 `message_thread_id` 字段

## 💡 与旧版本的区别

| 功能 | 旧版本 (v1.x) | 极简版 (v2.0) |
|------|---------------|---------------|
| Web 管理界面 | ✅ | ❌ 移除 |
| 数据库存储 | ✅ D1 | ❌ 不需要 |
| 文件存储 | ✅ R2 | ❌ 不需要 |
| 邮箱管理 | 需手动创建 | Catch-all 自动接收 |
| 附件处理 | ✅ 支持 | ❌ 忽略 |
| Telegram 推送 | ✅ | ✅ 保留 |
| 验证码识别 | ✅ | ✅ 保留 |

## 🙏 鸣谢

- [cloud-mail](https://github.com/maillab/cloud-mail) - Telegram 转发参考
- [freemail](https://github.com/idinging/freemail) - 验证码提取逻辑参考

## 📄 License

MIT

---

**如果你喜欢这个项目，请给个 ⭐ Star 吧！(｡♡‿♡｡)**
