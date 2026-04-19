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
  DocumentDuplicateIcon, PresentationChartBarIcon,
  TicketIcon, ClipboardDocumentCheckIcon
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
          <p className="font-bold text-sm text-slate-800 truncate pr-6">
            {item.plan?.isUnit 
              ? (item.topic || item.plan?.unitTitle || 'Unit Plan') 
              : (item.plan?.topic || item.topic || 'Lesson Plan')
            }
          </p>
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
  const [mode, setMode] = useState('lesson'); // 'lesson' | 'unit'
  // Separate input state for lesson and unit to preserve input when switching mode
  const [lessonInput, setLessonInput] = useState({
    topic: '',
    grade: 'Grade 5',
    standard: 'Common Core (CCSS)',
    subject: 'Science',
  });
  const [unitInput, setUnitInput] = useState({
    topic: '',
    grade: 'Grade 5',
    standard: 'Common Core (CCSS)',
    subject: 'Science',
  });
  const [unitLessonCount, setUnitLessonCount] = useState(10); // User-defined lesson count for unit
  
  // Current input based on mode
  const topic = mode === 'lesson' ? lessonInput.topic : unitInput.topic;
  const grade = mode === 'lesson' ? lessonInput.grade : unitInput.grade;
  const standard = mode === 'lesson' ? lessonInput.standard : unitInput.standard;
  const subject = mode === 'lesson' ? lessonInput.subject : unitInput.subject;
  
  const setTopic = (newTopic) => {
    if (mode === 'lesson') {
      setLessonInput(prev => ({ ...prev, topic: newTopic }));
    } else {
      setUnitInput(prev => ({ ...prev, topic: newTopic }));
    }
  };
  const setGrade = (newGrade) => {
    if (mode === 'lesson') {
      setLessonInput(prev => ({ ...prev, grade: newGrade }));
    } else {
      setUnitInput(prev => ({ ...prev, grade: newGrade }));
    }
  };
  const setStandard = (newStandard) => {
    if (mode === 'lesson') {
      setLessonInput(prev => ({ ...prev, standard: newStandard }));
    } else {
      setUnitInput(prev => ({ ...prev, standard: newStandard }));
    }
  };
  const SUBJECT_STANDARDS = {
    'Science': ['Next Gen Science (NGSS)', 'TEKS Science (Texas)', 'Virginia SOL Science', 'Florida NGSSS Science'],
    'Math': ['Common Core Math (CCSS)', 'TEKS Math (Texas)', 'Virginia SOL Math', 'Florida NGSSS Math'],
    'English Language Arts': ['Common Core ELA (CCSS)', 'TEKS ELA (Texas)', 'Virginia SOL ELA', 'Florida NGSSS ELA'],
    'Social Studies': ['C3 Framework', 'TEKS Social Studies (Texas)', 'Virginia SOL Social Studies', 'Florida NGSSS Social Studies'],
    'History': ['C3 Framework', 'TEKS History (Texas)', 'Virginia SOL History', 'AP History Standards'],
    'Art': ['National Core Arts Standards', 'TEKS Art (Texas)', 'State Arts Standards'],
    'Physical Education': ['SHAPE America Standards', 'TEKS PE (Texas)', 'State PE Standards'],
  };

  const setSubject = (newSubject) => {
    const defaultStandard = SUBJECT_STANDARDS[newSubject]?.[0] || 'Common Core (CCSS)';
    if (mode === 'lesson') {
      setLessonInput(prev => ({ ...prev, subject: newSubject, standard: defaultStandard }));
    } else {
      setUnitInput(prev => ({ ...prev, subject: newSubject, standard: defaultStandard }));
    }
  };
  
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [exportToast, setExportToast] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [isPro, setIsPro] = useState(false); // Default: free tier
  const [lessonCount, setLessonCount] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);
  const [lessonTab, setLessonTab] = useState('lesson');
  const [currentWorksheet, setCurrentWorksheet] = useState(null);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [currentLeveledTexts, setCurrentLeveledTexts] = useState(null);
  const [isGeneratingLeveledTexts, setIsGeneratingLeveledTexts] = useState(false);
  const [currentSlides, setCurrentSlides] = useState(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Exit Ticket & Rubric states
  const [currentExitTicket, setCurrentExitTicket] = useState(null);
  const [isGeneratingExitTicket, setIsGeneratingExitTicket] = useState(false);
  const [currentRubric, setCurrentRubric] = useState(null);
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  
  // Differentiation & Accommodations options
  const [includeIEP, setIncludeIEP] = useState(false);
  const [includeELL, setIncludeELL] = useState(false);

  const PRO_WHITELIST = ['joanjiaocn@gmail.com'];

  const contentRef = useRef(null);
  const worksheetRef = useRef(null);
  const slidesRef = useRef(null);
  const exitTicketRef = useRef(null);
  const rubricRef = useRef(null);

  // Restore Google login from localStorage on page load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eduspark_google_user');
      if (saved) {
        const user = JSON.parse(saved);
        // access_token expires in ~1h, check expiry
        if (user.expires_at && Date.now() < user.expires_at) {
          setGoogleUser(user);
          if (user.profile?.id) {
            const savedPro = localStorage.getItem(`eduspark_pro_${user.profile.id}`);
            if (savedPro) {
              const { active } = JSON.parse(savedPro);
              if (active) setIsPro(true);
            }
          }
        } else {
          localStorage.removeItem('eduspark_google_user');
        }
      }
    } catch (e) {}
  }, []);

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
        const userWithProfile = { ...tokenResponse, profile, expires_at: Date.now() + 3500 * 1000 };
        setGoogleUser(userWithProfile);
        try { localStorage.setItem('eduspark_google_user', JSON.stringify(userWithProfile)); } catch (e) {}

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
    localStorage.removeItem('eduspark_google_user');
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
      let textContent;
      if (typeof content === 'object') {
        // 根据内容类型选择格式化函数
        if (content.type === 'exit_ticket' || content.questions) {
          textContent = formatExitTicketForExport(content);
        } else if (content.type === 'rubric' || content.criteria) {
          textContent = formatRubricForExport(content);
        } else {
          textContent = formatLessonPlanForExport(content);
        }
      } else {
        textContent = content;
      }

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

  // 格式化教案为纯文本（支持 Lesson Plan 和 Unit Plan）
  const formatLessonPlanForExport = (plan) => {
    // 检测是否为 Unit Plan
    const isUnit = plan.isUnit || plan.unitTitle || (plan.lessons && plan.lessons.length > 0);
    
    if (isUnit) {
      return formatUnitPlanForExport(plan);
    }
    
    return formatSingleLessonForExport(plan);
  };

  // 格式化单节课教案
  const formatSingleLessonForExport = (plan) => {
    let text = '';
    
    text += `${plan.topic || 'Lesson Plan'}\n`;
    text += `${'='.repeat(plan.topic?.length || 20)}\n\n`;
    
    if (plan.objective) {
      text += `OBJECTIVE\n${plan.objective}\n\n`;
    }
    
    if (plan.standardCode) {
      text += `STANDARD\n${plan.standardCode}\n`;
      if (plan.standardDescription) {
        text += `${plan.standardDescription}\n`;
      }
      text += `\n`;
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

  // 格式化单元教案（新增）
  const formatUnitPlanForExport = (unit) => {
    let text = '';
    
    // 标题
    text += `${unit.unitTitle || 'Unit Plan'}\n`;
    text += `${'='.repeat(unit.unitTitle?.length || 20)}\n\n`;
    
    // 基本信息
    if (unit.duration) {
      text += `DURATION: ${unit.duration}\n\n`;
    }
    
    // Big Ideas
    if (unit.bigIdeas?.length) {
      text += `BIG IDEAS\n`;
      unit.bigIdeas.forEach((idea, i) => {
        text += `${i + 1}. ${idea}\n`;
      });
      text += '\n';
    }
    
    // Essential Questions
    if (unit.essentialQuestions?.length) {
      text += `ESSENTIAL QUESTIONS\n`;
      unit.essentialQuestions.forEach((q, i) => {
        text += `${i + 1}. ${q}\n`;
      });
      text += '\n';
    }
    
    // Standards
    if (unit.standards?.length) {
      text += `STANDARDS\n`;
      unit.standards.forEach(s => {
        text += `• ${s}\n`;
      });
      text += '\n';
    }
    
    // Vocabulary
    if (unit.vocabulary?.length) {
      text += `VOCABULARY\n`;
      unit.vocabulary.forEach(v => {
        text += `• ${v}\n`;
      });
      text += '\n';
    }
    
    // Materials
    if (unit.materials?.length) {
      text += `MATERIALS\n`;
      unit.materials.forEach(m => {
        text += `• ${m}\n`;
      });
      text += '\n';
    }
    
    // Culminating Assessment
    if (unit.culminatingAssessment) {
      text += `CULMINATING ASSESSMENT\n`;
      text += `${'-'.repeat(40)}\n`;
      text += `Title: ${unit.culminatingAssessment.title}\n\n`;
      text += `Description:\n${unit.culminatingAssessment.description}\n\n`;
      if (unit.culminatingAssessment.rubric?.length) {
        text += `Rubric:\n`;
        unit.culminatingAssessment.rubric.forEach(r => {
          text += `• ${r}\n`;
        });
        text += '\n';
      }
    }
    
    // Lessons 概览
    if (unit.lessons?.length) {
      text += `LESSON SEQUENCE\n`;
      text += `${'-'.repeat(40)}\n\n`;
      
      unit.lessons.forEach((lesson, i) => {
        text += `Lesson ${lesson.lessonNumber || i + 1}: ${lesson.title}\n`;
        text += `Duration: ${lesson.duration || '45 min'}\n`;
        text += `Objective: ${lesson.objective}\n`;
        if (lesson.keyActivities?.length) {
          text += `Key Activities:\n`;
          lesson.keyActivities.forEach(activity => {
            text += `  - ${activity}\n`;
          });
        }
        if (lesson.homework) {
          text += `Homework: ${lesson.homework}\n`;
        }
        text += '\n';
      });
    }
    
    // Differentiation
    if (unit.differentiation) {
      text += `DIFFERENTIATION\n`;
      text += `${'-'.repeat(40)}\n`;
      Object.entries(unit.differentiation).forEach(([key, value]) => {
        text += `${key.toUpperCase()}: ${value}\n\n`;
      });
    }
    
    text += `\nGenerated by EduSpark AI`;
    
    return text;
  };

  // 格式化 Exit Ticket 为纯文本导出
  const formatExitTicketForExport = (exitTicket) => {
    let text = '';
    
    text += `${exitTicket.title || 'Exit Ticket'}\n`;
    text += `${'='.repeat(exitTicket.title?.length || 20)}\n\n`;
    
    if (exitTicket.objective) {
      text += `OBJECTIVE: ${exitTicket.objective}\n\n`;
    }
    if (exitTicket.timeLimit) {
      text += `TIME LIMIT: ${exitTicket.timeLimit} minutes\n\n`;
    }
    
    text += `QUESTIONS\n`;
    text += `${'-'.repeat(40)}\n\n`;
    
    exitTicket.questions.forEach((q, i) => {
      const num = i + 1;
      
      // 题目编号 + 问题文本
      text += `${num}. ${q.questionText}\n`;
      
      // 根据题型显示选项
      if (q.type === 'multiple_choice' && q.options?.length) {
        q.options.forEach((opt, j) => {
          const letter = String.fromCharCode(65 + j);
          text += `   ${letter}) ${opt}\n`;
        });
      } else if (q.type === 'true_false') {
        text += `   ▢ True    ▢ False\n`;
      } else if (q.type === 'short_answer') {
        text += `   _________________________________________________\n\n`;
      }
      
      // Bloom's Level
      if (q.bloomsLevel) {
        text += `   Bloom's Level: ${q.bloomsLevel}\n`;
      }
      text += `\n`;
    });
    
    // Answer Key
    if (exitTicket.answerKey && exitTicket.answerKey.length > 0) {
      text += `\nANSWER KEY\n`;
      text += `${'-'.repeat(40)}\n\n`;
      
      exitTicket.answerKey.forEach((ans, i) => {
        const num = i + 1;
        text += `${num}. ${ans}\n`;
      });
      text += `\n`;
    }
    
    text += `\nGenerated by EduSpark AI`;
    
    return text;
  };

  // 格式化 Grading Rubric 为纯文本导出
  const formatRubricForExport = (rubric) => {
    let text = '';
    
    text += `${rubric.title || 'Grading Rubric'}\n`;
    text += `${'='.repeat(rubric.title?.length || 20)}\n\n`;
    
    if (rubric.taskDescription) {
      text += `${rubric.taskDescription}\n\n`;
    }
    
    // 评分等级说明
    text += `SCORING SCALE (4 Points)\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `4 (100%) - Exceeds Expectations\n`;
    text += `3 (85%)  - Meets Expectations\n`;
    text += `2 (70%)  - Approaching Expectations\n`;
    text += `1 (55%)  - Below Expectations\n\n`;
    
    // 评分标准
    text += `CRITERIA\n`;
    text += `${'-'.repeat(40)}\n\n`;
    
    // 表头
    text += `| Criterion | Weight | Exceeds (4) | Meets (3) | Approaching (2) | Below (1) |\n`;
    text += `|-----------|--------|-------------|-----------|-----------------|-----------|\n`;
    
    rubric.criteria.forEach(c => {
      const name = c.name || '';
      const weight = c.weight ? `${c.weight}%` : '';
      const exceeds = c.descriptors?.exceeds || '';
      const meets = c.descriptors?.meets || '';
      const approaching = c.descriptors?.approaching || '';
      const below = c.descriptors?.below || '';
      
      text += `| ${name} | ${weight} | ${exceeds} | ${meets} | ${approaching} | ${below} |\n`;
    });
    
    text += `\n`;
    
    if (rubric.standardsAlignment?.length) {
      text += `STANDARDS ALIGNMENT\n`;
      text += `${'-'.repeat(40)}\n`;
      rubric.standardsAlignment.forEach(s => {
        text += `• ${s}\n`;
      });
      text += `\n`;
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
${includeIEP ? '- INCLUDE IEP ACCOMMODATIONS: Generate specific accommodations for ADHD, dyslexia, and below-grade-level learners. Include modified activities, reduced workload options, and sensory supports.' : ''}
${includeELL ? '- INCLUDE ELL LANGUAGE SCAFFOLDS (WIDA): Provide vocabulary list with definitions, sentence frames for academic discussion, and visual supports for English Language Learners at various proficiency levels.' : ''}

Return a JSON object with this exact structure:
{
  "topic": "Engaging, creative lesson title",
  "standardCode": "EXACT standard code e.g. CCSS.ELA-LITERACY.RI.5.3 or CCSS.Math.Content.4.OA.A.1 or NGSS 5-PS1-1",
  "standardDescription": "One sentence: how this lesson specifically addresses this standard. MUST explicitly state WHICH specific lesson activity/assessment directly implements this standard (e.g., 'Students demonstrate this standard during the We Do phase when they analyze primary sources in pairs' or 'The exit ticket assesses this standard by requiring students to explain cause-and-effect relationships'). This helps teachers show principals/administrators exactly where in the lesson the standard is being met.",
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
    "approaching": "Specific scaffold for struggling learners - sentence starters, graphic organizers, chunked assignments",
    "onLevel": "Standard support for grade-level learners",
    "advanced": "Extension for gifted/high-achieving students - deeper analysis, creative application",
    "ell": "Specific ELL strategies - sentence frames, visuals, native language support, vocabulary pre-teaching",
    "iep": "Specific IEP accommodations - modified assignments, sensory breaks, preferential seating, assistive technology, reduced distractions"
  },
  "ellScaffolds": {
    "vocabularyList": ["word1: definition", "word2: definition", "word3: definition"],
    "sentenceFrames": ["I think _____ because _____", "The evidence shows that _____", "I agree/disagree with _____"],
    "visualSupports": "Description of visual aids to support comprehension",
    "widaLevel": "Entering/Emerging/Developing/Expanding/Bridging"
  },
  "iepAccommodations": {
    "adhd": "Specific supports for ADHD students - movement breaks, fidget tools, chunked instructions",
    "dyslexia": "Specific supports for dyslexia - text-to-speech, extended time, color overlays",
    "belowGradeLevel": "Modified assignments with reduced workload and simplified language"
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

  // Generate Exit Ticket
  const handleGenerateExitTicket = async () => {
    if (!currentPlan) return;
    setIsGeneratingExitTicket(true);
    setCurrentExitTicket(null);

    const systemPrompt = `You are an expert assessment designer. Create a concise, effective exit ticket (3-5 questions) that checks student understanding of the lesson.

Return ONLY valid JSON (no markdown fences) in this exact structure:
{
  "title": "Exit Ticket: [Lesson Topic]",
  "objective": "Quick check for understanding",
  "timeLimit": "3-5 minutes",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A",
      "bloomsLevel": "Remember/Understand/Apply/Analyze"
    },
    {
      "type": "short_answer",
      "question": "Question text?",
      "lines": 3,
      "bloomsLevel": "Apply/Analyze"
    },
    {
      "type": "true_false",
      "question": "Statement to evaluate",
      "correctAnswer": true,
      "bloomsLevel": "Understand"
    }
  ],
  "answerKey": {
    "1": "Answer explanation",
    "2": "Answer explanation",
    "3": "Answer explanation"
  }
}

Include 3-5 questions covering different Bloom's levels. Mix question types for variety. Keep questions concise and focused on the core learning objective.`;

    const userPrompt = `Create an exit ticket for this lesson:
Topic: ${currentPlan.topic}
Grade: ${grade}
Subject: ${subject}
Objective: ${currentPlan.objective}
Key concepts: ${currentPlan.essentialQuestions?.join(', ') || currentPlan.objective}

Design questions that quickly assess whether students achieved the learning objective.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentExitTicket(data);
    } catch (err) {
      console.error('Exit Ticket Error:', err);
      alert('Failed to generate exit ticket. Please try again.');
    } finally {
      setIsGeneratingExitTicket(false);
    }
  };

  // Generate Grading Rubric
  const handleGenerateRubric = async () => {
    if (!currentPlan) return;
    setIsGeneratingRubric(true);
    setCurrentRubric(null);

    const systemPrompt = `You are an expert in standards-based grading and assessment design. Create a detailed 4-point rubric for the lesson's main assessment.

Return ONLY valid JSON (no markdown fences) in this exact structure:
{
  "title": "Rubric: [Assessment Name]",
  "taskDescription": "Brief description of what students are being assessed on",
  "criteria": [
    {
      "name": "Criterion Name (e.g., Content Knowledge, Critical Thinking, Communication)",
      "weight": "25%",
      "levels": {
        "4": {
          "label": "Exceeds Standard",
          "description": "Detailed description of exceeding performance",
          "points": "100%"
        },
        "3": {
          "label": "Meets Standard",
          "description": "Detailed description of meeting standard",
          "points": "85%"
        },
        "2": {
          "label": "Approaching Standard",
          "description": "Detailed description of approaching performance",
          "points": "70%"
        },
        "1": {
          "label": "Below Standard",
          "description": "Detailed description of below standard performance",
          "points": "55%"
        }
      }
    }
  ],
  "totalPoints": 100,
  "standardsAlignment": ["Specific standard code this rubric assesses"]
}

Include 3-5 criteria that align with the lesson objective and standards. Make descriptions specific and observable.`;

    const userPrompt = `Create a grading rubric for this lesson:
Topic: ${currentPlan.topic}
Grade: ${grade}
Subject: ${subject}
Objective: ${currentPlan.objective}
Standard: ${currentPlan.standardCode}
Assessment type: ${currentPlan.assessment?.summative || 'Lesson assessment'}

Design a rubric that teachers can use to consistently and fairly grade student work.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCurrentRubric(data);
    } catch (err) {
      console.error('Rubric Error:', err);
      alert('Failed to generate rubric. Please try again.');
    } finally {
      setIsGeneratingRubric(false);
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
    // Input is automatically synced via mode-based getters, setTopic will route to correct input
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
      {/* IEP/ELL Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setShowUpsell(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-black px-3 py-1.5 rounded-full mb-3">
                <SparklesIcon className="w-3.5 h-3.5" /> PRO FEATURE
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-2">Unlock IEP &amp; ELL Supports</h2>
              <p className="text-sm text-slate-500 mt-1">See what Pro generates vs. the basic plan</p>
            </div>
            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Free Plan</p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> IEP accommodations</li>
                  <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> ELL scaffolds</li>
                  <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> WIDA-aligned frames</li>
                  <li className="flex items-center gap-2"><span className="text-slate-300">✗</span> Differentiated tasks</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic lesson plan</li>
                </ul>
              </div>
              <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-300 relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full">PRO</span>
                <p className="text-[10px] font-black text-purple-600 uppercase mb-3">Pro Plan</p>
                <ul className="space-y-2 text-xs text-purple-800">
                  <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> IEP: ADHD, dyslexia, below-level</li>
                  <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> ELL vocabulary + sentence frames</li>
                  <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> WIDA levels 1–5 scaffolds</li>
                  <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> Tiered differentiated tasks</li>
                  <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> Everything in Free</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => { setShowUpsell(false); setPaywallFeature('IEP/ELL'); setShowPaywall(true); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-black text-sm hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-200 transition-all"
            >
              Upgrade to Pro — Unlock All Features ✨
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3">Cancel anytime · Used by 2,000+ teachers</p>
          </div>
        </div>
      )}

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
                Google
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
              Google
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
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Standards</label>
                  <select value={standard} onChange={(e) => setStandard(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    {(SUBJECT_STANDARDS[subject] || ['Common Core (CCSS)', 'Next Gen Science (NGSS)', 'TEKS (Texas)', 'Virginia SOL', 'Florida NGSSS']).map(s => (
                      <option key={s}>{s}</option>
                    ))}
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
                
                {/* Differentiation & Accommodations */}
                <div className="bg-purple-50 rounded-2xl border-2 border-purple-200 shadow-sm p-4">
                  <p className="text-[9px] text-purple-600 font-black uppercase mb-3 flex items-center gap-1.5">
                    <span className="inline-flex items-center bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">AI</span>
                    Differentiation & Accommodations
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={includeIEP}
                        onChange={(e) => {
                          if (!isPro && e.target.checked) { setShowUpsell(true); return; }
                          setIncludeIEP(e.target.checked);
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-purple-800 block group-hover:text-purple-900">IEP Accommodations</span>
                        <span className="text-[10px] text-purple-600">Generate specific supports for ADHD, dyslexia, below-grade-level learners</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={includeELL}
                        onChange={(e) => {
                          if (!isPro && e.target.checked) { setShowUpsell(true); return; }
                          setIncludeELL(e.target.checked);
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-purple-800 block group-hover:text-purple-900">ELL Language Scaffolds (WIDA)</span>
                        <span className="text-[10px] text-purple-600">Vocabulary list + sentence frames for English Language Learners</span>
                      </div>
                    </label>
                  </div>
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
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
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
                    {googleUser && (
                      <button 
                        onClick={() => exportToGoogleDocs(currentPlan.topic, currentPlan)}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:from-blue-600 hover:to-blue-800 shadow-md flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Google Docs
                      </button>
                    )}
                    <button onClick={handlePrint} className="border border-slate-300 text-slate-600 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-2">
                      <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
                    </button>
                    <button
                      onClick={() => saveCurrentPlan(currentPlan, currentId)}
                      className="border border-emerald-300 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <CheckIcon className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-8 bg-white flex gap-1">
                  {[
                    { id: 'lesson', label: '📄 Lesson Plan', icon: DocumentTextIcon },
                    { id: 'worksheet', label: '📝 Worksheet', icon: DocumentDuplicateIcon },
                    { id: 'leveled_texts', label: '📖 Leveled Texts', icon: BookOpenIcon },
                    { id: 'slides', label: '📊 Google Slides', icon: PresentationChartBarIcon },
                    { id: 'exit_ticket', label: '🎟️ Exit Ticket', icon: TicketIcon },
                    { id: 'rubric', label: '📋 Rubric', icon: ClipboardDocumentCheckIcon },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setLessonTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 my-2 text-xs font-bold rounded-full transition-all ${
                          lessonTab === tab.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
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

                    {/* ELL Language Scaffolds (WIDA) */}
                    {currentPlan.ellScaffolds && (
                      <section className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200">
                        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BookOpenIcon className="w-4 h-4" /> ELL Language Scaffolds (WIDA)
                          {currentPlan.ellScaffolds.widaLevel && (
                            <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px]">
                              {currentPlan.ellScaffolds.widaLevel}
                            </span>
                          )}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Vocabulary List */}
                          {currentPlan.ellScaffolds.vocabularyList && (
                            <div className="bg-white rounded-2xl p-5 border border-blue-100">
                              <h3 className="text-xs font-bold text-blue-700 mb-3 uppercase">Key Vocabulary</h3>
                              <ul className="space-y-2">
                                {currentPlan.ellScaffolds.vocabularyList.map((word, i) => (
                                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <EditableText
                                      value={word}
                                      onChange={val => updatePlan(p => ({
                                        ...p,
                                        ellScaffolds: {
                                          ...p.ellScaffolds,
                                          vocabularyList: p.ellScaffolds.vocabularyList.map((w, wi) => wi === i ? val : w)
                                        }
                                      }))}
                                      className="flex-1"
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Sentence Frames */}
                          {currentPlan.ellScaffolds.sentenceFrames && (
                            <div className="bg-white rounded-2xl p-5 border border-blue-100">
                              <h3 className="text-xs font-bold text-blue-700 mb-3 uppercase">Sentence Frames</h3>
                              <ul className="space-y-2">
                                {currentPlan.ellScaffolds.sentenceFrames.map((frame, i) => (
                                  <li key={i} className="text-sm text-slate-700 bg-blue-50 p-2 rounded-lg font-mono">
                                    <EditableText
                                      value={frame}
                                      onChange={val => updatePlan(p => ({
                                        ...p,
                                        ellScaffolds: {
                                          ...p.ellScaffolds,
                                          sentenceFrames: p.ellScaffolds.sentenceFrames.map((f, fi) => fi === i ? val : f)
                                        }
                                      }))}
                                      className="block"
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Visual Supports */}
                        {currentPlan.ellScaffolds.visualSupports && (
                          <div className="mt-4 bg-white rounded-2xl p-5 border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-700 mb-2 uppercase">Visual Supports</h3>
                            <EditableText
                              value={currentPlan.ellScaffolds.visualSupports}
                              onChange={val => updatePlan(p => ({
                                ...p,
                                ellScaffolds: { ...p.ellScaffolds, visualSupports: val }
                              }))}
                              multiline
                              className="text-sm text-slate-700 block"
                            />
                          </div>
                        )}
                      </section>
                    )}

                    {/* IEP Accommodations */}
                    {currentPlan.iepAccommodations && (
                      <section className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200">
                        <h2 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <PuzzlePieceIcon className="w-4 h-4" /> IEP Accommodations
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* ADHD Supports */}
                          {currentPlan.iepAccommodations.adhd && (
                            <div className="bg-white rounded-2xl p-5 border border-purple-100">
                              <h3 className="text-xs font-bold text-purple-700 mb-3 uppercase flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span> ADHD Support
                              </h3>
                              <EditableText
                                value={currentPlan.iepAccommodations.adhd}
                                onChange={val => updatePlan(p => ({
                                  ...p,
                                  iepAccommodations: { ...p.iepAccommodations, adhd: val }
                                }))}
                                multiline
                                className="text-sm text-slate-700 block leading-relaxed"
                              />
                            </div>
                          )}
                          
                          {/* Dyslexia Supports */}
                          {currentPlan.iepAccommodations.dyslexia && (
                            <div className="bg-white rounded-2xl p-5 border border-purple-100">
                              <h3 className="text-xs font-bold text-purple-700 mb-3 uppercase flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span> Dyslexia Support
                              </h3>
                              <EditableText
                                value={currentPlan.iepAccommodations.dyslexia}
                                onChange={val => updatePlan(p => ({
                                  ...p,
                                  iepAccommodations: { ...p.iepAccommodations, dyslexia: val }
                                }))}
                                multiline
                                className="text-sm text-slate-700 block leading-relaxed"
                              />
                            </div>
                          )}
                          
                          {/* Below Grade Level */}
                          {currentPlan.iepAccommodations.belowGradeLevel && (
                            <div className="bg-white rounded-2xl p-5 border border-purple-100">
                              <h3 className="text-xs font-bold text-purple-700 mb-3 uppercase flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span> Below Grade Level
                              </h3>
                              <EditableText
                                value={currentPlan.iepAccommodations.belowGradeLevel}
                                onChange={val => updatePlan(p => ({
                                  ...p,
                                  iepAccommodations: { ...p.iepAccommodations, belowGradeLevel: val }
                                }))}
                                multiline
                                className="text-sm text-slate-700 block leading-relaxed"
                              />
                            </div>
                          )}
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

                  {lessonTab === 'exit_ticket' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Exit Ticket</h2>
                        <p className="text-slate-500">Quick formative assessment (3-5 minutes)</p>
                      </div>
                      {currentExitTicket ? (
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                          <div className="px-8 py-4 border-b bg-amber-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                              🎟️ {currentExitTicket.title}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { const el = exitTicketRef.current; if (el) window.print(); }}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                              >
                                Print
                              </button>
                              <button
                                onClick={() => {
                                  const text = `${currentExitTicket.title}\n\nObjective: ${currentExitTicket.objective}\nTime: ${currentExitTicket.timeLimit}\n\nQuestions:\n${currentExitTicket.questions.map((q, i) => `${i + 1}. ${q.question}${q.type === 'multiple_choice' ? '\n   ' + q.options.join('\n   ') : ''}`).join('\n\n')}\n\n--- Answer Key ---\n${Object.entries(currentExitTicket.answerKey).map(([k, v]) => `${k}. ${v}`).join('\n')}`;
                                  navigator.clipboard.writeText(text);
                                  alert('Exit ticket copied!');
                                }}
                                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700"
                              >
                                Copy
                              </button>
                              {googleUser && (
                                <button
                                  onClick={() => exportToGoogleDocs(currentExitTicket.title, currentExitTicket)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  Docs
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-8" ref={exitTicketRef}>
                            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                              <h3 className="text-xl font-black text-slate-900">{currentExitTicket.title}</h3>
                              <p className="text-sm text-slate-500 mt-1">Name: _________________ Date: _________</p>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 italic">{currentExitTicket.objective} • {currentExitTicket.timeLimit}</p>
                            <div className="space-y-6">
                              {currentExitTicket.questions?.map((q, i) => (
                                <div key={i} className="space-y-3">
                                  <p className="font-medium text-slate-800">{i + 1}. {q.question} <span className="text-xs text-slate-400">({q.bloomsLevel})</span></p>
                                  {q.type === 'multiple_choice' && (
                                    <div className="space-y-2 ml-4">
                                      {q.options.map((opt, j) => (
                                        <label key={j} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                          <span className="w-4 h-4 border-2 border-slate-300 rounded-full"></span>
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {q.type === 'short_answer' && (
                                    <div className="space-y-2 ml-4">
                                      {Array.from({ length: q.lines || 3 }).map((_, li) => (
                                        <div key={li} className="border-b border-slate-300 h-8" />
                                      ))}
                                    </div>
                                  )}
                                  {q.type === 'true_false' && (
                                    <div className="flex gap-4 ml-4">
                                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <span className="w-4 h-4 border-2 border-slate-300 rounded"></span> True
                                      </label>
                                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <span className="w-4 h-4 border-2 border-slate-300 rounded"></span> False
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
                              <h4 className="text-xs font-black text-slate-500 uppercase mb-3">Answer Key (Teacher Only)</h4>
                              <div className="space-y-1 text-sm text-slate-600">
                                {Object.entries(currentExitTicket.answerKey).map(([k, v]) => (
                                  <p key={k}><span className="font-bold">{k}.</span> {v}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl border border-amber-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] bg-white/90 rounded-2xl p-4 flex flex-col justify-between">
                              <div>
                                <div className="w-3/4 h-4 bg-amber-200 rounded mb-3"></div>
                                <div className="w-full h-2 bg-amber-100 rounded mb-2"></div>
                                <div className="w-5/6 h-2 bg-amber-100 rounded"></div>
                              </div>
                              <div className="flex justify-end">
                                <div className="w-1/4 h-6 bg-amber-500 rounded-lg"></div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">Exit Ticket</h3>
                            <p className="text-slate-600 text-sm">Quick 3-5 question formative assessment covering different Bloom's levels with answer key.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-amber-500" /> 3-5 mixed question types</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-amber-500" /> Bloom's taxonomy alignment</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-amber-500" /> Answer key included</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { if (!isPro) { setPaywallFeature('Exit Ticket'); setShowPaywall(true); } else handleGenerateExitTicket(); }} 
                                disabled={isGeneratingExitTicket}
                                className={`w-full px-8 py-4 rounded-2xl font-bold transition-colors shadow-md shadow-amber-200 ${isGeneratingExitTicket ? 'bg-amber-300 cursor-wait' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                              >
                                {isGeneratingExitTicket ? (
                                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating...</span>
                                ) : (
                                  <span>Generate Exit Ticket 🎟️</span>
                                )}
                              </button>
                              {!isPro && <p className="text-xs text-center text-slate-400 mt-2">🔒 Pro feature</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {lessonTab === 'rubric' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Grading Rubric</h2>
                        <p className="text-slate-500">Standards-based 4-point assessment rubric</p>
                      </div>
                      {currentRubric ? (
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                          <div className="px-8 py-4 border-b bg-indigo-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                              📋 {currentRubric.title}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { const el = rubricRef.current; if (el) window.print(); }}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                              >
                                Print
                              </button>
                              <button
                                onClick={() => {
                                  const text = `${currentRubric.title}\n\n${currentRubric.taskDescription}\n\nTotal Points: ${currentRubric.totalPoints}\n\n${currentRubric.criteria.map(c => `${c.name} (${c.weight})\n${Object.entries(c.levels).map(([level, data]) => `  ${level} - ${data.label}: ${data.description} (${data.points})`).join('\n')}`).join('\n\n')}`;
                                  navigator.clipboard.writeText(text);
                                  alert('Rubric copied!');
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
                              >
                                Copy
                              </button>
                              {googleUser && (
                                <button
                                  onClick={() => exportToGoogleDocs(currentRubric.title, currentRubric)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  Docs
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-8" ref={rubricRef}>
                            <h3 className="text-xl font-black text-slate-900 mb-2">{currentRubric.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{currentRubric.taskDescription}</p>
                            <p className="text-sm font-bold text-slate-800 mb-4">Total Points: {currentRubric.totalPoints}</p>
                            
                            {currentRubric.criteria?.map((criterion, ci) => (
                              <div key={ci} className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                  <h4 className="font-bold text-slate-800">{criterion.name} <span className="text-slate-500 font-normal">({criterion.weight})</span></h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                  {Object.entries(criterion.levels).map(([level, data]) => (
                                    <div key={level} className="p-4">
                                      <div className="text-center mb-2">
                                        <span className="inline-block w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1">{level}</span>
                                        <p className="text-xs font-bold text-indigo-700">{data.label}</p>
                                        <p className="text-xs text-slate-500">{data.points}</p>
                                      </div>
                                      <p className="text-xs text-slate-600 text-center">{data.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            {currentRubric.standardsAlignment && (
                              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <h4 className="text-xs font-black text-emerald-600 uppercase mb-2">Standards Alignment</h4>
                                <div className="flex flex-wrap gap-2">
                                  {currentRubric.standardsAlignment.map((std, i) => (
                                    <span key={i} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">{std}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-lg rounded-4xl border border-white/40 p-6">
                          <div className="w-full md:w-1/2 aspect-video bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl border border-indigo-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-[90%] h-[80%] bg-white/90 rounded-2xl p-4">
                              <div className="w-full h-3 bg-indigo-200 rounded mb-3"></div>
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className="h-8 bg-indigo-100 rounded"></div>
                                ))}
                              </div>
                              <div className="w-full h-2 bg-indigo-100 rounded mb-1"></div>
                              <div className="w-3/4 h-2 bg-indigo-100 rounded"></div>
                            </div>
                          </div>
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-2">
                            <h3 className="text-xl font-bold text-slate-900">Grading Rubric</h3>
                            <p className="text-slate-600 text-sm">4-point standards-based rubric with weighted criteria and observable performance descriptors.</p>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-indigo-500" /> 4-point scale (Exceeds to Below)</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-indigo-500" /> Weighted criteria</li>
                              <li className="flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4 text-indigo-500" /> Standards alignment</li>
                            </ul>
                            <div className="pt-4">
                              <button 
                                onClick={() => { if (!isPro) { setPaywallFeature('Grading Rubric'); setShowPaywall(true); } else handleGenerateRubric(); }} 
                                disabled={isGeneratingRubric}
                                className={`w-full px-8 py-4 rounded-2xl font-bold transition-colors shadow-md shadow-indigo-200 ${isGeneratingRubric ? 'bg-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                              >
                                {isGeneratingRubric ? (
                                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating...</span>
                                ) : (
                                  <span>Generate Rubric 📋</span>
                                )}
                              </button>
                              {!isPro && <p className="text-xs text-center text-slate-400 mt-2">🔒 Pro feature</p>}
                            </div>
                          </div>
                        </div>
                      )}
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
                        onClick={() => exportToGoogleDocs(currentUnit.unitTitle, currentUnit)}
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
              <>
                {/* Sample Generation Preview */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Sample Generation</h3>
                      <p className="text-sm text-slate-500">See what EduSpark creates • California 5th Grade Science</p>
                    </div>
                  </div>
                  
                  {/* Sample Lesson Card */}
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg">Earth's Rotation & Day/Night Cycle</h4>
                          <p className="text-blue-100 text-sm">NGSS 5-ESS1-2 • Grade 5 • Science</p>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Bloom's: Analyze</span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Objective & EQ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <h5 className="text-xs font-black text-blue-600 uppercase mb-2">Learning Objective</h5>
                          <p className="text-sm text-slate-700">SWBAT use a model to explain why day and night occur based on Earth's rotation.</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                          <h5 className="text-xs font-black text-orange-600 uppercase mb-2">Essential Question</h5>
                          <p className="text-sm text-slate-700">Why do we have day and night, and how does Earth's rotation cause this pattern?</p>
                        </div>
                      </div>
                      
                      {/* Procedure Preview */}
                      <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase mb-3">Instructional Procedures</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <span className="text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded">Hook</span>
                            <span className="text-sm text-slate-700">5m • Flashlight + globe demonstration</span>
                          </div>
                          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded">I Do</span>
                            <span className="text-sm text-slate-700">10m • Teacher models rotation with think-aloud</span>
                          </div>
                          <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                            <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded">We Do</span>
                            <span className="text-sm text-slate-700">15m • Partners predict sunrise/sunset times</span>
                          </div>
                          <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <span className="text-xs font-bold text-purple-600 bg-white px-2 py-1 rounded">You Do</span>
                            <span className="text-sm text-slate-700">12m • Independent model drawing + explanation</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dynamic IEP/ELL Preview */}
                      {(includeIEP || includeELL) && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                          <h5 className="text-xs font-black text-purple-600 uppercase mb-3 flex items-center gap-2">
                            <PuzzlePieceIcon className="w-4 h-4" />
                            Differentiation Preview
                            {includeIEP && <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px]">IEP</span>}
                            {includeELL && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px]">ELL</span>}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {includeIEP && (
                              <div className="bg-white rounded-lg p-3 border border-purple-100">
                                <span className="font-bold text-purple-700">ADHD Support:</span>
                                <span className="text-slate-600"> Movement breaks during modeling, fidget tools</span>
                              </div>
                            )}
                            {includeIEP && (
                              <div className="bg-white rounded-lg p-3 border border-purple-100">
                                <span className="font-bold text-purple-700">Below Grade Level:</span>
                                <span className="text-slate-600"> Pre-labeled diagram, sentence starters</span>
                              </div>
                            )}
                            {includeELL && (
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <span className="font-bold text-blue-700">Vocabulary:</span>
                                <span className="text-slate-600"> rotation, axis, sunrise, sunset + visuals</span>
                              </div>
                            )}
                            {includeELL && (
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <span className="font-bold text-blue-700">Sentence Frames:</span>
                                <span className="text-slate-600 italic"> "Earth rotates on its _____"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Standards Alignment */}
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <h5 className="text-xs font-black text-emerald-600 uppercase mb-2">Standards Alignment</h5>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold bg-emerald-600 text-white px-2 py-1 rounded">NGSS 5-ESS1-2</span>
                        </div>
                        <p className="text-sm text-emerald-800">Students model Earth's rotation to explain day/night patterns — assessed through exit ticket drawing and explanation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Product Value Proposition */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <ClockIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">Generate in Seconds</h4>
                    <p className="text-sm text-slate-500">Complete lesson plans with teacher scripts, pacing guides, and assessments — ready for Danielson observations.</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                      <PuzzlePieceIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">Built for Inclusion</h4>
                    <p className="text-sm text-slate-500">Automatic IEP accommodations and ELL language scaffolds (WIDA) for every lesson you create.</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">Standards-Aligned</h4>
                    <p className="text-sm text-slate-500">CCSS, NGSS, TEKS, SOL, NGSSS — with explicit evidence for admin observations.</p>
                  </div>
                </div>
                
                {/* Empty State Message */}
                <div className="text-center py-10 text-slate-400">
                  <p className="text-lg font-bold">Enter a topic above to generate your lesson plan</p>
                  {history.length > 0 && (
                    <button onClick={() => setShowHistory(true)} className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-bold flex items-center gap-1 mx-auto">
                      <ClockIcon className="w-4 h-4" /> View {history.length} saved plan{history.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
