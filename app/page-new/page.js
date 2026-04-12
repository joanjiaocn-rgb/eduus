"use client";
import { useState } from "react";
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return alert("Please enter a topic first.");
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); setShowResult(true); }, 1800);
  };

  return (
    <div className="bg-slate-50 text-slate-900 h-screen flex font-sans">
      <aside className="w-72 bg-white border-r border-slate-100 p-6 pt-24 flex flex-col gap-8 overflow-y-auto">
        <section className="space-y-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogy Settings</h3>
          {[
            { label: 'Grade Level', options: ['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)'] },
            { label: 'Subject Area', options: ['Math', 'Science', 'ELA', 'Social Studies'] },
            { label: 'Standards Alignment', options: ['Common Core (CCSS)', 'NGSS', 'TEKS'] }
          ].map(item => (
            <div key={item.label} className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-600">
                {item.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generate Assets</h3>
          {[
            { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
            { name: 'Unit Plan', icon: BookOpenIcon, pro: true },
            { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
            { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
          ].map(item => (
            <button key={item.name} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 ${item.pro ? 'border-dashed border-slate-200 text-slate-400' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5"/>{item.name}</div>
              {item.pro && <span className="text-[9px] bg-pro-400 text-white px-2 py-0.5 rounded-md font-extrabold">PRO</span>}
            </button>
          ))}
        </section>
      </aside>

      <main className="flex-1 p-12 pt-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="relative">
            <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white p-7 pl-6 pr-36 rounded-3xl shadow-sm border border-slate-200 text-xl font-medium outline-none focus:ring-2 focus:ring-brand-600" placeholder="What are we teaching today?..." />
            <button onClick={handleGenerate} disabled={isGenerating} className="absolute right-4 top-4 bottom-4 w-28 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700">{isGenerating ? '...' : 'Draft'}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
