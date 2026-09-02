import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import {
  Bomb,
  Scissors,
  Clock,
  Zap,
  Sparkles,
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BombDefusalGameProps {
  onBack: () => void;
}

const WIRE_COLORS = [
  { name: 'แดง (Red)', bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-400', glow: 'shadow-red-500/50', wireHex: '#ef4444' },
  { name: 'น้ำเงิน (Blue)', bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', glow: 'shadow-blue-500/50', wireHex: '#3b82f6' },
  { name: 'เขียว (Green)', bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', glow: 'shadow-emerald-500/50', wireHex: '#10b981' },
  { name: 'เหลือง (Yellow)', bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', glow: 'shadow-amber-500/50', wireHex: '#f59e0b' }
];

export const BombDefusalGame: React.FC<BombDefusalGameProps> = ({ onBack }) => {
  const { questions, submitAnswer, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [defusedCount, setDefusedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'exploded' | 'victory' | null>(null);
  const [cutWireIdx, setCutWireIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<'ready' | 'defusing' | 'exploded' | 'defused'>('ready');
  const [hiddenWires, setHiddenWires] = useState<number[]>([]);
  const [scanUsed, setScanUsed] = useState(false);
  const [freezeTimeUsed, setFreezeTimeUsed] = useState(false);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);

  // Initialize questions
  useEffect(() => {
    let pool = [...questions];
    if (selectedSubjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === selectedSubjectId);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 6);
    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setTimeLeft(25);
    setStatus('ready');
    setHiddenWires([]);
    setCutWireIdx(null);
  }, [selectedSubjectId, questions]);

  const currentQ = activeQuestions[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (status !== 'ready' && status !== 'defusing') return;
    if (isTimeFrozen || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleExplode();
          return 0;
        }
        if (prev <= 6) {
          playSound('click');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, isTimeFrozen, isGameOver, currentIdx]);

  const handleCutWire = (index: number) => {
    if (status !== 'ready' && status !== 'defusing') return;
    if (!currentQ || hiddenWires.includes(index)) return;

    setCutWireIdx(index);
    playSound('battle-hit');

    const isCorrect = index === currentQ.correctIndex;
    const timeSpent = 25 - timeLeft;

    if (isCorrect) {
      setStatus('defused');
      const bonus = timeLeft * 10;
      const pts = 150 + bonus + (streak * 30);
      setScore(prev => prev + pts);
      setStreak(prev => prev + 1);
      setDefusedCount(prev => prev + 1);
      playSound('victory');
      triggerConfetti();

      submitAnswer({
        questionId: currentQ.id,
        selectedOption: index,
        timeSpentSeconds: timeSpent,
        mode: 'bomb'
      });

      triggerMascotTip(`ปลดชนวนระเบิดลูกที่ ${currentIdx + 1} สำเร็จ! ปลอดภัยแล้ว! 💣💨`, 'cheering');
    } else {
      setStatus('exploded');
      playSound('wrong');
      setStreak(0);

      submitAnswer({
        questionId: currentQ.id,
        selectedOption: index,
        timeSpentSeconds: timeSpent,
        mode: 'bomb'
      });

      triggerMascotTip(`ตู๊มมมม! ตัดสายผิด ระเบิดทำงาน! แต่ไม่เป็นไร ลองลูกถัดไปกันนะ 💥`, 'surprised');
    }
  };

  const handleExplode = () => {
    setStatus('exploded');
    playSound('wrong');
    setStreak(0);
    if (currentQ) {
      submitAnswer({
        questionId: currentQ.id,
        selectedOption: -1,
        timeSpentSeconds: 25,
        mode: 'bomb'
      });
    }
    triggerMascotTip('เวลาหมด! ระเบิดทำงานแล้ว รีบไปกู้ลูกถัดไปกัน! 🚨', 'surprised');
  };

  const handleNextBomb = () => {
    if (currentIdx + 1 >= activeQuestions.length) {
      setIsGameOver(true);
      setGameResult('victory');
      playSound('victory');
      triggerConfetti();
    } else {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(Math.max(18, 25 - (currentIdx * 1.5))); // Gets faster
      setStatus('ready');
      setCutWireIdx(null);
      setHiddenWires([]);
      setIsTimeFrozen(false);
    }
  };

  const handleUseScanner = () => {
    if (scanUsed || !currentQ || status !== 'ready') return;
    setScanUsed(true);
    playSound('levelup');

    // Hide 2 wrong wires
    const wrongIndices = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctIndex);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenWires(toHide);
    triggerMascotTip('สแกนเนอร์ตัดสายลวงออก 2 สายเรียบร้อยแล้วครับ! ⚡', 'happy');
  };

  const handleUseTimeFreeze = () => {
    if (freezeTimeUsed || isTimeFrozen) return;
    setFreezeTimeUsed(true);
    setIsTimeFrozen(true);
    playSound('levelup');
    triggerMascotTip('หยุดเวลา 5 วินาที! รีบอ่านโจทย์และตัดสายเลย! ❄️', 'cheering');

    setTimeout(() => {
      setIsTimeFrozen(false);
    }, 5000);
  };

  const handleRestart = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 6);
    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setDefusedCount(0);
    setStreak(0);
    setTimeLeft(25);
    setIsGameOver(false);
    setGameResult(null);
    setStatus('ready');
    setCutWireIdx(null);
    setHiddenWires([]);
    setScanUsed(false);
    setFreezeTimeUsed(false);
    setIsTimeFrozen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="bomb-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            ← ย้อนกลับ
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-300 flex items-center gap-2">
              <span className="text-2xl">💣</span> กู้ระเบิดเวลาสปีดรัน
            </h1>
            <p className="text-xs text-slate-400">Time Bomb Defusal & Wire Cutting Challenge</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{score} แต้ม</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>กู้สำเร็จ {defusedCount}/{activeQuestions.length}</span>
          </div>
        </div>
      </div>

      {!isGameOver && currentQ ? (
        <div className="space-y-6">
          {/* Bomb Visual Unit */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-red-500/30 shadow-2xl relative overflow-hidden">
            {/* Background Hazard Stripes */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-slate-900 to-amber-500 opacity-40" />

            {/* Bomb Timer & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold font-mono">
                  BOMB #{currentIdx + 1} OF {activeQuestions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentQ.subjectName}
                </span>
              </div>

              {/* Digital LED Timer */}
              <div className={`px-6 py-2.5 rounded-2xl border-2 flex items-center gap-3 font-mono font-black text-2xl sm:text-3xl shadow-xl transition-all ${
                isTimeFrozen
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-cyan-500/30 animate-pulse'
                  : timeLeft <= 6
                  ? 'bg-red-950 border-red-500 text-red-500 shadow-red-600/50 animate-ping'
                  : timeLeft <= 10
                  ? 'bg-red-950/90 border-red-500 text-red-400 shadow-red-500/30 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-amber-400'
              }`}>
                <Clock className="w-6 h-6" />
                <span>00:{timeLeft < 10 ? `0${Math.max(0, Math.floor(timeLeft))}` : Math.floor(timeLeft)}</span>
                {isTimeFrozen && <span className="text-xs font-sans text-cyan-300">หยุดเวลา</span>}
              </div>
            </div>

            {/* Question Display on Bomb Screen */}
            <div className="p-5 sm:p-6 rounded-2xl bg-black/80 border border-slate-800 shadow-inner mb-8">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> โจทย์ปลดรหัสชนวน
                </span>
                <span className="text-slate-500">ระดับ: {currentQ.difficulty.toUpperCase()}</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* Defusal Tools / Powerups */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-red-400" />
                คลิกเลือกตัดสายชนวนที่ถูกต้อง:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseScanner}
                  disabled={scanUsed || status !== 'ready'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    !scanUsed && status === 'ready'
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30'
                      : 'opacity-40 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>สแกนเนอร์ (50:50)</span>
                </button>
                <button
                  onClick={handleUseTimeFreeze}
                  disabled={freezeTimeUsed || isTimeFrozen || status !== 'ready'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    !freezeTimeUsed && status === 'ready'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                      : 'opacity-40 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>หยุดเวลา 5s</span>
                </button>
              </div>
            </div>

            {/* 4 Colored Wires to Cut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((optionText, idx) => {
                const colorMeta = WIRE_COLORS[idx % WIRE_COLORS.length];
                const isHidden = hiddenWires.includes(idx);
                const isCut = cutWireIdx === idx;
                const isCorrectWire = idx === currentQ.correctIndex;

                if (isHidden) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 opacity-20 flex items-center gap-3 cursor-not-allowed"
                    >
                      <span className="w-3 h-3 rounded-full bg-slate-700" />
                      <span className="text-xs text-slate-600 line-through">สายไฟถูกสแกนตัดทิ้ง</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleCutWire(idx)}
                    disabled={status !== 'ready'}
                    className={`group relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between gap-4 touch-manipulation ${
                      isCut && isCorrectWire
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/30'
                        : isCut && !isCorrectWire
                        ? 'bg-red-950/80 border-red-500 shadow-lg shadow-red-500/30 animate-wiggle'
                        : status !== 'ready'
                        ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900/90 border-slate-700 hover:border-red-400 hover:bg-slate-800/90 hover:shadow-xl active:scale-98'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Wire Indicator */}
                      <div className={`w-4 h-4 rounded-full ${colorMeta.bg} shadow-md ${colorMeta.glow} flex items-center justify-center`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${colorMeta.text}`}>
                          สาย {colorMeta.name}
                        </span>
                        <p className="text-sm sm:text-base font-medium text-white group-hover:text-amber-200">
                          {optionText}
                        </p>
                      </div>
                    </div>

                    <Scissors className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      isCut ? 'text-white rotate-45' : 'text-slate-500 group-hover:text-red-400 group-hover:scale-110'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Bomb Outcome Message & Next Action */}
            <AnimatePresence>
              {status !== 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-6 p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    status === 'defused'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                      : 'bg-red-950/80 border-red-500 text-red-200'
                  }`}
                >
                  <div>
                    <h4 className="text-base font-bold flex items-center gap-2">
                      {status === 'defused' ? '🎉 ปลดชนวนสำเร็จ!' : '💥 ระเบิดทำงาน!'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {currentQ.explanation}
                    </p>
                  </div>

                  <button
                    onClick={handleNextBomb}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-red-500/30 transition-all whitespace-nowrap"
                  >
                    {currentIdx + 1 >= activeQuestions.length ? 'ดูสรุปผลลัพธ์' : 'กู้ลูกถัดไป ➔'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* End Summary */
        <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center shadow-lg shadow-red-500/30 text-4xl">
            {defusedCount >= activeQuestions.length / 2 ? '🎖️' : '💣'}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              จบภารกิจกู้ระเบิดเวลา!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              สรุปผลการกู้ระเบิดและปลดชนวนความรู้สปีดรัน
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">คะแนนกู้ระเบิด</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">กู้สำเร็จ</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{defusedCount}/{activeQuestions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">รางวัล XP</span>
              <p className="text-2xl font-black text-red-400 mt-1">+{defusedCount * 45}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-red-500/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เล่นภารกิจใหม่อีกครั้ง</span>
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
