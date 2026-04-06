"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  SparklesIcon, DocumentArrowDownIcon, AcademicCapIcon, 
  LightBulbIcon, PresentationChartLineIcon,
  PencilSquareIcon, CheckBadgeIcon,
  GlobeAltIcon, PuzzlePieceIcon, Cog6ToothIcon,
  ChatBubbleLeftRightIcon, BeakerIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

// --- Pre-built Mock Data for Specific Queries ---
const mockDatabase = {
  "photosynthesis": {
    topic: "Photosynthesis: The Green Power Plant",
    objective: "Students will be able to construct a model to explain how plants convert light energy, water, and carbon dioxide into cellular energy (glucose) and release oxygen.",
    standards: [
      "NGSS 5-LS1-1: Support an argument that plants get the materials they need for growth chiefly from air and water.",
      "CCSS.ELA-LITERACY.RI.5.7: Draw on information from multiple print or digital sources."
    ],
    essentialQuestions: [
      "If all sunlight disappeared for a day, what would happen inside a leaf?",
      "Why are forests often referred to as the 'lungs of the Earth'?"
    ],
    procedure: [
      { type: "Hook", title: "The Missing Weight Mystery", time: "7 min", content: "Show Van Helmont's willow tree experiment. Ask: 'The tree gained 160 lbs, but the soil only lost 2 oz. Where did the mass come from?'", color: "bg-slate-50 border-slate-200" },
      { type: "I Do (Direct Instruction)", title: "The Solar Panel Analogy", time: "15 min", content: "Display the chloroplast structure. Break down the formula: CO2 + H2O + Light → Glucose + O2. Emphasize that plants don't 'eat' dirt.", color: "bg-blue-50 border-blue-100" },
      { type: "We Do (Guided Practice)", title: "Molecule Builders", time: "15 min", content: "Students use colored beads to represent atoms, breaking apart CO2 and H2O to build a glucose molecule.", color: "bg-green-50 border-green-100" },
      { type: "You Do (Independent)", title: "Journey of a Carbon Atom", time: "10 min", content: "Draft a 1-paragraph narrative from the perspective of a Carbon atom entering a stomata and becoming part of a sugar molecule.", color: "bg-purple-50 border-purple-100" }
    ],
    differentiation: {
      ell: "Provide a bilingual glossary (stomata, chloroplast, glucose). Allow students to draw their narrative instead of writing.",
      advanced: "Challenge students to research and briefly explain the difference between light-dependent and light-independent reactions.",
      iep: "Provide fill-in-the-blank formula templates. Reduce the number of atoms in the bead simulation."
    },
    assessment: "Exit Ticket: Draw a plant. Label 3 inputs going in and 2 outputs coming out. Circle the output that the plant keeps for food."
  }
};

// --- Dynamic AI Mock Generator for Any Other Topic ---
const generateDynamicPlan = (topic, grade, standard) => {
  return {
    topic: `${topic.charAt(0).toUpperCase() + topic.slice(1)}: Core Concepts`,
    objective: `Students will be able to (SWBAT) analyze and apply fundamental principles of ${topic} to solve problems and demonstrate comprehension.`,
    standards: [
      `${standard} Alignment: Demonstrate grade-appropriate mastery of ${topic}.`,
      `${standard} Cross-curricular Connection: Apply critical thinking and analytical skills.`
    ],
    essentialQuestions: [
      `Why is understanding ${topic} critical to our daily lives?`,
      `How does ${topic} connect to broader real-world applications?`
    ],
    procedure: [
      { type: "Hook", title: "Activating Prior Knowledge", time: "5 min", content: `Engage students with a real-world scenario related to ${topic}. Think-Pair-Share.`, color: "bg-slate-50 border-slate-200" },
      { type: "I Do", title: "Direct Instruction", time: "15 min", content: `Explicitly model the core framework of ${topic}. Introduce key vocabulary and concepts.`, color: "bg-blue-50 border-blue-100" },
      { type: "We Do", title: "Guided Practice", time: "15 min", content: `Work through examples of ${topic} as a whole class. Monitor for misconceptions.`, color: "bg-green-50 border-green-100" },
      { type: "You Do", title: "Independent Application", time: "10 min", content: `Students apply their knowledge of ${topic} through a hands-on activity or worksheet.`, color: "bg-purple-50 border-purple-100" }
    ],
    differentiation: {
      ell: "Provide visual aids, sentence stems, and a pre-taught vocabulary list.",
      advanced: `Assign an extension project requiring synthesis of ${topic} with a secondary concept.`,
      iep: "Provide graphic organizers, chunked instructions, and extended time."
    },
    assessment: `Exit Ticket: Write two key takeaways about ${topic} and one lingering question.`
  };
};

export default function EduSparkPro() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 5');
  const [standard, setStandard] = useState('Common Core (CCSS)');
  const [subject, setSubject] = useState('Science');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `LessonPlan_${topic.replace(/\s+/g, '_')}`,
  });

 const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a topic.");
    setIsGenerating(true);
    setCurrentPlan(null);

    // 1. 构建“北美专家级”系统提示词
    const systemPrompt = `
      You are a National Board Certified Teacher in the USA. 
      Generate a professional, highly detailed lesson plan in JSON format.
      
      CRITICAL STANDARDS:
      - Objectives: Must use "SWBAT" format with measurable Bloom's Taxonomy verbs.
      - Framework: Follow the "I Do, We Do, You Do" (Gradual Release) model.
      - Differentiation: Provide specific "Scaffolding" for ELL/IEP and "Extensions" for Gifted students.
      - Misconceptions: Identify 2-3 common student misunderstandings about this topic.
    `;

    const userPrompt = `
      Topic: ${topic}
      Grade Level: ${grade}
      Standards Framework: ${standard}
      
      Return a JSON object with this exact structure:
      {
        "topic": "Creative Title",
        "objective": "Detailed SWBAT statement",
        "standards": ["Code: Description"],
        "essentialQuestions": ["Question 1", "Question 2"],
        "misconceptions": ["Misconception & Correction"],
        "procedure": [
          {"type": "Hook", "title": "Engage", "time": "5m", "content": "Detailed script/activity", "color": "bg-slate-50"},
          {"type": "I Do", "title": "Model", "time": "15m", "content": "Teacher direct instruction with analogies", "color": "bg-blue-50"},
          {"type": "We Do", "title": "Guided", "time": "15m", "content": "Collaborative task description", "color": "bg-green-50"},
          {"type": "You Do", "title": "Independent", "time": "10m", "content": "Application task", "color": "bg-purple-50"}
        ],
        "differentiation": {"ell": "...", "advanced": "...", "iep": "..."},
        "assessment": "Exit Ticket description"
      }
    `;

    try {
      // 2. 调用 OpenAI API (建议通过你的 Next.js API Route)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          systemPrompt, 
          userPrompt 
        })
      });

      const data = await response.json();
      // 假设后端返回的是解析好的 JSON 对象
      setCurrentPlan(data);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("AI drafting failed. Please check your API connection.");
    } finally {
      setIsGenerating(false);
    }
  };
 

  const handleGeneratePPT = async () => {
    if (!currentPlan) return;
    setIsGeneratingPPT(true);
    
    try {
      const PptxGenJS = (await import(/* webpackIgnore: true */ "pptxgenjs")).default;
      const pres = new PptxGenJS();
      
      // Slide 1: Title
      let slide1 = pres.addSlide();
      slide1.background = { color: "FFFFFF" };
      slide1.addText(currentPlan.topic, { x: 1, y: 2, w: '80%', fontSize: 36, bold: true, align: 'center', color: '0F172A' });
      slide1.addText(`${currentPlan.grade} • ${currentPlan.subject}`, { x: 1, y: 3, w: '80%', fontSize: 18, align: 'center', color: '64748B' });

      // Slide 2: Objective & Standards
      let slide2 = pres.addSlide();
      slide2.addText("LEARNING OBJECTIVE", { x: 0.5, y: 0.5, fontSize: 14, color: '2563EB', bold: true });
      slide2.addShape("RECT", { x: 0.5, y: 0.8, w: 9, h: 0.02, fill: { color: 'E2E8F0' } });
      slide2.addText(currentPlan.objective, { x: 0.5, y: 1.2, w: 8.5, fontSize: 22, italic: true, color: '334155' });
      
      slide2.addText("ESSENTIAL QUESTIONS", { x: 0.5, y: 3.0, fontSize: 14, color: 'F97316', bold: true });
      currentPlan.essentialQuestions.forEach((q, idx) => {
        slide2.addText(`• ${q}`, { x: 0.5, y: 3.4 + (idx * 0.5), w: 8.5, fontSize: 18, color: '475569' });
      });

      // Slides 3+: Procedure Steps
      currentPlan.procedure.forEach(step => {
        let s = pres.addSlide();
        s.addText(`${step.type.toUpperCase()} • ${step.time}`, { x: 0.5, y: 0.5, fontSize: 12, color: '64748B', bold: true });
        s.addShape("RECT", { x: 0.5, y: 0.8, w: 9, h: 0.02, fill: { color: 'E2E8F0' } });
        s.addText(step.title, { x: 0.5, y: 1.2, fontSize: 32, bold: true, color: '0F172A' });
        s.addText(step.content, { x: 0.5, y: 2.2, w: 8.5, fontSize: 24, color: '334155' });
      });

      // Final Slide: Assessment
      let slideLast = pres.addSlide();
      slideLast.background = { color: "0F172A" };
      slideLast.addText("EXIT TICKET", { x: 0.5, y: 0.5, fontSize: 14, color: 'FBBF24', bold: true });
      slideLast.addShape("RECT", { x: 0.5, y: 0.8, w: 9, h: 0.02, fill: { color: '334155' } });
      slideLast.addText(currentPlan.assessment, { x: 0.5, y: 2.0, w: 8.5, fontSize: 28, color: 'F8FAFC' });

      await pres.writeFile({ fileName: `SlideDeck_${topic.replace(/\s+/g, '_')}.pptx` });
    } catch (err) {
      console.error("PPT Generation Error:", err);
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="text-2xl font-black tracking-tight">EduSpark</span>
        </div>
        <div className="flex gap-6 items-center">
          <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">My Library</button>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-100">
            Upgrade to Pro
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Curriculum Configuration */}
        <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden md:block overflow-y-auto">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" /> Curriculum Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Subject Area</label>
              <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Science</option>
                <option>Math</option>
                <option>English Language Arts</option>
                <option>Social Studies</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Grade Level</label>
              <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Kindergarten</option>
                <option>Grade 1 - 5 (Elementary)</option>
                <option>Grade 6 - 8 (Middle)</option>
                <option>Grade 9 - 12 (High School)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Standards Framework</label>
              <select value={standard} onChange={(e)=>setStandard(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Common Core State Standards (CCSS)</option>
                <option>Next Generation Science Standards (NGSS)</option>
                <option>Texas Essential Knowledge and Skills (TEKS)</option>
                <option>C3 Framework (Social Studies)</option>
              </select>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-8">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide mb-1">AI Pedagogy Engine</p>
              <p className="text-xs text-indigo-800 leading-relaxed">Currently using the <strong>I Do, We Do, You Do</strong> instructional framework with DOK-aligned essential questions.</p>
            </div>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            
            {/* Generation Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex gap-2 mb-10 transition-all focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex items-center pl-4 text-slate-400">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                value={topic} 
                onChange={(e)=>setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter a topic (e.g., Fractions, Civil War, Photosynthesis)..."
                className="flex-1 px-4 py-3 outline-none text-lg font-medium text-slate-800 placeholder-slate-400"
              />
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-200"
              >
                {isGenerating ? "Drafting Plan..." : "Generate ✨"}
              </button>
            </div>

            {/* Lesson Plan Document */}
            {currentPlan && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Bar */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <AcademicCapIcon className="w-5 h-5 text-blue-600" /> Principal-Ready Document
                  </span>
                  <button 
                    onClick={handlePrint} 
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 hover:shadow-lg transition-all"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
                  </button>
                </div>

                {/* Printable Content Area */}
                <div className="p-10 md:p-16" ref={contentRef}>
                  
                  {/* Title Section */}
                  <div className="mb-14 pb-8 border-b-2 border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{currentPlan.topic}</h1>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-blue-100 text-blue-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider">{currentPlan.subject}</span>
                      <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider">{currentPlan.grade}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider">{currentPlan.standard}</span>
                    </div>
                  </div>

                  <div className="space-y-16">
                    
                    {/* Objectives & Questions */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-4">
                         <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <CheckBadgeIcon className="w-5 h-5" /> Objective (SWBAT)
                         </h2>
                         <p className="text-slate-700 leading-relaxed text-lg italic border-l-4 border-blue-200 pl-6 py-1">"{currentPlan.objective}"</p>
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                           <ChatBubbleLeftRightIcon className="w-5 h-5" /> Essential Questions
                         </h2>
                         <ul className="space-y-3">
                            {currentPlan.essentialQuestions.map((q, i) => (
                              <li key={i} className="text-sm font-medium text-slate-700 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                {q}
                              </li>
                            ))}
                         </ul>
                      </div>
                    </section>

                    {/* Standards Alignment */}
                    <section>
                       <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                         <GlobeAltIcon className="w-5 h-5" /> Standards Alignment
                       </h2>
                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <ul className="space-y-3">
                            {currentPlan.standards.map((s, i) => (
                              <li key={i} className="text-sm font-mono text-slate-600 flex gap-3">
                                <span className="text-blue-500">→</span> {s}
                              </li>
                            ))}
                         </ul>
                       </div>
                    </section>

                    {/* Instructional Procedures */}
                    <section className="space-y-8">
                       <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                         <BeakerIcon className="w-7 h-7 text-blue-600" /> Instructional Procedures
                       </h2>
                       <div className="space-y-6">
                          {currentPlan.procedure.map((step, i) => (
                            <div key={i} className={`${step.color} p-8 rounded-3xl border-2 hover:shadow-md transition-shadow`}>
                               <div className="flex justify-between items-center mb-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/50 px-3 py-1 rounded-full">{step.type} • {step.time}</span>
                               </div>
                               <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                               <p className="text-slate-700 leading-relaxed text-base">{step.content}</p>
                            </div>
                          ))}
                       </div>
                    </section>

                    {/* Differentiation */}
                    <section className="bg-slate-900 p-10 md:p-12 rounded-[3rem] text-slate-300 shadow-2xl print:bg-white print:text-black print:border-2 print:border-slate-900 print:shadow-none">
                       <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 print:text-black">
                         <PuzzlePieceIcon className="w-6 h-6 text-indigo-400 print:text-slate-800" /> Differentiation Strategies
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div>
                             <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-3 print:text-slate-500">ELL Support</h4>
                             <p className="text-sm leading-relaxed">{currentPlan.differentiation.ell}</p>
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-3 print:text-slate-500">Advanced / G&T</h4>
                             <p className="text-sm leading-relaxed">{currentPlan.differentiation.advanced}</p>
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-3 print:text-slate-500">IEP / Accommodations</h4>
                             <p className="text-sm leading-relaxed">{currentPlan.differentiation.iep}</p>
                          </div>
                       </div>
                    </section>

                    {/* Assessment */}
                    <section className="text-center pt-8 border-t-2 border-slate-100 border-dashed">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Formative Assessment</p>
                      <p className="text-xl font-medium text-slate-800 max-w-2xl mx-auto">{currentPlan.assessment}</p>
                    </section>

                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar: Premium Export Tools */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 hidden xl:block">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Export & Resources</h3>
          
          <div className="space-y-5">
             
             {/* Working Feature: PPT Export */}
             <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <PresentationChartLineIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-base font-bold mb-2 text-slate-900">Slide Deck (PPT)</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Instantly generate a highly visual, editable presentation for this exact lesson plan.</p>
                <button 
                  onClick={handleGeneratePPT} 
                  disabled={!currentPlan || isGeneratingPPT}
                  className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPPT ? "Rendering..." : "Download PPTX"}
                </button>
             </div>

             {/* Locked Feature: Worksheet */}
             <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Pro</div>
                <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center mb-5 opacity-60">
                  <PencilSquareIcon className="w-6 h-6 text-slate-500" />
                </div>
                <h4 className="text-base font-bold mb-2 text-slate-900 opacity-60">Student Handouts</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 opacity-60">Auto-generate guided notes and practice worksheets aligned to the 'You Do' section.</p>
                <button className="w-full py-3.5 rounded-xl bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-400 cursor-not-allowed">Unlock with Pro</button>
             </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
