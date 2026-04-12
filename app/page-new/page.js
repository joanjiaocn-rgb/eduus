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

    const systemPrompt = `You are a National Board Certified Teacher with 15+ years of experience in US public schools. 

Generate a comprehensive, publication-quality lesson plan that would impress a principal during a formal Danielson Framework observation.

CRITICAL REQUIREMENTS:
1. Use precise educational terminology (Bloom's Taxonomy, DOK levels, formative/summative assessment)
2. Include VERBATIM teacher scripts - what the teacher actually says word-for-word, in quotes
3. Provide Socratic questioning sequences that scaffold from low to high cognitive demand
4. Include EXACT standard codes (e.g., CCSS.ELA-LITERACY.RI.5.3, CCSS.Math.Content.4.OA.A.1, NGSS 5-PS1-1)
5. List ALL materials needed with quantities
6. Provide precise pacing (down to the minute) for a 45-50 minute class
7. Include pre-class preparation and homework extension
8. Address common misconceptions with specific correction strategies
9. Include explicit Danielson Framework Domain 3 alignment notes

The output must be detailed enough that a substitute teacher could teach this lesson successfully.`;

    const userPrompt = `Create a professional lesson plan for:
- Topic: ${val}
- Grade: ${grade}
- Subject: ${subject}
- Standards Framework: ${standard}

Return a JSON object with this exact structure:
{
  "topic": "Engaging, creative lesson title",
  "standardCode": "EXACT standard code e.g. CCSS.ELA-LITERACY.RI.5.3 or CCSS.Math.Content.4.OA.A.1 or NGSS 5-PS1-1",
  "standardDescription": "One sentence: how this lesson specifically addresses this standard",
  "additionalStandards": ["Additional standard code if applicable"],
  "objective": "SWBAT... (use strong Bloom's verb like analyze, evaluate, create)",
  "dokLevel": "DOK Level 1-4 with brief rationale",
  "bloomsLevel": "Bloom's Taxonomy level (Remember/Understand/Apply/Analyze/Evaluate/Create)",
  "essentialQuestions": ["Overarching question 1", "Overarching question 2"],
  "learningTargets": ["Students will be able to...", "Students will understand that..."],
  "misconceptions": [
    {"misconception": "What students often think", "correction": "How to address it"}
  ],
  "materials": ["Material 1 with quantity", "Material 2 with quantity"],
  "preparation": "What teacher needs to do before class (5-10 minutes)",
  "pacingGuide": {
    "totalTime": "45 minutes",
    "breakdown": [
      {"phase": "Hook/Do Now", "time": "5 min", "description": "Brief description"},
      {"phase": "Direct Instruction", "time": "10 min", "description": "Brief description"},
      {"phase": "Guided Practice", "time": "12 min", "description": "Brief description"},
      {"phase": "Independent Practice", "time": "13 min", "description": "Brief description"},
      {"phase": "Closure/Exit Ticket", "time": "5 min", "description": "Brief description"}
    ]
  },
  "procedure": [
    {
      "type": "Hook",
      "title": "Engage & Activate",
      "time": "5m",
      "teacherScript": "EXACT words the teacher says: 'Class, today we're going to...'",
      "studentResponse": "Expected student responses or actions",
      "content": "Detailed description of the hook activity (2-3 sentences)",
      "color": "bg-orange-50 border-orange-200"
    },
    {
      "type": "I Do",
      "title": "Teacher Modeling",
      "time": "10m",
      "teacherScript": "EXACT words the teacher says while modeling: 'Watch me as I...'",
      "socraticQuestions": ["Low-level question?", "Mid-level question?", "High-level question?"],
      "content": "Detailed modeling description with think-aloud process",
      "color": "bg-blue-50 border-blue-200"
    },
    {
      "type": "We Do",
      "title": "Guided Practice",
      "time": "15m",
      "teacherScript": "EXACT words for guided practice: 'Now let's try this together...'",
      "socraticQuestions": ["Scaffolded question 1?", "Scaffolded question 2?", "Scaffolded question 3?"],
      "content": "Detailed guided practice with questioning sequence",
      "color": "bg-green-50 border-green-200"
    },
    {
      "type": "You Do",
      "title": "Independent Practice",
      "time": "12m",
      "teacherScript": "Transition language: 'Now it's your turn...'",
      "content": "Independent work description with success criteria and monitoring tips",
      "color": "bg-purple-50 border-purple-200"
    },
    {
      "type": "Closure",
      "title": "Wrap-Up & Exit Ticket",
      "time": "3m",
      "teacherScript": "Closure language: 'Let's review what we learned today...'",
      "content": "Closure activity and exit ticket description",
      "color": "bg-slate-50 border-slate-200"
    }
  ],
  "anchorChart": "Description of anchor chart to create during lesson (title and key elements)",
  "differentiation": {
    "approaching": "Specific scaffold for struggling learners (IEP, 504) - sentence starters, graphic organizers, etc.",
    "onLevel": "Standard support for grade-level learners",
    "advanced": "Extension for gifted/high-achieving students - deeper analysis, creative application",
    "ell": "Specific ELL strategies - sentence frames, visuals, native language support, vocabulary pre-teaching"
  },
  "assessment": {
    "formative": "How to check understanding during lesson (thumbs up, whiteboards, turn and talk)",
    "summative": "Exit ticket or end-of-lesson assessment with specific question",
    "successCriteria": ["Student can...", "Student demonstrates...", "Student explains..."]
  },
  "danielsonAlignment": {
    "domain": "Domain 3: Instruction",
    "components": ["3a: Communicating with Students", "3b: Questioning & Discussion Techniques", "3c: Engaging Students in Learning"],
    "evidence": "Specific evidence of how this lesson demonstrates Distinguished/Proficient performance: explain how the teacher script demonstrates 3a, how Socratic questions demonstrate 3b, and how I Do/We Do/You Do structure demonstrates 3c. Be specific and detailed (3-4 sentences)."
  },
  "homework": "Extension activity or homework assignment connected to the lesson",
  "reflectionPrompts": ["What went well?", "What would you change?", "Which students need follow-up?"]
}`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });

      if (!response.ok) throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to reach the AI expert. Please check your API configuration or terminal logs.");
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
    { name: 'Lesson Plan', icon: AcademicCapIcon, pro: false },
    { name: 'Unit Plan', icon: BookOpenIcon, pro: true, link: '/pricing' },
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
        <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 hidden lg:flex max-h-screen">
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
              <div className="animate-fade-in">
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

                <div className="space-y-8">
                  {/* Objective */}
                  <div className="bg-white/90 backdrop-blur border border-slate-200/80 p-10 rounded-[2rem] shadow-xl shadow-slate-200/20">
                    <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-6">Learning Objective</h4>
                    <p className="text-2xl font-semibold text-brand-900 leading-relaxed">{result.objective}</p>
                  </div>

                  {/* Standards */}
                  <div className="bg-brand-900 p-10 rounded-[2rem] text-white shadow-xl">
                    <h4 className="text-[10px] font-black text-brand-300 uppercase tracking-widest mb-4">Aligned Standards</h4>
                    <p className="text-3xl font-extrabold mb-2 tracking-tighter">{result.standardCode}</p>
                    <p className="text-brand-300 text-sm">{result.standardDescription}</p>
                  </div>

                  {/* Procedure */}
                  {result.procedure && (
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructional Procedures</h4>
                      {result.procedure.map((step, i) => (
                        <div key={i} className={`${step.color} p-8 rounded-3xl border-2`}>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/50 px-3 py-1 rounded-full">
                              {step.type} • {step.time}
                            </span>
                          </div>
                          <h5 className="font-bold text-xl mb-3 text-slate-900">{step.title}</h5>
                          <p className="text-slate-700 leading-relaxed mb-4">{step.content}</p>
                          {step.teacherScript && (
                            <div className="bg-white/70 p-4 rounded-xl">
                              <p className="text-xs font-bold text-slate-500 mb-1">Teacher Script:</p>
                              <p className="text-slate-800 italic">&quot;{step.teacherScript}&quot;</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Differentiation */}
                  {result.differentiation && (
                    <div className="bg-slate-900 p-10 rounded-[2rem] text-slate-300">
                      <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-6">Differentiation Strategies</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(result.differentiation).map(([key, value]) => (
                          <div key={key}>
                            <h5 className="text-xs font-bold text-indigo-300 uppercase mb-2">{key}</h5>
                            <p className="text-sm leading-relaxed">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessment */}
                  {result.assessment && (
                    <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4">Assessment</h4>
                      {typeof result.assessment === 'object' ? (
                        <div className="space-y-4">
                          {result.assessment.formative && (
                            <div>
                              <p className="text-xs font-bold text-slate-600 mb-1">Formative:</p>
                              <p className="text-slate-700">{result.assessment.formative}</p>
                            </div>
                          )}
                          {result.assessment.summative && (
                            <div>
                              <p className="text-xs font-bold text-slate-600 mb-1">Summative:</p>
                              <p className="text-slate-700">{result.assessment.summative}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-700">{result.assessment}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
