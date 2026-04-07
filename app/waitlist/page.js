"use client";

import React, { useState } from 'react';
import { SparklesIcon, CheckIcon, ClockIcon, AcademicCapIcon, DocumentTextIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    
    // 这里可以发送到 Google Sheets 或 Airtable
    // 暂时先存到 localStorage
    try {
      const waitlist = JSON.parse(localStorage.getItem('eduspark_waitlist') || '[]');
      waitlist.push({
        email,
        joinedAt: new Date().toISOString(),
      });
      localStorage.setItem('eduspark_waitlist', JSON.stringify(waitlist));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
      {/* Nav */}
      <nav className="h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6" />
          <span className="text-xl font-black tracking-tight">EduSpark AI</span>
        </div>
        <a href="https://eduus.pages.dev" className="text-sm font-medium hover:text-blue-200 transition-colors">
          Try Demo →
        </a>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          500+ teachers on the waitlist
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Professional Lesson Plans<br />
          <span className="text-blue-200">in 5 Minutes</span>
        </h1>

        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12">
          AI-powered lesson plans that follow Danielson Framework, 
          align with CCSS/NGSS standards, and impress your principal.
        </p>

        {/* Email Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-16">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-6 py-4 rounded-xl font-bold transition-colors"
              >
                {loading ? '...' : 'Join Waitlist'}
              </button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              🎉 First 100 get 50% off for life
            </p>
          </form>
        ) : (
          <div className="max-w-md mx-auto mb-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You are on the list!</h3>
            <p className="text-blue-200">
              Check your email for confirmation. We will notify you when we launch!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Single Lesson Plans</h3>
            <p className="text-blue-200 text-sm">
              Complete with objectives, procedures, differentiation, and assessments
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Squares2X2Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Unit Plans</h3>
            <p className="text-blue-200 text-sm">
              8-12 lesson sequences with pacing guides and culminating projects
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Google Classroom</h3>
            <p className="text-blue-200 text-sm">
              One-click export to Google Docs and post to Classroom
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
          <p className="text-lg italic mb-4">
            "I used to spend 2 hours writing a lesson plan. With EduSpark, 
            I get a better plan in 5 minutes. My principal actually complimented my last observation!"
          </p>
          <p className="font-medium text-blue-200">
            — Sarah M., 5th Grade Teacher, Texas
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-blue-200 text-sm">
        © 2025 EduSpark AI. Made for teachers, by teachers.
      </footer>
    </div>
  );
}
