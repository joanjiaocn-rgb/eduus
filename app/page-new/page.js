"use client";
import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function AIEDUInterface() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (t) => {
    const val = t || topic;
    if (!val.trim()) return alert("Please enter a topic.");
    setTopic(val);
    setIsGenerating(true);
    setResult(null);
    await new Promise(resolve => setTimeout(resolve, 1800));
    setResult({ topic: val, content: "Expert lesson plan content generated..." });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
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
            {[
              { label: 'Grade Level', options: ['K-5', '6-8', '9-12'] },
              { label: 'Subject Area', options: ['ELA', 'Math', 'Science', 'Social Studies', 'World Languages', 'STEM / Computer Science', 'Arts', 'PE & Health', 'ESL / ELL', 'SEL'] },
              { label: 'Standards', options: ['CCSS', 'NGSS', 'TEKS', 'State Stands', 'IB/AP', 'Custom'] }
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <label className="text-xs font-bold text-slate-600">{item.label}</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                    {item.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Generate Assets</h3>
          <div className="space-y-3">
            {[
              { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
              { name: 'Unit Plan', icon: BookOpenIcon, pro: true },
              { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
              { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
            ].map(item => (
              <button key={item.name} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 ${item.pro ? 'border-dashed border-slate-200 text-slate-400' : 'bg-brand-50 text-brand-700 border-brand-100'}`}>
                <div className="flex items-center gap-3"><item.icon className="w-5 h-5"/>{item.name}</div>
                {item.pro && <span className="bg-pro-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="flex justify-end gap-4"><button className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold">Sign In</button></header>
          
          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-cyan-500 rounded-[2.5rem] blur opacity-15"></div>
            <input 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="relative w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 outline-none text-2xl font-semibold transition-all placeholder:text-slate-300 focus:border-brand-600" 
              placeholder="Type a topic (e.g. Plate Tectonics)..."
            />
            <button onClick={() => handleGenerate()} disabled={isGenerating} className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all active:scale-95">
                {isGenerating ? 'Drafting...' : 'Draft Magic'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'The Water Cycle', sub: 'SCIENCE', icon: 'M20 12l-8-8-8 8M12 4v16', color: 'blue' },
              { title: 'Pythagorean Theorem', sub: 'MATHEMATICS', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'emerald' },
              { title: 'Civil Rights Movement', sub: 'SOCIAL STUDIES', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'purple' }
            ].map((card, i) => (
              <button key={i} onClick={() => handleGenerate(card.title)} className="group bg-white border border-slate-200 p-6 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                <div className={`w-10 h-10 bg-${card.color}-100 text-${card.color}-600 rounded-xl flex items-center justify-center mb-4`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={card.icon}/></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.sub}</p>
                <p className="font-bold text-slate-800">{card.title}</p>
              </button>
            ))}
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-6 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">STANDARD COMPLIANCE & SUPPORT</p>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold text-slate-600">
              {['CCSS', 'NGSS', 'TEKS', 'State Stands', 'IB/AP', 'Custom', 'FERPA Privacy Compliant'].map(item => (
                <div key={item} className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[9px]">{item.split(' ')[0].substring(0,3)}</div>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
