import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import {
  Sparkles,
  Heart,
  Key,
  Compass,
  Trophy,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shield,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Gem,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TreasureMazeGameProps {
  onBack: () => void;
}

type CellType = 'path' | 'wall' | 'question_door' | 'treasure' | 'boss' | 'exit';

interface DungeonCell {
  x: number;
  y: number;
  type: CellType;
  visited: boolean;
  cleared?: boolean;
  question?: Question;
}

const MAZE_SIZE = 5;

export const TreasureMazeGame: React.FC<TreasureMazeGameProps> = ({ onBack }) => {
  const { questions, submitAnswer, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [grid, setGrid] = useState<DungeonCell[][]>([]);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hp, setHp] = useState(3);
  const [keys, setKeys] = useState(1);
  const [gems, setGems] = useState(0);
  const [score, setScore] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [pendingMove, setPendingMove] = useState<{ x: number; y: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);
  const [lootSummary, setLootSummary] = useState<{ xp: number; coins: number; chestsOpened: number }>({
    xp: 0,
    coins: 0,
    chestsOpened: 0
  });

  // Generate Maze Layout
  const initMaze = () => {
    const qPool = [...questions].sort(() => Math.random() - 0.5);
    let qIndex = 0;

    const newGrid: DungeonCell[][] = [];
    for (let y = 0; y < MAZE_SIZE; y++) {
      const row: DungeonCell[] = [];
      for (let x = 0; x < MAZE_SIZE; x++) {
        let type: CellType = 'path';

        if (x === 0 && y === 0) {
          type = 'path';
        } else if (x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1) {
          type = 'exit';
        } else {
          const rand = Math.random();
          if (rand < 0.25) {
            type = 'question_door';
          } else if (rand < 0.45) {
            type = 'treasure';
          } else if (rand < 0.55 && (x > 2 || y > 2)) {
            type = 'boss';
          } else if (rand < 0.70) {
            type = 'wall';
          }
        }

        const cellQuestion = (type === 'question_door' || type === 'treasure' || type === 'boss')
          ? qPool[qIndex++ % qPool.length]
          : undefined;

        row.push({
          x,
          y,
          type,
          visited: x === 0 && y === 0,
          cleared: false,
          question: cellQuestion
        });
      }
      newGrid.push(row);
    }

    // Ensure path exists by clearing simple pathway
    newGrid[0][1].type = 'path';
    newGrid[1][0].type = 'path';
    newGrid[MAZE_SIZE - 1][MAZE_SIZE - 2].type = 'question_door';
    newGrid[MAZE_SIZE - 1][MAZE_SIZE - 2].question = qPool[qIndex++ % qPool.length];

    setGrid(newGrid);
    setPlayerPos({ x: 0, y: 0 });
    setHp(3);
    setKeys(1);
    setGems(0);
    setScore(0);
    setIsGameOver(false);
    setGameResult(null);
    setActiveQuestion(null);
    setPendingMove(null);
    setLootSummary({ xp: 0, coins: 0, chestsOpened: 0 });
  };

  useEffect(() => {
    initMaze();
  }, [questions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeQuestion || isGameOver) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleMove(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleMove(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleMove(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleMove(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, activeQuestion, isGameOver, grid]);

  const handleMove = (dx: number, dy: number) => {
    if (activeQuestion || isGameOver) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= MAZE_SIZE || newY < 0 || newY >= MAZE_SIZE) return;

    const targetCell = grid[newY][newX];
    if (targetCell.type === 'wall') {
      playSound('wrong');
      triggerMascotTip('ติดกำแพงหินศิลา! ลองหาเส้นทางอื่นในเขาวงกตดูครับ 🧱', 'thinking');
      return;
    }

    // If cell has an uncleared question (door, chest, boss)
    if (!targetCell.cleared && (targetCell.type === 'question_door' || targetCell.type === 'treasure' || targetCell.type === 'boss')) {
      if (targetCell.question) {
        playSound('click');
        setActiveQuestion(targetCell.question);
        setPendingMove({ x: newX, y: newY });
        return;
      }
    }

    // Move player directly
    executeMove(newX, newY);
  };

  const executeMove = (targetX: number, targetY: number) => {
    playSound('click');
    setPlayerPos({ x: targetX, y: targetY });

    const updated = grid.map(row =>
      row.map(cell => {
        if (cell.x === targetX && cell.y === targetY) {
          return { ...cell, visited: true };
        }
        return cell;
      })
    );
    setGrid(updated);

    const dest = updated[targetY][targetX];
    if (dest.type === 'exit') {
      handleExitReached();
    }
  };

  const handleAnswerQuestion = (selectedOption: number) => {
    if (!activeQuestion || !pendingMove) return;

    const isCorrect = selectedOption === activeQuestion.correctIndex;
    const timeSpent = 6;

    submitAnswer({
      questionId: activeQuestion.id,
      selectedOption,
      timeSpentSeconds: timeSpent,
      mode: 'dungeon'
    });

    const targetCell = grid[pendingMove.y][pendingMove.x];

    if (isCorrect) {
      playSound('correct');
      triggerConfetti();

      let earnedPts = 100;
      let earnedGems = 1;

      if (targetCell.type === 'treasure') {
        earnedPts = 150;
        earnedGems = 2;
        setLootSummary(prev => ({
          ...prev,
          chestsOpened: prev.chestsOpened + 1,
          coins: prev.coins + 30
        }));
        triggerMascotTip('เปิดหีบสมบัติโบราณสำเร็จ! ได้รับอัญมณีและเหรียญทอง 💎', 'cheering');
      } else if (targetCell.type === 'boss') {
        earnedPts = 250;
        earnedGems = 3;
        triggerMascotTip('ปราบผู้พิทักษ์ดันเจี้ยนสำเร็จ! ทางเปิดแล้ว! ⚔️', 'cheering');
      } else {
        triggerMascotTip('ไขรหัสเปิดประตูกลสำเร็จ! ได้รับกุญแจทองคำ 🗝️', 'happy');
      }

      setScore(prev => prev + earnedPts);
      setGems(prev => prev + earnedGems);
      setKeys(prev => prev + 1);
      setLootSummary(prev => ({ ...prev, xp: prev.xp + earnedPts }));

      // Mark cell as cleared and visited
      const updated = grid.map(row =>
        row.map(cell => {
          if (cell.x === pendingMove.x && cell.y === pendingMove.y) {
            return { ...cell, cleared: true, visited: true, type: 'path' as CellType };
          }
          return cell;
        })
      );
      setGrid(updated);
      setPlayerPos(pendingMove);
      setActiveQuestion(null);
      setPendingMove(null);

      if (targetCell.type === 'exit') {
        handleExitReached();
      }
    } else {
      playSound('wrong');
      const nextHp = hp - 1;
      setHp(nextHp);

      if (nextHp <= 0) {
        setIsGameOver(true);
        setGameResult('defeat');
        setActiveQuestion(null);
        triggerMascotTip('พลังชีวิตหมดลงในดันเจี้ยน! ลองใหม่อีกครั้งนะ 💀', 'surprised');
      } else {
        triggerMascotTip(`ตอบผิด โดนกับดักลด 1 หัวใจ! เหลือ ${nextHp} ดวง ❤️`, 'thinking');
        setActiveQuestion(null);
        setPendingMove(null);
      }
    }
  };

  const handleExitReached = () => {
    setIsGameOver(true);
    setGameResult('victory');
    playSound('victory');
    triggerConfetti();
    triggerMascotTip('ยินดีด้วย! คุณพิชิตดันเจี้ยนเขาวงกตและนำสมบัติออกมาได้สำเร็จ! 🏆', 'cheering');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="maze-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
          >
            ← ย้อนกลับ
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 flex items-center gap-2">
              <span className="text-2xl">🗝️</span> ดันเจี้ยนเขาวงกตล่าสมบัติ
            </h1>
            <p className="text-xs text-slate-400">Treasure Dungeon Maze Quest</p>
          </div>
        </div>

        {/* Player Stats Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* HP Hearts */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < hp ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
              />
            ))}
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold">
            <Gem className="w-4 h-4" />
            <span>{gems}</span>
          </div>

          {/* Keys */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold">
            <Key className="w-4 h-4" />
            <span>{keys}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{score} แต้ม</span>
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maze Grid Stage */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full text-xs text-slate-400 mb-4 px-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                นำทาง 🧙‍♂️ ไปยังประตูทางออก 🏆
              </span>
              <span className="font-mono text-slate-500">ขนาด 5x5 ห้อง</span>
            </div>

            {/* 5x5 Dungeon Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner max-w-md w-full aspect-square">
              {grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayerHere = playerPos.x === x && playerPos.y === y;
                  const isExit = cell.type === 'exit';
                  const isWall = cell.type === 'wall';
                  const isDoor = cell.type === 'question_door' && !cell.cleared;
                  const isChest = cell.type === 'treasure' && !cell.cleared;
                  const isBoss = cell.type === 'boss' && !cell.cleared;

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => {
                        const dx = x - playerPos.x;
                        const dy = y - playerPos.y;
                        if (Math.abs(dx) + Math.abs(dy) === 1) {
                          handleMove(dx, dy);
                        }
                      }}
                      className={`relative rounded-xl border flex items-center justify-center font-bold text-lg sm:text-xl transition-all cursor-pointer select-none touch-manipulation ${
                        isPlayerHere
                          ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/40 scale-105 z-10'
                          : isWall
                          ? 'bg-slate-950 border-slate-900 text-slate-800'
                          : isExit
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 animate-pulse'
                          : isDoor
                          ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300'
                          : isChest
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                          : isBoss
                          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                          : cell.visited
                          ? 'bg-slate-800/80 border-slate-700/60'
                          : 'bg-slate-900/40 border-slate-800/40 opacity-70'
                      }`}
                    >
                      {/* Cell Icon */}
                      {isPlayerHere ? (
                        <span className="text-2xl animate-bounce">🧙‍♂️</span>
                      ) : isExit ? (
                        <span className="text-xl">🏆</span>
                      ) : isWall ? (
                        <span className="text-sm opacity-40">🧱</span>
                      ) : isChest ? (
                        <span className="text-xl">💎</span>
                      ) : isBoss ? (
                        <span className="text-xl">👹</span>
                      ) : isDoor ? (
                        <span className="text-xl">🔒</span>
                      ) : cell.visited ? (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile / Screen D-Pad Controller */}
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium mb-1">
                แตะปุ่มทิศทาง หรือใช้แป้นลูกศรคีย์บอร์ด:
              </span>
              <button
                onClick={() => handleMove(0, -1)}
                className="w-13 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md touch-manipulation"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMove(-1, 0)}
                  className="w-13 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleMove(0, 1)}
                  className="w-13 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md touch-manipulation"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleMove(1, 0)}
                  className="w-13 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md touch-manipulation"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dungeon Legend & Active Challenge Panel */}
          <div className="space-y-4">
            {/* Guide & Symbols */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> สัญลักษณ์ในดันเจี้ยน
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>🧙‍♂️</span> <span>ผู้เล่น</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>🔒</span> <span>ประตูกล</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>💎</span> <span>หีบสมบัติ</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>👹</span> <span>ผู้พิทักษ์</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>🏆</span> <span>ทางออก</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60">
                  <span>🧱</span> <span>กำแพงหิน</span>
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                💡 เคล็ดลับการเอาชีวิตรอด:
              </p>
              <p className="leading-relaxed">
                ตอบคำถามให้ถูกต้องเพื่อเปิดประตูกลและหีบสมบัติ หากตอบผิดจะสูญเสียพลังชีวิต 1 หัวใจ สะสมกุญแจและอัญมณีเพื่อนำคะแนนโบนัสออกจากดันเจี้ยน!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Game Over / Victory Screen */
        <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-xl ${
            gameResult === 'victory'
              ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-amber-500/30'
              : 'bg-slate-800 shadow-rose-500/20'
          }`}>
            {gameResult === 'victory' ? '🏆' : '💀'}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {gameResult === 'victory' ? 'พิชิตดันเจี้ยนเขาวงกตสำเร็จ!' : 'พลังชีวิตหมดลงในดันเจี้ยน!'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {gameResult === 'victory'
                ? 'คุณสามารถไขรหัสความรู้และนำสมบัติโบราณกลับมาได้อย่างปลอดภัย'
                : 'มอนสเตอร์และกับดักในเขาวงกตเอาชนะคุณได้ แต่ความพยายามของคุณยอดเยี่ยมมาก'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">คะแนนสะสม</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">อัญมณีที่ได้</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">{gems} เม็ด</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400">หีบสมบัติที่เปิด</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{lootSummary.chestsOpened} หีบ</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={initMaze}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>สำรวจดันเจี้ยนใหม่</span>
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

      {/* Active Question Modal when triggering Door/Chest/Boss */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> ปริศนาปลดล็อกเส้นทาง
                </span>
                <span className="text-xs text-slate-400 font-medium">{activeQuestion.subjectName}</span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                  โจทย์คำถาม:
                </span>
                <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {activeQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuestion(idx)}
                    className="w-full p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-400 text-left font-medium text-sm text-white transition-all active:scale-98 flex items-center justify-between gap-3 touch-manipulation group"
                  >
                    <span>{option}</span>
                    <span className="w-6 h-6 rounded-full bg-slate-700 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-xs font-bold transition-all">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setActiveQuestion(null);
                    setPendingMove(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ยกเลิกและถอยกลับ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
