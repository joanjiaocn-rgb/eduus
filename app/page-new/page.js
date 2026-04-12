"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, ArrowRightIcon, TrashIcon, ClockIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const STORAGE_KEY = 'eduspark_lesson_history';

// ── EditableText ──────────────────────────────────────────────
function EditableText({ value, onChange, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) return (
    <div className="flex gap-2">
      <textarea value={draft} onChange={e => setDraft(e.target.value)} className="w-full p-2 border rounded-xl" rows={4} />
      <button onClick={() => { onChange(draft); setEditing(false); }} className="bg-blue-600 text-white p-2 rounded-lg"><CheckIcon className="w-4 h-4"/></button>
    </div>
  );
  return <div onClick={() => setEditing(true)} className={`cursor-pointer hover:bg-slate-50 p-2 rounded-xl ${className}`}>{value}</div>;
}

// ── Main Interface ──────────────────────────────────────────
export default function AIEDUInterface() {
  const [selectedAsset, setSelectedAsset] = useState('Lesson Plan');
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleGenerate = async () => {
    if (!topic) return alert("Enter topic");
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, assetType: selectedAsset })
      });
      const data = await res.json();
      const plan = { id: Date.now(), topic, content: data.content, savedAt: new Date().toISOString() };
      const newHistory = [plan, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setResult(plan);
    } catch (e) { alert("Failed"); } finally { setIsGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <aside className="w-80 border-r border-slate-200 bg-slate-50 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-blue-600" /><span className="text-xl font-black">AIEDU</span></div>
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</h2>
          {history.map(h => (
            <div key={h.id} onClick={() => setResult(h)} className="p-3 bg-white rounded-xl border border-slate-100 cursor-pointer text-sm font-bold truncate">{h.topic}</div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <section className="max-w-3xl mx-auto space-y-10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
              { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
              { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
            ].map(item => (
              <button key={item.name} onClick={() => setSelectedAsset(item.name)} className={`p-6 rounded-3xl border-2 ${selectedAsset === item.name ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                <item.icon className="w-8 h-8 mb-4" />
                <span className="font-bold">{item.name}</span>
                {item.pro && <span className="block text-[10px] text-amber-600 font-black">PRO</span>}
              </button>
            ))}
          </div>

          <div className="border-2 border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center gap-6">
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic?" className="w-full text-2xl font-bold text-center outline-none" />
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold">{isGenerating ? 'Generating...' : 'Draft'}</button>
          </div>

          {result && (
            <div className="mt-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <EditableText value={result.content} onChange={val => setResult(r => ({...r, content: val}))} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
