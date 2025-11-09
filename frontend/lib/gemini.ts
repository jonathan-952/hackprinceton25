import { GoogleGenerativeAI } from '@google/generative-ai'
import { Message, ChatContext, ChatAction } from '@/types/chat'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function chatWithGemini(
  context: ChatContext,
  userMessage: string
): Promise<{ response: string; actions: ChatAction[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Build system prompt with claim context
  const systemPrompt = `You are ClaimPilot AI, a professional insurance claims assistant. You have access to the following claim data:

${JSON.stringify(context.claim_data, null, 2)}

Agent Outputs:
${JSON.stringify(context.agent_outputs, null, 2)}

Your capabilities:
1. Answer questions about the claim naturally and conversationally
2. Update claim fields when requested (return structured JSON for updates)
3. Trigger orchestrator agents when asked (return agent_trigger command)
4. Explain insurance concepts, payout calculations, and next steps

Tone: Professional, calm, empathetic, helpful
Format: Conversational responses, not bullet points unless listing options

When the user asks you to:
- Update claim information: Respond with JSON in format {"action": "update_claim", "fields": {...}}
- Run an agent: Respond with JSON in format {"action": "trigger_agent", "agent": "agent_name"}
- Answer questions: Provide natural, helpful responses based on the claim data
`

  // Build conversation history
  const history = context.conversation_history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  // Create chat session
  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I\'m ready to assist with this insurance claim. How can I help you today?' }],
      },
      ...history,
    ],
  })

  // Send user message
  const result = await chat.sendMessage(userMessage)
  const response = result.response.text()

  // Parse response for actions
  const actions: ChatAction[] = parseActions(response)

  return { response, actions }
}

function parseActions(response: string): ChatAction[] {
  const actions: ChatAction[] = []

  // Look for JSON action blocks in the response
  const jsonRegex = /\{[^}]*"action":\s*"([^"]+)"[^}]*\}/g
  const matches = response.matchAll(jsonRegex)

  for (const match of matches) {
    try {
      const actionData = JSON.parse(match[0])
      if (actionData.action === 'update_claim') {
        actions.push({
          type: 'update_claim',
          payload: actionData.fields,
        })
      } else if (actionData.action === 'trigger_agent') {
        actions.push({
          type: 'trigger_agent',
          payload: { agent: actionData.agent },
        })
      }
    } catch (e) {
      // Not valid JSON, skip
    }
  }

  return actions
}

// Helper to extract clean response (remove JSON blocks)
export function cleanResponse(response: string): string {
  return response.replace(/\{[^}]*"action":\s*"[^"]+\"[^}]*\}/g, '').trim()
}
