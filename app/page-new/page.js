"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function AIEDUInterface() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (t) => {
    const val = t || topic;
    if (!val.trim()) return alert("Please enter a topic.");
    setTopic(val);
    setIsGenerating(true);
    setResult(null);

    try {
      // 对接真实的后端生成接口
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: val, assetType: 'Lesson Plan' })
      });
      const data = await res.json();
      setResult(data.content || "生成失败，请稍后重试。");
    } catch (error) {
      console.error("Generation error:", error);
      alert("生成请求出错，请检查接口状态。");
    } finally {
      setIsGenerating(false);
    }
  };

  const assets = [
    { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
    { name: 'Unit Plan', icon: BookOpenIcon, pro: true, link: '/pricing' },
    { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true, link: '/pricing' },
    { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true, link: '/pricing' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-10 shrink-0 hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-900 uppercase">AI EDU <span className="text-accent-500 text-xs">Studio</span></span>
        </div>
        
        <section className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Generate Assets</h3>
          <div className="space-y-3">
            {assets.map(item => (
              <button 
                key={item.name} 
                onClick={() => item.pro ? router.push(item.link) : handleGenerate()} 
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 ${item.pro ? 'border-dashed border-slate-200 text-slate-400 hover:border-brand-600' : 'bg-brand-50 text-brand-700 border-brand-100'}`}
              >
                <div className="flex items-center gap-3"><item.icon className="w-5 h-5"/>{item.name}</div>
                {item.pro && <span className="bg-pro-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="flex justify-end"><button className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold">Sign In</button></header>
          
          <div className="relative max-w-3xl mx-auto">
            <input 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl border border-slate-100 outline-none text-2xl font-semibold transition-all focus:border-brand-600" 
              placeholder="What are we teaching today?..."
            />
            <button 
              onClick={() => handleGenerate()} 
              disabled={isGenerating}
              className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 disabled:bg-brand-400"
            >
              {isGenerating ? 'Drafting...' : 'Draft Magic'}
            </button>
          </div>

          {result && (
            <div className="max-w-4xl mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in">
              <h2 className="text-4xl font-black text-brand-900 mb-6">{topic}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
