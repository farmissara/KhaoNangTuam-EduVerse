import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { MatchingCard, Subject } from '../../types';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Award,
  ChevronLeft,
  Flame,
  CheckCircle2,
  Layers,
  Star
} from 'lucide-react';

interface MatchingGameProps {
  onBack: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ onBack }) => {
  const { subjects, questions, playSound, triggerConfetti, triggerMascotTip, updateStudent, currentStudent } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [totalPairs, setTotalPairs] = useState<number>(6);
  const [moves, setMoves] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Generate cards when starting game or changing subject
  const initGame = () => {
    playSound('click');
    const availableQuestions = questions.filter(
      q => selectedSubjectId === 'ALL' || q.subjectId === selectedSubjectId
    );

    // Take up to 6 questions to form 6 pairs (12 cards)
    const shuffledQs = [...availableQuestions].sort(() => 0.5 - Math.random()).slice(0, 6);
    const generatedCards: MatchingCard[] = [];

    shuffledQs.forEach((q, idx) => {
      const pairId = idx + 1;
      // Card 1: Question
      generatedCards.push({
        id: `q_${q.id}`,
        pairId,
        content: q.questionText.length > 55 ? q.questionText.substring(0, 52) + '...' : q.questionText,
        type: 'question',
        isFlipped: false,
        isMatched: false
      });

      // Card 2: Correct Answer
      const correctAns = q.options[q.correctIndex] || 'คำตอบที่ถูกต้อง';
      generatedCards.push({
        id: `a_${q.id}`,
        pairId,
        content: correctAns,
        type: 'answer',
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the 12 cards
    const shuffledCards = generatedCards.sort(() => 0.5 - Math.random());
    setCards(shuffledCards);
    setSelectedCardIds([]);
    setMatchedPairs(0);
    setTotalPairs(shuffledQs.length);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setGameWon(false);
    setTimerSeconds(0);
    setIsPlaying(true);
    triggerMascotTip('เลือกจับคู่การ์ด "โจทย์คำถาม" กับ "คำตอบที่ถูกต้อง" ให้ตรงกันนะครับ! 🎴', 'happy');
  };

  useEffect(() => {
    initGame();
  }, [selectedSubjectId]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || gameWon) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  const handleCardClick = (card: MatchingCard) => {
    if (!isPlaying || card.isMatched || card.isFlipped || selectedCardIds.length >= 2) return;

    playSound('click');
    const newSelected = [...selectedCardIds, card.id];
    setSelectedCardIds(newSelected);

    // Flip this card
    setCards(prev => prev.map(c => (c.id === card.id ? { ...c, isFlipped: true } : c)));

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = cards.find(c => c.id === newSelected[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        // MATCHED!
        playSound('correct');
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        const comboBonus = newCombo * 50;
        setScore(prev => prev + 100 + comboBonus);

        setTimeout(() => {
          setCards(prev =>
            prev.map(c => (c.id === firstCard.id || c.id === secondCard.id ? { ...c, isMatched: true } : c))
          );
          setSelectedCardIds([]);
          setMatchedPairs(prev => {
            const next = prev + 1;
            if (next === totalPairs) {
              handleGameWin(score + 100 + comboBonus);
            }
            return next;
          });
        }, 500);
      } else {
        // NOT MATCHED
        playSound('wrong');
        setCombo(0);
        setTimeout(() => {
          setCards(prev =>
            prev.map(c => (c.id === firstCard?.id || c.id === secondCard.id ? { ...c, isFlipped: false } : c))
          );
          setSelectedCardIds([]);
        }, 900);
      }
    }
  };

  const handleGameWin = (finalScore: number) => {
    setGameWon(true);
    setIsPlaying(false);
    triggerConfetti();
    playSound('victory');

    const earnedXp = Math.max(100, Math.floor(finalScore / 4));
    const earnedCoins = Math.max(20, Math.floor(finalScore / 20));

    // Reward student
    updateStudent({
      ...currentStudent,
      xp: currentStudent.xp + earnedXp,
      coins: currentStudent.coins + earnedCoins,
      level: Math.floor((currentStudent.xp + earnedXp) / 500) + 1
    });

    triggerMascotTip(`สุดยอดมาก! จับคู่ครบทุกใบ รับ +${earnedXp} XP และ +${earnedCoins} เหรียญทอง! 🎉`, 'cheering');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>กลับหน้ารวมเกม</span>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">ทุกหมวดวิชา</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={initGame}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="เริ่มเกมใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>คู่ที่จับได้</span>
            <b className="text-white text-sm block">
              {matchedPairs} / {totalPairs}
            </b>
          </div>
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>คอมโบต่อเนื่อง</span>
            <b className="text-amber-400 text-sm block flex items-center gap-1">
              <Flame className="w-4 h-4" /> x{combo}
            </b>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            MAX x{maxCombo}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>คะแนนสะสม</span>
            <b className="text-emerald-400 text-sm block font-mono">{score} PTS</b>
          </div>
          <Award className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>เวลาที่ใช้</span>
            <b className="text-blue-400 text-sm block font-mono">{formatTime(timerSeconds)}</b>
          </div>
          <Clock className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Cards Grid (3 columns on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map(card => {
          return (
            <motion.div
              key={card.id}
              whileHover={!card.isMatched && !card.isFlipped ? { scale: 1.03 } : {}}
              whileTap={!card.isMatched && !card.isFlipped ? { scale: 0.97 } : {}}
              onClick={() => handleCardClick(card)}
              className={`h-36 sm:h-40 rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer border transition-all relative overflow-hidden select-none ${
                card.isMatched
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 opacity-60 shadow-none'
                  : card.isFlipped
                  ? card.type === 'question'
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-100 shadow-xl shadow-indigo-500/20'
                    : 'bg-purple-950 border-purple-500 text-purple-100 shadow-xl shadow-purple-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 shadow-lg text-slate-400'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        card.type === 'question'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {card.type === 'question' ? '❓ โจทย์' : '💡 คำตอบ'}
                    </span>
                    {card.isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold leading-relaxed line-clamp-4 text-center my-auto">
                    {card.content}
                  </p>

                  <div className="text-[10px] text-center text-slate-400 opacity-70">
                    {card.isMatched ? 'จับคู่ถูกต้องแล้ว ✨' : 'ค้นหาคู่ตรงข้าม'}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">EDUQUEST</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Victory Modal */}
      <AnimatePresence>
        {gameWon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl p-6 text-center text-white space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
                🎉
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
                ยินดีด้วย! จับคู่ครบทุกใบ!
              </h2>
              <p className="text-xs text-slate-400">
                คุณใช้เวลาไปเพียง {formatTime(timerSeconds)} และทำคอมโบสูงสุด x{maxCombo}
              </p>

              <div className="grid grid-cols-3 gap-2 py-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">คะแนน</span>
                  <b className="text-base text-amber-400">{score} PTS</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">XP ที่ได้รับ</span>
                  <b className="text-base text-emerald-400">+{Math.max(100, Math.floor(score / 4))}</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">เหรียญทอง</span>
                  <b className="text-base text-yellow-400">+{Math.max(20, Math.floor(score / 20))} 🪙</b>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={initGame}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>เล่นรอบใหม่</span>
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  กลับหน้ารวมเกม
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
