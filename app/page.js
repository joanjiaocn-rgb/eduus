"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  SparklesIcon, DocumentArrowDownIcon, AcademicCapIcon, 
  CheckBadgeIcon, PuzzlePieceIcon, Cog6ToothIcon,
  ChatBubbleLeftRightIcon, BeakerIcon, BookOpenIcon, 
  ExclamationTriangleIcon, ClockIcon, TrashIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon, ChevronLeftIcon
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'eduspark_lesson_history';

// ── Editable Field ──────────────────────────────────────────────
function EditableText({ value, onChange, multiline = false, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={ref}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={`w-full border-2 border-blue-400 rounded-xl p-3 outline-none resize-none bg-blue-50 text-slate-800 ${className}`}
            rows={4}
          />
        ) : (
          <input
            ref={ref}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={`w-full border-2 border-blue-400 rounded-xl px-3 py-1 outline-none bg-blue-50 text-slate-800 ${className}`}
          />
        )}
        <div className="flex gap-2 mt-1 justify-end">
          <button onClick={commit} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700">
            <CheckIcon className="w-3 h-3" /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1 text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold hover:bg-slate-300">
            <XMarkIcon className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
      <span className={className}>{value}</span>
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 rounded-full p-0.5">
        <PencilSquareIcon className="w-3 h-3 text-blue-500" />
      </span>
    </div>
  );
}

// ── History Sidebar ──────────────────────────────────────────────
function HistorySidebar({ history, currentId, onSelect, onDelete, onClose }) {
  if (!history.length) return (
    <div className="text-center text-slate-400 py-12 px-4">
      <ClockIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-xs font-bold uppercase tracking-widest">No saved plans yet</p>
      <p className="text-xs mt-1">Generate your first lesson plan!</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {history.map(item => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${
            currentId === item.id
              ? 'bg-blue-50 border-blue-200'
              : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'
          }`}
        >
          <p className="font-bold text-sm text-slate-800 truncate pr-6">{item.plan.topic}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-medium">{item.subject} • {item.grade}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.savedAt).toLocaleDateString()}</p>
          <button
            onClick={e => { e.stopPropagation(); onDelete(item.id); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-red-400 transition-all"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function EduSparkPro() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 5');
  const [standard, setStandard] = useState('Common Core (CCSS)');
  const [subject, setSubject] = useState('Science');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const contentRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const persistHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory)); } catch (e) {}
  }, []);

  const saveCurrentPlan = useCallback((plan, id) => {
    const entry = {
      id: id || Date.now().toString(),
      savedAt: new Date().toISOString(),
      subject, grade, standard, topic,
      plan,
    };
    const filtered = history.filter(h => h.id !== entry.id);
    persistHistory([entry, ...filtered].slice(0, 20)); // keep last 20
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    return entry.id;
  }, [history, subject, grade, standard, topic, persistHistory]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `LessonPlan_${topic.replace(/\s+/g, '_')}`,
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a lesson topic.");
    setIsGenerating(true);
    setCurrentPlan(null);
    setCurrentId(null);

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

      if (!response.ok) throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      setCurrentPlan(data);
      // Auto-save after generation
      const newId = saveCurrentPlan(data, Date.now().toString());
      setCurrentId(newId);
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to reach the AI expert. Please check your API configuration or terminal logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update a field in currentPlan and persist
  const updatePlan = useCallback((updater) => {
    setCurrentPlan(prev => {
      const next = updater(prev);
      if (currentId) saveCurrentPlan(next, currentId);
      return next;
    });
  }, [currentId, saveCurrentPlan]);

  const updateProcedureField = (idx, field, val) => {
    updatePlan(prev => {
      const procedure = prev.procedure.map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...prev, procedure };
    });
  };

  const handleSelectHistory = (item) => {
    setCurrentPlan(item.plan);
    setCurrentId(item.id);
    setTopic(item.topic);
    setGrade(item.grade);
    setSubject(item.subject);
    setStandard(item.standard);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id) => {
    persistHistory(history.filter(h => h.id !== id));
    if (currentId === id) { setCurrentPlan(null); setCurrentId(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckIcon className="w-4 h-4" /> Saved to history
        </div>
      )}

      {/* Nav */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="text-2xl font-black tracking-tight">EduSpark AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(h => !h)}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-colors ${
              showHistory ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            History {history.length > 0 && <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-[10px]">{history.length}</span>}
          </button>
          <div className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase">Expert Mode</div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden md:block overflow-y-auto">
          {showHistory ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" /> Saved Plans
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <HistorySidebar
                history={history}
                currentId={currentId}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
                onClose={() => setShowHistory(false)}
              />
            </>
          ) : (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Cog6ToothIcon className="w-4 h-4" /> Pedagogy Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Subject Area</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Science</option>
                    <option>Math</option>
                    <option>English Language Arts</option>
                    <option>Social Studies</option>
                    <option>History</option>
                    <option>Art</option>
                    <option>Physical Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Grade Level</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Kindergarten</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                    <option>Grade 7</option>
                    <option>Grade 8</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Standards</label>
                  <select value={standard} onChange={(e) => setStandard(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Common Core (CCSS)</option>
                    <option>Next Gen Science (NGSS)</option>
                    <option>TEKS (Texas)</option>
                    <option>Virginia SOL</option>
                    <option>Florida NGSSS</option>
                  </select>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[9px] text-blue-600 font-black uppercase mb-1">Instructional Design</p>
                  <p className="text-[11px] text-blue-800 leading-tight">Using <b>Gradual Release</b> and <b>Bloom's Higher Order Thinking</b> prompts.</p>
                </div>
                {currentPlan && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[9px] text-emerald-600 font-black uppercase mb-1 flex items-center gap-1">
                      <PencilSquareIcon className="w-3 h-3" /> Inline Editing ON
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-tight">Click any text in the lesson plan to edit it directly.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Search bar */}
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex gap-2 mb-10 transition-all focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex items-center pl-4 text-slate-400">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <input
                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter topic (e.g., Solar System, Civil War, Fractions)..."
                className="flex-1 px-4 py-3 outline-none font-medium text-slate-800"
              />
              <button
                onClick={handleGenerate} disabled={isGenerating}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? "Drafting Plan..." : "Generate ✨"}
              </button>
            </div>

            {/* Loading skeleton */}
            {isGenerating && (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Lesson Plan Display */}
            {currentPlan && !isGenerating && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-20">
                {/* Toolbar */}
                <div className="px-8 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" /> Ready for Instruction
                    <span className="text-emerald-500 flex items-center gap-1 ml-2">
                      <PencilSquareIcon className="w-3 h-3" /> Editable
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCurrentPlan(currentPlan, currentId)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <CheckIcon className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={handlePrint} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2">
                      <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="p-10 md:p-16" ref={contentRef}>
                  {/* Title */}
                  <div className="mb-12 pb-8 border-b-2 border-slate-100">
                    <EditableText
                      value={currentPlan.topic}
                      onChange={val => updatePlan(p => ({ ...p, topic: val }))}
                      className="text-4xl md:text-5xl font-black leading-tight text-slate-900 block mb-6"
                    />
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-blue-100 text-blue-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{subject}</span>
                      <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{grade}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{standard}</span>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {/* Objective & Essential Questions */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckBadgeIcon className="w-5 h-5"/> Objective (SWBAT)
                        </h2>
                        <EditableText
                          value={currentPlan.objective}
                          onChange={val => updatePlan(p => ({ ...p, objective: val }))}
                          multiline
                          className="text-slate-700 text-base italic border-l-4 border-blue-200 pl-4 py-1 block"
                        />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                          <ChatBubbleLeftRightIcon className="w-5 h-5"/> Essential Questions
                        </h2>
                        <ul className="space-y-2">
                          {currentPlan.essentialQuestions?.map((q, i) => (
                            <li key={i} className="text-sm font-medium text-slate-700 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                              <EditableText
                                value={q}
                                onChange={val => updatePlan(p => ({
                                  ...p,
                                  essentialQuestions: p.essentialQuestions.map((eq, ei) => ei === i ? val : eq)
                                }))}
                                className="block"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>

                    {/* Misconceptions */}
                    {currentPlan.misconceptions && (
                      <section className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                        <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4" /> Common Misconceptions
                        </h2>
                        <ul className="space-y-2">
                          {currentPlan.misconceptions.map((m, i) => (
                            <li key={i} className="text-sm text-amber-900 leading-relaxed font-medium">
                              • <EditableText
                                value={m}
                                onChange={val => updatePlan(p => ({
                                  ...p,
                                  misconceptions: p.misconceptions.map((mm, mi) => mi === i ? val : mm)
                                }))}
                                className="inline"
                              />
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Procedure */}
                    <section className="space-y-6">
                      <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                        <BeakerIcon className="w-7 h-7 text-blue-600"/> Instructional Procedures
                      </h2>
                      <div className="space-y-6">
                        {currentPlan.procedure?.map((s, i) => (
                          <div key={i} className={`${s.color} p-8 rounded-3xl border-2 hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/50 px-3 py-1 rounded-full">
                                {s.type} • <EditableText value={s.time} onChange={val => updateProcedureField(i, 'time', val)} className="inline" />
                              </span>
                            </div>
                            <EditableText
                              value={s.title}
                              onChange={val => updateProcedureField(i, 'title', val)}
                              className="font-bold text-xl mb-3 text-slate-900 block"
                            />
                            <EditableText
                              value={s.content}
                              onChange={val => updateProcedureField(i, 'content', val)}
                              multiline
                              className="text-slate-700 text-base leading-relaxed block"
                            />
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Differentiation */}
                    {currentPlan.differentiation && (
                      <section className="p-10 bg-slate-900 rounded-[3rem] text-slate-300 print:bg-white print:text-black print:border-2 print:border-slate-900">
                        <h2 className="text-white font-bold mb-8 flex items-center gap-3 text-xl print:text-black">
                          <PuzzlePieceIcon className="w-6 h-6 text-indigo-400 print:text-slate-800"/> Differentiation Strategies
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                          {['ell', 'advanced', 'iep'].map((key, i) => (
                            <div key={key}>
                              <h4 className="text-[11px] text-indigo-300 font-black mb-3 uppercase tracking-widest print:text-slate-500">
                                {key === 'ell' ? 'ELL Support' : key === 'advanced' ? 'Advanced / G&T' : 'IEP / Accom.'}
                              </h4>
                              <EditableText
                                value={currentPlan.differentiation[key]}
                                onChange={val => updatePlan(p => ({ ...p, differentiation: { ...p.differentiation, [key]: val } }))}
                                multiline
                                className="leading-relaxed block text-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Assessment */}
                    <section className="pt-8 border-t-2 border-slate-100 border-dashed text-center">
                      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Formative Assessment</h2>
                      <EditableText
                        value={currentPlan.assessment}
                        onChange={val => updatePlan(p => ({ ...p, assessment: val }))}
                        multiline
                        className="font-medium text-slate-800 text-lg max-w-2xl mx-auto block"
                      />
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!currentPlan && !isGenerating && (
              <div className="text-center py-20 text-slate-400">
                <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">Enter a topic above to generate your lesson plan</p>
                {history.length > 0 && (
                  <button onClick={() => setShowHistory(true)} className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-bold flex items-center gap-1 mx-auto">
                    <ClockIcon className="w-4 h-4" /> View {history.length} saved plan{history.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
