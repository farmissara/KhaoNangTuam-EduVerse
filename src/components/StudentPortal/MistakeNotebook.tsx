import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookMarked,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MistakeNotebookProps {
  onBack: () => void;
  onLaunchPractice?: (subjectId: string) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({ onBack, onLaunchPractice }) => {
  const { currentStudent, answerLogs, questions, subjects, submitAnswer, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isRetryActive, setIsRetryActive] = useState<boolean>(false);
  const [retryIndex, setRetryIndex] = useState<number>(0);
  const [retryScore, setRetryScore] = useState<number>(0);
  const [retryCompleted, setRetryCompleted] = useState<boolean>(false);
  const [retryFeedback, setRetryFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Filter wrong answers specifically for current student
  const studentMistakes = answerLogs.filter(
    log => log.studentId === currentStudent.id && !log.isCorrect
  );

  // Deduplicate questions by questionId to give a unique review list
  const uniqueMistakeMap = new Map<string, typeof studentMistakes[0]>();
  studentMistakes.forEach(m => {
    if (!uniqueMistakeMap.has(m.questionId)) {
      uniqueMistakeMap.set(m.questionId, m);
    }
  });
  const uniqueMistakes = Array.from(uniqueMistakeMap.values());

  const filteredMistakes = uniqueMistakes.filter(item => {
    const matchSubject = selectedSubjectId === 'all' || item.subjectId === selectedSubjectId;
    const qObj = questions.find(q => q.id === item.questionId);
    const qText = item.questionText || qObj?.questionText || '';
    const matchSearch = searchKeyword.trim() === '' ||
      qText.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Retry Mode Questions
  const retryQuestions = filteredMistakes
    .map(m => questions.find(q => q.id === m.questionId))
    .filter(Boolean) as typeof questions;

  const currentRetryQ = retryQuestions[retryIndex];

  const handleStartRetry = () => {
    if (retryQuestions.length === 0) return;
    setIsRetryActive(true);
    setRetryIndex(0);
    setRetryScore(0);
    setRetryCompleted(false);
    setRetryFeedback(null);
    playSound('click');
    triggerMascotTip('เริ่มทำแบบฝึกหัดแก้ตัวข้อที่เคยตอบผิด สู้ๆ เพื่อความเข้าใจ 100%! 🚀', 'cheering');
  };

  const handleAnswerRetry = (selectedIdx: number) => {
    if (!currentRetryQ || retryFeedback !== null) return;

    const res = submitAnswer({
      questionId: currentRetryQ.id,
      selectedOption: selectedIdx,
      timeSpentSeconds: 5,
      mode: 'practice'
    });

    if (res.isCorrect) {
      setRetryFeedback('correct');
      setRetryScore(prev => prev + 1);
      playSound('correct');
      triggerConfetti();
    } else {
      setRetryFeedback('wrong');
      playSound('wrong');
    }
  };

  const handleNextRetry = () => {
    if (retryIndex + 1 >= retryQuestions.length) {
      setRetryCompleted(true);
      playSound('victory');
      triggerConfetti();
    } else {
      setRetryIndex(prev => prev + 1);
      setRetryFeedback(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="mistake-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            ← ย้อนกลับ
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-rose-400" />
              สมุดทบทวนข้อที่เคยทำผิด (Mistake Notebook)
            </h1>
            <p className="text-xs text-slate-400">
              รวบรวมข้อสอบที่คุณเคยตอบผิดจากทุกเกม เพื่อให้ทบทวนและทำความเข้าใจจุดบกพร่อง
            </p>
          </div>
        </div>

        {/* Action Button */}
        {filteredMistakes.length > 0 && !isRetryActive && (
          <button
            id="start-retry-quiz-btn"
            onClick={handleStartRetry}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ฝึกซ้ำข้อผิด ({filteredMistakes.length} ข้อ)</span>
          </button>
        )}
      </div>

      {!isRetryActive ? (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            {/* Subject Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubjectId === 'all'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ทั้งหมด ({uniqueMistakes.length})
              </button>
              {subjects.map(s => {
                const count = uniqueMistakes.filter(m => m.subjectId === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedSubjectId === s.id
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.icon} {s.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="ค้นหาข้อความโจทย์..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* List of Mistakes */}
          {filteredMistakes.length > 0 ? (
            <div className="space-y-4">
              {filteredMistakes.map((log, index) => {
                const qObj = questions.find(q => q.id === log.questionId);
                const qText = log.questionText || qObj?.questionText || 'โจทย์ข้อสอบ';
                const correctText = log.correctOptionText || (qObj ? qObj.options[qObj.correctIndex] : 'เฉลยที่ถูกต้อง');
                const selectedText = log.selectedOptionText || (qObj && log.selectedOption >= 0 ? qObj.options[log.selectedOption] : 'ไม่ได้ตอบ / ตอบผิด');
                const explanation = log.explanation || qObj?.explanation || 'โปรดทบทวนเนื้อหาบทเรียนนี้เพิ่มเติม';

                return (
                  <motion.div
                    key={log.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 transition-all"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                          {log.subjectName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-mono">
                          โหมด: {log.mode.toUpperCase()}
                        </span>
                      </div>

                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                    </div>

                    {/* Question text */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 mb-1 block">
                        ข้อที่ {index + 1}:
                      </span>
                      <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                        {qText}
                      </p>
                    </div>

                    {/* Comparison Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Your wrong answer */}
                      <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1">
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> ตัวเลือกที่คุณตอบ (ผิด):
                        </span>
                        <p className="text-rose-200 font-medium">{selectedText}</p>
                      </div>

                      {/* Correct answer */}
                      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> คำตอบที่ถูกต้อง (เฉลย):
                        </span>
                        <p className="text-emerald-200 font-medium">{correctText}</p>
                      </div>
                    </div>

                    {/* Deep explanation */}
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> คำอธิบายและเทคนิคจำ:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
                ✨
              </div>
              <h3 className="text-xl font-bold text-white">ยอดเยี่ยมมาก! ไม่มีข้อผิดค้างทบทวน</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                คุณยังไม่มีประวัติการตอบผิดในหมวดวิชานี้ หรือได้ทบทวนและฝึกซ้ำจนถูกต้องครบถ้วนแล้ว!
              </p>
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
              >
                กลับไปเล่นเกมอื่น
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Retry Quiz Screen */
        <div className="space-y-6">
          {!retryCompleted && currentRetryQ ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                  {currentRetryQ.subjectName}
                </span>
                <span className="font-mono text-rose-400 font-bold">
                  ข้อทบทวนที่ {retryIndex + 1} / {retryQuestions.length}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1 block">
                  โจทย์ที่ต้องฝึกซ่อมแซม:
                </span>
                <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                  {currentRetryQ.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentRetryQ.options.map((opt, idx) => {
                  const isSelected = retryFeedback !== null;
                  const isCorrect = idx === currentRetryQ.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerRetry(idx)}
                      disabled={retryFeedback !== null}
                      className={`w-full p-4 rounded-2xl border-2 text-left font-medium text-sm transition-all flex items-center justify-between gap-3 touch-manipulation ${
                        retryFeedback !== null && isCorrect
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20'
                          : retryFeedback !== null && !isCorrect
                          ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                          : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 hover:border-rose-400 text-white active:scale-98'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next button */}
              {retryFeedback !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    retryFeedback === 'correct'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {retryFeedback === 'correct' ? '🎉 ยอดเยี่ยม! แก้ตัวสำเร็จ' : '❌ ยังไม่ถูกต้องนะ'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {currentRetryQ.explanation}
                    </p>
                  </div>

                  <button
                    onClick={handleNextRetry}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm shadow-lg shadow-rose-500/30 whitespace-nowrap transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{retryIndex + 1 >= retryQuestions.length ? 'ดูสรุปผล' : 'ข้อถัดไป'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            /* Retry Completed Screen */
            <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/30 text-4xl">
                🏆
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  การทบทวนข้อสอบเสร็จสิ้น!
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  คุณได้ฝึกซ้ำข้อที่เคยตอบผิดเพื่อเสริมสร้างความเข้าใจที่ถูกต้อง
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-xs text-slate-400">ตอบถูกรอบแก้ตัว</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {retryScore} / {retryQuestions.length} ข้อ
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-xs text-slate-400">อัตราความก้าวหน้า</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {Math.round((retryScore / retryQuestions.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsRetryActive(false)}
                  className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm shadow-xl shadow-rose-500/30 transition-all"
                >
                  กลับสู่สมุดทบทวนข้อผิด
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all"
                >
                  กลับสู่หน้าหลัก
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
