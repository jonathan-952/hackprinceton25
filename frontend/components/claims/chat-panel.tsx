'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import { Message, ChatContext } from '@/types/chat'
import { Claim } from '@/types/claim'
import { formatDateTime } from '@/lib/utils'

interface ChatPanelProps {
  claim: Claim
  onAgentTrigger?: (agentType: string) => void
  onClaimUpdate?: (updates: any) => void
}

export function ChatPanel({ claim, onAgentTrigger, onClaimUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [claim.claim_id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claim.claim_id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        // If endpoint doesn't exist, start with welcome message
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm ClaimPilot AI. I see you've filed a claim for ${claim.incident_data.type}. How can I help you today?`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      // Start with welcome message
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm ClaimPilot AI. I see you've filed a claim for ${claim.incident_data.type}. How can I help you today?`,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Build context for Gemini
      const context: ChatContext = {
        claim_id: claim.claim_id,
        claim_data: claim,
        agent_outputs: claim.orchestrator_state || {},
        conversation_history: messages,
      }

      // Call Gemini API through backend
      const response = await fetch(`http://localhost:8000/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claim.claim_id,
          message: input.trim(),
          context,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Handle actions from the response
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.type === 'trigger_agent' && onAgentTrigger) {
            onAgentTrigger(action.payload.agent)
          } else if (action.type === 'update_claim' && onClaimUpdate) {
            onClaimUpdate(action.payload)
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Apple Style */}
      <div className="border-b border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
        <h3 className="font-semibold text-lg text-gray-900">ClaimPilot Chat Assistant</h3>
        <p className="text-sm text-gray-600">Ask questions, update claim details, or trigger agents</p>
      </div>

      {/* Messages - Apple Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-1.5 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
                title={formatDateTime(message.timestamp)}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-700">ClaimPilot is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Apple Style */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
