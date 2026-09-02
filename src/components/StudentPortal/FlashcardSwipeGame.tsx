import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Flame,
  HelpCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';

interface FlashcardSwipeGameProps {
  onBack: () => void;
}

export const FlashcardSwipeGame: React.FC<FlashcardSwipeGameProps> = ({ onBack }) => {
  const { questions, submitAnswer, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [swipeQueue, setSwipeQueue] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [history, setHistory] = useState<{ question: Question; userChoseTrue: boolean; isCorrect: boolean }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.9, 1, 0.9, 0.5]);
  const rightOverlayOpacity = useTransform(x, [20, 120], [0, 1]);
  const leftOverlayOpacity = useTransform(x, [-20, -120], [0, 1]);

  useEffect(() => {
    let pool = [...questions];
    if (selectedSubjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === selectedSubjectId);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setSwipeQueue(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setIsGameOver(false);
    setLastFeedback(null);
  }, [selectedSubjectId, questions]);

  const currentQ = swipeQueue[currentIdx];

  // Determine if the statement is TRUE or FALSE in context
  // If question is true_false type, index 0 is True, index 1 is False
  // For multiple choice questions, we make a statement: "Option 0 is the correct answer"
  const isQuestionStatementTrue = currentQ ? (currentQ.correctIndex === 0) : true;

  const handleDecision = (choseTrue: boolean) => {
    if (!currentQ || isGameOver) return;

    const isCorrect = (choseTrue === isQuestionStatementTrue);
    const earnedPts = isCorrect ? 80 + (streak * 15) : 0;

    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + earnedPts);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setLastFeedback('correct');
      if ((streak + 1) % 4 === 0) {
        triggerConfetti();
        triggerMascotTip(`สตรีคความถูกต้อง ${streak + 1} ข้อติดต่อกันแล้ว! ไฟลุกพรึ่บ! 🔥`, 'cheering');
      }
    } else {
      playSound('wrong');
      setStreak(0);
      setLastFeedback('wrong');
      triggerMascotTip(`ข้อนี้ตอบผิดนะ! ดูคำอธิบายแล้วลุยข้อถัดไปกันครับ 💡`, 'thinking');
    }

    // Submit log
    submitAnswer({
      questionId: currentQ.id,
      selectedOption: choseTrue ? 0 : 1,
      timeSpentSeconds: 4,
      mode: 'swipe'
    });

    setHistory(prev => [
      ...prev,
      { question: currentQ, userChoseTrue: choseTrue, isCorrect }
    ]);

    // Next Card
    if (currentIdx + 1 >= swipeQueue.length) {
      setTimeout(() => {
        setIsGameOver(true);
        playSound('victory');
        triggerConfetti();
      }, 300);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      // Swiped Right -> TRUE
      handleDecision(true);
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> FALSE
      handleDecision(false);
    }
  };

  const handleRestart = () => {
    let pool = [...questions];
    if (selectedSubjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === selectedSubjectId);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setSwipeQueue(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setIsGameOver(false);
    setLastFeedback(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="swipe-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            ← ย้อนกลับ
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 flex items-center gap-2">
              <span className="text-2xl">⚡</span> การ์ดสไวป์ จริงหรือเท็จ
            </h1>
            <p className="text-xs text-slate-400">True / False Flashcard Swipe Quest</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{score} แต้ม</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-bold">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>{streak}x สตรีค</span>
          </div>
        </div>
      </div>

      {!isGameOver && currentQ ? (
        <div className="space-y-6">
          {/* Card Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>ปัดขวา = จริง (True) | ปัดซ้าย = เท็จ (False)</span>
            <span className="font-mono font-bold text-cyan-400">
              การ์ดที่ {currentIdx + 1} / {swipeQueue.length}
            </span>
          </div>

          {/* Swipeable Card Stage */}
          <div className="relative h-[380px] sm:h-[420px] w-full flex items-center justify-center">
            {/* Background Card Preview */}
            {currentIdx + 1 < swipeQueue.length && (
              <div className="absolute inset-x-4 inset-y-2 rounded-3xl bg-slate-800/60 border border-slate-700/50 scale-95 opacity-50 pointer-events-none" />
            )}

            {/* Active Draggable Card */}
            <motion.div
              key={currentQ.id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-slate-700/80 shadow-2xl p-6 sm:p-8 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none touch-manipulation overflow-hidden"
            >
              {/* Right Swipe (TRUE) Badge Overlay */}
              <motion.div
                style={{ opacity: rightOverlayOpacity }}
                className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-emerald-500/90 text-white font-black text-lg border-2 border-white shadow-xl flex items-center gap-1.5 pointer-events-none z-20 rotate-12"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>จริง (TRUE)</span>
              </motion.div>

              {/* Left Swipe (FALSE) Badge Overlay */}
              <motion.div
                style={{ opacity: leftOverlayOpacity }}
                className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-rose-500/90 text-white font-black text-lg border-2 border-white shadow-xl flex items-center gap-1.5 pointer-events-none z-20 -rotate-12"
              >
                <XCircle className="w-6 h-6" />
                <span>เท็จ (FALSE)</span>
              </motion.div>

              {/* Subject & Grade Level Tag */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {currentQ.subjectName}
                  </span>
                  <span className="text-xs text-slate-500">{currentQ.gradeLevel}</span>
                </div>

                {/* Question / Statement Body */}
                <div className="my-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    ประโยคคำถาม / ข้อความ:
                  </span>
                  <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                    "{currentQ.questionText}"
                  </p>
                </div>
              </div>

              {/* Bottom Hint */}
              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>👈 รูดซ้าย: เท็จ</span>
                <span>•</span>
                <span>👉 รูดขวา: จริง</span>
              </div>
            </motion.div>
          </div>

          {/* Large Touch Decision Buttons (for Mobile / Tap usage) */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleDecision(false)}
              className="py-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border-2 border-rose-500/40 active:scale-95 text-rose-300 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 transition-all touch-manipulation"
            >
              <ThumbsDown className="w-6 h-6 text-rose-400" />
              <span>เท็จ (False) ❌</span>
            </button>

            <button
              onClick={() => handleDecision(true)}
              className="py-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-500/40 active:scale-95 text-emerald-300 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all touch-manipulation"
            >
              <ThumbsUp className="w-6 h-6 text-emerald-400" />
              <span>จริง (True) ✅</span>
            </button>
          </div>
        </div>
      ) : (
        /* Game Over Summary */
        <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-4xl">
            ⚡
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              จบการรูดการ์ดสปีดรัน!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              ทบทวนแนวคิดความรู้และสถิติความแม่นยำของคุณ
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">คะแนนสะสม</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">สตรีคสูงสุด</span>
              <p className="text-2xl font-black text-orange-400 mt-1">{maxStreak}x</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">ความแม่นยำ</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {history.length > 0
                  ? Math.round((history.filter(h => h.isCorrect).length / history.length) * 100)
                  : 100}%
              </p>
            </div>
          </div>

          {/* Question Review List */}
          <div className="space-y-3 text-left max-h-60 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              สรุปคำตอบและคำอธิบาย:
            </h4>
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs ${
                  item.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>{item.isCorrect ? '✅ ตอบถูก' : '❌ ตอบผิด'} (เลือก {item.userChoseTrue ? 'จริง' : 'เท็จ'})</span>
                  <span className="text-slate-400">{item.question.subjectName}</span>
                </div>
                <p className="text-slate-300 font-medium mb-1">{item.question.questionText}</p>
                <p className="text-[11px] text-slate-400">💡 เฉลย: {item.question.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>สไวป์ใหม่อีกรอบ</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all"
            >
              กลับสู่ศูนย์รวม 9 เกม
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
