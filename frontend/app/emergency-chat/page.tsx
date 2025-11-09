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

// Demo conversation showing how the emergency chatbot helps at accident scene
const DEMO_CONVERSATION: Message[] = [
  {
    id: 'demo-1',
    role: 'assistant',
    content: "I'm ClaimPilot Emergency Assistant. If you just had an accident, I'm here to guide you through the immediate next steps.\n\nWhat happened?",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'demo-2',
    role: 'user',
    content: "I just got rear-ended at a red light! I'm really shaken up. What should I do?",
    timestamp: new Date(Date.now() - 540000).toISOString(),
  },
  {
    id: 'demo-3',
    role: 'assistant',
    content: "Take a deep breath. You're safe now and I'm here to help. Here's what to do RIGHT NOW:\n\n**IMMEDIATE ACTIONS:**\n1. ✅ Check yourself and passengers for injuries\n2. ✅ Call 911 if anyone is hurt\n3. ✅ Move to safety if possible (but don't leave the scene)\n4. ✅ Turn on hazard lights\n\n**IMPORTANT:** Are you or anyone else injured? Is the scene safe?",
    timestamp: new Date(Date.now() - 480000).toISOString(),
  },
  {
    id: 'demo-4',
    role: 'user',
    content: "No one's hurt, just minor neck pain. The other driver is apologizing saying it's his fault. Should I tell him it's okay?",
    timestamp: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: 'demo-5',
    role: 'assistant',
    content: "⚠️ **STOP! Do NOT say these things:**\n❌ \"It's okay\" or \"Don't worry about it\"\n❌ \"I'm fine\" (you mentioned neck pain!)\n❌ \"We don't need to call police\"\n❌ Accepting fault or apologizing\n\n**WHAT TO DO INSTEAD:**\n1. 📸 Document EVERYTHING with photos (vehicles, damage, intersection, license plates)\n2. 🚓 Call police for a report - this protects you legally\n3. 📝 Get the other driver's info but limit conversation\n4. 🏥 Get checked by a doctor (neck pain = potential injury)\n5. 👥 Get witness contact info if anyone saw it\n\n**Why this matters:** Insurance companies use your words against you. Saying \"I'm fine\" can void injury claims later. Accepting fault can cost you thousands.",
    timestamp: new Date(Date.now() - 360000).toISOString(),
  },
  {
    id: 'demo-6',
    role: 'user',
    content: "Oh wow, I didn't know that. What info should I collect from the other driver?",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'demo-7',
    role: 'assistant',
    content: "**GET THIS INFO FROM THE OTHER DRIVER:**\n\n📋 Driver Info:\n• Full name and phone number\n• Driver's license number\n• License plate number\n\n🛡️ Insurance Info:\n• Insurance company name\n• Policy number\n• Phone number for claims\n\n🚗 Vehicle Info:\n• Year, make, and model\n• VIN (on dashboard near windshield)\n\n**HOW CLAIMPILOT HELPS YOU:**\n✅ I'll organize all this info automatically\n✅ Generate a professional claim document\n✅ Calculate your expected payout\n✅ Find the best repair shops near you\n✅ Ensure you don't miss any compensation you deserve\n\nWhen you're ready, click 'Save & File Claim' and I'll guide you through documenting everything properly. This takes 5 minutes and could save you $1000s.",
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'demo-8',
    role: 'user',
    content: "This is so helpful! The police just arrived. What should I tell them?",
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'demo-9',
    role: 'assistant',
    content: "**TALKING TO POLICE - STICK TO FACTS:**\n\n✅ DO SAY:\n• \"I was stopped at a red light when the other vehicle hit me from behind\"\n• \"The impact happened at [intersection name]\"\n• \"I'm experiencing neck pain\" (mention ALL symptoms)\n\n❌ DON'T SAY:\n• Speculation (\"I think he was texting\")\n• Estimates (\"Maybe 30 mph\")\n• Admissions (\"I might have braked too hard\")\n\n**GET FROM POLICE:**\n• Police report number (CRITICAL for claims)\n• Officer's name and badge number\n• Estimated report availability date\n\n**AFTER THE SCENE:**\nTake photos of:\n📸 All vehicle damage (multiple angles)\n📸 The intersection/scene\n📸 Skid marks or debris\n📸 Your injuries (bruises, etc.)\n\nThen come back here and click 'Save & File Claim' - I'll turn all this into a professional insurance claim that maximizes your payout.",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
]

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
  const [demoIndex, setDemoIndex] = useState(0)
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

  const loadDemoConversation = () => {
    // Progressive demo - show one more message each time button is clicked
    if (demoIndex < DEMO_CONVERSATION.length) {
      const nextMessages = DEMO_CONVERSATION.slice(0, demoIndex + 1)
      setMessages(nextMessages)
      setDemoIndex(demoIndex + 1)
    } else {
      // Reset demo if at the end
      setMessages([DEMO_CONVERSATION[0]])
      setDemoIndex(1)
    }
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
                onClick={loadDemoConversation}
                size="sm"
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
              >
                ✨ Demo {demoIndex > 0 && demoIndex <= DEMO_CONVERSATION.length ? `(${demoIndex}/${DEMO_CONVERSATION.length})` : ''}
              </Button>
              <Button
                onClick={handleSaveAsClaim}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & File Claim
              </Button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
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
