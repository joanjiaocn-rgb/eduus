"use client";
import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function AIEDUInterface() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    if (!topic.trim()) return alert("Please enter a topic.");
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        topic,
        objective: "Students will be able to describe how energy from sunlight is captured by plants to convert water and carbon dioxide into food.",
        standard: "MS-LS1-6"
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - Precision-styled, keeping original functional layout */}
      <aside className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 shrink-0 hidden lg:flex">
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
              { label: 'Grade Level', options: ['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)'] },
              { label: 'Subject Area', options: ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Fine Arts'] },
              { label: 'Standards', options: ['Common Core (CCSS)', 'NGSS (Science)', 'TEKS (Texas)'] }
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <label className="text-xs font-bold text-slate-600">{item.label}</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-600 outline-none cursor-pointer">
                  {item.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Export Tools</h3>
          <div className="space-y-3">
            {[
              { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
              { name: 'Unit Plan', icon: BookOpenIcon, pro: true },
              { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
              { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
            ].map(item => (
              <button key={item.name} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 ${item.pro ? 'border-dashed border-slate-200 text-slate-400' : 'bg-brand-50 text-brand-700 border-brand-100'}`}>
                <div className="flex items-center gap-3"><item.icon className="w-5 h-5"/>{item.name}</div>
                {item.pro && <span className="bg-amber-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>}
              </button>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-brand-900 leading-tight">Expert Lesson Plans <br/><span className="text-slate-400">In Seconds.</span></h1>
          </div>

          <div className="relative max-w-3xl mx-auto group">
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 outline-none text-2xl font-semibold transition-all placeholder:text-slate-300 focus:border-brand-600" 
              placeholder="Type a topic (e.g. Plate Tectonics)..."
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all active:scale-95 flex items-center gap-2"
            >
              {isGenerating ? 'Processing...' : 'Draft Magic'}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-4xl p-10 border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-5xl font-extrabold text-brand-900 mb-6">{result.topic}</h2>
              <p className="text-xl text-slate-700">{result.objective}</p>
            </div>
          )}

          {/* FERPA Footer Info */}
          <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-4 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Compliance & Privacy</p>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[10px]">FERPA</div>
                <span className="text-xs font-bold">Privacy Compliant (FERPA/COPPA)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
