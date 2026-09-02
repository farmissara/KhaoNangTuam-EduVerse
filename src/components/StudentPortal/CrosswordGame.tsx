import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_WORD_PUZZLES } from '../../data/mockData';
import { WordPuzzleItem } from '../../types';
import {
  Sparkles,
  Award,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrosswordGameProps {
  onBack: () => void;
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ onBack }) => {
  const { subjects, submitAnswer, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [puzzles, setPuzzles] = useState<WordPuzzleItem[]>(INITIAL_WORD_PUZZLES);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [solvedCount, setSolvedCount] = useState(0);

  const filteredPuzzles = selectedSubjectId === 'all'
    ? puzzles
    : puzzles.filter(p => p.subjectId === selectedSubjectId);

  const currentPuzzle = filteredPuzzles[currentIndex] || filteredPuzzles[0];

  useEffect(() => {
    if (currentPuzzle) {
      const cleanWord = currentPuzzle.word.trim().toUpperCase();
      setUserInputs(new Array(cleanWord.length).fill(''));
      setRevealedIndices([]);
      setStatus('playing');
      setTimeLeft(45);
    }
  }, [currentIndex, selectedSubjectId]);

  // Timer countdown
  useEffect(() => {
    if (isGameOver || status !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, status, currentIndex]);

  const targetWord = currentPuzzle ? currentPuzzle.word.trim().toUpperCase() : '';

  // Generate scrambled letter bank (actual letters + 3 random distractors)
  const [letterBank, setLetterBank] = useState<{ id: string; letter: string; used: boolean }[]>([]);

  useEffect(() => {
    if (!targetWord) return;
    const thaiChars = ['ก', 'ข', 'ค', 'ง', 'จ', 'ส', 'ต', 'น', 'ป', 'ม', 'ร', 'ล', 'ว', 'อ'];
    const engChars = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'N', 'P', 'M'];
    const isThai = /[ก-๙]/.test(targetWord);
    const alphabet = isThai ? thaiChars : engChars;

    const actualLetters = targetWord.split('').map((l, i) => ({
      id: `act_${i}_${l}`,
      letter: l,
      used: false
    }));

    // Add 3 distractors
    const distractors = Array.from({ length: 3 }).map((_, i) => ({
      id: `dist_${i}`,
      letter: alphabet[Math.floor(Math.random() * alphabet.length)],
      used: false
    }));

    const combined = [...actualLetters, ...distractors].sort(() => Math.random() - 0.5);
    setLetterBank(combined);
  }, [targetWord]);

  const handleTileClick = (bankIndex: number) => {
    if (status !== 'playing') return;
    const tile = letterBank[bankIndex];
    if (tile.used) return;

    // Find first empty slot
    const firstEmpty = userInputs.findIndex(ch => ch === '');
    if (firstEmpty === -1) return;

    playSound('click');
    const newInputs = [...userInputs];
    newInputs[firstEmpty] = tile.letter;
    setUserInputs(newInputs);

    // Mark tile used
    const newBank = [...letterBank];
    newBank[bankIndex].used = true;
    setLetterBank(newBank);

    // Check if word is complete
    if (firstEmpty === targetWord.length - 1) {
      verifyAnswer(newInputs.join(''));
    }
  };

  const handleRemoveSlot = (slotIndex: number) => {
    if (status !== 'playing' || revealedIndices.includes(slotIndex)) return;
    const removedChar = userInputs[slotIndex];
    if (!removedChar) return;

    playSound('click');
    const newInputs = [...userInputs];
    newInputs[slotIndex] = '';
    setUserInputs(newInputs);

    // Unuse corresponding tile in bank
    const bankIdx = letterBank.findIndex(b => b.letter === removedChar && b.used);
    if (bankIdx !== -1) {
      const newBank = [...letterBank];
      newBank[bankIdx].used = false;
      setLetterBank(newBank);
    }
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0 || status !== 'playing') return;
    // Find unrevealed slot
    const unrevealed = targetWord.split('').map((_, i) => i).filter(i => !revealedIndices.includes(i) && userInputs[i] !== targetWord[i]);
    if (unrevealed.length === 0) return;

    playSound('levelup');
    const slotToReveal = unrevealed[0];
    const correctLetter = targetWord[slotToReveal];

    setRevealedIndices(prev => [...prev, slotToReveal]);
    const newInputs = [...userInputs];
    newInputs[slotToReveal] = correctLetter;
    setUserInputs(newInputs);
    setHintsRemaining(prev => prev - 1);

    // Find and use in bank if available
    const bankIdx = letterBank.findIndex(b => b.letter === correctLetter && !b.used);
    if (bankIdx !== -1) {
      const newBank = [...letterBank];
      newBank[bankIdx].used = true;
      setLetterBank(newBank);
    }

    triggerMascotTip(`เปิดตัวอักษร "${correctLetter}" ให้ 1 ตำแหน่งแล้วครับ! 💡`, 'happy');

    if (newInputs.every(ch => ch !== '')) {
      verifyAnswer(newInputs.join(''));
    }
  };

  const verifyAnswer = (wordAttempt: string) => {
    const isCorrect = wordAttempt === targetWord;
    if (isCorrect) {
      setStatus('correct');
      const timeBonus = Math.floor(timeLeft * 2);
      const points = 100 + (streak * 20) + timeBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setSolvedCount(prev => prev + 1);
      playSound('correct');
      triggerConfetti();

      // Submit to log
      submitAnswer({
        questionId: currentPuzzle.id,
        selectedOption: 0,
        timeSpentSeconds: 45 - timeLeft,
        mode: 'crossword'
      });

      triggerMascotTip(`ถูกต้องยอดเยี่ยม! คำตอบคือ "${targetWord}" (+${points} แต้ม) 🎉`, 'cheering');
    } else {
      setStatus('wrong');
      playSound('wrong');
      setStreak(0);

      // Submit wrong log
      submitAnswer({
        questionId: currentPuzzle.id,
        selectedOption: 1,
        timeSpentSeconds: 45 - timeLeft,
        mode: 'crossword'
      });

      triggerMascotTip(`ยังไม่ถูกต้องนะ ลองตรวจสอบตัวอักษรใหม่อีกครั้งครับ! 💡`, 'thinking');
    }
  };

  const handleTimeout = () => {
    setStatus('wrong');
    playSound('wrong');
    setStreak(0);
    triggerMascotTip('หมดเวลาแล้วครับ! ไม่เป็นไร ลองลุยข้อถัดไปกันนะ ⏳', 'surprised');
  };

  const handleNext = () => {
    if (currentIndex + 1 >= filteredPuzzles.length) {
      setIsGameOver(true);
      playSound('victory');
      triggerConfetti();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSolvedCount(0);
    setIsGameOver(false);
    setStatus('playing');
    setHintsRemaining(3);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="crossword-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            ← ย้อนกลับ
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300 flex items-center gap-2">
              <span className="text-2xl">🔤</span> ปริศนาอักษรไขว้ & สแครมเบิล
            </h1>
            <p className="text-xs text-slate-400">Crossword & Academic Word Scramble</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{score} แต้ม</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold">
            <Zap className="w-4 h-4" />
            <span>{streak}x คอมโบ</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
            timeLeft <= 10 ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setSelectedSubjectId('all'); setCurrentIndex(0); }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            selectedSubjectId === 'all'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          🌟 ทุกหมวดวิชา ({puzzles.length})
        </button>
        {subjects.map(s => {
          const count = puzzles.filter(p => p.subjectId === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => { setSelectedSubjectId(s.id); setCurrentIndex(0); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedSubjectId === s.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {s.icon} {s.name} ({count})
            </button>
          );
        })}
      </div>

      {!isGameOver ? (
        <div className="space-y-6">
          {/* Question Clue Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                {currentPuzzle?.subjectName || 'วิทยาศาสตร์และเทคโนโลยี'}
              </span>
              <span className="font-mono text-slate-400">
                ข้อที่ {currentIndex + 1} / {filteredPuzzles.length}
              </span>
            </div>

            {/* Clue Prompt */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4" /> คำใบ้ปริศนา:
              </span>
              <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                "{currentPuzzle?.clue}"
              </p>
              {currentPuzzle?.hint && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  💡 คำชี้แนะ: {currentPuzzle.hint}
                </p>
              )}
            </div>

            {/* Word Letter Slots */}
            <div className="my-8">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {targetWord.split('').map((char, index) => {
                  const filledChar = userInputs[index];
                  const isRevealed = revealedIndices.includes(index);
                  const isWrong = status === 'wrong';
                  const isCorrect = status === 'correct';

                  return (
                    <button
                      key={index}
                      onClick={() => handleRemoveSlot(index)}
                      className={`w-11 h-13 sm:w-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl sm:text-2xl transition-all duration-200 border-2 shadow-lg touch-manipulation ${
                        isCorrect
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-emerald-500/20'
                          : isWrong
                          ? 'bg-red-500/20 border-red-500 text-red-300 animate-wiggle'
                          : filledChar
                          ? 'bg-slate-800 border-teal-400 text-white scale-100 shadow-teal-500/20'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-600 border-dashed'
                      }`}
                    >
                      <span>{filledChar || ''}</span>
                      {isRevealed && (
                        <span className="text-[9px] text-amber-400 font-normal">hint</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrambled Letter Bank */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">เลือกตัวอักษรเพื่อเติมคำศัพท์:</span>
                <button
                  onClick={handleUseHint}
                  disabled={hintsRemaining <= 0 || status !== 'playing'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hintsRemaining > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>ขอคำใบ้ตัวอักษร ({hintsRemaining})</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {letterBank.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleTileClick(idx)}
                    disabled={item.used || status !== 'playing'}
                    className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl transition-all active:scale-95 touch-manipulation ${
                      item.used
                        ? 'opacity-20 bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
                        : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 text-teal-300 hover:border-teal-400 hover:text-white hover:shadow-lg hover:shadow-teal-500/10'
                    }`}
                  >
                    {item.letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Result Message & Next Button */}
            <AnimatePresence>
              {status !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    status === 'correct'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status === 'correct' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">
                        {status === 'correct' ? '🎉 ยอดเยี่ยม! คำตอบถูกต้อง' : '❌ ยังไม่ถูกต้องนะ!'}
                      </p>
                      <p className="text-xs text-slate-300">
                        คำตอบที่ถูกต้องคือ: <strong className="text-white underline font-mono">{targetWord}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{currentIndex + 1 >= filteredPuzzles.length ? 'ดูสรุปผล' : 'ข้อถัดไป'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Game Over View */
        <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30 text-4xl">
            🏆
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ภารกิจปริศนาอักษรไขว้สำเร็จ!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              คุณได้ไขปริศนาคำศัพท์วิชาการและสะสมคลังความรู้เรียบร้อยแล้ว
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">คะแนนรวม</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">ตอบถูก</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{solvedCount} คำ</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">รางวัล XP</span>
              <p className="text-2xl font-black text-teal-400 mt-1">+{solvedCount * 40}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เล่นใหม่อีกครั้ง</span>
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
