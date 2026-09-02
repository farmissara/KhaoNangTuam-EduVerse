import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BossMonster, Question } from '../../types';
import { INITIAL_BOSSES } from '../../data/mockData';
import {
  Shield,
  Heart,
  Zap,
  Sword,
  Flame,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface SurvivalBossGameProps {
  onBack: () => void;
}

export const SurvivalBossGame: React.FC<SurvivalBossGameProps> = ({ onBack }) => {
  const { currentStudent, updateStudent, questions, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [selectedBoss, setSelectedBoss] = useState<BossMonster>(INITIAL_BOSSES[0]);
  const [bossHp, setBossHp] = useState<number>(INITIAL_BOSSES[0].maxHp);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerRage, setPlayerRage] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'selecting' | 'fighting' | 'won' | 'lost'>('selecting');

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [attackEffect, setAttackEffect] = useState<'player-slash' | 'boss-strike' | 'ultimate-blast' | null>(null);

  const startFight = (boss: BossMonster) => {
    playSound('click');
    setSelectedBoss(boss);
    setBossHp(boss.maxHp);
    setPlayerHp(100);
    setPlayerRage(0);

    // Filter questions for this boss subject or random
    const pool = questions.filter(q => q.subjectId === boss.subjectId);
    const fightQs = (pool.length >= 8 ? pool : questions).sort(() => 0.5 - Math.random()).slice(0, 15);
    setGameQuestions(fightQs);
    setQIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setGameStatus('fighting');
    triggerMascotTip(`เผชิญหน้ากับ "${boss.name}"! ตอบคำถามให้ถูกต้องเพื่อโจมตีบอส อย่าให้พลังชีวิตหมดนะ! ⚔️`, 'cheering');
  };

  const currentQ = gameQuestions[qIndex];

  const handleSelectOption = (optIdx: number) => {
    if (answered || !currentQ) return;
    setSelectedOption(optIdx);
    setAnswered(true);

    const isCorrect = optIdx === currentQ.correctIndex;

    if (isCorrect) {
      // Player attacks Boss!
      playSound('battle-hit');
      setAttackEffect('player-slash');
      const baseDmg = currentQ.difficulty === 'hard' ? 75 : currentQ.difficulty === 'medium' ? 55 : 40;
      const nextBossHp = Math.max(0, bossHp - baseDmg);
      setBossHp(nextBossHp);
      setPlayerRage(prev => Math.min(100, prev + 25));

      setTimeout(() => {
        setAttackEffect(null);
        if (nextBossHp <= 0) {
          handleBossDefeated();
        }
      }, 600);
    } else {
      // Boss attacks Player!
      playSound('wrong');
      setAttackEffect('boss-strike');
      const dmgTaken = selectedBoss.attackPower || 25;
      const nextPlayerHp = Math.max(0, playerHp - dmgTaken);
      setPlayerHp(nextPlayerHp);

      setTimeout(() => {
        setAttackEffect(null);
        if (nextPlayerHp <= 0) {
          handlePlayerLost();
        }
      }, 600);
    }
  };

  const handleCastUltimate = (type: 'strike' | 'heal') => {
    if (playerRage < 100 || answered) return;
    playSound('battle-hit');
    setPlayerRage(0);

    if (type === 'strike') {
      setAttackEffect('ultimate-blast');
      const nextBossHp = Math.max(0, bossHp - 160);
      setBossHp(nextBossHp);
      triggerMascotTip('⚡ ท่าไม้ตายอัสนีบาตปัญญา! โจมตีบอสอย่างรุนแรง 160 DMG!', 'cheering');

      setTimeout(() => {
        setAttackEffect(null);
        if (nextBossHp <= 0) {
          handleBossDefeated();
        }
      }, 700);
    } else {
      setPlayerHp(prev => Math.min(100, prev + 45));
      triggerMascotTip('💚 มนต์ฟื้นฟูพลังชีวิต +45 HP!', 'happy');
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (qIndex + 1 < gameQuestions.length) {
      setQIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      // Shuffle more questions if boss is still alive
      const pool = questions.sort(() => 0.5 - Math.random());
      setGameQuestions(pool);
      setQIndex(0);
      setSelectedOption(null);
      setAnswered(false);
    }
  };

  const handleBossDefeated = () => {
    setGameStatus('won');
    triggerConfetti();
    playSound('victory');

    // Reward student
    updateStudent({
      ...currentStudent,
      xp: currentStudent.xp + selectedBoss.rewardXp,
      coins: currentStudent.coins + selectedBoss.rewardCoins,
      level: Math.floor((currentStudent.xp + selectedBoss.rewardXp) / 500) + 1,
      battleWins: currentStudent.battleWins + 1
    });

    triggerMascotTip(`สุดยอดผู้กล้า! ปราบ "${selectedBoss.name}" สำเร็จ รับ +${selectedBoss.rewardXp} XP และ +${selectedBoss.rewardCoins} เหรียญทอง! 🏆🔥`, 'cheering');
  };

  const handlePlayerLost = () => {
    setGameStatus('lost');
    playSound('wrong');
    triggerMascotTip('พลังชีวิตหมดลงแล้ว! ฝึกฝนทบทวนความรู้แล้วมาแก้มือใหม่นะ! 💪', 'thinking');
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

        <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>โหมดเอาชีวิตรอด: พิชิตบอส (Survival Boss Rush)</span>
        </div>
      </div>

      {/* Screen 1: Boss Selection */}
      {gameStatus === 'selecting' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-white text-center">
            <h2 className="text-xl sm:text-2xl font-black mb-1">เลือกบอสประจำวิชาที่ต้องการท้าทาย</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              ตอบคำถามวิชาการเพื่อสะสมพลังโจมตีและท่าไม้ตาย พร้อมเอาชีวิตรอดจากการโจมตีของบอส
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INITIAL_BOSSES.map(boss => (
              <motion.div
                key={boss.id}
                whileHover={{ y: -4 }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 h-36">
                    <img src={boss.imageUrl} alt={boss.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      HP {boss.maxHp}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{boss.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{boss.description}</p>

                  <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>วิชา:</span>
                      <b className="text-indigo-400">{boss.subjectName}</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>พลังโจมตีบอส:</span>
                      <b className="text-rose-400">{boss.attackPower} DMG / ข้อผิด</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>รางวัล:</span>
                      <b className="text-amber-400">+{boss.rewardXp} XP / +{boss.rewardCoins} 🪙</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startFight(boss)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sword className="w-4 h-4" />
                  <span>เริ่มประลองกับบอส</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Screen 2: Active Boss Fight Arena */}
      {gameStatus === 'fighting' && (
        <div className="space-y-4">
          {/* Boss & Player Status Arena */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden text-white">
            {/* Visual Attack Flash FX */}
            {attackEffect === 'player-slash' && (
              <div className="absolute inset-0 bg-indigo-500/20 pointer-events-none animate-pulse flex items-center justify-center z-10">
                <span className="text-4xl font-black text-indigo-300 animate-bounce">⚡ CRITICAL HIT!</span>
              </div>
            )}
            {attackEffect === 'boss-strike' && (
              <div className="absolute inset-0 bg-rose-600/30 pointer-events-none animate-ping flex items-center justify-center z-10">
                <span className="text-4xl font-black text-rose-300">💥 BOSS ATTACK!</span>
              </div>
            )}
            {attackEffect === 'ultimate-blast' && (
              <div className="absolute inset-0 bg-amber-500/30 pointer-events-none flex items-center justify-center z-10">
                <span className="text-4xl font-black text-amber-200 animate-bounce">🌟 ULTIMATE KNOWLEDGE BLAST!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Boss Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-rose-500/60 shadow-lg flex-shrink-0 bg-slate-950">
                  <img src={selectedBoss.imageUrl} alt={selectedBoss.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-sm sm:text-base text-rose-300">{selectedBoss.name}</h3>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {bossHp} / {selectedBoss.maxHp} HP
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                      style={{ width: `${(bossHp / selectedBoss.maxHp) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">วิชา: {selectedBoss.subjectName}</span>
                </div>
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/60 shadow-lg flex-shrink-0 bg-slate-950">
                  <img src={currentStudent.avatar} alt={currentStudent.firstName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-indigo-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> พลังชีวิตผู้เล่น
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{playerHp} / 100 HP</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${playerHp}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> เกจท่าไม้ตาย (Ultimate)
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{playerRage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${playerRage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultimate Spell Trigger Buttons */}
            {playerRage >= 100 && !answered && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleCastUltimate('strike')}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-bounce cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>ใช้ท่าไม้ตาย "อัสนีบาตปัญญา" (160 DMG)</span>
                </button>
                <button
                  onClick={() => handleCastUltimate('heal')}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>ใช้มนต์ "ฟื้นฟูชีวา" (+45 HP)</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">คำถามข้อที่ {qIndex + 1}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                  {currentQ.subjectName}
                </span>
              </div>

              <h4 className="text-base font-bold text-white leading-relaxed">{currentQ.questionText}</h4>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;

                  let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700';

                  if (answered) {
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
                      disabled={answered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Question Drawer */}
              {answered && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {selectedOption === currentQ.correctIndex ? (
                      <b className="text-emerald-400">โจมตีบอสสำเร็จ! ✨</b>
                    ) : (
                      <b className="text-rose-400">ถูกบอสโจมตีสวนกลับ! 💥</b>
                    )}
                  </span>
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    ข้อต่อไป ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Screen 3: Victory Modal */}
      <AnimatePresence>
        {gameStatus === 'won' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl p-6 text-center text-white space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 animate-bounce">
                👑
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-300 via-white to-teal-300 bg-clip-text text-transparent">
                ชัยชนะอันยิ่งใหญ่! ปราบ {selectedBoss.name} สำเร็จ!
              </h2>
              <p className="text-xs text-slate-400">
                คุณสามารถปกป้องอาณาจักรความรู้และเอาชีวิตรอดจากการโจมตีอันดุเดือดได้สำเร็จ
              </p>

              <div className="grid grid-cols-2 gap-3 py-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">XP รางวัล</span>
                  <b className="text-base text-emerald-400">+{selectedBoss.rewardXp} XP</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">เหรียญทอง</span>
                  <b className="text-base text-yellow-400">+{selectedBoss.rewardCoins} 🪙</b>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setGameStatus('selecting')}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  เลือกบอสตัวอื่น
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

      {/* Screen 4: Defeat Modal */}
      <AnimatePresence>
        {gameStatus === 'lost' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/50 shadow-2xl p-6 text-center text-white space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 to-red-800 flex items-center justify-center text-4xl shadow-xl shadow-rose-600/30">
                💀
              </div>
              <h2 className="text-2xl font-black text-rose-400">พลังชีวิตหมดลงแล้ว!</h2>
              <p className="text-xs text-slate-400">
                บอส {selectedBoss.name} แข็งแกร่งมาก ลองทบทวนเนื้อหาและลองใหม่อีกครั้ง!
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => startFight(selectedBoss)}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ลองสู้อีกครั้ง</span>
                </button>
                <button
                  onClick={() => setGameStatus('selecting')}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  เลือกบอสตัวอื่น
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
