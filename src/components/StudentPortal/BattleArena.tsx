import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Question, Subject, BattleOpponent, BattlePowerup } from '../../types';
import {
  Sword,
  Shield,
  Zap,
  Flame,
  Heart,
  Clock,
  Award,
  Sparkles,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Crown,
  Bot
} from 'lucide-react';

const BOT_OPPONENTS: BattleOpponent[] = [
  {
    id: 'BOT_1',
    name: 'น้องบ็อต ปัญญาประดิษฐ์',
    avatar: '🤖',
    level: 6,
    title: 'AI Challenger',
    isBot: true,
    botDifficulty: 'medium'
  },
  {
    id: 'BOT_2',
    name: 'จอมยุทธ์ สปีดเร็ว',
    avatar: '⚡',
    level: 8,
    title: 'Speed Demon',
    isBot: true,
    botDifficulty: 'smart'
  },
  {
    id: 'BOT_3',
    name: 'มังกรเพลิง ปริศนา',
    avatar: '🐲',
    level: 9,
    title: 'Dragon Boss',
    isBot: true,
    botDifficulty: 'smart'
  }
];

export const BattleArena: React.FC = () => {
  const {
    currentStudent,
    updateStudent,
    subjects,
    questions,
    playSound,
    triggerConfetti,
    triggerMascotTip,
    theme
  } = useApp();

  const [gameState, setGameState] = useState<'lobby' | 'matchmaking' | 'battle' | 'ended'>('lobby');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'SUB_SCI');
  const [opponent, setOpponent] = useState<BattleOpponent>(BOT_OPPONENTS[0]);

  // Battle room state
  const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [playerCombo, setPlayerCombo] = useState(0);
  const [opponentCombo, setOpponentCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasAnsweredRound, setHasAnsweredRound] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [hitEffect, setHitEffect] = useState<'none' | 'player' | 'opponent'>('none');

  // Active powerups
  const [shieldActive, setShieldActive] = useState(false);
  const [doubleXpActive, setDoubleXpActive] = useState(false);

  const startMatchmaking = () => {
    playSound('click');
    setGameState('matchmaking');
    triggerMascotTip('กำลังค้นหาคู่ต่อสู้ที่สมน้ำสมเนื้อในสังเวียน... ⚔️', 'thinking');

    // Filter questions for chosen subject
    let subjectQs = questions.filter(q => q.subjectId === selectedSubjectId);
    if (subjectQs.length === 0) subjectQs = questions;
    const shuffled = [...subjectQs].sort(() => 0.5 - Math.random()).slice(0, 5);

    setTimeout(() => {
      const chosenBot = BOT_OPPONENTS[Math.floor(Math.random() * BOT_OPPONENTS.length)];
      setOpponent(chosenBot);
      setBattleQuestions(shuffled);
      setCurrentRound(0);
      setPlayerHp(100);
      setOpponentHp(100);
      setPlayerCombo(0);
      setOpponentCombo(0);
      setBattleLogs([`สังเวียนเปิดแล้ว! การดวลวิชา ${subjects.find(s => s.id === selectedSubjectId)?.name} เริ่มต้นขึ้น!`]);
      setGameState('battle');
      setHasAnsweredRound(false);
      setSelectedOption(null);
      setTimeLeft(15);
      playSound('battle-hit');
      triggerMascotTip(`เจอกับ ${chosenBot.name} แล้ว! ตั้งสมาธิแล้วตอบให้ไวที่สุดนะ! 🔥`, 'cheering');
    }, 1800);
  };

  const currentQ = battleQuestions[currentRound];

  // Round Timer
  useEffect(() => {
    if (gameState !== 'battle' || hasAnsweredRound || !currentQ) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentRound, hasAnsweredRound, currentQ]);

  const handleRoundTimeout = () => {
    if (hasAnsweredRound) return;
    handleAnswerRound(-1);
  };

  const handleAnswerRound = (optionIndex: number) => {
    if (hasAnsweredRound || !currentQ) return;

    setSelectedOption(optionIndex);
    setHasAnsweredRound(true);

    const isPlayerCorrect = optionIndex === currentQ.correctIndex;

    // Simulate bot answering accuracy
    const botAccuracy = opponent.botDifficulty === 'smart' ? 0.8 : opponent.botDifficulty === 'medium' ? 0.6 : 0.4;
    const isBotCorrect = Math.random() < botAccuracy;

    // Calculate player damage
    let damageToOpponent = 0;
    if (isPlayerCorrect) {
      const speedBonus = timeLeft > 10 ? 10 : timeLeft > 5 ? 5 : 0;
      const comboBonus = playerCombo * 5;
      damageToOpponent = 20 + speedBonus + comboBonus;
      setPlayerCombo(prev => prev + 1);
      setHitEffect('opponent');
      playSound('battle-hit');
    } else {
      setPlayerCombo(0);
    }

    // Calculate opponent damage
    let damageToPlayer = 0;
    if (isBotCorrect) {
      damageToPlayer = 20 + opponentCombo * 4;
      if (shieldActive) {
        damageToPlayer = Math.round(damageToPlayer * 0.4); // Shield blocks 60%
        setShieldActive(false);
        setBattleLogs(prev => ['🛡️ โล่ป้องกันช่วยลดดาเมจจากการโจมตี!', ...prev]);
      }
      setOpponentCombo(prev => prev + 1);
      if (!isPlayerCorrect) {
        setHitEffect('player');
      }
    } else {
      setOpponentCombo(0);
    }

    // Apply HP changes
    const nextOpponentHp = Math.max(0, opponentHp - damageToOpponent);
    const nextPlayerHp = Math.max(0, playerHp - damageToPlayer);

    setOpponentHp(nextOpponentHp);
    setPlayerHp(nextPlayerHp);

    // Add log
    const logMsg = `รอบที่ ${currentRound + 1}: ${
      isPlayerCorrect ? `คุณตอบถูก โจมตี ${damageToOpponent} HP!` : 'คุณตอบผิด!'
    } | ${opponent.name} ${isBotCorrect ? `ตอบถูก โจมตี ${damageToPlayer} HP!` : 'ตอบผิดพลาด!'}`;
    setBattleLogs(prev => [logMsg, ...prev]);

    // Check Win/Loss conditions
    setTimeout(() => {
      setHitEffect('none');
      if (nextOpponentHp <= 0 || nextPlayerHp <= 0 || currentRound + 1 >= battleQuestions.length) {
        finishBattle(nextPlayerHp, nextOpponentHp);
      } else {
        // Next round
        setCurrentRound(prev => prev + 1);
        setHasAnsweredRound(false);
        setSelectedOption(null);
        setTimeLeft(15);
      }
    }, 2400);
  };

  const finishBattle = (finalPlayerHp: number, finalOpponentHp: number) => {
    setGameState('ended');
    const isWin = finalPlayerHp > finalOpponentHp;

    if (isWin) {
      triggerConfetti();
      playSound('victory');
      const earnedXp = doubleXpActive ? 240 : 120;
      const earnedCoins = 30;

      updateStudent({
        ...currentStudent,
        battleWins: currentStudent.battleWins + 1,
        xp: currentStudent.xp + earnedXp,
        coins: currentStudent.coins + earnedCoins,
        level: Math.floor((currentStudent.xp + earnedXp) / 500) + 1
      });

      triggerMascotTip('ชนะการดวล Battle สำเร็จ! รับเหรียญและ XP ไปเลยแชมป์เปี้ยน! 👑🎉', 'cheering');
    } else {
      playSound('wrong');
      const earnedXp = 40;
      const earnedCoins = 5;

      updateStudent({
        ...currentStudent,
        battleLosses: currentStudent.battleLosses + 1,
        xp: currentStudent.xp + earnedXp,
        coins: currentStudent.coins + earnedCoins
      });

      triggerMascotTip('รอบนี้พลาดไปนิดเดียว! ฝึกฝนทบทวนเนื้อหาแล้วกลับมาท้าดวลใหม่นะ! 💪', 'thinking');
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-4 px-3 sm:px-0">
      {/* State 1: Lobby View */}
      {gameState === 'lobby' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold mb-3">
                  <Sword className="w-3.5 h-3.5 text-rose-400" />
                  สังเวียนประลองความรู้ 1v1
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
                  Battle Arena • ดวลตอบไวชิงคะแนน
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  ประลองความรู้กับบอทอัจฉริยะและเพื่อนในห้อง ตอบถูกให้ไวเพื่อทำดาเมจคอมโบ X2!
                  ชนะเพื่อรับ XP และเหรียญทองก้อนโต
                </p>
              </div>

              {/* Student Battle Stats Card */}
              <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-around md:justify-start gap-6 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">ชนะ (Wins)</div>
                  <div className="text-2xl font-black text-emerald-400">{currentStudent.battleWins}</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-800" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">แพ้ (Losses)</div>
                  <div className="text-2xl font-black text-rose-400">{currentStudent.battleLosses}</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-800" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">อัตราชนะ</div>
                  <div className="text-2xl font-black text-amber-400">
                    {currentStudent.battleWins + currentStudent.battleLosses > 0
                      ? Math.round(
                          (currentStudent.battleWins /
                            (currentStudent.battleWins + currentStudent.battleLosses)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. เลือกหมวดวิชาที่ต้องการประลอง:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {subjects.map(subj => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedSubjectId(subj.id);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-400 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xl">📚</div>
                    <div className="text-xs font-bold truncate w-full">{subj.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400">{subj.code}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Battle Launch Button */}
          <div className="text-center pt-2">
            <button
              onClick={startMatchmaking}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Sword className="w-5 h-5 text-amber-300" />
              <span>ค้นหาคู่ต่อสู้ & เริ่มดวลเลย!</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* State 2: Matchmaking */}
      {gameState === 'matchmaking' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-3xl bg-slate-900/95 border border-rose-500/30 text-center text-white shadow-2xl my-12"
        >
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
            <Sword className="w-10 h-10 text-rose-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-2">กำลังจับคู่สังเวียน...</h3>
          <p className="text-xs text-slate-400">เตรียมพร้อมระบบคำถาม 5 ข้อ</p>
        </motion.div>
      )}

      {/* State 3: Live Battle Arena */}
      {gameState === 'battle' && currentQ && (
        <div className="space-y-4">
          {/* Top Score & HP Bars (Player vs Opponent) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Side */}
            <motion.div
              animate={hitEffect === 'player' ? { x: [-10, 10, -5, 5, 0] } : {}}
              className="p-4 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl">{currentStudent.avatar}</div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{currentStudent.prefix}{currentStudent.firstName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                        Lv.{currentStudent.level}
                      </span>
                    </div>
                    <div className="text-[10px] text-indigo-300">
                      Combo: <span className="font-bold text-amber-400">X{playerCombo}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                    {playerHp} / 100 HP
                  </div>
                </div>
              </div>

              {/* Player HP Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    playerHp > 40 ? 'bg-emerald-500' : playerHp > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  animate={{ width: `${playerHp}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Opponent Side */}
            <motion.div
              animate={hitEffect === 'opponent' ? { x: [-10, 10, -5, 5, 0] } : {}}
              className="p-4 rounded-3xl bg-slate-900/90 border border-rose-500/40 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl">{opponent.avatar}</div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{opponent.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white">
                        Lv.{opponent.level}
                      </span>
                    </div>
                    <div className="text-[10px] text-rose-300">
                      Combo: <span className="font-bold text-amber-400">X{opponentCombo}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-rose-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-400" />
                    {opponentHp} / 100 HP
                  </div>
                </div>
              </div>

              {/* Opponent HP Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    opponentHp > 40 ? 'bg-rose-500' : opponentHp > 20 ? 'bg-amber-500' : 'bg-red-700'
                  }`}
                  animate={{ width: `${opponentHp}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </div>

          {/* Battle Question Box */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-amber-400">
                ยกที่ {currentRound + 1} จาก {battleQuestions.length}
              </span>
              <div
                className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full ${
                  timeLeft <= 5 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold leading-relaxed mb-6">
              {currentQ.questionText}
            </h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';
                if (hasAnsweredRound) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500';
                  } else {
                    btnStyle = 'opacity-50 bg-slate-900 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredRound}
                    onClick={() => handleAnswerRound(idx)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {hasAnsweredRound && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {hasAnsweredRound && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Battle Logs ticker */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 max-h-24 overflow-y-auto space-y-1">
            {battleLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="text-indigo-400">⚔️</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State 4: Battle Ended View */}
      {gameState === 'ended' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-2xl text-center text-white max-w-xl mx-auto my-8"
        >
          {playerHp > opponentHp ? (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 animate-bounce">
                👑
              </div>
              <h2 className="text-3xl font-black text-amber-400 mb-1">ชัยชนะเป็นของคุณ! (VICTORY)</h2>
              <p className="text-xs text-slate-400 mb-6">
                คุณเอาชนะ {opponent.name} ได้อย่างสมเกียรติ!
              </p>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 mb-6 inline-flex gap-6">
                <div>
                  <div className="text-[10px] text-slate-400">รางวัล XP</div>
                  <div className="text-lg font-bold text-amber-400">+120 XP</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-700" />
                <div>
                  <div className="text-[10px] text-slate-400">เหรียญทอง</div>
                  <div className="text-lg font-bold text-yellow-400">+30 🪙</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-4xl shadow-lg">
                🛡️
              </div>
              <h2 className="text-2xl font-black text-slate-300 mb-1">ยังไม่สามารถคว้าชัยได้ในรอบนี้</h2>
              <p className="text-xs text-slate-400 mb-6">
                อย่าเพิ่งยอมแพ้! ฝึกทำแบบฝึกหัดเพิ่มแล้วมาแก้มือใหม่นะ
              </p>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 mb-6 inline-flex gap-4">
                <div>
                  <div className="text-[10px] text-slate-400">รางวัลปลอบใจ</div>
                  <div className="text-sm font-bold text-indigo-300">+40 XP</div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setGameState('lobby')}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
            >
              กลับสู่สังเวียน
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
