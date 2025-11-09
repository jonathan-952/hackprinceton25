'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, FileText, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "🚨 **Emergency Accident Support**\n\nI'm ClaimPilot, your post-accident companion. If you just had an accident, I'm here to help you RIGHT NOW.\n\n**I can help you with:**\n• What to do at the scene\n• Whether to call police or ambulance\n• How to document the accident\n• Legal & medical next steps\n• Starting your insurance claim\n\nWhat happened? Tell me everything.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: null,
          message: input.trim(),
          context: {
            conversation_history: messages,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
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
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClaimPilot Emergency Support</h1>
                <p className="text-xs text-red-600 font-semibold">24/7 Post-Accident Help</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              My Claims
            </Link>
          </div>
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 text-center shadow-md">
        <p className="text-white font-semibold text-sm">
          🚨 <strong>Just had an accident?</strong> Stay calm. I'll guide you through every step.
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
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
              <div className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-base text-gray-700">ClaimPilot is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <Textarea
              ref={textareaRef}
              placeholder="Describe what happened... I'm here to help."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[70px] resize-none text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[70px] w-[70px] bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Press Enter to send • Shift+Enter for new line • <Link href="/dashboard" className="text-blue-600 hover:underline">Need to file a claim?</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
