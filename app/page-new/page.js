"use client";

import React, { useState, useEffect } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function AIEDUInterface() {
  const [selectedAsset, setSelectedAsset] = useState('Lesson Plan');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic");
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, assetType: selectedAsset })
      });
      const data = await response.json();
      setResult(data.content);
    } catch (e) {
      alert("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      <aside className="w-80 border-r border-slate-200 bg-slate-50 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-black">AIEDU <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Beta</span></span>
        </div>
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogy Settings</h2>
          {['Grade Level', 'Subject Area', 'Standards Alignment'].map(label => (
            <div key={label} className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600">{label}</label>
              <button className="w-full bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center text-sm font-medium hover:border-blue-400">
                Select... <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div />
          <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
            <button className="hover:text-blue-600">Pricing</button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800">Sign In</button>
          </div>
        </header>

        <section className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-4xl font-black">Generate Assets</h1>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
              { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
              { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
            ].map(item => (
              <button 
                key={item.name} 
                onClick={() => setSelectedAsset(item.name)}
                className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 ${selectedAsset === item.name ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex justify-between">
                  <item.icon className={`w-8 h-8 ${selectedAsset === item.name ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.pro && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1"><StarIcon className="w-3 h-3" />PRO</span>}
                </div>
                <span className="font-bold">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="border-2 border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center gap-6 bg-slate-50/50">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are we teaching today?" 
              className="w-full text-2xl font-bold placeholder:text-slate-300 outline-none text-center bg-transparent"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {isGenerating ? 'Generating...' : 'Draft'} <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          {result && (
            <div className="mt-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm whitespace-pre-wrap text-slate-700">
              {result}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
