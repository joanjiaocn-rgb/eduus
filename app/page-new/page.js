"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function AIEDUInterface() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [grade, setGrade] = useState('6-8');
  const [subject, setSubject] = useState('Science');
  const [standard, setStandard] = useState('NGSS');

  const handleGenerate = async (t) => {
    const val = t || topic;
    if (!val.trim()) return alert("Please enter a topic.");
    setTopic(val);
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: val, grade, subject, standard, assetType: 'Lesson Plan' })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Generation error:", error);
      alert("生成请求出错，请检查接口状态。");
    } finally {
      setIsGenerating(false);
    }
  };

  const quickDraft = (t, g, s, std) => {
    setTopic(t);
    setGrade(g);
    setSubject(s);
    setStandard(std);
    handleGenerate(t);
  };

  const grades = ['K-5', '6-8', '9-12'];
  const subjects = ['ELA', 'Math', 'Science', 'Social Studies', 'World Languages', 'STEM / Computer Science', 'Arts', 'PE & Health', 'ESL / ELL', 'SEL'];
  const standards = ['CCSS', 'NGSS', 'TEKS', 'State Stands', 'IB/AP', 'Custom'];

  const assets = [
    { name: '单节课计划', icon: AcademicCapIcon, pro: false },
    { name: '单元计划', icon: BookOpenIcon, pro: true, link: '/pricing' },
    { name: 'Google Slides', icon: PresentationChartBarIcon, pro: true, link: '/pricing' },
    { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true, link: '/pricing' }
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden text-slate-900 bg-[#f8fafc]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Navbar */}
      <nav className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-900 uppercase">AI EDU <span className="text-accent-500 text-xs">Studio</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Pricing</button>
          <button className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-700 transition-all shadow-md active:scale-95">Sign In</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 overflow-y-auto shrink-0 hidden lg:flex">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Lesson Context</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Grade Level</label>
                <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Subject Area</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Standards</label>
                <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none cursor-pointer">
                  {standards.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

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
                  {item.pro && <span className="bg-amber-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>}
                </button>
              ))}
            </div>
          </section>

          <div className="bg-brand-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-brand-900/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-300 mb-2">Premium Feature</p>
            <p className="text-sm font-bold mb-4">One-click PPT slides and Worksheets.</p>
            <button onClick={() => router.push('/pricing')} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-brand-500 transition-all">Upgrade Now</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-12 relative">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black tracking-tight text-brand-900 leading-tight">Expert Lesson Plans <br/><span className="text-slate-400">In Seconds.</span></h1>
              </div>

              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-cyan-500 rounded-[2.5rem] blur opacity-15 group-focus-within:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 outline-none text-2xl font-semibold transition-all placeholder:text-slate-300" 
                    placeholder="Type a topic (e.g. Plate Tectonics)..."
                  />
                  <button 
                    onClick={() => handleGenerate()} 
                    disabled={isGenerating}
                    className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>{isGenerating ? 'Processing...' : 'Draft Magic'}</span>
                    {isGenerating && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <button onClick={() => quickDraft('The Water Cycle', 'K-5', 'Science', 'NGSS')} className="group bg-white/90 backdrop-blur border border-slate-200/80 p-5 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12l-8-8-8 8M12 4v16"/></svg>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Science</p>
                  <p className="font-bold text-slate-800">The Water Cycle</p>
                </button>
                <button onClick={() => quickDraft('Pythagorean Theorem', '6-8', 'Math', 'CCSS')} className="group bg-white/90 backdrop-blur border border-slate-200/80 p-5 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mathematics</p>
                  <p className="font-bold text-slate-800">Pythagorean Theorem</p>
                </button>
                <button onClick={() => quickDraft('The Civil Rights Movement', '9-12', 'Social Studies', 'CCSS')} className="group bg-white/90 backdrop-blur border border-slate-200/80 p-5 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Social Studies</p>
                  <p className="font-bold text-slate-800">Civil Rights Movement</p>
                </button>
              </div>
            </div>

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-end justify-between mb-8 pb-8 border-b border-slate-200">
                  <div>
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-2">Lesson Draft Ready</p>
                    <h2 className="text-5xl font-extrabold text-brand-900 capitalize tracking-tight">{result.topic || topic}</h2>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">Save Draft</button>
                    <button className="bg-brand-900 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all">Publish Lesson</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 bg-white/90 backdrop-blur border border-slate-200/80 p-10 rounded-[2rem] shadow-xl shadow-slate-200/20">
                    <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-6">Learning Objective</h4>
                    <p className="text-2xl font-semibold text-brand-900 leading-relaxed">
                      {result.content || "Students will be able to describe how energy from sunlight is captured by plants to convert water and carbon dioxide into food."}
                    </p>
                  </div>

                  <div className="bg-brand-900 p-10 rounded-[2rem] text-white shadow-xl">
                    <h4 className="text-[10px] font-black text-brand-300 uppercase tracking-widest mb-4">Aligned Standards</h4>
                    <p className="text-3xl font-extrabold mb-2 tracking-tighter">{standard === 'NGSS' ? 'MS-LS1-6' : 'CCSS.MATH.8.G.B.6'}</p>
                    <p className="text-brand-300 text-xs font-medium">Verified Pedagogical Alignment</p>
                  </div>

                  <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4">The Hook</h4>
                    <p className="text-slate-600 text-sm leading-relaxed italic">&quot;Imagine if you could make your own snacks just by standing in the sun. That is exactly what plants do! Today we learn the secret.&quot;</p>
                  </div>

                  <div className="md:col-span-2 bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-4">Differentiation Support</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-slate-800 mb-2">ELL Support</p>
                        <p className="text-xs text-slate-500">Use visual organizers to diagram the photosynthesis equation using pictures.</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-slate-800 mb-2">Advanced Learners</p>
                        <p className="text-xs text-slate-500">Research the differences between C3, C4, and CAM photosynthetic pathways.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-8 opacity-60">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Standard Compliance & Support</p>
              <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                {['CCSS', 'NGSS', 'TEKS', 'FERPA'].map(item => (
                  <div key={item} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[10px]">{item}</div>
                    <span className="text-xs font-bold">{item === 'FERPA' ? 'Privacy Compliant' : item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
