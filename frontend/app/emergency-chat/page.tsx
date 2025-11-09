'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, FileText, AlertCircle, Save } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function EmergencyChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm ClaimPilot. If you just had an accident, I'm here to guide you through the immediate next steps.\n\nWhat happened?",
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

  const handleSaveAsClaim = async () => {
    // Save conversation context and redirect to claim form
    localStorage.setItem('emergencyChatHistory', JSON.stringify(messages))
    router.push('/claims/new?from=emergency')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Minimal Professional Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Emergency Support</h1>
                <p className="text-sm text-gray-500">Get immediate guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveAsClaim}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & File Claim
              </Button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-gray-900 hover:bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <FileText className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages - Clean & Professional */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                    {message.content}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2 px-2">
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
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-[15px] text-gray-600">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Professional */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              placeholder="Describe what happened..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[56px] resize-none text-[15px] bg-gray-50 border-gray-200"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[56px] w-[56px] bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Press Enter to send • This conversation can be saved as a claim
          </p>
        </div>
      </div>
    </div>
  )
}
