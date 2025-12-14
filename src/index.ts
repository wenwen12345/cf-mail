/**
 * CF-Mail - 极简版
 * 功能：邮件接收 → 解析 → 验证码提取 → Telegram推送
 */

import { handleEmail } from './services/email'

type Bindings = {
  MAIL_DOMAIN: string
  TG_BOT_TOKEN: string
  TG_CHAT_ID: string
  TG_TOPIC_ID?: string  // 可选：Telegram群组的Topic ID
}

export default {
  // Email Workers handler
  async email(message: EmailMessage, env: Bindings, ctx: ExecutionContext) {
    console.log(`收到邮件：${message.from} → ${message.to}`)

    try {
      await handleEmail(message, env)
    } catch (error) {
      console.error('邮件处理失败:', error)
      message.setReject('处理失败')
    }
  },
}
