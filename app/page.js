"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  SparklesIcon, DocumentArrowDownIcon, AcademicCapIcon, 
  CheckBadgeIcon, PuzzlePieceIcon, Cog6ToothIcon,
  ChatBubbleLeftRightIcon, BeakerIcon, BookOpenIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function EduSparkPro() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 5');
  const [standard, setStandard] = useState('Common Core (CCSS)');
  const [subject, setSubject] = useState('Science');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `LessonPlan_${topic.replace(/\s+/g, '_')}`,
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a lesson topic.");
    setIsGenerating(true);
    setCurrentPlan(null);

    const systemPrompt = `You are a National Board Certified Teacher (USA). 
    Generate a highly professional lesson plan in JSON format. 
    Strict adherence to: 
    1. SWBAT objectives (Bloom's Taxonomy). 
    2. "I Do, We Do, You Do" framework. 
    3. Identify student misconceptions. 
    4. Provide specific teacher scripts and scaffolding for ELL/IEP.`;

    const userPrompt = `Generate a lesson for Topic: ${topic}, Grade: ${grade}, Standard: ${standard}. 
    Return strictly a JSON object with this exact structure:
    {
      "topic": "Creative Title", 
      "objective": "SWBAT...", 
      "essentialQuestions": ["Q1", "Q2"],
      "misconceptions": ["Misconception 1", "Misconception 2"], 
      "procedure": [
        {"type": "Hook", "title": "Engage", "time": "5m", "content": "Script/Activity", "color": "bg-slate-50 border-slate-200"},
        {"type": "I Do", "title": "Model", "time": "15m", "content": "Teacher direct instruction", "color": "bg-blue-50 border-blue-100"},
        {"type": "We Do", "title": "Guided", "time": "15m", "content": "Collaborative task", "color": "bg-green-50 border-green-100"},
        {"type": "You Do", "title": "Independent", "time": "10m", "content": "Application task", "color": "bg-purple-50 border-purple-100"}
      ],
      "differentiation": {"ell": "Strategy for ELL", "advanced": "Strategy for Advanced", "iep": "Strategy for IEP"},
      "assessment": "Exit Ticket description"
    }`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentPlan(data);
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to reach the AI expert. Please check your API configuration or terminal logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="text-2xl font-black tracking-tight">EduSpark AI</span>
        </div>
        <div className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase">Expert Mode</div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden md:block overflow-y-auto">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" /> Pedagogy Settings
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Subject Area</label>
              <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option>Science</option>
                <option>Math</option>
                <option>English Language Arts</option>
                <option>Social Studies</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Grade Level</label>
              <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option>Elementary (K-5)</option>
                <option>Middle School (6-8)</option>
                <option>High School (9-12)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Standards</label>
              <select value={standard} onChange={(e)=>setStandard(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option>Common Core (CCSS)</option>
                <option>Next Gen Science (NGSS)</option>
                <option>TEKS (Texas)</option>
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[9px] text-blue-600 font-black uppercase mb-1">Instructional Design</p>
              <p className="text-[11px] text-blue-800 leading-tight">Using <b>Gradual Release</b> and <b>Bloom's Higher Order Thinking</b> prompts.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex gap-2 mb-10 transition-all focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex items-center pl-4 text-slate-400">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <input 
                type="text" value={topic} onChange={(e)=>setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter topic (e.g., Solar System, Civil War)..."
                className="flex-1 px-4 py-3 outline-none font-medium text-slate-800"
              />
              <button 
                onClick={handleGenerate} disabled={isGenerating}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? "Drafting Plan..." : "Generate ✨"}
              </button>
            </div>

            {currentPlan && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-20 animate-in fade-in duration-500">
                <div className="px-8 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" /> Ready for Instruction
                  </span>
                  <button onClick={handlePrint} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2">
                    <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
                  </button>
                </div>

                <div className="p-10 md:p-16" ref={contentRef}>
                  <div className="mb-12 pb-8 border-b-2 border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-slate-900">{currentPlan.topic}</h1>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-blue-100 text-blue-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{subject}</span>
                      <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{grade}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{standard}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-12">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5"/> Objective (SWBAT)</h2>
                        <p className="text-slate-700 text-lg italic border-l-4 border-blue-200 pl-4 py-1">"{currentPlan.objective}"</p>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2"><ChatBubbleLeftRightIcon className="w-5 h-5"/> Essential Questions</h2>
                        <ul className="space-y-2">
                          {currentPlan.essentialQuestions?.map((q,i)=><li key={i} className="text-sm font-medium text-slate-700 bg-orange-50/50 p-3 rounded-xl border border-orange-100">• {q}</li>)}
                        </ul>
                      </div>
                    </section>

                    {currentPlan.misconceptions && (
                      <section className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                        <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4" /> Common Misconceptions
                        </h2>
                        <ul className="space-y-2">
                          {currentPlan.misconceptions.map((m, i) => (
                            <li key={i} className="text-sm text-amber-900 leading-relaxed font-medium">• {m}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <section className="space-y-6">
                      <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900"><BeakerIcon className="w-7 h-7 text-blue-600"/> Instructional Procedures</h2>
                      <div className="space-y-6">
                        {currentPlan.procedure?.map((s, i) => (
                          <div key={i} className={`${s.color} p-8 rounded-3xl border-2 hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/50 px-3 py-1 rounded-full">{s.type} • {s.time}</span>
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-slate-900">{s.title}</h3>
                            <p className="text-slate-700 text-base leading-relaxed">{s.content}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {currentPlan.differentiation && (
                      <section className="p-10 bg-slate-900 rounded-[3rem] text-slate-300 print:bg-white print:text-black print:border-2 print:border-slate-900">
                        <h2 className="text-white font-bold mb-8 flex items-center gap-3 text-xl print:text-black"><PuzzlePieceIcon className="w-6 h-6 text-indigo-400 print:text-slate-800"/> Differentiation Strategies</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                          <div><h4 className="text-[11px] text-indigo-300 font-black mb-3 uppercase tracking-widest print:text-slate-500">ELL Support</h4><p className="leading-relaxed">{currentPlan.differentiation.ell}</p></div>
                          <div><h4 className="text-[11px] text-indigo-300 font-black mb-3 uppercase tracking-widest print:text-slate-500">Advanced / G&T</h4><p className="leading-relaxed">{currentPlan.differentiation.advanced}</p></div>
                          <div><h4 className="text-[11px] text-indigo-300 font-black mb-3 uppercase tracking-widest print:text-slate-500">IEP / Accom.</h4><p className="leading-relaxed">{currentPlan.differentiation.iep}</p></div>
                        </div>
                      </section>
                    )}

                    <section className="pt-8 border-t-2 border-slate-100 border-dashed text-center">
                      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Formative Assessment</h2>
                      <p className="font-medium text-slate-800 text-lg max-w-2xl mx-auto">{currentPlan.assessment}</p>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
