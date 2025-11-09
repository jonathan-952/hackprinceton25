'use client'

import { MessageCircle, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface StartClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectChatbot: () => void
  onSelectForm: () => void
}

export function StartClaimModal({ isOpen, onClose, onSelectChatbot, onSelectForm }: StartClaimModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 p-8 relative bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            How can we help you today?
          </h2>
          <p className="text-gray-700 font-medium">
            Choose the best option for your situation
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chatbot Option - FOR EMERGENCY */}
          <button
            onClick={onSelectChatbot}
            className="group relative overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-8 text-left transition-all hover:border-red-400 hover:shadow-xl hover:scale-105"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                URGENT
              </span>
            </div>

            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500 text-white mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              I Need Help NOW
            </h3>

            <p className="text-gray-800 font-medium mb-4 leading-relaxed">
              Just had an accident? Talk to our AI assistant immediately for guidance on what to do next.
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span>Instant answers to urgent questions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span>Step-by-step accident scene guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span>Legal & medical advice on the spot</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-red-600 font-semibold group-hover:underline">
                Start Chatting →
              </span>
            </div>
          </button>

          {/* Form Option - FOR LATER */}
          <button
            onClick={onSelectForm}
            className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-left transition-all hover:border-blue-400 hover:shadow-xl hover:scale-105"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white mb-6 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              File a Full Claim
            </h3>

            <p className="text-gray-800 font-medium mb-4 leading-relaxed">
              Have all your information ready? Fill out the detailed form to process your claim.
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>6-step guided claim process</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Upload documents & photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Complete claim submission</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-blue-600 font-semibold group-hover:underline">
                Fill Out Form →
              </span>
            </div>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <strong>Not sure?</strong> If you just had an accident, start with the chatbot for immediate help.
          </p>
        </div>
      </Card>
    </div>
  )
}
