import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { TowerStage, Question } from '../../types';
import {
  Sparkles,
  Star,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Shield,
  RotateCcw,
  Zap,
  Award,
  Crown
} from 'lucide-react';

interface TowerClimbGameProps {
  onBack: () => void;
}

export const TowerClimbGame: React.FC<TowerClimbGameProps> = ({ onBack }) => {
  const { towerStages, questions, updateStageStars, playSound, triggerConfetti, triggerMascotTip, currentStudent, updateStudent } = useApp();

  const [activeStage, setActiveStage] = useState<TowerStage | null>(null);
  const [stageQuestions, setStageQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [stageComplete, setStageComplete] = useState<boolean>(false);

  const totalStarsEarned = towerStages.reduce((sum, s) => sum + s.starsEarned, 0);

  const handleStartStage = (stage: TowerStage) => {
    if (!stage.isUnlocked) {
      playSound('wrong');
      triggerMascotTip(`ด่านนี้ยังล็อคอยู่! ต้องการดาวสะสมอย่างน้อย ${stage.requiredStars} ดวงเพื่อปลดล็อค ⭐`, 'thinking');
      return;
    }

    playSound('click');
    setActiveStage(stage);

    // Pick 5 questions matching difficulty or subject
    const stagePool = questions.filter(
      q => q.difficulty === stage.difficulty || stage.difficulty === 'hard'
    );
    const qs = (stagePool.length >= 5 ? stagePool : questions).sort(() => 0.5 - Math.random()).slice(0, 5);

    setStageQuestions(qs);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setCorrectCount(0);
    setStageComplete(false);
    triggerMascotTip(`เข้าสู่ ${stage.name}! พิชิตคะแนนเพื่อคว้า 3 ดาวและปลดล็อคชั้นต่อไป! 🏰`, 'cheering');
  };

  const currentQ = stageQuestions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered || !currentQ) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      playSound('correct');
      setCorrectCount(prev => prev + 1);
    } else {
      playSound('wrong');
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentQIndex + 1 < stageQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      handleFinishStage();
    }
  };

  const handleFinishStage = () => {
    if (!activeStage) return;

    setStageComplete(true);
    const finalScore = correctCount + (selectedOption === currentQ?.correctIndex ? 1 : 0);
    
    // Calculate stars: 5/5 = 3 stars, 3-4/5 = 2 stars, 1-2/5 = 1 star, 0 = 0
    let starsEarned = 0;
    if (finalScore >= 5) starsEarned = 3;
    else if (finalScore >= 3) starsEarned = 2;
    else if (finalScore >= 1) starsEarned = 1;

    updateStageStars(activeStage.stageNumber, starsEarned);

    const earnedXp = activeStage.rewardXp + starsEarned * 30;
    const earnedCoins = activeStage.rewardCoins + starsEarned * 10;

    updateStudent({
      ...currentStudent,
      xp: currentStudent.xp + earnedXp,
      coins: currentStudent.coins + earnedCoins,
      level: Math.floor((currentStudent.xp + earnedXp) / 500) + 1
    });

    if (starsEarned > 0) {
      triggerConfetti();
      playSound('victory');
      triggerMascotTip(`ผ่านด่าน ${activeStage.name} สำเร็จ! ได้รับ ${starsEarned} ดาว ⭐ (+${earnedXp} XP, +${earnedCoins} 🪙)`, 'cheering');
    } else {
      playSound('wrong');
      triggerMascotTip('เกือบผ่านแล้ว! ลองใหม่อีกครั้งเพื่อเก็บดาวนะ!', 'thinking');
    }
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
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>ดาวสะสม: {totalStarsEarned} / {towerStages.length * 3}</span>
          </div>
        </div>
      </div>

      {/* Screen 1: Stage Select Map */}
      {!activeStage && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2">
                <span>🏰 หอคอยความรู้ผจญภัย (Tower Quest)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                ไต่ระดับหอคอย 5 ชั้น ท้าทายโจทย์ความรู้เพื่อสะสมดาวและปลดล็อคชั้นที่สูงขึ้น
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">ระดับความก้าวหน้า:</span>
              <div className="w-32 h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${(totalStarsEarned / (towerStages.length * 3)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tower Stages Vertical Path */}
          <div className="space-y-3">
            {[...towerStages].reverse().map(stage => {
              const isBossStage = stage.stageNumber === 5;

              return (
                <motion.div
                  key={stage.id}
                  whileHover={stage.isUnlocked ? { scale: 1.01 } : {}}
                  onClick={() => handleStartStage(stage)}
                  className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                    !stage.isUnlocked
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60 text-slate-500'
                      : isBossStage
                      ? 'bg-gradient-to-r from-red-950/80 to-purple-950/80 border-red-500/50 shadow-xl shadow-red-950/40 text-white'
                      : stage.isCompleted
                      ? 'bg-slate-900/90 border-emerald-500/40 text-white'
                      : 'bg-slate-900/90 border-indigo-500/40 text-white shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border flex-shrink-0 ${
                        !stage.isUnlocked
                          ? 'bg-slate-800 border-slate-700 text-slate-500'
                          : isBossStage
                          ? 'bg-red-600 text-white border-red-400 animate-pulse'
                          : stage.isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-indigo-600 text-white border-indigo-400'
                      }`}
                    >
                      {stage.isUnlocked ? (
                        isBossStage ? <Crown className="w-6 h-6" /> : `F${stage.stageNumber}`
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm sm:text-base">{stage.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-800 border border-slate-700">
                          {stage.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {/* Stars Earned */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(starNum => (
                        <Star
                          key={starNum}
                          className={`w-5 h-5 ${
                            starNum <= stage.starsEarned
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Action button */}
                    <button
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        !stage.isUnlocked
                          ? 'bg-slate-800 text-slate-500 border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      {stage.isUnlocked ? (stage.isCompleted ? 'เล่นซ้ำ' : 'ลุยด่านนี้') : `ต้องมี ${stage.requiredStars} ⭐`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Active Stage Quiz */}
      {activeStage && !stageComplete && currentQ && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300">
              {activeStage.name} • ข้อที่ {currentQIndex + 1} จาก {stageQuestions.length}
            </span>
            <span className="text-emerald-400 font-bold">ตอบถูกแล้ว: {correctCount} ข้อ</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white leading-relaxed">{currentQ.questionText}</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700';

                if (hasAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950 border-rose-500 text-rose-300 font-bold';
                  } else {
                    btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {selectedOption === currentQ.correctIndex ? (
                    <b className="text-emerald-400">ตอบถูกต้อง! ✨</b>
                  ) : (
                    <b className="text-rose-400">ตอบผิด! ดูเฉลย: {currentQ.options[currentQ.correctIndex]}</b>
                  )}
                </span>
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  {currentQIndex + 1 < stageQuestions.length ? 'ข้อต่อไป ➔' : 'ดูผลลัพธ์ด่าน'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 3: Stage Complete Modal */}
      <AnimatePresence>
        {stageComplete && activeStage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/50 shadow-2xl p-6 text-center text-white space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/30 animate-bounce">
                🏰
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
                พิชิต {activeStage.name}!
              </h2>
              
              {/* Stars Display */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3].map(num => {
                  const hasStar =
                    num <= (correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : correctCount >= 1 ? 1 : 0);
                  return (
                    <Star
                      key={num}
                      className={`w-8 h-8 ${
                        hasStar ? 'fill-amber-400 text-amber-400 animate-pulse' : 'text-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">ตอบถูก</span>
                  <b className="text-base text-emerald-400">{correctCount} / {stageQuestions.length} ข้อ</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">รางวัลรวม</span>
                  <b className="text-base text-amber-400">+{activeStage.rewardXp} XP</b>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleStartStage(activeStage)}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>เล่นด่านนี้ใหม่</span>
                </button>
                <button
                  onClick={() => setActiveStage(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  กลับสู่แผนที่หอคอย
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
