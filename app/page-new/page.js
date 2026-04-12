"use client";
import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function AIEDUInterface() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState('Science');
  const [standard, setStandard] = useState('NGSS (Science)');
  const [selectedAsset, setSelectedAsset] = useState('Lesson Plan');

  const subjects = ['ELA', 'Math', 'Science', 'Social Studies', 'World Languages', 'STEM / Computer Science', 'Arts', 'PE & Health', 'ESL / ELL', 'SEL'];
  
  const getStandardsForSubject = (subj) => {
    if (subj === 'Science') return ['NGSS (Science)'];
    if (['ELA', 'Math'].includes(subj)) return ['Common Core (CCSS)'];
    return ['CCSS', 'NGSS', 'TEKS', 'State Standards', 'IB', 'AP', 'Custom'];
  };

  const handleSubjectChange = (e) => {
    const newSubj = e.target.value;
    setSubject(newSubj);
    setStandard(getStandardsForSubject(newSubj)[0]);
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
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Grade Level</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                    {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g}>{g}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Subject Area</label>
                <select value={subject} onChange={handleSubjectChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Standards</label>
                <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                    {getStandardsForSubject(subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
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
              <button key={item.name} onClick={() => setSelectedAsset(item.name)} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 ${selectedAsset === item.name ? 'border-brand-600 bg-brand-50' : 'border-slate-100 hover:border-slate-200'}`}>
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
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="relative w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 outline-none text-2xl font-semibold transition-all placeholder:text-slate-300 focus:border-brand-600" 
              placeholder="What are we teaching today?..."
            />
            <button className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all active:scale-95">Draft Magic</button>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-6 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">STANDARD COMPLIANCE & SUPPORT</p>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold text-slate-600">
              {['CCSS', 'NGSS', 'TEKS', 'State Stands', 'IB', 'AP', 'Custom'].map(item => (
                <div key={item} className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[9px]">{item.split(' ')[0].substring(0,3)}</div>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
