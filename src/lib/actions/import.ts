'use server'

import Anthropic from '@anthropic-ai/sdk'

export interface ParsedItem {
  title: string
  titleOriginal?: string
  brand?: string
  itemType?: string
  variant?: string
  purchasePrice?: number
  sourceAgent?: string
  sourceItemId?: string
  sourceOrderId?: string
  source1688Id?: string
  sourceUrl?: string
  quantity?: number
}

const SYSTEM_PROMPT = `You are a reselling import assistant. Parse the pasted order data from ACBuy or GTBuy.
Detect the source agent (acbuy/gtbuy/unknown).
For each item, extract: title (English), titleOriginal, brand, itemType, variant, purchasePrice (USD number), quantity (integer), sourceItemId, sourceOrderId, source1688Id, sourceUrl.
If the source is gtbuy and the title is in Chinese, translate it to English.
Suggest brand and itemType based on the title.
If quantity > 1, duplicate the item that many times (each as separate entry with qty=1).
Return ONLY a JSON array, no explanation.
Schema: { title, titleOriginal, brand, itemType, variant, purchasePrice, sourceAgent, sourceItemId, sourceOrderId, source1688Id, sourceUrl }[]`

export async function parseImportText(text: string): Promise<ParsedItem[]> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key-here') {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add your API key to .env.')
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Parse this order data:\n\n${text}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  // Extract JSON from response
  const responseText = content.text.trim()
  const jsonMatch = responseText.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in Claude response')

  const parsed = JSON.parse(jsonMatch[0]) as ParsedItem[]
  return parsed
}
