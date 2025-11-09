'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, ChevronRight, FileText } from 'lucide-react'
import { StartClaimModal } from '@/components/claims/start-claim-modal'

interface Claim {
  claim_id: string
  incident_type: string
  date: string
  location: string
  status: string
  summary: string
  estimated_damage?: string
  updated_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [showStartModal, setShowStartModal] = useState(false)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/claims')
      const data = await response.json()
      setClaims(data.claims || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary'
      case 'processing':
        return 'warning'
      case 'open':
        return 'info'
      case 'review':
        return 'warning'
      case 'approved':
        return 'success'
      case 'closed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const groupedClaims = {
    inProgress: claims.filter(
      (c) =>
        c.status.toLowerCase() === 'processing' ||
        c.status.toLowerCase() === 'open' ||
        c.status.toLowerCase() === 'draft' ||
        c.status.toLowerCase() === 'review'
    ),
    completed: claims.filter((c) => c.status.toLowerCase() === 'closed'),
  }
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Claim {
  claim_id: string;
  incident_type: string;
  date: string;
  location: string;
  status: string;
  summary: string;
  estimated_damage?: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [mcpSummary, setMcpSummary] = useState<string | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [useGemini, setUseGemini] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/claims');
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Process the first/primary file
      const primaryFile = files[0];
      const formData = new FormData();
      formData.append('file', primaryFile);

      // Call MCP endpoint to process document and extract structured data
      const mcpUrl = `http://localhost:9000/api/mcp-process-document?extract_data=true&use_gemini=${useGemini}`;
      const response = await fetch(mcpUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        console.log('MCP Processing complete:', data);

        // If we have structured data, create a full claim
        if (data.structured_data && !data.structured_data.error) {
          // Create claim via upload endpoint
          const claimFormData = new FormData();
          claimFormData.append('file', primaryFile);

          const claimResponse = await fetch('http://localhost:9000/api/upload', {
            method: 'POST',
            body: claimFormData
          });

          const claimResult = await claimResponse.json();

          if (claimResult.claim_id) {
            // Claim created successfully - redirect to claim page
            router.push(`/claim/${claimResult.claim_id}`);
            return;
          }
        }

        // Fallback: just show summary and email template
        setMcpSummary(data.summary);
        setEmailTemplate(data.email_template || null);
        setShowSummary(true);
        setShowUpload(false);
        setFiles([]);

        // Refresh claims list
        fetchClaims();
      } else {
        alert('Error processing document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error processing claim. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedClaims = {
    inProgress: claims.filter(c => c.status === 'Processing' || c.status === 'Open'),
    completed: claims.filter(c => c.status === 'Closed')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <FileText className="h-6 w-6" />
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClaimPilot</h1>
                <p className="text-xs text-gray-500">AI-Powered Claims Assistant</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Phil</h1>
          <p className="mt-2 text-gray-600">Manage and track your insurance claims</p>
        </div>

        {/* New Claim Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowStartModal(true)}
            variant="gradient"
            size="lg"
            className="shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-5 w-5" />
            Start New Claim
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading claims...</p>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Claim
          </button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start New Claim</h2>
              <p className="text-gray-600 mb-6">
                Upload your police report, insurance form, or accident details
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or TXT up to 10MB (multiple files supported)</p>
                </label>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2 text-left">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Provider Selection */}
              <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">AI Provider:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseGemini(false)}
                    className={`px-3 py-1 rounded text-sm ${!useGemini ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => setUseGemini(true)}
                    className={`px-3 py-1 rounded text-sm ${useGemini ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Gemini
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setFiles([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={files.length === 0 || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing...' : 'Start Processing'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MCP Summary Modal */}
        {showSummary && mcpSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Claim Summary</h2>
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setMcpSummary(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-blue-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Summary</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{mcpSummary}</p>
                  </div>
                </div>
              </div>

              {/* Email Template Section */}
              {emailTemplate && !emailTemplate.error && (
                <div className="bg-green-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="h-6 w-6 text-green-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Insurance Email Template</h3>
                      <p className="text-sm text-gray-600 mb-4">Auto-generated email ready to send to your insurance company</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 mb-1">Subject</div>
                      <div className="text-sm text-gray-900">{emailTemplate.subject}</div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 mb-1">To</div>
                      <div className="text-sm text-gray-900">{emailTemplate.to}</div>
                    </div>

                    {emailTemplate.cc && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-xs font-medium text-gray-500 mb-1">CC</div>
                        <div className="text-sm text-gray-900">{emailTemplate.cc}</div>
                      </div>
                    )}

                    <div className="bg-white rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 mb-2">Email Body</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{emailTemplate.body}</div>
                    </div>

                    {emailTemplate.attachments_note && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="text-xs font-medium text-yellow-800 mb-1">Attachments</div>
                        <div className="text-sm text-yellow-700">{emailTemplate.attachments_note}</div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Subject: ${emailTemplate.subject}\n\nTo: ${emailTemplate.to}\n\n${emailTemplate.body}`
                        );
                        alert('Email template copied to clipboard!');
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Email to Clipboard
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setMcpSummary(null);
                    setEmailTemplate(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* In Progress Claims */}
            {groupedClaims.inProgress.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">In Progress</h2>
                <div className="grid gap-4">
                  {groupedClaims.inProgress.map((claim) => (
                    <Link key={claim.claim_id} href={`/claim/${claim.claim_id}`}>
                      <Card className="p-6 hover:shadow-xl transition-all border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <Badge variant={getStatusColor(claim.status) as any}>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-800 font-medium mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                    <Link
                      key={claim.claim_id}
                      href={`/claim/${claim.claim_id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{claim.date}</span>
                              <span>•</span>
                              <span>{claim.location}</span>
                              {claim.estimated_damage && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-green-600">
                                    {claim.estimated_damage}
                                  </span>
                                  <span className="font-semibold text-gray-900">{claim.estimated_damage}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Claims */}
            {groupedClaims.completed.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed</h2>
                <div className="grid gap-4">
                  {groupedClaims.completed.map((claim) => (
                    <Link key={claim.claim_id} href={`/claim/${claim.claim_id}`}>
                      <Card className="p-6 hover:shadow-lg transition-all border-gray-200 opacity-75 hover:opacity-100 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <Badge variant={getStatusColor(claim.status) as any}>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-800 font-medium mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                    <Link
                      key={claim.claim_id}
                      href={`/claim/${claim.claim_id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{claim.date}</span>
                              <span>•</span>
                              <span>{claim.location}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {claims.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No claims yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first insurance claim. Our AI will guide you through
                  the process step by step.
                </p>
                <Button
                  onClick={() => setShowStartModal(true)}
                  variant="gradient"
                  size="lg"
                  className="shadow-lg hover:shadow-xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Claim
                </Button>
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No claims yet</h3>
                <p className="mt-2 text-gray-600">Get started by creating your first claim</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Claim
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Start Claim Modal */}
      <StartClaimModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSelectChatbot={() => {
          setShowStartModal(false)
          router.push('/emergency-chat')  // Go to emergency chatbot
        }}
        onSelectForm={() => {
          setShowStartModal(false)
          router.push('/claims/new')  // Go to multi-step form
        }}
      />
    </div>
  )
    </div>
  );
}
