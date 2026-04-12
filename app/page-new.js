"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { 
  SparklesIcon, DocumentArrowDownIcon, 
  CheckBadgeIcon, PuzzlePieceIcon, BookOpenIcon, 
  ClockIcon, TrashIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon, ChevronLeftIcon,
  DocumentTextIcon, BookmarkIcon, LightBulbIcon,
  BeakerIcon, ChatBubbleLeftRightIcon, DocumentDuplicateIcon,
  PresentationChartBarIcon, ArrowRightIcon, StarIcon,
  ShieldCheckIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const STORAGE_KEY = 'eduspark_lesson_history';

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
          <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)} className={`w-full border-2 border-blue-400 rounded-xl p-3 outline-none resize-none bg-blue-50 text-slate-800 ${className}`} rows={4} />
        ) : (
          <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} className={`w-full border-2 border-blue-400 rounded-xl px-3 py-1 outline-none bg-blue-50 text-slate-800 ${className}`} />
        )}
        <div className="flex gap-2 mt-1 justify-end">
          <button onClick={commit} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700"><CheckIcon className="w-3 h-3" /> Save</button>
          <button onClick={cancel} className="flex items-center gap-1 text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold hover:bg-slate-300"><XMarkIcon className="w-3 h-3" /> Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative group cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
      <span className={className}>{value}</span>
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 rounded-full p-0.5"><PencilSquareIcon className="w-3 h-3 text-blue-500" /></span>
    </div>
  );
}

function HistorySidebar({ history, currentId, onSelect, onDelete }) {
  if (!history.length) return <div className="text-center text-slate-400 py-12 px-4"><ClockIcon className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-xs font-bold uppercase tracking-widest">No saved plans yet</p></div>;
  return (
    <div className="space-y-2">
      {history.map(item => (
        <div key={item.id} onClick={() => onSelect(item)} className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${currentId === item.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'}`}>
          <p className="font-bold text-sm text-slate-800 truncate pr-6">{item.plan.topic}</p>
          <div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-slate-400 font-medium">{item.subject} • {item.grade}</span></div>
          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.savedAt).toLocaleDateString()}</p>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-red-400 transition-all"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}

export default function EduSparkPro() {
  const [view, setView] = useState('landing');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 5');
  const [standard, setStandard] = useState('Common Core (CCSS)');
  const [subject, setSubject] = useState('Science');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [googleUser, setGoogleUser] = useState(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
      const pro = localStorage.getItem('eduspark_pro');
      if (pro) { const { active } = JSON.parse(pro); if (active) setIsPro(true); }
    } catch (e) {}
  }, []);

  const persistHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory)); } catch (e) {}
  }, []);

  const saveCurrentPlan = useCallback((plan, id) => {
    const entry = { id: id || Date.now().toString(), savedAt: new Date().toISOString(), subject, grade, standard, topic, plan };
    const filtered = history.filter(h => h.id !== entry.id);
    persistHistory([entry, ...filtered].slice(0, 20));
    setSaveToast(true); setTimeout(() => setSaveToast(false), 2000); return entry.id;
  }, [history, subject, grade, standard, topic, persistHistory]);

  const handleGenerateLesson = async () => {
    if (!topic.trim()) return alert("Please enter a lesson topic.");
    setIsGenerating(true);
    setGeneratingStatus('Analyzing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockPlan = { topic, standardCode: 'CCSS.ELA.RI.5.3', objective: `Understand ${topic}.`, essentialQuestions: [`Why ${topic}?`], procedure: [{title: 'Lesson', time: '40m', content: 'Detailed lesson content for ' + topic}], differentiation: {approaching: 'Support'} };
    setCurrentPlan(mockPlan);
    const newId = saveCurrentPlan(mockPlan, Date.now().toString());
    setCurrentId(newId);
    setView('result');
    setIsGenerating(false);
  };

  if (view === 'landing') return (
    <div className="min-h-screen bg-white font-sans p-20 text-center">
        <h1 className="text-5xl font-black mb-6">Save 10+ Hours of Lesson Planning.</h1>
        <p className="text-xl text-slate-600 mb-10">Generate plans, slides, and worksheets in seconds.</p>
        <button onClick={() => setView('lesson')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold">Get Started for Free</button>
    </div>
  );

  if (view === 'lesson') return (
    <div className="p-10 max-w-lg mx-auto bg-slate-50 rounded-3xl mt-10">
      <h2 className="text-2xl font-black mb-6">Lesson Details</h2>
      <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic" className="w-full p-4 mb-4 rounded-xl border" />
      <button onClick={handleGenerateLesson} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">{isGenerating ? 'Generating...' : 'Generate'}</button>
    </div>
  );

  return (
    <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-6">{currentPlan.topic}</h1>
        <EditableText value={currentPlan.objective} onChange={val => setCurrentPlan(p => ({...p, objective: val}))} className="text-lg" />
    </div>
  );
}
