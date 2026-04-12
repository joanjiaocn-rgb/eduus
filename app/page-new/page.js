"use client";

import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function AIEDUInterface() {
  const [selectedAsset, setSelectedAsset] = useState('Lesson Plan');

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      {/* Sidebar - Precision-styled */}
      <aside className="w-80 border-r border-slate-100 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">AIEDU <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">BETA</span></span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pedagogy Settings</h2>
            <div className="space-y-4">
              {[
                { label: 'GRADE LEVEL', val: 'Elementary (K-5)' },
                { label: 'SUBJECT AREA', val: 'Science' },
                { label: 'STANDARDS ALIGNMENT', val: 'Common Core (CCSS)' }
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 tracking-wider">{item.label}</label>
                  <button className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex justify-between items-center text-sm font-medium hover:border-blue-400 transition-colors">
                    {item.val} <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Generate Assets</h2>
            <div className="space-y-3">
              {[
                { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
                { name: 'Class Slides', icon: PresentationChartBarIcon, pro: true },
                { name: 'Worksheets', icon: DocumentDuplicateIcon, pro: true }
              ].map(item => (
                <button 
                  key={item.name} 
                  onClick={() => setSelectedAsset(item.name)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedAsset === item.name ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${selectedAsset === item.name ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  {item.pro && <span className="text-[9px] font-black text-amber-600 border border-amber-200 px-1.5 rounded">PRO</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace - Precision-styled */}
      <main className="flex-1 p-12">
        <header className="flex justify-end items-center gap-4 mb-20 text-sm font-bold">
          <button className="text-slate-500 hover:text-slate-900">Pricing</button>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800">Sign In</button>
        </header>

        <section className="max-w-xl mx-auto">
          <div className="border border-slate-200 rounded-3xl p-8 shadow-sm">
            <input 
              type="text" 
              placeholder="What are we teaching today?..." 
              className="w-full text-xl font-bold placeholder:text-slate-300 outline-none mb-6 text-center"
            />
            <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
              Draft
            </button>
          </div>
          <div className="text-center mt-6 text-slate-400 text-xs">
            Enter a topic to generate your lesson plan
          </div>
        </section>
      </main>
    </div>
  );
}
