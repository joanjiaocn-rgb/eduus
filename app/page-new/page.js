"use client";
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setShowResult(true);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <div className="bg-slate-50 text-slate-900 h-screen flex flex-col overflow-hidden font-sans">
      {/* 导航栏 */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-600 p-2 rounded-xl text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-2xl font-black text-brand-900 tracking-tighter">AI EDU</span>
          <span className="text-[10px] font-bold bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full uppercase ml-1">Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-slate-600 hover:text-brand-600">Pricing</button>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors">Sign In</button>
        </div>
      </header>

      {/* 主体布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧侧边栏 */}
        <aside className="w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-10 overflow-y-auto shrink-0 hidden md:flex">
          <section className="space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pedagogy Settings</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Grade Level</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-600 transition-all">
                <option>Elementary (K-5)</option>
                <option>Middle School (6-8)</option>
                <option>High School (9-12)</option>
              </select>
            </div>
          </section>

          <section className="flex-1 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Generate Assets</h3>

            <button onClick={handleGenerate} className="w-full flex items-center gap-3 p-4 bg-brand-50 text-brand-700 rounded-2xl font-bold text-sm border-2 border-brand-200 hover:bg-brand-100 transition-all active:scale-[0.98]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Lesson Plan</span>
            </button>

            {/* PRO 按钮 */}
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm border border-dashed border-slate-200 cursor-not-allowed group">
              <span>Class Slides</span>
              <span className="flex items-center gap-1 bg-pro-400 text-[9px] text-white px-2 py-0.5 rounded-md font-extrabold group-hover:scale-105 transition-transform">
                PRO
              </span>
            </button>
          </section>
        </aside>

        {/* 右侧主内容区域 */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* 输入搜索框 */}
            <div className="relative group">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white p-7 pl-6 pr-36 rounded-3xl shadow-xl border-2 border-transparent focus:border-brand-600 outline-none text-xl font-medium transition-all placeholder:text-slate-300"
                placeholder="What are we teaching today? (e.g., Photosynthesis)..."
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="absolute right-4 top-4 bottom-4 w-28 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center disabled:bg-brand-400"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Draft"
                )}
              </button>
            </div>

            {/* 状态渲染逻辑 */}
            {!showResult ? (
              <div className="h-64 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 text-center p-8">
                <p className="font-medium max-w-sm">Enter a topic above, and your expert lesson plan will appear here...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-10 pb-8 border-b border-slate-100">
                  <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-brand-900">{topic}</h1>
                  <div className="flex gap-3">
                     <span className="bg-brand-100 text-brand-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">Science</span>
                     <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">CCSS Aligned</span>
                  </div>
                </div>

                <div className="space-y-10 text-slate-700 leading-relaxed">
                  <section className="space-y-2 border-l-4 border-brand-200 pl-5">
                    <h2 className="text-xs font-black text-brand-600 uppercase tracking-widest">Learning Objective</h2>
                    <p className="italic text-base">Students will be able to understand the core concepts of {topic}.</p>
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
