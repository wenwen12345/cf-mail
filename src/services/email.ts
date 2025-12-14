/**
 * Email Workers 收件处理 - 极简版
 * 功能：解析邮件 → 提取验证码 → 推送到Telegram
 */

import { parseEmail } from './parser'
import { extractVerificationCode } from './verification'

interface Env {
  MAIL_DOMAIN: string
  TG_BOT_TOKEN: string
  TG_CHAT_ID: string
  TG_TOPIC_ID?: string  // 可选：Telegram群组的Topic ID
}

/**
 * 生成邮件预览文本（前120字符）
 */
function generatePreview(text: string, html: string): string {
  let content = text || html
  // 移除 HTML 标签
  content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  // 截取前 120 字符
  return content.length > 120 ? content.substring(0, 120) + '...' : content
}

/**
 * 主邮件处理流程
 */
export async function handleEmail(
  message: EmailMessage,
  env: Env
): Promise<void> {
  // 读取原始邮件内容
  const rawEmail = await new Response(message.raw).text()

  // 解析邮件
  const parsed = parseEmail(rawEmail)

  // 提取验证码
  const verificationCode = extractVerificationCode(parsed.subject, parsed.text, parsed.html)

  // 生成预览
  const preview = generatePreview(parsed.text, parsed.html)

  console.log(`邮件已解析: ${parsed.subject} (验证码: ${verificationCode || '无'})`)

  // 推送到 Telegram
  await sendTelegramNotification(env, {
    from: parsed.from,
    to: message.to.toLowerCase(),
    subject: parsed.subject,
    preview,
    verificationCode,
  })
}

/**
 * Telegram 推送通知
 */
async function sendTelegramNotification(
  env: Env,
  email: {
    from: string
    to: string
    subject: string
    preview: string
    verificationCode: string | null
  }
): Promise<void> {
  try {
    const codeText = email.verificationCode ? `\n🔑 验证码: ${email.verificationCode}` : ''
    const text = `📬 新邮件

📤 发件人: ${email.from}
📥 收件人: ${email.to}
📋 主题: ${email.subject}${codeText}

${email.preview}`

    // 构建请求体
    const body: {
      chat_id: string
      text: string
      message_thread_id?: string
    } = {
      chat_id: env.TG_CHAT_ID,
      text,
    }

    // 如果配置了Topic ID，则添加到请求中
    if (env.TG_TOPIC_ID) {
      body.message_thread_id = env.TG_TOPIC_ID
    }

    const res = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Telegram 推送失败: ${res.status}`, errorText)
    } else {
      console.log('Telegram 推送成功 ✓')
    }
  } catch (e) {
    console.error('Telegram 推送异常:', e)
  }
}
