'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Claim {
  claim_id: string;
  incident_type: string;
  date: string;
  location: string;
  status: string;
  summary: string;
  estimated_damage?: string;
  damages_description: string;
}

interface AgentStatus {
  ClaimPilot: string;
  FinTrack: string;
  ClaimDrafting: string;
  ComplianceCheck: string;
}

export default function ClaimDetailsPage() {
  const params = useParams();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<Claim | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimData();
      fetchAgentStatus();
    }
  }, [claimId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchClaimData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}`);
      const data = await response.json();
      setClaim(data);

      // Add initial greeting
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm ClaimPilot, your AI assistant. I see you're working on claim ${claimId}. How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error fetching claim:', error);
    }
  };

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}/agent-status`);
      const data = await response.json();
      setAgentStatus(data.agent_status);
    } catch (error) {
      console.error('Error fetching agent status:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          claim_id: claimId
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh agent status
      fetchAgentStatus();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return '✅';
      case 'In Progress':
        return '⏳';
      case 'Error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{claim.incident_type}</h1>
                <p className="text-sm text-gray-500">Claim #{claim.claim_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {claim.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Dual Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Claim Info & Agent Status */}
        <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Claim Metadata */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">DATE</p>
                  <p className="text-sm text-gray-900">{claim.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">LOCATION</p>
                  <p className="text-sm text-gray-900">{claim.location}</p>
                </div>
                {claim.estimated_damage && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">ESTIMATED DAMAGE</p>
                    <p className="text-lg font-bold text-gray-900">{claim.estimated_damage}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500">DESCRIPTION</p>
                  <p className="text-sm text-gray-900">{claim.damages_description}</p>
                </div>
              </div>
            </div>

            {/* AI Agent Collaboration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Collaboration</h2>
              {agentStatus && (
                <div className="space-y-3">
                  {/* ClaimPilot */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ClaimPilot)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">ClaimPilot (Core)</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ClaimPilot)}`}>
                          {agentStatus.ClaimPilot}
                        </span>
                      </div>
                      {agentStatus.ClaimPilot === 'Complete' && claim.estimated_damage && (
                        <p className="text-sm text-gray-600">Damage: {claim.estimated_damage}</p>
                      )}
                    </div>
                  </div>

                  {/* FinTrack */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.FinTrack)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">FinTrack</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.FinTrack)}`}>
                          {agentStatus.FinTrack}
                        </span>
                      </div>
                      {agentStatus.FinTrack === 'Complete' && (
                        <p className="text-sm text-gray-600">Financial analysis ready</p>
                      )}
                    </div>
                  </div>

                  {/* Claim Drafting */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ClaimDrafting)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Claim Drafting</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ClaimDrafting)}`}>
                          {agentStatus.ClaimDrafting}
                        </span>
                      </div>
                      {agentStatus.ClaimDrafting === 'Complete' && (
                        <p className="text-sm text-gray-600">Draft document ready</p>
                      )}
                    </div>
                  </div>

                  {/* Compliance Check */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ComplianceCheck)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Compliance Check</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ComplianceCheck)}`}>
                          {agentStatus.ComplianceCheck}
                        </span>
                      </div>
                      {agentStatus.ComplianceCheck === 'Complete' && (
                        <p className="text-sm text-gray-600">Validation complete</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Claim Status Timeline */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Claim Status</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-full w-px bg-gray-300"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">Claim Submitted</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {agentStatus?.ClaimPilot === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="h-full w-px bg-gray-300"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">Document Processed</p>
                      <p className="text-xs text-gray-500">AI extraction complete</p>
                    </div>
                  </div>
                )}

                {agentStatus?.FinTrack === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="h-full w-px bg-gray-300"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">Damage Assessed</p>
                      <p className="text-xs text-gray-500">{claim.estimated_damage || 'Calculating...'}</p>
                    </div>
                  </div>
                )}

                {agentStatus?.ComplianceCheck === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compliance Verified</p>
                      <p className="text-xs text-gray-500">Ready for submission</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Chat Interface */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                CP
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">ClaimPilot Chat Assistant</h2>
                <p className="text-xs text-gray-500">Ask me anything about your claim</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4 max-w-3xl">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
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

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
