'use client';

import Link from 'next/link';
import { useState } from 'react';
import { StartClaimModal } from '@/components/claims/start-claim-modal';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [showStartModal, setShowStartModal] = useState(false);


import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClaimPilot</h1>
                <p className="text-xs text-gray-500">AI-Powered Claims Assistant</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
            >
              My Claims
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Car Accident Claims,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Simplified
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Your calm, intelligent assistant for managing insurance claims.
              Let our AI agents handle the complexity while you focus on what matters.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => setShowStartModal(true)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Your Claim
              </button>
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Your Claim
              </Link>
              <a
                href="#features"
                className="text-base font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Document Processing</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Upload police reports or insurance forms and let our AI extract all the important details instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Financial Estimates</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get accurate damage estimates and insurance payout calculations in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Shop Finder</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Find top-rated repair shops near you with transparent pricing and wait times.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Compliance Check</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Automated validation ensures your claim meets all requirements before submission.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-24">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-semibold">Upload Documents</h3>
                <p className="mt-2 text-gray-600">
                  Upload your police report, photos, or insurance forms
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-semibold">AI Processing</h3>
                <p className="mt-2 text-gray-600">
                  Our multi-agent system analyzes and processes your claim
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-semibold">Get Results</h3>
                <p className="mt-2 text-gray-600">
                  Receive estimates, shop recommendations, and submit your claim
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-16 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Start your claim now and experience the future of insurance processing.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your Claim
            </button>
            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your Claim
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-sm text-gray-500">
            Powered by ClaimPilot AI Multi-Agent System | © 2025
          </p>
        </div>
      </footer>

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
  );
}
