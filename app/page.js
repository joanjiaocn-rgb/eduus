"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { 
  SparklesIcon, DocumentArrowDownIcon, AcademicCapIcon, 
  CheckBadgeIcon, PuzzlePieceIcon, Cog6ToothIcon,
  ChatBubbleLeftRightIcon, BeakerIcon, BookOpenIcon, 
  ExclamationTriangleIcon, ClockIcon, TrashIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon, ChevronLeftIcon,
  Squares2X2Icon, DocumentTextIcon, BookmarkIcon, LightBulbIcon,
  DocumentDuplicateIcon, PresentationChartBarIcon
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
          <p className="font-bold text-sm text-slate-800 truncate pr-6">{item.plan.isUnit ? (item.topic || item.plan.unitTitle || 'Unit Plan') : (item.plan.topic || item.topic || 'Lesson Plan')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-medium">{item.plan.isUnit ? 'Unit Plan' : 'Single Lesson'} • {item.subject} • {item.grade}</span>
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
  const [mode, setMode] = useState('lesson'); // 'lesson' | 'unit'
  const [currentUnit, setCurrentUnit] = useState(null);
  const [unitLessonCount, setUnitLessonCount] = useState(10); // User-defined lesson count for unit
  const [googleUser, setGoogleUser] = useState(null);
  const [exportToast, setExportToast] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [isPro, setIsPro] = useState(false); // Default: free tier
  const [lessonCount, setLessonCount] = useState(0);
  const [lessonTab, setLessonTab] = useState('lesson');
  const [currentWorksheet, setCurrentWorksheet] = useState(null);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [currentLeveledTexts, setCurrentLeveledTexts] = useState(null);
  const [isGeneratingLeveledTexts, setIsGeneratingLeveledTexts] = useState(false);
  const [currentSlides, setCurrentSlides] = useState(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const PRO_WHITELIST = ['joanjiaocn@gmail.com'];

  const contentRef = useRef(null);
  const worksheetRef = useRef(null);
  const slidesRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Load subscription status
  useEffect(() => {
    try {
      const pro = localStorage.getItem('eduspark_pro');
      if (pro) {
        const { active, sessionId, demo } = JSON.parse(pro);
        if (active) {
          setIsPro(true);
          // Verify session with server if not demo
          if (!demo && sessionId && sessionId !== 'demo_session') {
            fetch(`/api/check-session?session_id=${sessionId}`)
              .then(res => res.json())
              .then(data => {
                if (data.status !== 'active') {
                  // Subscription expired
                  localStorage.removeItem('eduspark_pro');
                  setIsPro(false);
                }
              })
              .catch(console.error);
          }
        }
      }
      const count = parseInt(localStorage.getItem('eduspark_lesson_count') || '0', 10);
      setLessonCount(count);
    } catch (e) {}
  }, []);

  const persistHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory)); } catch (e) {}
  }, []);

  const saveCurrentPlan = useCallback((plan, id) => {
    // Capture current values directly from state to avoid stale closure
    const entry = {
      id: id || Date.now().toString(),
      savedAt: new Date().toISOString(),
      subject: subject,
      grade: grade,
      standard: standard,
      topic: topic,
      plan,
      // Save generated assets together with the plan
      worksheet: currentWorksheet,
      leveledTexts: currentLeveledTexts,
      slides: currentSlides,
    };
    const filtered = history.filter(h => h.id !== entry.id);
    persistHistory([entry, ...filtered].slice(0, 20)); // keep last 20
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    return entry.id;
  }, [history, subject, grade, standard, topic, currentWorksheet, currentLeveledTexts, currentSlides, persistHistory]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `LessonPlan_${topic.replace(/\s+/g, '_')}`,
  });

  // Google Login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Fetch user profile info
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();
        const userWithProfile = { ...tokenResponse, profile };
        setGoogleUser(userWithProfile);

        // Store Google ID in sessionStorage for subscription binding
        sessionStorage.setItem('google_user_id', profile.id);

        // Whitelist: joanjiaocn@gmail.com gets Pro for free
        if (PRO_WHITELIST.includes(profile.email)) {
          setIsPro(true);
        } else {
          // Restore subscription status bound to this Google account
          const savedPro = localStorage.getItem(`eduspark_pro_${profile.id}`);
          if (savedPro) {
            const { active } = JSON.parse(savedPro);
            if (active) setIsPro(true);
          }
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
    // Reset pro status to localStorage-only check on logout
    try {
      const pro = localStorage.getItem('eduspark_pro');
      if (!pro) setIsPro(false);
    } catch (e) { setIsPro(false); }
  };

  // Export to Google Docs
  const exportToGoogleDocs = async (title, content) => {
    if (!googleUser?.access_token) {
      alert('Please sign in with Google first');
      return;
    }

    try {
      const textContent = typeof content === 'object'
        ? formatLessonPlanForExport(content)
        : content;

      // 用 multipart upload 一次性创建并写入内容
      const metadata = {
        name: title || 'Lesson Plan',
        mimeType: 'application/vnd.google-apps.document',
      };

      const boundary = 'eduspark_boundary_xyz';
      const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        textContent,
        `--${boundary}--`,
      ].join('\r\n');

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&convert=true',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleUser.access_token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${uploadResponse.status}`);
      }

      const file = await uploadResponse.json();
      console.log('Google Doc created:', file);

      setExportToast({ type: 'success', message: 'Exported to Google Docs!' });
      setTimeout(() => setExportToast(null), 3000);
      window.open(`https://docs.google.com/document/d/${file.id}/edit`, '_blank');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export: ' + err.message);
    }
  };

  // 格式化教案为纯文本
  const formatLessonPlanForExport = (plan) => {
    let text = '';
    
    text += `${plan.topic || 'Lesson Plan'}\n`;
    text += `${'='.repeat(plan.topic?.length || 20)}\n\n`;
    
    if (plan.objective) {
      text += `OBJECTIVE\n${plan.objective}\n\n`;
    }
    
    if (plan.standardCode) {
      text += `STANDARD\n${plan.standardCode}\n\n`;
    }
    
    if (plan.essentialQuestions?.length) {
      text += `ESSENTIAL QUESTIONS\n`;
      plan.essentialQuestions.forEach((q, i) => {
        text += `${i + 1}. ${q}\n`;
      });
      text += '\n';
    }
    
    if (plan.materials?.length) {
      text += `MATERIALS\n`;
      plan.materials.forEach(m => {
        text += `• ${m}\n`;
      });
      text += '\n';
    }
    
    if (plan.procedure?.length) {
      text += `PROCEDURE\n`;
      plan.procedure.forEach((step, i) => {
        text += `\n${step.type}: ${step.title} (${step.time})\n`;
        text += `${'-'.repeat(40)}\n`;
        if (step.teacherScript) {
          text += `Teacher Script: ${step.teacherScript}\n\n`;
        }
        if (step.content) {
          text += `${step.content}\n\n`;
        }
      });
    }
    
    if (plan.differentiation) {
      text += `DIFFERENTIATION\n`;
      Object.entries(plan.differentiation).forEach(([key, value]) => {
        text += `${key.toUpperCase()}: ${value}\n\n`;
      });
    }
    
    text += `\nGenerated by EduSpark AI`;
    
    return text;
  };

  // Post to Google Classroom
  const postToClassroom = async (courseId, title, description) => {
    if (!googleUser?.access_token) {
      alert('Please sign in with Google first');
      return;
    }

    try {
      const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleUser.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: description,
          workType: 'ASSIGNMENT',
          state: 'PUBLISHED',
        }),
      });

      if (response.ok) {
        setExportToast({type: 'success', message: 'Posted to Google Classroom!'});
        setTimeout(() => setExportToast(null), 3000);
      } else {
        throw new Error('Failed to post');
      }
    } catch (err) {
      console.error('Classroom error:', err);
      alert('Failed to post to Google Classroom');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a lesson topic.");

    setIsGenerating(true);
    setCurrentPlan(null);
    setCurrentId(null);
    // Clear previous generated assets when creating new lesson
    setCurrentWorksheet(null);
    setCurrentLeveledTexts(null);
    setCurrentSlides(null);

    // Streaming-style status messages
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
- Topic: ${topic}
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
      setCurrentPlan(data);
      // Auto-save after generation
      const newId = saveCurrentPlan(data, Date.now().toString());
      setCurrentId(newId);
      // Track lesson count for free tier
      if (!isPro) {
        const newCount = lessonCount + 1;
        setLessonCount(newCount);
        localStorage.setItem('eduspark_lesson_count', String(newCount));
      }
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to reach the AI expert. Please check your API configuration or terminal logs.");
    } finally {
      clearInterval(statusInterval);
      setGeneratingStatus('');
      setIsGenerating(false);
    }
  };

  const handleGenerateUnit = async () => {
    if (!topic.trim()) return alert("Please enter a unit topic.");
    setIsGenerating(true);
    setCurrentUnit(null);
    setCurrentId(null);
    // Clear previous generated assets when creating new unit
    setCurrentWorksheet(null);
    setCurrentLeveledTexts(null);
    setCurrentSlides(null);

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
- Number of Lessons: ${unitLessonCount} lessons (user-specified)

Return a JSON object with this exact structure. The "lessons" array MUST contain exactly ${unitLessonCount} lessons:
{
  "unitTitle": "Engaging unit title",
  "bigIdeas": ["Big idea 1", "Big idea 2", "Big idea 3"],
  "essentialQuestions": ["Overarching EQ 1", "Overarching EQ 2"],
  "standards": ["Specific standard code 1", "Specific standard code 2"],
  "duration": "X weeks (${unitLessonCount} lessons)",
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
    // Generate exactly ${unitLessonCount} lessons with lessonNumber 1 through ${unitLessonCount}
    {
      "lessonNumber": 1,
      "title": "Lesson 1 Title",
      "duration": "45 min",
      "objective": "SWBAT...",
      "keyActivities": ["Activity 1", "Activity 2"],
      "homework": "Brief homework description"
    }
    // Continue through lesson ${unitLessonCount}
  ],
  "differentiation": {
    "approaching": "Unit-level scaffold for struggling learners",
    "onLevel": "Standard support",
    "advanced": "Extension opportunities throughout unit",
    "ell": "ELL strategies for the unit"
  },
  "reflectionPrompts": ["What went well?", "What would you change?"]
}

CRITICAL: You MUST generate exactly ${unitLessonCount} lessons total. Each lesson should build upon the previous one with clear progression and scaffolding. Distribute the content appropriately across all ${unitLessonCount} lessons.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });

      if (!response.ok) throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      setCurrentUnit(data);
      const newId = saveCurrentPlan({...data, isUnit: true}, Date.now().toString());
      setCurrentId(newId);
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to generate unit plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Student Worksheet
  const handleGenerateWorksheet = async () => {
    if (!currentPlan) return;
    setIsGeneratingWorksheet(true);
    setCurrentWorksheet(null);

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

Include 6-8 vocabulary terms, 5 fill-in-the-blank sentences, 3 comprehension questions, 2 short answer prompts, and 1 exit ticket. Make content age-appropriate for the grade level.`;

    const userPrompt = `Generate a student worksheet for this lesson:
Topic: ${currentPlan.topic}
Grade: ${grade}
Subject: ${subject}
Objective: ${currentPlan.objective}
Key Vocabulary: ${currentPlan.vocabulary?.join(', ') || 'see lesson plan'}

Make it engaging, pedagogically sound, and directly tied to the lesson content.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentWorksheet(data);
    } catch (err) {
      console.error('Worksheet Error:', err);
      alert('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  // Generate Leveled Texts
  const handleGenerateLeveledTexts = async () => {
    if (!currentPlan) return;
    setIsGeneratingLeveledTexts(true);
    setCurrentLeveledTexts(null);

    const systemPrompt = `You are an expert in differentiated literacy instruction. Generate three reading passages at different Lexile levels about the lesson topic.

Return ONLY valid JSON (no markdown fences) in this exact structure:
{
  "topic": "...",
  "levels": [
    {
      "level": "Approaching",
      "lexile": "400-500L",
      "emoji": "🟢",
      "color": "green",
      "text": "150-200 word passage with simple vocabulary, short sentences, and concrete concepts",
      "questions": ["Simple question 1?", "Simple question 2?", "Simple question 3?"]
    },
    {
      "level": "On-Level",
      "lexile": "600-700L",
      "emoji": "🟡",
      "color": "yellow",
      "text": "200-250 word passage with standard vocabulary and varied sentence structure",
      "questions": ["Standard question 1?", "Standard question 2?", "Standard question 3?"]
    },
    {
      "level": "Advanced",
      "lexile": "800-900L",
      "emoji": "🔴",
      "color": "red",
      "text": "250-300 word passage with academic vocabulary, complex sentences, and nuanced ideas",
      "questions": ["Higher-order question 1?", "Higher-order question 2?", "Higher-order question 3?"]
    }
  ]
}

Each passage should cover the SAME core content but at different complexity levels. Questions should match the reading level (literal → inferential → analytical).`;

    const userPrompt = `Generate three leveled reading passages about:
Topic: ${currentPlan.topic}
Grade: ${grade}
Subject: ${subject}
Key concepts from lesson: ${currentPlan.objective}

Ensure each passage is factually accurate, engaging, and clearly differentiated in complexity.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentLeveledTexts(data);
    } catch (err) {
      console.error('Leveled Texts Error:', err);
      alert('Failed to generate leveled texts. Please try again.');
    } finally {
      setIsGeneratingLeveledTexts(false);
    }
  };

  // Generate Google Slides Content
  const handleGenerateSlides = async () => {
    if (!currentPlan) return;
    setIsGeneratingSlides(true);
    setCurrentSlides(null);

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
Ensure there are at least 8-10 slides covering the entire lesson flow. Make it engaging and age-appropriate for the grade level.`;

    const userPrompt = `Create a presentation for:
Topic: ${currentPlan.topic}
Grade: ${grade}
Subject: ${subject}
Lesson Objective: ${currentPlan.objective}
Key Vocabulary: ${currentPlan.vocabulary?.join(', ') || 'See lesson plan'}

Make it engaging, visual, and ready to project in class.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentSlides(data);
    } catch (err) {
      console.error('Slides Error:', err);
      alert('Failed to generate slides. Please try again.');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // Generate Google Slides Content for Unit Plan
  const handleGenerateUnitSlides = async () => {
    if (!currentUnit) return;
    setIsGeneratingSlides(true);
    setCurrentSlides(null);

    const systemPrompt = `You are an expert Instructional Designer and Presentation Creator for North American K-12 schools.
Your task is to create a comprehensive, student-facing Slide Deck for an entire UNIT (2-3 weeks of instruction).

CRITICAL RULES FOR UNIT SLIDES:
1. "Less is More" on screen: Bullet points must be short and digestible for students (max 6-8 words per bullet).
2. Speaker Notes are mandatory: Provide the EXACT script the teacher should say while this slide is on screen.
3. Visual Cues: For every slide, suggest an image, chart, or diagram the teacher could add.
4. Flow: Must follow Unit Introduction -> Big Ideas -> Essential Questions -> Vocabulary -> Lesson Overview -> Assessment.

Return strictly a JSON object with this exact structure:
{
  "presentationTitle": "Unit Title Here",
  "estimatedDuration": "2-3 weeks",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "TitleSlide",
      "title": "Unit Title",
      "subtitle": "Grade Level & Subject",
      "speakerNotes": "Welcome to our new unit! Over the next few weeks, we will explore..."
    },
    {
      "slideNumber": 2,
      "layout": "ContentSlide",
      "title": "Big Ideas",
      "bulletPoints": ["Core concept 1", "Core concept 2", "Core concept 3"],
      "visualSuggestion": "Concept map or mind map image",
      "speakerNotes": "These are the big ideas we'll explore throughout this unit..."
    },
    {
      "slideNumber": 3,
      "layout": "ContentSlide",
      "title": "Essential Questions",
      "bulletPoints": ["Question 1?", "Question 2?"],
      "visualSuggestion": "Question mark graphic or thinking student image",
      "speakerNotes": "These questions will guide our learning journey..."
    },
    {
      "slideNumber": 4,
      "layout": "ContentSlide",
      "title": "Key Vocabulary",
      "bulletPoints": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5"],
      "visualSuggestion": "Word wall or vocabulary cards image",
      "speakerNotes": "Let's preview the important vocabulary we'll learn..."
    },
    {
      "slideNumber": 5,
      "layout": "ContentSlide",
      "title": "Unit Roadmap",
      "bulletPoints": ["Lesson 1: Topic", "Lesson 2: Topic", "Lesson 3: Topic"],
      "visualSuggestion": "Roadmap or timeline graphic",
      "speakerNotes": "Here's our journey through this unit..."
    },
    {
      "slideNumber": 6,
      "layout": "ContentSlide",
      "title": "Culminating Assessment",
      "bulletPoints": ["Project description", "Success criteria"],
      "visualSuggestion": "Project example or rubric image",
      "speakerNotes": "At the end of this unit, you will demonstrate your learning by..."
    }
  ]
}

Ensure there are at least 6-8 slides covering the entire unit overview. Make it engaging and age-appropriate for the grade level. Focus on student-facing language (not teacher jargon).`;

    const userPrompt = `Create a unit overview presentation for:
Unit Title: ${currentUnit.unitTitle}
Grade: ${grade}
Subject: ${subject}
Big Ideas: ${currentUnit.bigIdeas?.join(', ') || 'See unit plan'}
Essential Questions: ${currentUnit.essentialQuestions?.join(', ') || 'See unit plan'}
Key Vocabulary: ${currentUnit.vocabulary?.join(', ') || 'See unit plan'}
Number of Lessons: ${currentUnit.lessons?.length || '8-12'}
Culminating Assessment: ${currentUnit.culminatingAssessment?.title || 'Final project'}

Make it engaging, visual, and ready to project in class for the unit launch day.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentSlides(data);
    } catch (err) {
      console.error('Unit Slides Error:', err);
      alert('Failed to generate unit slides. Please try again.');
    } finally {
      setIsGeneratingSlides(false);
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
    const isUnit = item.plan?.isUnit;
    if (isUnit) {
      setMode('unit');
      setCurrentUnit(item.plan);
      setCurrentPlan(null);
    } else {
      setMode('lesson');
      setCurrentPlan(item.plan);
      setCurrentUnit(null);
      // Restore generated assets from saved history
      setCurrentWorksheet(item.worksheet || null);
      setCurrentLeveledTexts(item.leveledTexts || null);
      setCurrentSlides(item.slides || null);
    }
    setCurrentId(item.id);
    setTopic(item.topic);
    setGrade(item.grade);
    setSubject(item.subject);
    setStandard(item.standard);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id) => {
    persistHistory(history.filter(h => h.id !== id));
    if (currentId === id) { 
      setCurrentPlan(null); 
      setCurrentId(null); 
      setCurrentWorksheet(null);
      setCurrentLeveledTexts(null);
      setCurrentSlides(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Unlock Pro Features</h2>
              <p className="text-slate-500 text-sm">
                <span className="font-bold text-slate-700">{paywallFeature}</span> is a Pro feature.
                Upgrade to generate student materials, unit plans, and more.
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                "📋 Full Unit Plans (8-12 lessons)",
                "📄 Student Worksheets & Guided Notes",
                "📊 Leveled Reading Materials (3 Lexile levels)",
                "📝 Google Forms Quiz Export",
                "🎯 Danielson & Marzano Framework Alignment",
                "💾 Cloud Library (unlimited saves)",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-slate-400 mb-4">
              🔒 <span className="font-black text-slate-700">$9.99/month</span> · Cancel anytime · Secure via Stripe
            </div>
            {!googleUser && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800 flex items-center gap-2">
                <span>💡</span>
                <span><b>Tip:</b> Sign in with Google first so your subscription syncs across devices.</span>
              </div>
            )}
            <a
              href="/pricing"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-black text-sm block text-center hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro — $9.99/mo →
            </a>
            {!googleUser && (
              <button
                onClick={() => { setShowPaywall(false); login(); }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold mt-2 hover:bg-slate-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google first
              </button>
            )}
            <button
              onClick={() => setShowPaywall(false)}
              className="w-full text-slate-400 text-xs py-2 mt-2 hover:text-slate-600"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckIcon className="w-4 h-4" /> Saved to history
        </div>
      )}
      
      {exportToast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          exportToast.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <CheckIcon className="w-4 h-4" /> {exportToast.message}
        </div>
      )}

      {/* Nav */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 relative">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="text-2xl font-black tracking-tight">EduSpark AI</span>
          {isPro ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/customer-portal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId: 'demo_customer' }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch (err) {
                  console.error('Portal error:', err);
                }
              }}
              className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold ml-2 hover:opacity-90 transition-opacity"
            >
              PRO
            </button>
          ) : (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold ml-2">FREE {lessonCount}/3</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => { 
                setMode('lesson'); 
                // Don't clear currentUnit when switching to lesson mode - preserve unit for when user switches back
                // Reset to main lesson tab when switching back to lesson mode
                setLessonTab('lesson');
                // Keep current lesson, id, and assets when switching mode - preserve everything for quick switching
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                mode === 'lesson' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <DocumentTextIcon className="w-3.5 h-3.5" /> Single Lesson
            </button>
            <button
              onClick={() => { 
                setMode('unit'); 
                // Keep current lesson, id, and assets when switching mode - preserve everything for quick switching
                if (!isPro) { setPaywallFeature('Unit Plan'); setShowPaywall(true); } 
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                mode === 'unit' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Squares2X2Icon className="w-3.5 h-3.5" /> Unit Plan
              {!isPro && <span className="text-[9px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full font-black ml-1">PRO</span>}
            </button>
          </div>

          {/* Profile / Login */}
          {googleUser ? (
            <button
              onClick={() => setShowProfile(p => !p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                showProfile ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {googleUser.profile?.picture
                ? <img src={googleUser.profile.picture} alt="avatar" className="w-6 h-6 rounded-full" />
                : <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-[10px]">{(googleUser.profile?.name || 'U')[0]}</span>
              }
              {googleUser.profile?.name?.split(' ')[0] || 'Profile'}
            </button>
          ) : (
            <button
              onClick={() => login()}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          )}
          {!isPro && (
            <a href="/pricing" className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
              Upgrade to Pro →
            </a>
          )}

          {/* Profile Dropdown */}
          {showProfile && googleUser && (
            <div className="absolute right-8 top-16 w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 z-[100] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-black text-slate-800">{googleUser.profile?.name}</p>
                  <p className="text-xs text-slate-400">{googleUser.profile?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-red-600 font-bold">Logout</button>
                  <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Saved Plans</h4>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No saved plans yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <p className="font-bold text-sm text-slate-800 truncate">{item.plan?.isUnit ? (item.topic || item.plan?.unitTitle || 'Untitled Unit') : (item.plan?.topic || item.topic || 'Untitled Plan')}</p>
                        <p className="text-[10px] text-slate-400 mb-2">{item.plan?.isUnit ? 'Unit Plan' : 'Single Lesson'} · {item.subject} · {item.grade} · {new Date(item.savedAt).toLocaleDateString()}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { handleSelectHistory(item); setShowProfile(false); }} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg font-bold hover:bg-blue-100">View Plan</button>
                          <button className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">Slides</button>
                          <button className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">Worksheet</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
                {mode === 'unit' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Number of Lessons</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="15"
                        value={unitLessonCount}
                        onChange={(e) => setUnitLessonCount(Math.max(5, Math.min(15, parseInt(e.target.value) || 10)))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                      />
                      <span className="text-xs text-slate-500 whitespace-nowrap">lessons</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Range: 5-15 lessons</p>
                  </div>
                )}
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
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'lesson' ? handleGenerate() : handleGenerateUnit())}
                placeholder={mode === 'lesson' ? "Enter lesson topic (e.g., Solar System)..." : "Enter unit topic (e.g., Earth and Space)..."}
                className="flex-1 px-4 py-3 outline-none font-medium text-slate-800"
              />
              <button
                onClick={mode === 'lesson' ? handleGenerate : handleGenerateUnit} disabled={mode === 'unit' ? !isPro || isGenerating : isGenerating}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (mode === 'lesson' ? "Drafting Plan..." : "Creating Unit...") : (mode === 'lesson' ? "Generate Lesson ✨" : "Generate Unit 📚")}
              </button>

            </div>

            {/* Loading skeleton */}
            {isGenerating && (
              <div className="space-y-4">
                {/* Status message */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">AI Expert at Work</p>
                    <p className="text-sm font-medium text-blue-700 transition-all duration-500">{generatingStatus}</p>
                  </div>
                </div>
                {/* Skeleton cards */}
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Lesson Plan Display */}
            {currentPlan && !isGenerating && mode === 'lesson' && (
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
                    {googleUser && (
                      <button 
                        onClick={() => exportToGoogleDocs(currentPlan.topic, JSON.stringify(currentPlan, null, 2))}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Google Docs
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-8 bg-white flex gap-1">
                  {[
                    { id: 'lesson', label: '📄 Lesson Plan', icon: DocumentTextIcon },
                    { id: 'worksheet', label: '📝 Worksheet', icon: DocumentDuplicateIcon },
                    { id: 'leveled_texts', label: '📖 Leveled Texts', icon: BookOpenIcon },
                    { id: 'slides', label: '📊 Google Slides', icon: PresentationChartBarIcon },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setLessonTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                          lessonTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-10 md:p-16" ref={contentRef}>
                  {lessonTab === 'lesson' && (
                    <>
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
                        <ul className="space-y-3">
                          {currentPlan.misconceptions.map((m, i) => (
                            <li key={i} className="text-sm text-amber-900 leading-relaxed">
                              <div className="font-medium mb-1">
                                • Misconception: {typeof m === 'object' ? m.misconception : m}
                              </div>
                              {typeof m === 'object' && m.correction && (
                                <div className="text-amber-700 ml-4 text-xs">
                                  ✓ Correction: {m.correction}
                                </div>
                              )}
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
                    {currentPlan.assessment && (
                      <section className="pt-8 border-t-2 border-slate-100 border-dashed">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Assessment</h2>
                        {typeof currentPlan.assessment === 'object' ? (
                          <div className="space-y-4 max-w-2xl mx-auto">
                            {currentPlan.assessment.formative && (
                              <div className="bg-blue-50 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-blue-600 mb-2">Formative</h3>
                                <p className="text-sm text-slate-700">{currentPlan.assessment.formative}</p>
                              </div>
                            )}
                            {currentPlan.assessment.summative && (
                              <div className="bg-purple-50 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-purple-600 mb-2">Summative</h3>
                                <p className="text-sm text-slate-700">{currentPlan.assessment.summative}</p>
                              </div>
                            )}
                            {currentPlan.assessment.successCriteria && (
                              <div className="bg-emerald-50 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-emerald-600 mb-2">Success Criteria</h3>
                                <ul className="text-sm text-slate-700 space-y-1">
                                  {currentPlan.assessment.successCriteria.map((criteria, i) => (
                                    <li key={i}>✓ {criteria}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <EditableText
                            value={currentPlan.assessment}
                            onChange={val => updatePlan(p => ({ ...p, assessment: val }))}
                            multiline
                            className="font-medium text-slate-800 text-lg max-w-2xl mx-auto block"
                          />
                        )}
                      </section>
                    )}

                    {/* Danielson Framework Alignment */}
                    {currentPlan.danielsonAlignment && (
                      <section className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl text-white">
                        <h2 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckBadgeIcon className="w-4 h-4" /> Danielson Framework Alignment
                        </h2>
                        <p className="text-sm font-bold text-indigo-200 mb-3">{currentPlan.danielsonAlignment.domain}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentPlan.danielsonAlignment.components?.map((c, i) => (
                            <span key={i} className="text-[10px] bg-indigo-800 text-indigo-200 px-3 py-1 rounded-full font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-indigo-100 leading-relaxed">{currentPlan.danielsonAlignment.evidence}</p>
                        <div className="mt-4 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                          ✓ Ready for formal observation
                        </div>
                      </section>
                    )}

                    {/* Standard Codes callout */}
                    {currentPlan.standardCode && (
                      <section className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
                        <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckBadgeIcon className="w-4 h-4" /> Standards Alignment
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="font-mono text-sm font-black bg-emerald-600 text-white px-3 py-1 rounded-lg">
                            {currentPlan.standardCode}
                          </span>
                          {currentPlan.additionalStandards?.map((s, i) => (
                            <span key={i} className="font-mono text-sm font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                        {currentPlan.standardDescription && (
                          <p className="text-sm text-emerald-800 italic">{currentPlan.standardDescription}</p>
                        )}
                      </section>
                    )}
                      </div>
                    </>
                  )}

                  {lessonTab === 'worksheet' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Student Worksheet</h2>
                        <p className="text-slate-500">Ready for print or digital distribution</p>
                      </div>
                      {currentWorksheet ? (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl border border-emerald-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] bg-white/90 rounded-2xl p-4 flex flex-col justify-between">
                              <div>
                                <div className="w-3/4 h-4 bg-emerald-200 rounded mb-3"></div>
                                <div className="w-full h-2 bg-emerald-100 rounded mb-2"></div>
                                <div className="w-5/6 h-2 bg-emerald-100 rounded mb-2"></div>
                                <div className="w-2/3 h-2 bg-emerald-100 rounded"></div>
                              </div>
                              <div className="flex justify-end">
                                <div className="w-1/3 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Ready</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">{currentWorksheet.title}</h3>
                            <p className="text-slate-600 text-sm">Your custom worksheet has been generated successfully. Use the toolbar below to print or export.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> Ready for printing</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> Common Core aligned</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> Multiple question types</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { const el = worksheetRef.current; if (el) window.print(); }}
                                className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
                              >
                                Print Worksheet 🖨️
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl border border-emerald-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] bg-white/90 rounded-2xl p-4 flex flex-col justify-between">
                              <div>
                                <div className="w-3/4 h-4 bg-emerald-200 rounded mb-3"></div>
                                <div className="w-full h-2 bg-emerald-100 rounded mb-2"></div>
                                <div className="w-5/6 h-2 bg-emerald-100 rounded mb-2"></div>
                                <div className="w-2/3 h-2 bg-emerald-100 rounded"></div>
                              </div>
                              <div className="flex justify-end">
                                <div className="w-1/4 h-6 bg-emerald-500 rounded-lg"></div>
                              </div>
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">Professional Worksheet</h3>
                            <p className="text-slate-600 text-sm">Common Core aligned, ready-to-print worksheets with vocabulary, questions, and exit tickets.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> Includes answer key</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> Multiple question formats</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> One-click PDF export</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { if (!isPro) { setPaywallFeature('Worksheet'); setShowPaywall(true); } else handleGenerateWorksheet(); }} 
                                disabled={isGeneratingWorksheet}
                                className={`w-full px-8 py-4 rounded-2xl font-bold transition-colors shadow-md shadow-emerald-200 ${isGeneratingWorksheet ? 'bg-emerald-300 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                              >
                                {isGeneratingWorksheet ? (
                                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating...</span>
                                ) : (
                                  <span>Generate Worksheet 📝</span>
                                )}
                              </button>
                              {!isPro && <p className="text-xs text-center text-slate-400 mt-2">🔒 Pro feature</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {lessonTab === 'leveled_texts' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Leveled Texts</h2>
                        <p className="text-slate-500">Reading materials at 3 Lexile levels</p>
                      </div>
                      {currentLeveledTexts ? (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border border-blue-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 gap-3 w-[90%] h-[80%]">
                              {['Emerging', 'Proficient', 'Advanced'].map((lvl, i) => (
                                <div key={i} className="bg-white/90 rounded-xl p-2 flex flex-col">
                                  <div className={`text-[8px] font-black text-white px-1 rounded-full mb-2 text-center ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-red-500'}`}>{lvl.split(' ')[0]}</div>
                                  <div className="flex-1 space-y-1">
                                    <div className="w-full h-1 bg-blue-100 rounded"></div>
                                    <div className="w-3/4 h-1 bg-blue-100 rounded"></div>
                                    <div className="w-5/6 h-1 bg-blue-100 rounded"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">3 Differentiated Texts</h3>
                            <p className="text-slate-600 text-sm">Leveled reading texts are ready for your differentiated reading groups.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Ready to use</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Built-in comprehension questions</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Exact Lexile ranges</li>
                            </ul>
                            <div className="pt-4">
                              <p className="text-center text-slate-500 text-sm mb-2">Scroll down to view all levels</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border border-blue-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 gap-3 w-[90%] h-[80%]">
                              {['Emerging', 'Proficient', 'Advanced'].map((lvl, i) => (
                                <div key={i} className="bg-white/90 rounded-xl p-2 flex flex-col">
                                  <div className={`text-[8px] font-black text-white px-1 rounded-full mb-2 text-center ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-red-500'}`}>{lvl.split(' ')[0]}</div>
                                  <div className="flex-1 space-y-1">
                                    <div className="w-full h-1 bg-blue-100 rounded"></div>
                                    <div className="w-3/4 h-1 bg-blue-100 rounded"></div>
                                    <div className="w-5/6 h-1 bg-blue-100 rounded"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">Differentiated Reading</h3>
                            <p className="text-slate-600 text-sm">Three reading levels with Lexile ranges and comprehension questions to meet all your students' needs.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> 3 Lexile levels (400L - 1000L+)</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Built-in comprehension checks</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Ready for small group instruction</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { if (!isPro) { setPaywallFeature('Leveled Texts'); setShowPaywall(true); } else handleGenerateLeveledTexts(); }} 
                                disabled={isGeneratingLeveledTexts}
                                className={`w-full px-8 py-4 rounded-2xl font-bold transition-colors shadow-md shadow-blue-200 ${isGeneratingLeveledTexts ? 'bg-blue-300 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                              >
                                {isGeneratingLeveledTexts ? (
                                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating...</span>
                                ) : (
                                  <span>Generate Leveled Texts 📖</span>
                                )}
                              </button>
                              {!isPro && <p className="text-xs text-center text-slate-400 mt-2">🔒 Pro feature</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {lessonTab === 'slides' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Google Slides</h2>
                        <p className="text-slate-500">Unit slide deck generated in seconds</p>
                      </div>
                      {currentSlides ? (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border border-purple-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] space-y-2 flex flex-col">
                              <div className="bg-white/90 rounded-xl p-3 flex-1 flex flex-col justify-center">
                                <div className="w-2/3 h-3 bg-purple-200 rounded mx-auto mb-2"></div>
                                <div className="w-3/4 h-2 bg-purple-100 rounded mx-auto"></div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className="bg-white/90 h-10 rounded-lg"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">{currentSlides.presentationTitle}</h3>
                            <p className="text-slate-600 text-sm">Full slide deck generated. Copy to clipboard and paste directly into Google Slides.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> {currentSlides.slides?.length || 10} slides ready</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> Full speaker notes included</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> One-click copy to clipboard</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => {
                                  const slidesText = currentSlides.slides.map(s => 
                                    `Slide ${s.slideNumber}: ${s.title}\n${s.bulletPoints?.join('\n') || ''}\n\nSpeaker Notes: ${s.speakerNotes}`
                                  ).join('\n\n---\n\n');
                                  navigator.clipboard.writeText(slidesText);
                                  alert('Slides copied! Paste into Google Slides.');
                                }}
                                className="w-full bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                              >
                                Copy All Slides 📋
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          {/* Preview Card */}
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border border-purple-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] space-y-2 flex flex-col">
                              <div className="bg-white/90 rounded-xl p-3 flex-1 flex flex-col justify-center">
                                <div className="w-2/3 h-3 bg-purple-200 rounded mx-auto mb-2"></div>
                                <div className="w-3/4 h-2 bg-purple-100 rounded mx-auto"></div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className="bg-white/90 h-10 rounded-lg"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Action Area */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">Complete Slide Deck</h3>
                            <p className="text-slate-600 text-sm">Full lesson presentation with speaker notes, visuals, and discussion prompts ready to copy-paste into Google Slides.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> 10-15 slides per lesson</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> Full speaker notes for teachers</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-purple-500" /> One-click copy to clipboard</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { if (!isPro) { setPaywallFeature('Google Slides'); setShowPaywall(true); } else handleGenerateSlides(); }} 
                                disabled={isGeneratingSlides}
                                className={`w-full px-8 py-4 rounded-2xl font-bold transition-colors shadow-md shadow-purple-200 ${isGeneratingSlides ? 'bg-purple-300 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                              >
                                {isGeneratingSlides ? (
                                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating...</span>
                                ) : (
                                  <span>Generate Google Slides 📽️</span>
                                )}
                              </button>
                              {!isPro && <p className="text-xs text-center text-slate-400 mt-2">🔒 Pro feature</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

{/* Footer / Meta */}
            {currentPlan && !isGenerating && mode === 'lesson' && (
                <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xs">
                    <p>Designed for professional educators • AI EDU Studio</p>
                </div>
            )}
            
            {/* Worksheet Display */}
            {mode === 'lesson' && lessonTab === 'worksheet' && currentWorksheet && !isGeneratingWorksheet && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
                <div className="px-8 py-4 border-b bg-emerald-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                    📝 Student Worksheet
                  </span>
                  <button
                    onClick={() => { const el = worksheetRef.current; if (el) window.print(); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" /> Print Worksheet
                  </button>
                </div>
                <div className="p-8 md:p-12 space-y-8" ref={worksheetRef}>
                  <div className="text-center border-b-2 border-slate-900 pb-4">
                    <h2 className="text-2xl font-black text-slate-900">{currentWorksheet.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">Name: _________________________ Date: _____________ Period: _____</p>
                  </div>
                  {currentWorksheet.sections?.map((section, si) => (
                    <div key={si} className="space-y-4">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest border-b border-slate-200 pb-2">
                        {String.fromCharCode(65 + si)}. {section.title}
                      </h3>
                      {section.type === 'vocabulary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.items?.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <span className="font-bold text-blue-700 min-w-[120px]">{item.word}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-slate-300 text-sm">{item.definition.replace(/./g, '_').substring(0, 30)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.type === 'fill_blank' && (
                        <div className="space-y-4">
                          {section.sentences?.map((item, i) => (
                            <p key={i} className="text-slate-700">{i + 1}. {item.text}</p>
                          ))}
                        </div>
                      )}
                      {(section.type === 'comprehension' || section.type === 'short_answer') && (
                        <div className="space-y-6">
                          {section.questions?.map((item, i) => (
                            <div key={i}>
                              <p className="font-medium text-slate-700 mb-2">{i + 1}. {typeof item === 'string' ? item : item.question}</p>
                              <div className="space-y-2">
                                {Array.from({ length: typeof item === 'object' ? item.lines : 3 }).map((_, li) => (
                                  <div key={li} className="border-b border-slate-300 h-7" />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.type === 'exit_ticket' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                          <p className="font-medium text-amber-800 mb-4">🎟️ {section.prompt}</p>
                          <div className="space-y-2">
                            {Array.from({ length: section.lines || 3 }).map((_, li) => (
                              <div key={li} className="border-b border-amber-300 h-7" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leveled Texts Display */}
            {mode === 'lesson' && lessonTab === 'leveled_texts' && currentLeveledTexts && !isGeneratingLeveledTexts && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
                <div className="px-8 py-4 border-b bg-blue-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                    📚 Leveled Reading Texts — {currentLeveledTexts.topic}
                  </span>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentLeveledTexts.levels?.map((level, i) => {
                      const colorMap = {
                        green: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', text: 'text-emerald-800', q: 'bg-emerald-100' },
                        yellow: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', text: 'text-amber-800', q: 'bg-amber-100' },
                        red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600', text: 'text-red-800', q: 'bg-red-100' },
                      };
                      const c = colorMap[level.color] || colorMap.yellow;
                      return (
                        <div key={i} className={`${c.bg} ${c.border} border-2 rounded-2xl p-5 flex flex-col`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`${c.badge} text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase`}>
                              {level.emoji} {level.level}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{level.lexile}</span>
                          </div>
                          <p className={`text-sm ${c.text} leading-relaxed mb-4 flex-1`}>{level.text}</p>
                          <div className={`${c.q} rounded-xl p-4 space-y-2`}>
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Comprehension Questions</p>
                            {level.questions?.map((q, qi) => (
                              <p key={qi} className="text-xs text-slate-700">{qi + 1}. {q}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Slides Display */}
            {mode === 'lesson' && lessonTab === 'slides' && currentSlides && !isGeneratingSlides && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
                <div className="px-8 py-4 border-b bg-purple-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
                    📽️ Google Slides — {currentSlides.presentationTitle}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { const el = slidesRef.current; if (el) window.print(); }}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                    >
                      Print Slides
                    </button>
                    <button
                      onClick={() => {
                        const slidesText = currentSlides.slides.map(s => 
                          `Slide ${s.slideNumber}: ${s.title}\n${s.bulletPoints?.join('\n') || ''}\n\nSpeaker Notes: ${s.speakerNotes}`
                        ).join('\n\n---\n\n');
                        navigator.clipboard.writeText(slidesText);
                        alert('Slides copied! Paste into Google Slides.');
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700"
                    >
                      Copy All
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-6" ref={slidesRef}>
                  <p className="text-sm text-slate-500 mb-4">Estimated Duration: {currentSlides.estimatedDuration}</p>
                  {currentSlides.slides?.map((slide, i) => (
                    <div key={i} className="border-2 border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-700 font-black">{slide.slideNumber}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900 mb-2">{slide.title}</h3>
                          {slide.subtitle && <p className="text-slate-500 text-sm mb-3">{slide.subtitle}</p>}
                          {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                            <ul className="space-y-2 mb-4">
                              {slide.bulletPoints.map((bp, bi) => (
                                <li key={bi} className="text-slate-700 text-sm flex items-start gap-2">
                                  <span className="text-purple-500 mt-1">•</span>{bp}
                                </li>
                              ))}
                            </ul>
                          )}
                          {slide.visualSuggestion && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                              <p className="text-xs text-blue-600">🖼️ Visual: {slide.visualSuggestion}</p>
                            </div>
                          )}
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Speaker Notes</p>
                            <p className="text-sm text-amber-800 italic">"{slide.speakerNotes}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Plan Display */}
            {currentUnit && !isGenerating && mode === 'unit' && (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-20">
                {/* Toolbar */}
                <div className="px-8 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Squares2X2Icon className="w-4 h-4" /> Unit Plan
                    <span className="text-emerald-500 flex items-center gap-1 ml-2">
                      <PencilSquareIcon className="w-3 h-3" /> Editable
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCurrentPlan({...currentUnit, isUnit: true}, currentId)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <CheckIcon className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={handlePrint} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2">
                      <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
                    </button>
                    {googleUser && (
                      <button 
                        onClick={() => exportToGoogleDocs(currentUnit.unitTitle, JSON.stringify(currentUnit, null, 2))}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Google Docs
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!isPro) { setPaywallFeature('Google Slides Generator'); setShowPaywall(true); return; }
                        handleGenerateUnitSlides();
                      }}
                      disabled={!isPro || isGeneratingSlides}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${isPro ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'}`}
                    >
                      {isGeneratingSlides ? (
                        <><span className="animate-spin">⏳</span> Generating...</>
                      ) : (
                        <>{isPro ? '📽️' : '🔒'} Slides {!isPro && <span className="text-[9px] bg-amber-400 text-amber-900 px-1 py-0.5 rounded-full font-black ml-1">PRO</span>}</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-10 md:p-16" ref={contentRef}>
                  {/* Unit Title */}
                  <div className="mb-10 pb-8 border-b-2 border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 block mb-4">{currentUnit.unitTitle}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{subject}</span>
                      <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{grade}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">{currentUnit.duration || '2-3 weeks'}</span>
                    </div>
                    {currentUnit.standards && currentUnit.standards.map((std, i) => (
                      <div key={i} className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg mr-2">
                        <BookmarkIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-800">{std}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-10">
                    {/* Big Ideas */}
                    {currentUnit.bigIdeas && (
                      <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <LightBulbIcon className="w-5 h-5"/> Big Ideas
                        </h2>
                        <ul className="space-y-2">
                          {currentUnit.bigIdeas.map((idea, i) => (
                            <li key={i} className="text-slate-700 font-medium">• {idea}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Essential Questions */}
                    {currentUnit.essentialQuestions && (
                      <section>
                        <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <ChatBubbleLeftRightIcon className="w-5 h-5"/> Essential Questions
                        </h2>
                        <ul className="space-y-2">
                          {currentUnit.essentialQuestions.map((q, i) => (
                            <li key={i} className="text-sm font-medium text-slate-700 bg-orange-50/50 p-3 rounded-xl border border-orange-100">{q}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Vocabulary */}
                    {currentUnit.vocabulary && (
                      <section>
                        <h2 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <BookOpenIcon className="w-5 h-5"/> Key Vocabulary
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {currentUnit.vocabulary.map((term, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100">{term}</span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Lessons Timeline */}
                    {currentUnit.lessons && (
                      <section>
                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                          <ClockIcon className="w-5 h-5"/> Lesson Sequence ({currentUnit.lessons.length} Lessons)
                        </h2>
                        <div className="space-y-4">
                          {currentUnit.lessons.map((lesson, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {lesson.lessonNumber}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-slate-800 mb-1">{lesson.title}</h3>
                                  <p className="text-xs text-slate-500 mb-2">{lesson.duration} • {lesson.objective?.substring(0, 100)}...</p>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {lesson.keyActivities?.map((activity, j) => (
                                      <span key={j} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">{activity}</span>
                                    ))}
                                  </div>
                                  {lesson.homework && (
                                    <p className="text-xs text-slate-400">📝 {lesson.homework}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Culminating Assessment */}
                    {currentUnit.culminatingAssessment && (
                      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
                        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                          <AcademicCapIcon className="w-6 h-6"/> Culminating Assessment
                        </h2>
                        <h3 className="font-bold text-lg mb-2">{currentUnit.culminatingAssessment.title}</h3>
                        <p className="text-blue-100 mb-4">{currentUnit.culminatingAssessment.description}</p>
                        {currentUnit.culminatingAssessment.rubric && (
                          <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-xs font-bold uppercase mb-2">Rubric</p>
                            <ul className="space-y-1 text-sm">
                              {currentUnit.culminatingAssessment.rubric.map((criteria, i) => (
                                <li key={i}>• {criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Differentiation */}
                    {currentUnit.differentiation && (
                      <section className="p-8 bg-slate-900 rounded-2xl text-slate-300">
                        <h2 className="text-white font-bold mb-6 flex items-center gap-2 text-xl">
                          <PuzzlePieceIcon className="w-6 h-6 text-indigo-400"/> Differentiation Strategies
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          {Object.entries(currentUnit.differentiation).map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-[11px] text-indigo-300 font-black mb-2 uppercase">
                                {key === 'approaching' ? '🟢 Approaching' : key === 'advanced' ? '🔴 Advanced' : key === 'ell' ? '🌐 ELL Support' : '🟡 On-Level'}
                              </h4>
                              <p className="leading-relaxed">{value}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!currentPlan && !currentUnit && !isGenerating && (
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
