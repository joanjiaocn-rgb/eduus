"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const isDemo = searchParams.get('demo') === 'true';

    // Save subscription status to localStorage
    if (sessionId) {
      const proData = {
        active: true,
        sessionId,
        activatedAt: new Date().toISOString(),
        demo: isDemo,
      };
      // Save to general key
      localStorage.setItem('eduspark_pro', JSON.stringify(proData));

      // Also save bound to Google ID if user is logged in
      try {
        const googleId = sessionStorage.getItem('google_user_id');
        if (googleId) {
          localStorage.setItem(`eduspark_pro_${googleId}`, JSON.stringify(proData));
        }
      } catch (e) {}
    }

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-3">You're a Pro! 🎉</h1>
        <p className="text-slate-500 mb-8">
          Your EduSpark Pro subscription is now active. All Pro features are unlocked.
        </p>

        {/* Pro features unlocked */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">✅ Now Unlocked</p>
          {[
            'Unlimited lesson plans',
            'Unit Plan Generator',
            'Student Worksheet Generator',
            'Leveled Texts (3 reading levels)',
            'Danielson Framework alignment',
            'Google Docs export',
          ].map((f, i) => (
            <p key={i} className="text-sm text-blue-800 flex items-center gap-2">
              <span className="text-emerald-500">✓</span> {f}
            </p>
          ))}
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 transition-colors"
        >
          Start Creating Lessons →
        </button>
        <p className="text-slate-400 text-sm mt-4">Redirecting in {countdown}s...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SparklesIcon className="w-8 h-8 text-blue-600 animate-pulse" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
