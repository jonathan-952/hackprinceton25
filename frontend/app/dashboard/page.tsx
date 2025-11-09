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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mcpSummary, setMcpSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

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

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call MCP endpoint to process document with emailagent tools
      const response = await fetch('http://localhost:9000/api/mcp-process-document', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Display the MCP summary
        setMcpSummary(data.summary);
        setShowSummary(true);
        setShowUpload(false);
        setFile(null);
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
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Phil</h1>
          <p className="mt-2 text-gray-600">Manage and track your insurance claims</p>
        </div>

        {/* New Claim Button */}
        <div className="mb-8">
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
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or TXT up to 10MB</p>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!file || uploading}
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
                  <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Summary</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{mcpSummary}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setMcpSummary(null);
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
                                  <span className="font-semibold text-gray-900">{claim.estimated_damage}</span>
                                </>
                              )}
                            </div>
                          </div>
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
    </div>
  );
}
