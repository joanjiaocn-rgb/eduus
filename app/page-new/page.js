"use client";
import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function AIEDUInterface() {
  const [topic, setTopic] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - Precision-styled */}
      <aside className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-10 shrink-0 hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-900 uppercase">AI EDU <span className="text-accent-500 text-xs">Studio</span></span>
        </div>

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Lesson Context</h3>
          <div className="space-y-5">
            {['Grade Level', 'Subject Area', 'Standards'].map(label => (
              <div key={label} className="space-y-2">
                <label className="text-xs font-bold text-slate-600">{label}</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                  <option>Select...</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="flex justify-end gap-4"><button className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold">Sign In</button></header>

          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black text-brand-900 leading-tight">Expert Lesson Plans <br/><span className="text-slate-400">In Seconds.</span></h1>
          </div>

          {/* New Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'The Water Cycle', sub: 'SCIENCE', icon: 'M20 12l-8-8-8 8M12 4v16', color: 'blue' },
              { title: 'Pythagorean Theorem', sub: 'MATHEMATICS', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'emerald' },
              { title: 'Civil Rights Movement', sub: 'SOCIAL STUDIES', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'purple' }
            ].map((card, i) => (
              <button key={i} className="group bg-white border border-slate-200 p-6 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                <div className={`w-10 h-10 bg-${card.color}-100 text-${card.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${card.color}-600 group-hover:text-white`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={card.icon}/></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.sub}</p>
                <p className="font-bold text-slate-800">{card.title}</p>
              </button>
            ))}
          </div>

          {/* Compliance Footer */}
          <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-6 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">STANDARD COMPLIANCE & SUPPORT</p>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold text-slate-600">
              {['CCSS Common Core', 'NGSS Next Gen Science', 'TEKS Texas Essential', 'FERPA Privacy Compliant'].map(item => (
                <div key={item} className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[9px]">{item.split(' ')[0]}</div>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
