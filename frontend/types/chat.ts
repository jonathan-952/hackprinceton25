export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id?: string
  role: MessageRole
  content: string
  timestamp: string
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  claim_id?: string
  agent_triggered?: string
  claim_updated?: boolean
  update_fields?: string[]
}

export interface ChatContext {
  claim_id: string
  claim_data: any
  agent_outputs: any
  conversation_history: Message[]
}

export interface ChatResponse {
  message: Message
  actions?: ChatAction[]
}

export interface ChatAction {
  type: 'update_claim' | 'trigger_agent' | 'generate_response'
  payload: any
}
