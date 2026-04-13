"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { SparklesIcon, AcademicCapIcon, PresentationChartBarIcon, DocumentDuplicateIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function AIEDUInterface() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [grade, setGrade] = useState('6-8');
  const [subject, setSubject] = useState('Science');
  const [standard, setStandard] = useState('NGSS');
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [googleUser, setGoogleUser] = useState(null);

  // Check for temporary Pro whitelist on mount
  useEffect(() => {
    const TEMP_PRO_EMAILS = ['joanjiaocn@gmail.com'];
    const TEST_EMAIL = 'joanjiaocn@gmail.com';
    let storedEmail = localStorage.getItem('user_email');
    if (!storedEmail) {
      localStorage.setItem('user_email', TEST_EMAIL);
      storedEmail = TEST_EMAIL;
    }
    setUserEmail(storedEmail);
    if (TEMP_PRO_EMAILS.includes(storedEmail)) {
      setIsPro(true);
    }
  }, []);

  // Google Login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();
        const userWithProfile = { ...tokenResponse, profile };
        setGoogleUser(userWithProfile);
        sessionStorage.setItem('google_user_id', profile.id);
        localStorage.setItem('user_email', profile.email || '');
        setUserEmail(profile.email || '');
        const savedPro = localStorage.getItem(`eduspark_pro_${profile.id}`);
        if (savedPro) {
          const { active } = JSON.parse(savedPro);
          if (active) setIsPro(true);
        }
      } catch (e) {
        setGoogleUser(tokenResponse);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents',
  });

  const handleLogout = () => {
    googleLogout();
    setGoogleUser(null);
    sessionStorage.removeItem('google_user_id');
    try {
      const pro = localStorage.getItem('eduspark_pro');
      if (!pro) setIsPro(false);
    } catch (e) {}
  };

  // Pro feature states
  const [unitResult, setUnitResult] = useState(null);
  const [slidesResult, setSlidesResult] = useState(null);
  const [worksheetResult, setWorksheetResult] = useState(null);
  const [isGeneratingUnit, setIsGeneratingUnit] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);

  const handleGenerate = async (t) => {
    const val = t || topic;
    if (!val.trim()) return alert("Please enter a topic.");
    setTopic(val);
    setIsGenerating(true);
    setResult(null);

    const statusMessages = [
      `Analyzing ${standard} standards...`,
      "Mapping exact curriculum codes...",
      "Designing Bloom's Taxonomy sequence...",
      "Writing verbatim teacher scripts...",
      "Crafting Socratic questions by DOK level...",
      "Building minute-by-minute pacing guide...",
      "Aligning to Danielson Framework Domain 3...",
      "Generating differentiation strategies...",
      "Finalizing assessment rubric...",
    ];
    let statusIdx = 0;
    setGeneratingStatus(statusMessages[0]);
    const statusInterval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statusMessages.length;
      setGeneratingStatus(statusMessages[statusIdx]);
    }, 1800);

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
  "standardCode": "EXACT standard code",
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
      clearInterval(statusInterval);
      setGeneratingStatus('');
      setIsGenerating(false);
    }
  };

  // Generate Unit Plan (Pro)
  const handleGenerateUnit = async () => {
    if (!isPro) {
      router.push('/pricing');
      return;
    }
    if (!topic.trim()) return alert("Please enter a unit topic.");
    setIsGeneratingUnit(true);
    setUnitResult(null);

    const systemPrompt = `You are a National Board Certified Teacher with 15+ years of experience in US public schools.
Generate a comprehensive UNIT PLAN consisting of 8-12 sequential lessons that build upon each other. This should be publication-quality that would impress a principal.
CRITICAL REQUIREMENTS:
1. Create lessons based on the topic's complexity and depth - can be 5-15 lessons
2. Typical US units range from 1-3 weeks, but flexible based on content needs
3. Each lesson must have specific learning objectives aligned to standards
4. Include big ideas and essential questions for the entire unit
5. Provide a culminating assessment/project for the unit
6. Show how each lesson connects to the next (progression map)
7. Include vocabulary progression across lessons
8. Address common misconceptions at the unit level
9. Provide differentiation strategies for the entire unit
The unit plan must be detailed enough that a substitute teacher could teach any lesson successfully.`;

    const userPrompt = `Create a comprehensive unit plan for:
- Unit Topic: ${topic}
- Grade: ${grade}
- Subject: ${subject}
- Standards Framework: ${standard}
- Number of Lessons: 10 lessons
Return a JSON object with this exact structure:
{
  "unitTitle": "Engaging unit title",
  "bigIdeas": ["Big idea 1", "Big idea 2", "Big idea 3"],
  "essentialQuestions": ["Overarching EQ 1", "Overarching EQ 2"],
  "standards": ["Specific standard code 1", "Specific standard code 2"],
  "duration": "2-3 weeks (10 lessons)",
  "vocabulary": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5"],
  "misconceptions": [
    {"misconception": "Common unit-level misconception", "correction": "How to address throughout unit"}
  ],
  "materials": ["Material 1 with quantity", "Material 2 with quantity"],
  "culminatingAssessment": {
    "title": "Final Project/Assessment name",
    "description": "Detailed description of culminating task",
    "rubric": ["Criteria 1: Exceeds/Meets/Below", "Criteria 2: Exceeds/Meets/Below"]
  },
  "lessons": [
    {
      "lessonNumber": 1,
      "title": "Lesson 1 Title",
      "duration": "45 min",
      "objective": "SWBAT...",
      "keyActivities": ["Activity 1", "Activity 2"],
      "homework": "Brief homework description"
    }
  ],
  "differentiation": {
    "approaching": "Unit-level scaffold for struggling learners",
    "onLevel": "Standard support",
    "advanced": "Extension opportunities throughout unit",
    "ell": "ELL strategies for the unit"
  },
  "reflectionPrompts": ["What went well?", "What would you change?"]
}`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      const data = await response.json();
      setUnitResult(data);
    } catch (err) {
      console.error("Unit Generation Error:", err);
      alert("Failed to generate unit plan. Please try again.");
    } finally {
      setIsGeneratingUnit(false);
    }
  };

  // Generate Google Slides (Pro)
  const handleGenerateSlides = async () => {
    if (!isPro) {
      router.push('/pricing');
      return;
    }
    if (!result) return alert("Please generate a lesson plan first.");
    setIsGeneratingSlides(true);
    setSlidesResult(null);

    const systemPrompt = `You are an expert Instructional Designer and Presentation Creator for North American K-12 schools.
Your task is to create a highly engaging, student-facing Slide Deck based on a specific topic.
CRITICAL RULES FOR SLIDES:
1. "Less is More" on screen: Bullet points must be short and digestible for students (max 6-8 words per bullet).
2. Speaker Notes are mandatory: Provide the EXACT script the teacher should say while this slide is on screen.
3. Visual Cues: For every slide, suggest an image, chart, or diagram the teacher could add.
4. Flow: Must follow the "Hook -> Direct Instruction (I Do) -> Guided Practice (We Do) -> Assessment (Exit Ticket)" flow.
Return strictly a JSON object with this exact structure:
{
  "presentationTitle": "Engaging Title Here",
  "estimatedDuration": "25-30 minutes",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "TitleSlide",
      "title": "Main Title",
      "subtitle": "Subtitle or Grade Level",
      "speakerNotes": "Welcome class! Today we are going to explore..."
    },
    {
      "slideNumber": 2,
      "layout": "ContentSlide",
      "title": "The Hook: [Engaging Question]",
      "bulletPoints": ["Short bullet 1", "Short bullet 2"],
      "visualSuggestion": "Describe an image here (e.g., 'A picture of a falling apple')",
      "speakerNotes": "Teacher script: Have you ever wondered why..."
    }
  ]
}
Ensure there are at least 8-10 slides covering the entire lesson flow.`;

    const userPrompt = `Create a presentation for:
Topic: ${result.topic}
Grade: ${grade}
Subject: ${subject}
Lesson Objective: ${result.objective}
Key Vocabulary: ${result.vocabulary?.join(', ') || 'See lesson plan'}
Make it engaging, visual, and ready to project in class.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      const data = await response.json();
      setSlidesResult(data);
    } catch (err) {
      console.error("Slides Generation Error:", err);
      alert("Failed to generate slides. Please try again.");
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // Generate Worksheet (Pro)
  const handleGenerateWorksheet = async () => {
    if (!isPro) {
      router.push('/pricing');
      return;
    }
    if (!result) return alert("Please generate a lesson plan first.");
    setIsGeneratingWorksheet(true);
    setWorksheetResult(null);

    const systemPrompt = `You are an experienced curriculum designer. Create a student-facing worksheet that matches the lesson plan provided. The worksheet should be classroom-ready and pedagogically sound.
Return ONLY valid JSON (no markdown fences) in this exact structure:
{
  "title": "Worksheet: [topic]",
  "grade": "Grade X",
  "subject": "...",
  "sections": [
    {
      "type": "vocabulary",
      "title": "Vocabulary Match",
      "items": [{"word": "term", "definition": "meaning"}]
    },
    {
      "type": "fill_blank",
      "title": "Fill in the Blank",
      "sentences": [{"text": "The ___ is important because...", "answer": "word"}]
    },
    {
      "type": "comprehension",
      "title": "Reading Check",
      "questions": [{"question": "What is...?", "lines": 3}]
    },
    {
      "type": "short_answer",
      "title": "Think & Write",
      "questions": [{"question": "Explain why...", "lines": 5}]
    },
    {
      "type": "exit_ticket",
      "title": "Exit Ticket",
      "prompt": "Today I learned...",
      "lines": 3
    }
  ]
}
Include 6-8 vocabulary terms, 5 fill-in-the-blank sentences, 3 comprehension questions, 2 short answer prompts, and 1 exit ticket.`;

    const userPrompt = `Generate a student worksheet for this lesson:
Topic: ${result.topic}
Grade: ${grade}
Subject: ${subject}
Objective: ${result.objective}
Key Vocabulary: ${result.vocabulary?.join(', ') || 'see lesson plan'}
Make it engaging, pedagogically sound, and directly tied to the lesson content.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      const data = await response.json();
      setWorksheetResult(data);
    } catch (err) {
      console.error("Worksheet Generation Error:", err);
      alert("Failed to generate worksheet. Please try again.");
    } finally {
      setIsGeneratingWorksheet(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-900 uppercase">AI EDU <span className="text-accent-500 text-xs">Studio</span></span>
        </div>

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
            <button 
              onClick={() => handleGenerate()} 
              disabled={isGenerating}
              className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 bg-brand-50 text-brand-700 border-brand-100"
            >
              <div className="flex items-center gap-3"><AcademicCapIcon className="w-5 h-5"/>Lesson Plan</div>
            </button>
            <button 
              onClick={() => handleGenerateUnit()} 
              disabled={isGeneratingUnit}
              className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-600"
            >
              <div className="flex items-center gap-3"><BookOpenIcon className="w-5 h-5"/>Unit Plan</div>
              <span className="bg-amber-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>
            </button>
            <button 
              onClick={() => handleGenerateSlides()} 
              disabled={isGeneratingSlides || !result}
              className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-3"><PresentationChartBarIcon className="w-5 h-5"/>Google Slides</div>
              <span className="bg-amber-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>
            </button>
            <button 
              onClick={() => handleGenerateWorksheet()} 
              disabled={isGeneratingWorksheet || !result}
              className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-3"><DocumentDuplicateIcon className="w-5 h-5"/>Worksheets</div>
              <span className="bg-amber-400 text-[8px] text-white px-2 py-0.5 rounded-md font-black">PRO</span>
            </button>
          </div>
        </section>

        <div className="bg-brand-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-brand-900/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-300 mb-2">Premium Feature</p>
          <p className="text-sm font-bold mb-4">One-click PPT slides and Worksheets.</p>
          <button onClick={() => router.push('/pricing')} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-brand-500 transition-all">Upgrade Now</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="flex justify-end">
            {googleUser ? (
              <div className="flex items-center gap-3">
                {googleUser.profile?.picture && (
                  <img src={googleUser.profile.picture} alt="avatar" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm font-semibold text-slate-700">{googleUser.profile?.name || googleUser.profile?.email || 'User'}</span>
                <button onClick={handleLogout} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-300 transition-all">Logout</button>
              </div>
            ) : (
              <button onClick={() => login()} className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-500 transition-all">Sign In</button>
            )}
          </header>
          
          <div className="relative max-w-3xl mx-auto">
            <input 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-white p-8 pl-10 pr-44 rounded-[2rem] shadow-2xl border border-slate-100 outline-none text-2xl font-semibold transition-all focus:border-brand-600" 
              placeholder="Type a topic (e.g. Plate Tectonics)..."
            />
            <button 
              onClick={() => handleGenerate()} 
              disabled={isGenerating}
              className="absolute right-4 top-4 bottom-4 bg-brand-600 text-white px-10 rounded-2xl font-black text-sm hover:bg-brand-700 disabled:bg-brand-400"
            >
              {isGenerating ? 'Drafting...' : 'Draft Magic'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'The Water Cycle', sub: 'SCIENCE', g: 'K-5', s: 'Science', std: 'NGSS' },
              { title: 'Pythagorean Theorem', sub: 'MATHEMATICS', g: '6-8', s: 'Math', std: 'CCSS' },
              { title: 'Civil Rights Movement', sub: 'SOCIAL STUDIES', g: '9-12', s: 'Social Studies', std: 'CCSS' }
            ].map((card, i) => (
              <button key={i} onClick={() => quickDraft(card.title, card.g, card.s, card.std)} className="group bg-white border border-slate-200 p-6 rounded-3xl text-left transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.sub}</p>
                <p className="font-bold text-slate-800">{card.title}</p>
              </button>
            ))}
          </div>

          {isGenerating && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">{generatingStatus}</p>
            </div>
          )}

          {result && (
            <div className="space-y-8">
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

              <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm">
                <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-6">Learning Objective</h4>
                <p className="text-2xl font-semibold text-brand-900 leading-relaxed">{result.objective}</p>
              </div>

              <div className="bg-brand-900 p-10 rounded-3xl text-white shadow-xl">
                <h4 className="text-[10px] font-black text-brand-300 uppercase tracking-widest mb-4">Aligned Standards</h4>
                <p className="text-3xl font-extrabold mb-2 tracking-tighter">{result.standardCode}</p>
                <p className="text-brand-300 text-sm">{result.standardDescription}</p>
              </div>

              {result.procedure && (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructional Procedures</h4>
                  {result.procedure.map((step, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-8 rounded-3xl">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white px-3 py-1 rounded-full">
                          {step.type} • {step.time}
                        </span>
                      </div>
                      <h5 className="font-bold text-xl mb-3 text-slate-900">{step.title}</h5>
                      <p className="text-slate-700 leading-relaxed mb-4">{step.content}</p>
                      {step.teacherScript && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <p className="text-xs font-bold text-slate-500 mb-1">Teacher Script:</p>
                          <p className="text-slate-800 italic">&quot;{step.teacherScript}&quot;</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.differentiation && (
                <div className="bg-slate-900 p-10 rounded-3xl text-slate-300">
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

              {result.assessment && (
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-6">Assessment</h4>
                  <div className="space-y-4">
                    {result.assessment.formative && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Formative</p>
                        <p className="text-slate-800">{result.assessment.formative}</p>
                      </div>
                    )}
                    {result.assessment.summative && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Summative</p>
                        <p className="text-slate-800">{result.assessment.summative}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.homework && (
                <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Homework / Extension</h4>
                  <p className="text-slate-800">{result.homework}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
