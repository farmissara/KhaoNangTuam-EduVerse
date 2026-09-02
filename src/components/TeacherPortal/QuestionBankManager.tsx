import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionDifficulty, Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Filter,
  Bot,
  Layers,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  ExternalLink,
  PlayCircle,
  Eye,
  Check
} from 'lucide-react';

const PRESET_EDUCATIONAL_MEDIA = [
  {
    type: 'image',
    name: 'แผนผังเซลล์และเยื่อหุ้ม (Biology)',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80'
  },
  {
    type: 'image',
    name: 'สูตรพีชคณิต & กราฟตรีโกณ (Math)',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
  },
  {
    type: 'image',
    name: 'แผนที่โลก & ภูมิศาสตร์ทวีป (Geography)',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80'
  },
  {
    type: 'image',
    name: 'แผงวงจร & เทคโนโลยีดิจิทัล (AI / Tech)',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
  },
  {
    type: 'video',
    name: 'VDO: สรุปหลักการแบ่งเซลล์ Mitosis & Meiosis (3 นาที)',
    url: 'https://www.youtube.com/embed/f-ldPgEfAHI'
  },
  {
    type: 'video',
    name: 'VDO: ทฤษฎีบทพีทาโกรัสและการประยุกต์',
    url: 'https://www.youtube.com/embed/AA6RfgP-AHU'
  }
];

export const QuestionBankManager: React.FC = () => {
  const { questions, subjects, addQuestion, updateQuestion, deleteQuestion, playSound, triggerMascotTip } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMediaModal, setPreviewMediaModal] = useState<Question | null>(null);

  // New Question Form State
  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || 'SUB_SCI',
    gradeLevel: 'ม.3',
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    difficulty: 'medium' as QuestionDifficulty,
    timeLimitSeconds: 20,
    tags: 'แบบฝึกหัด, ม.3',
    mediaType: 'none' as 'none' | 'image' | 'video' | 'link',
    imageUrl: '',
    videoUrl: '',
    referenceLink: {
      title: '',
      url: ''
    }
  });

  const filteredQuestions = questions.filter(q => {
    const matchSubj = selectedSubjectId === 'ALL' || q.subjectId === selectedSubjectId;
    const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchMedia =
      selectedMediaType === 'ALL' ||
      (selectedMediaType === 'media' && q.mediaType && q.mediaType !== 'none') ||
      q.mediaType === selectedMediaType;
    const matchQuery =
      searchQuery.trim() === '' ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubj && matchDiff && matchMedia && matchQuery;
  });

  const handleOpenAdd = () => {
    playSound('click');
    setFormData({
      subjectId: selectedSubjectId === 'ALL' ? subjects[0]?.id || 'SUB_SCI' : selectedSubjectId,
      gradeLevel: 'ม.3',
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      difficulty: 'medium',
      timeLimitSeconds: 20,
      tags: 'แบบฝึกหัด, ม.3',
      mediaType: 'none',
      imageUrl: '',
      videoUrl: '',
      referenceLink: { title: '', url: '' }
    });
    setEditingQuestion(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    playSound('click');
    setEditingQuestion(q);
    setFormData({
      subjectId: q.subjectId,
      gradeLevel: q.gradeLevel,
      questionText: q.questionText,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      timeLimitSeconds: q.timeLimitSeconds,
      tags: q.tags.join(', '),
      mediaType: q.mediaType || 'none',
      imageUrl: q.imageUrl || '',
      videoUrl: q.videoUrl || '',
      referenceLink: q.referenceLink || { title: '', url: '' }
    });
    setIsAddModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim() || formData.options.some(opt => !opt.trim())) {
      alert('กรุณากรอกข้อความคำถามและตัวเลือกให้ครบทั้ง 4 ข้อ');
      return;
    }

    const sub = subjects.find(s => s.id === formData.subjectId);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const questionData: Omit<Question, 'id' | 'createdAt'> = {
      subjectId: formData.subjectId,
      subjectName: sub ? sub.name : 'วิชาทั่วไป',
      gradeLevel: formData.gradeLevel,
      questionText: formData.questionText,
      type: 'multiple_choice',
      options: formData.options,
      correctIndex: formData.correctIndex,
      explanation: formData.explanation,
      difficulty: formData.difficulty,
      timeLimitSeconds: formData.timeLimitSeconds,
      tags: tagsArray,
      mediaType: formData.mediaType,
      imageUrl: formData.mediaType === 'image' ? formData.imageUrl : undefined,
      videoUrl: formData.mediaType === 'video' ? formData.videoUrl : undefined,
      referenceLink:
        formData.mediaType === 'link' && formData.referenceLink.url
          ? formData.referenceLink
          : undefined
    };

    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        ...questionData
      });
    } else {
      addQuestion(questionData);
    }

    setIsAddModalOpen(false);
  };

  // AI Smart Question Generator with Media
  const handleGenerateAiQuestions = () => {
    setIsGenerating(true);
    playSound('click');
    triggerMascotTip('AI กำลังแต่งโจทย์ข้อสอบพร้อมภาพประกอบและเฉลยละเอียด... 🤖✨', 'thinking');

    setTimeout(() => {
      const targetSub = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

      const newAiQuestion: Omit<Question, 'id' | 'createdAt'> = {
        subjectId: targetSub.id,
        subjectName: targetSub.name,
        gradeLevel: 'ม.3',
        questionText: `[AI วิเคราะห์สื่อ] จากโจทย์หัวข้อ "${aiPrompt || targetSub.name}": การทำงานร่วมกันของระบบต่างๆ ข้อใดมีความสอดคล้องกับภาพแผนผังมากที่สุด?`,
        type: 'multiple_choice',
        options: [
          'การส่งผ่านสารอาหารและพลังงานผ่านกระบวนการเมแทบอลิซึมอย่างเป็นระบบ',
          'การทำงานแบบแยกส่วนโดยไม่มีการสื่อสารระหว่างเซลล์',
          'การลดทอนประสิทธิภาพเมื่อได้รับสารกระตุ้นจากภายนอก',
          'การสลายตัวของสารพันธุกรรมโดยไม่มีการสังเคราะห์โปรตีนทดแทน'
        ],
        correctIndex: 0,
        explanation: 'จากแผนผังจะเห็นได้ชัดเจนว่าการทำงานของระบบชีววิทยาต้องมีการแลกเปลี่ยนสารอาหารและพลังงานอย่างเป็นระบบผ่านเมแทบอลิซึม',
        difficulty: 'medium',
        timeLimitSeconds: 20,
        tags: ['AI-Generated', 'มัลติมีเดีย', targetSub.name, 'ม.3'],
        mediaType: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80',
        referenceLink: {
          title: 'อ่านบทความเรื่องระบบชีววิทยาและเมแทบอลิซึม',
          url: 'https://en.wikipedia.org/wiki/Metabolism'
        }
      };

      addQuestion(newAiQuestion);
      setIsGenerating(false);
      setIsAiGeneratorOpen(false);
      setAiPrompt('');
      triggerMascotTip('สร้างข้อสอบพร้อมภาพประกอบสื่อการสอนสำเร็จแล้วครับอาจารย์! 🌟', 'cheering');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold">คลังข้อสอบมัลติมีเดีย (Rich Media Question Bank)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            สร้างและจัดการข้อสอบที่รองรับรูปภาพประกอบ วิดีโอคลิปเสริมความรู้ (YouTube) และลิงก์บทความเพื่อนำไปใช้ในเกม
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAiGeneratorOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>AI ช่วยสร้างข้อสอบ + สื่อ</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มข้อสอบใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาโจทย์ หรือแท็ก..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">ทุกกลุ่มสาระวิชา ({questions.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">ระดับความยากทั้งหมด</option>
            <option value="easy">ง่าย (Easy)</option>
            <option value="medium">ปานกลาง (Medium)</option>
            <option value="hard">ยาก (Hard)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedMediaType}
            onChange={e => setSelectedMediaType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">สื่อมัลติมีเดียทั้งหมด</option>
            <option value="media">เฉพาะข้อสอบที่มีสื่อ (รูป/วิดีโอ/ลิงก์)</option>
            <option value="image">มีรูปภาพประกอบ 🖼️</option>
            <option value="video">มีวิดีโอคลิป 🎬</option>
            <option value="link">มีลิงก์อ้างอิง 🔗</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>ไม่พบข้อสอบที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    ข้อที่ {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {q.subjectName}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {q.gradeLevel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : q.difficulty === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  {/* Media Badges */}
                  {q.mediaType === 'image' && q.imageUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> มีรูปภาพ
                    </span>
                  )}
                  {q.mediaType === 'video' && q.videoUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <VideoIcon className="w-3 h-3" /> มีวิดีโอ YouTube
                    </span>
                  )}
                  {q.referenceLink && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> ลิงก์อ้างอิง
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="แก้ไขข้อสอบ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อสอบนี้?')) {
                        deleteQuestion(q.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="ลบข้อสอบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                {q.questionText}
              </h4>

              {/* Media Preview Box inside card */}
              {q.mediaType === 'image' && q.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center group">
                  <img
                    src={q.imageUrl}
                    alt="Question Diagram"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                      🔍 รูปภาพประกอบข้อสอบ
                    </span>
                  </div>
                </div>
              )}

              {q.mediaType === 'video' && q.videoUrl && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-red-400">
                    <VideoIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white block">สื่อวิดีโอการเรียนรู้ประกอบข้อสอบ</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs">{q.videoUrl}</span>
                    </div>
                  </div>
                  <a
                    href={q.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>เปิดดูคลิป</span>
                  </a>
                </div>
              )}

              {q.referenceLink && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{q.referenceLink.title || 'อ่านบทความเสริมความรู้'}</span>
                  </div>
                  <a
                    href={q.referenceLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>เปิดลิงก์</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation note */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">เฉลยละเอียด:</span> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white my-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  {editingQuestion ? 'แก้ไขข้อสอบมัลติมีเดีย' : 'เพิ่มข้อสอบใหม่พร้อมสื่อมัลติมีเดีย'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">กลุ่มสาระฯ</label>
                    <select
                      value={formData.subjectId}
                      onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">ระดับชั้น</label>
                    <select
                      value={formData.gradeLevel}
                      onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map(g => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">ความยาก</label>
                    <select
                      value={formData.difficulty}
                      onChange={e => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <option value="easy">ง่าย (Easy)</option>
                      <option value="medium">ปานกลาง (Medium)</option>
                      <option value="hard">ยาก (Hard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">โจทย์คำถาม *</label>
                  <textarea
                    rows={3}
                    value={formData.questionText}
                    onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="พิมพ์โจทย์คำถามที่ต้องการทดสอบ..."
                    required
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Rich Media Selection Section */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <label className="block font-semibold text-slate-200">
                    แนบสื่อมัลติมีเดียประกอบโจทย์ (รูปภาพ, วิดีโอ YouTube, ลิงก์อ้างอิง)
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'ไม่มีสื่อ' },
                      { id: 'image', label: '🖼️ รูปภาพ' },
                      { id: 'video', label: '🎬 วิดีโอคลิป' },
                      { id: 'link', label: '🔗 ลิงก์อ่านเพิ่ม' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaType: tab.id as any })}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          formData.mediaType === tab.id
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Image Input */}
                  {formData.mediaType === 'image' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-slate-300 font-medium">URL รูปภาพ หรือเลือกจากภาพตัวอย่างการศึกษา:</label>
                      <input
                        type="url"
                        placeholder="https://example.com/diagram.jpg"
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {PRESET_EDUCATIONAL_MEDIA.filter(m => m.type === 'image').map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                            className={`p-2 rounded-xl border text-left text-[11px] truncate flex items-center gap-1.5 cursor-pointer ${
                              formData.imageUrl === preset.url
                                ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold'
                                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3 h-3 flex-shrink-0 text-blue-400" />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      {formData.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-36 border border-slate-700">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-36 object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Input */}
                  {formData.mediaType === 'video' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-slate-300 font-medium">URL วิดีโอ (YouTube Embed URL):</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/embed/f-ldPgEfAHI"
                        value={formData.videoUrl}
                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {PRESET_EDUCATIONAL_MEDIA.filter(m => m.type === 'video').map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, videoUrl: preset.url })}
                            className={`p-2 rounded-xl border text-left text-[11px] truncate flex items-center gap-1.5 cursor-pointer ${
                              formData.videoUrl === preset.url
                                ? 'bg-red-950 border-red-500 text-red-300 font-bold'
                                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <VideoIcon className="w-3 h-3 flex-shrink-0 text-red-400" />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link Input */}
                  {formData.mediaType === 'link' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">ชื่อหัวข้อบทความ / แหล่งอ้างอิง</label>
                        <input
                          type="text"
                          placeholder="เช่น ศึกษาเพิ่มเติมเรื่องทฤษฎีบทพีทาโกรัส"
                          value={formData.referenceLink.title}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              referenceLink: { ...formData.referenceLink, title: e.target.value }
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">URL เว็บไซต์</label>
                        <input
                          type="url"
                          placeholder="https://th.wikipedia.org/..."
                          value={formData.referenceLink.url}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              referenceLink: { ...formData.referenceLink, url: e.target.value }
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  <label className="block text-slate-400 font-medium">
                    ตัวเลือกคำตอบ 4 ตัวเลือก (ติ๊กเลือกข้อที่ถูกต้อง):
                  </label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctIndex === i}
                        onChange={() => setFormData({ ...formData, correctIndex: i })}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        title="ทำเครื่องหมายเป็นข้อที่ถูกต้อง"
                      />
                      <span className="w-6 text-center font-bold text-slate-400">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...formData.options];
                          newOpts[i] = e.target.value;
                          setFormData({ ...formData, options: newOpts });
                        }}
                        placeholder={`ตัวเลือก ${String.fromCharCode(65 + i)}`}
                        required
                        className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">คำอธิบายเฉลยละเอียด</label>
                  <textarea
                    rows={2}
                    value={formData.explanation}
                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="ระบุเหตุผลและวิธีคิด เพื่อแสดงให้นักเรียนดูหลังตอบ..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingQuestion ? 'บันทึกการแก้ไข' : 'บันทึกข้อสอบ'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAiGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/50 shadow-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">AI Smart Question & Media Generator</h3>
                    <p className="text-xs text-slate-400">สร้างโจทย์ข้อสอบพร้อมภาพประกอบและเฉลยอัตโนมัติ</p>
                  </div>
                </div>
                <button onClick={() => setIsAiGeneratorOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ระบุหัวข้อหรือมาตรฐานการเรียนรู้ที่ต้องการ:
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="เช่น พันธุศาสตร์และการกลายพันธุ์, เรขาคณิตวิเคราะห์, สำนวนสุภาษิตไทย..."
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-purple-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> ระบบ AI จะสร้าง:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    <li>คำถาม 4 ตัวเลือกตามหลักสูตรแกนกลาง</li>
                    <li>ภาพผังไดอะแกรมสื่อการสอนจำลอง</li>
                    <li>เฉลยละเอียดและคำอธิบายเหตุผล</li>
                    <li>ลิงก์แหล่งข้อมูลค้นคว้าเพิ่มเติม</li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsAiGeneratorOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleGenerateAiQuestions}
                    disabled={isGenerating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>กำลังสร้าง...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>เริ่มสร้างข้อสอบ AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
