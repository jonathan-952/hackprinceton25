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

// Demo conversation showcasing helpful AI capabilities
const DEMO_CONVERSATION: Message[] = [
  {
    id: 'demo-1',
    role: 'assistant',
    content: `Hello! I'm ClaimPilot AI. I can help you with:\n\n✅ Explaining your claim status and next steps\n✅ Answering questions about repair costs and shops\n✅ Helping update claim details\n✅ Clarifying insurance coverage and deductibles\n✅ Providing timeline estimates\n\nWhat would you like to know?`,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'demo-2',
    role: 'user',
    content: 'What repair shops are recommended and why?',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'demo-3',
    role: 'assistant',
    content: `Based on your claim analysis, I recommend these top 3 shops:\n\n🏆 **Princeton Auto Body** ($3,900)\n• Highest rated (4.8⭐) in your area\n• Only 1.2 miles away\n• 5-day turnaround\n• Certified for Honda repairs\n\n🥈 **Elite Collision Center** ($4,100)\n• Premium service (4.9⭐)\n• Fastest turnaround (4 days)\n• 2.5 miles away\n• Lifetime warranty on repairs\n\n🥉 **NJ Certified Repairs** ($3,850)\n• Best value option\n• Good rating (4.7⭐)\n• 6-day turnaround\n\nAll three are in-network with State Farm and can work directly with your insurance!`,
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'demo-4',
    role: 'user',
    content: 'What will my out-of-pocket cost be?',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'demo-5',
    role: 'assistant',
    content: `Great question! Here's your cost breakdown:\n\n💰 **Total Damage Estimate:** $4,250\n📋 **Your Deductible:** $500\n✅ **Insurance Payout:** $3,750\n\n**Your Out-of-Pocket:** Just $500 (your deductible)\n\nSince this is a rear-end collision where you weren't at fault, you may also be able to recover this $500 deductible from the other driver's insurance through subrogation. Would you like help filing that claim?`,
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
]

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

  const loadDemoConversation = () => {
    setMessages(DEMO_CONVERSATION)
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
      {/* Header - Professional with Accent */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-base text-gray-900">💬 AI Assistant</h3>
            <p className="text-xs text-gray-600">Ask questions, update details, or run agents</p>
          </div>
          <Button
            onClick={loadDemoConversation}
            variant="outline"
            size="sm"
            className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50 hover:text-purple-800 text-xs"
          >
            ✨ Demo
          </Button>
        </div>
      </div>

      {/* Messages - Clean Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
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
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Professional */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none border border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
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
