'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: any;
}

interface ClaimData {
  claim_id?: string;
  incident_type?: string;
  date?: string;
  location?: string;
  status?: string;
  summary?: string;
  estimated_damage?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm ClaimPilot AI, your insurance claim assistant.\n\nI can help you with:\n1. 📄 Process claim documents (upload a PDF or text file)\n2. 💰 Estimate damage costs and insurance payouts\n3. 🔧 Find recommended repair shops nearby\n4. 📊 Analyze and track your claims\n\nJust upload a document or ask me a question to get started!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentClaim, setCurrentClaim] = useState<ClaimData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const userMessage = input.trim() || (file ? `Uploading ${file.name}...` : '');

    // Add user message
    const newMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;

      if (file) {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', input.trim() || 'Process this document');

        response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Send chat message
        response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input.trim(),
            claim_id: currentClaim?.claim_id || null
          })
        });
      }

      const data = await response.json();

      // Update current claim if present
      if (data.claim) {
        setCurrentClaim(data.claim);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        data: data
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please make sure the backend is running on http://localhost:8000',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ClaimPilot AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Multi-Agent Insurance Assistant</p>
              </div>
            </div>
            {currentClaim && (
              <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/30">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Active Claim: {currentClaim.claim_id}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {currentClaim.status}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formatMessage(message.content)}
                  </div>
                  {message.data?.claim && message.role === 'assistant' && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900">
                      <p className="font-semibold">📋 Claim Details:</p>
                      <p>ID: {message.data.claim.claim_id}</p>
                      <p>Type: {message.data.claim.incident_type}</p>
                      <p>Location: {message.data.claim.location}</p>
                      {message.data.claim.estimated_damage && (
                        <p>Estimated Damage: {message.data.claim.estimated_damage}</p>
                      )}
                    </div>
                  )}
                  {message.data?.financial_estimate && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3 text-xs dark:bg-green-900/30">
                      <p className="font-semibold">💰 Financial Estimate:</p>
                      <p>Total Damage: ${message.data.financial_estimate.estimated_damage.toLocaleString()}</p>
                      <p>Insurance Pays: ${message.data.financial_estimate.payout_after_deductible.toLocaleString()}</p>
                      <p>Your Deductible: ${message.data.financial_estimate.deductible.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        <div className="mx-auto max-w-5xl px-4 py-4">
          {file && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-900/30">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="flex-1 text-blue-700 dark:text-blue-300">{file.name}</span>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Upload document"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or upload a document..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !file)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Powered by ClaimPilot, FinTrack & ShopFinder agents
          </p>
        </div>
      </footer>
    </div>
  );
}
