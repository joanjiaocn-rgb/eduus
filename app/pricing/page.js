"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

const FREE_FEATURES = [
  '3 lesson plans per month',
  'Basic lesson structure',
  'PDF export',
  'Lesson history (5 plans)',
];

const PRO_FEATURES = [
  'Unlimited lesson plans',
  'Unit Plan Generator (2-3 weeks)',
  'Student Worksheet Generator',
  'Leveled Texts (3 Lexile levels)',
  'Danielson Framework alignment',
  'Exact CCSS/NGSS standard codes',
  'Google Docs export',
  'Unlimited history',
  'Priority AI (GPT-4o)',
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Nav */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-black tracking-tight">EduSpark AI</span>
        </button>
        <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-500 hover:text-slate-800">
          ← Back to App
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full">Simple Pricing</span>
          <h1 className="text-5xl font-black mt-6 mb-4 text-slate-900">
            Plans for every teacher
          </h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

          {/* Free */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-slate-400 mb-2">/month</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">For teachers just getting started</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-blue-200">
            {/* Popular badge */}
            <div className="absolute top-6 right-6">
              <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Pro</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">$9.99</span>
                <span className="text-blue-200 mb-2">/month</span>
              </div>
              <p className="text-blue-200 text-sm mt-2">For professional educators who want more</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-blue-700 font-black hover:bg-blue-50 transition-colors disabled:opacity-70 text-base"
            >
              {loading ? 'Redirecting to checkout...' : 'Subscribe to Pro →'}
            </button>
            <p className="text-center text-blue-200 text-xs mt-3">
              Cancel anytime · Secure payment via Stripe
            </p>
          </div>
        </div>

        {/* School CTA */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Need a School or District license?</h3>
            <p className="text-slate-500 text-sm mt-1">Volume pricing, admin dashboard, and dedicated support for your whole team.</p>
          </div>
          <a
            href="mailto:hello@eduus.pages.dev?subject=School License Inquiry"
            className="flex-shrink-0 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Contact Us →
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl w-full">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your account settings. No questions asked.' },
              { q: 'What happens to my plans if I cancel?', a: 'All your saved lesson plans stay accessible. You\'ll just return to the free tier limits.' },
              { q: 'Is there a free trial?', a: 'Yes — the Free tier lets you generate 3 lesson plans per month, no credit card required.' },
              { q: 'What payment methods do you accept?', a: 'All major credit cards (Visa, Mastercard, Amex) via Stripe\'s secure checkout.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="border-b border-slate-100 pb-6">
                <h4 className="font-bold text-slate-800 mb-2">{q}</h4>
                <p className="text-slate-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
