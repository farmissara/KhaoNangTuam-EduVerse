import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Subject, Question, Assignment } from '../../types';
import { QuizPlayer } from './QuizPlayer';
import {
  BookOpen,
  Sword,
  Sparkles,
  Flame,
  Coins,
  Award,
  ChevronRight,
  CheckCircle2,
  Play,
  Atom,
  Calculator,
  Globe2,
  Landmark,
  Cpu,
  Target,
  Layers,
  Send,
  Clock,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Gamepad2,
  Trophy,
  RotateCcw,
  Star
} from 'lucide-react';

interface StudentDashboardProps {
  onGoToBattle: () => void;
  onGoToLeaderboard: () => void;
  onGoToMatchingGame?: () => void;
  onGoToSurvivalBoss?: () => void;
  onGoToTowerClimb?: () => void;
  onGoToCrossword?: () => void;
  onGoToBombDefusal?: () => void;
  onGoToFlashcardSwipe?: () => void;
  onGoToTreasureMaze?: () => void;
  onGoToMistakeNotebook?: () => void;
  onGoToAvatarShop?: () => void;
  onGoToCertificates?: () => void;
  onGoToLearningPath?: () => void;
  onGoToTimedExam?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onGoToBattle,
  onGoToLeaderboard,
  onGoToMatchingGame,
  onGoToSurvivalBoss,
  onGoToTowerClimb,
  onGoToCrossword,
  onGoToBombDefusal,
  onGoToFlashcardSwipe,
  onGoToTreasureMaze,
  onGoToMistakeNotebook,
  onGoToAvatarShop,
  onGoToCertificates,
  onGoToLearningPath,
  onGoToTimedExam
}) => {
  const {
    currentStudent,
    subjects,
    questions,
    assignments,
    answerLogs,
    assignmentSubmissions,
    playSound,
    triggerMascotTip,
    theme
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'games' | 'study' | 'review'>('games');
  const [activeGameCategory, setActiveGameCategory] = useState<'all' | 'speed' | 'puzzle' | 'adventure' | 'quiz'>('all');

  // Mistakes count for current student
  const mistakeCount = answerLogs.filter(l => l.studentId === currentStudent.id && !l.isCorrect).length;

  const isLightTheme = [
    'daylight-white',
    'pastel-sky',
    'sunny-amber',
    'mint-fresh',
    'bubblegum-pink',
    'lavender-dream'
  ].includes(theme.background);

  // Subject icon helper
  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-6 h-6 text-emerald-400" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-blue-400" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-amber-400" />;
      case 'Globe2':
        return <Globe2 className="w-6 h-6 text-indigo-400" />;
      case 'Landmark':
        return <Landmark className="w-6 h-6 text-rose-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-violet-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-indigo-400" />;
    }
  };

  const handleStartQuiz = (subject: Subject) => {
    playSound('start');
    setSelectedSubject(subject);
    setActiveAssignment(null);
    triggerMascotTip(`เปิดแบบทดสอบวิชา ${subject.name} ขอให้โชคดีและทำคะแนนเต็มนะ! 📝`, 'cheering');
  };

  const handleStartAssignment = (assignment: Assignment) => {
    playSound('start');
    const targetSub = subjects.find(s => s.id === assignment.subjectId) || subjects[0];
    setSelectedSubject(targetSub);
    setActiveAssignment(assignment);
    triggerMascotTip(`เริ่มทำภารกิจ "${assignment.title}" มอบหมายโดย ${assignment.teacherName}! ลุยเลย! 🎯`, 'cheering');
  };

  if (selectedSubject) {
    let subjectQuestions: Question[] = [];

    if (activeAssignment && activeAssignment.questionIds.length > 0) {
      subjectQuestions = questions.filter(q => activeAssignment.questionIds.includes(q.id));
    } else {
      subjectQuestions = questions.filter(q => q.subjectId === selectedSubject.id);
    }

    return (
      <QuizPlayer
        subject={selectedSubject}
        assignment={activeAssignment || undefined}
        questions={subjectQuestions.length > 0 ? subjectQuestions : questions.slice(0, 5)}
        onBack={() => {
          setSelectedSubject(null);
          setActiveAssignment(null);
        }}
      />
    );
  }

  // Filter assignments relevant to this student
  const studentAssignments = assignments.filter(
    a =>
      a.targetType === 'all' ||
      (a.targetType === 'classroom' && a.targetClassroom === currentStudent.classroom) ||
      (a.targetType === 'individual' && a.targetStudentId === currentStudent.id)
  );

  // Level XP Progress math
  const currentLevelBaseXp = (currentStudent.level - 1) * 500;
  const nextLevelXp = currentStudent.level * 500;
  const progressInLevel = currentStudent.xp - currentLevelBaseXp;
  const levelProgressPercent = Math.min(100, Math.max(0, Math.round((progressInLevel / 500) * 100)));

  return (
    <div className="space-y-6 animate-pop-in">
      {/* --- TOP GAMIFIED PLAYER HUD BANNER --- */}
      <div className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isLightTheme
          ? 'bg-white/90 border-slate-200/90 shadow-slate-200/60 text-slate-800'
          : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30 shadow-2xl text-white'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Avatar & Player Info */}
          <div className="flex items-center gap-4 text-center sm:text-left w-full md:w-auto">
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-pink-500 p-1 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
                <div className={`w-full h-full rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl ${
                  isLightTheme ? 'bg-slate-50' : 'bg-slate-950'
                }`}>
                  {currentStudent.avatar}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black shadow border border-amber-300">
                Lv.{currentStudent.level}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-black">
                  {currentStudent.prefix}{currentStudent.firstName} {currentStudent.lastName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {currentStudent.classroom} (เลขที่ {currentStudent.number})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ฉายา: <span className="text-amber-400 font-bold">{currentStudent.title}</span> • รหัส <span className="font-mono">{currentStudent.studentId}</span>
              </p>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Streak {currentStudent.streakDays} วัน
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20">
                  <Coins className="w-3.5 h-3.5" />
                  {currentStudent.coins} เหรียญ
                </span>
                {mistakeCount > 0 && (
                  <button
                    onClick={() => setDashboardTab('review')}
                    className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-0.5 rounded-full border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    📚 มีข้อผิด {mistakeCount} ข้อ (กดทบทวน)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Level XP Progress Bar */}
          <div className={`w-full md:w-80 p-4 rounded-2xl border ${
            isLightTheme
              ? 'bg-slate-100/90 border-slate-200 shadow-sm'
              : 'bg-slate-800/80 border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2 font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                เลเวล {currentStudent.level}
              </span>
              <span className={isLightTheme ? 'text-slate-700' : 'text-slate-300'}>
                {progressInLevel} / 500 XP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-700/60 overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/25 animate-shimmer" />
              </motion.div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>{levelProgressPercent}% สู่เลเวล {currentStudent.level + 1}</span>
              <span className="text-amber-400 font-bold">รวม {currentStudent.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CLEAN DASHBOARD MAIN TABS (ลดความรก แยกเป็น 3 หมวดหมู่หลัก ชัดเจน รวดเร็ว) --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <button
            onClick={() => {
              playSound('click');
              setDashboardTab('games');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              dashboardTab === 'games'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>🎮 9 โหมดเกมประลอง</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              dashboardTab === 'games' ? 'bg-slate-950/30 text-slate-900' : 'bg-slate-800 text-amber-400'
            }`}>
              9 เกม
            </span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setDashboardTab('study');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              dashboardTab === 'study'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 บทเรียน & การบ้าน</span>
            {studentAssignments.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {studentAssignments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playSound('click');
              setDashboardTab('review');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              dashboardTab === 'review'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>📖 สมุดทบทวน & สถิติ</span>
            {mistakeCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                {mistakeCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Battle, Shop, Certificates, Exam Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {onGoToAvatarShop && (
            <button
              onClick={() => {
                playSound('click');
                onGoToAvatarShop();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <span>🛍️ ร้านค้าไอเทม</span>
            </button>
          )}

          {onGoToLearningPath && (
            <button
              onClick={() => {
                playSound('click');
                onGoToLearningPath();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <span>🗺️ แผนที่ด่าน</span>
            </button>
          )}

          {onGoToCertificates && (
            <button
              onClick={() => {
                playSound('click');
                onGoToCertificates();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-yellow-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <span>📜 เกียรติบัตร</span>
            </button>
          )}

          {onGoToTimedExam && (
            <button
              onClick={() => {
                playSound('click');
                onGoToTimedExam();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <span>🛡️ สอบจับเวลา</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound('click');
              onGoToBattle();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Sword className="w-3.5 h-3.5 text-amber-300" />
            <span>Battle 1v1</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              onGoToLeaderboard();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>อันดับ</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 🎮 9 EDUCATIONAL GAME MODES ARENA */}
      {/* ======================================================== */}
      {dashboardTab === 'games' && (
        <div className="space-y-4 animate-pop-in">
          {/* Subcategory Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                เลือกสนามประลองเกมการศึกษา (All 9 Game Modes)
              </h2>
              <p className="text-xs text-slate-400">เลือกเกมที่ชอบเพื่อสะสมแต้ม XP, เหรียญทอง และคอมโบจัดอันดับ</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  playSound('click');
                  setActiveGameCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeGameCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🌟 ทั้งหมด (9 เกม)
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setActiveGameCategory('speed');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeGameCategory === 'speed'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ⚡ สปีดความเร็ว (3)
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setActiveGameCategory('puzzle');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeGameCategory === 'puzzle'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🧩 ปริศนา & จับคู่ (2)
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setActiveGameCategory('adventure');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeGameCategory === 'adventure'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏰 ผจญภัย & บอส (3)
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setActiveGameCategory('quiz');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeGameCategory === 'quiz'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🎯 ควิซฝึกฝน (1)
              </button>
            </div>
          </div>

          {/* 9 Games Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Game 1: Crossword & Word Scramble */}
            {(activeGameCategory === 'all' || activeGameCategory === 'puzzle') && (
              <div
                id="game-card-crossword"
                onClick={() => {
                  playSound('click');
                  if (onGoToCrossword) onGoToCrossword();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-teal-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform text-2xl border border-teal-500/30">
                      🔤
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                      🧩 ปริศนาคำศัพท์
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-teal-300 mb-1">
                    1. ปริศนาอักษรไขว้ & สแครมเบิล
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ไขปริศนาความหมาย เรียงตัวอักษรค้นหาคำศัพท์วิชาการ สะสมคอมโบ
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-teal-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +120 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 2: Speed Bomb Defusal */}
            {(activeGameCategory === 'all' || activeGameCategory === 'speed') && (
              <div
                id="game-card-bomb"
                onClick={() => {
                  playSound('click');
                  if (onGoToBombDefusal) onGoToBombDefusal();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-red-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center group-hover:scale-110 transition-transform text-2xl border border-red-500/30">
                      💣
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                      ⚡ สปีดความเร็ว
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-red-300 mb-1">
                    2. กู้ระเบิดเวลาสปีดรัน
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    จับเวลาถอยหลัง ตัดสายชนวนสีที่ถูกต้องเพื่อปลดชนวนระเบิดให้ทันเวลา
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-red-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +150 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 3: Flashcard Swipe */}
            {(activeGameCategory === 'all' || activeGameCategory === 'speed') && (
              <div
                id="game-card-swipe"
                onClick={() => {
                  playSound('click');
                  if (onGoToFlashcardSwipe) onGoToFlashcardSwipe();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-cyan-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform text-2xl border border-cyan-500/30">
                      ⚡
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      ⚡ สปีดสไวป์
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-cyan-300 mb-1">
                    3. การ์ดสไวป์ จริงหรือเท็จ
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ปัดขวาเมื่อจริง ปัดซ้ายเมื่อเท็จ สปีดไวพริบและความจำความรู้แบบรวดเร็ว
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-cyan-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +100 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 4: Treasure Maze */}
            {(activeGameCategory === 'all' || activeGameCategory === 'adventure') && (
              <div
                id="game-card-dungeon"
                onClick={() => {
                  playSound('click');
                  if (onGoToTreasureMaze) onGoToTreasureMaze();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-amber-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform text-2xl border border-amber-500/30">
                      🗝️
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      🏰 ผจญภัยดันเจี้ยน
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-amber-300 mb-1">
                    4. ดันเจี้ยนเขาวงกตล่าสมบัติ
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    เดินสำรวจเขาวงกต ไขรหัสเปิดประตูกล ปราบผู้พิทักษ์ และเก็บหีบสมบัติ
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +180 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 5: Matching Game */}
            {(activeGameCategory === 'all' || activeGameCategory === 'puzzle') && (
              <div
                id="game-card-matching"
                onClick={() => {
                  playSound('click');
                  if (onGoToMatchingGame) onGoToMatchingGame();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-purple-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/30">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      🧩 จับคู่ความจำ
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-purple-300 mb-1">
                    5. เกมจับคู่ความรู้ (Matching)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ฝึกความจำและความเข้าใจ จับคู่คำถามและคำตอบที่ถูกต้องเพื่อทำคอมโบ
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-purple-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +120 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 6: Survival Boss Rush */}
            {(activeGameCategory === 'all' || activeGameCategory === 'adventure') && (
              <div
                id="game-card-survival"
                onClick={() => {
                  playSound('click');
                  if (onGoToSurvivalBoss) onGoToSurvivalBoss();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-rose-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-500/30">
                      <Flame className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                      🔥 ตีบอสสุดโหด
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-rose-300 mb-1">
                    6. เอาชีวิตรอด: พิชิตบอส (Survival)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ต่อสู้กับบอสมอนสเตอร์ประจำวิชา ตอบถูกปล่อยท่าไม้ตาย ตอบผิดโดนดาเมจ
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-rose-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +200 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 7: Tower Climb Quest */}
            {(activeGameCategory === 'all' || activeGameCategory === 'adventure') && (
              <div
                id="game-card-tower"
                onClick={() => {
                  playSound('click');
                  if (onGoToTowerClimb) onGoToTowerClimb();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-yellow-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-yellow-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-500/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-500/30">
                      🏰 ไต่หอคอย
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-yellow-300 mb-1">
                    7. หอคอยผจญภัย 5 ชั้น (Tower)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ไต่ระดับความยาก 5 ชั้น เก็บดาวสะสม 3 ดาวเพื่อพิชิตยอดหอคอย
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-yellow-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +180 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 8: Battle Arena PVP */}
            {(activeGameCategory === 'all' || activeGameCategory === 'speed') && (
              <div
                id="game-card-battle"
                onClick={() => {
                  playSound('click');
                  onGoToBattle();
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-indigo-500/30">
                      <Sword className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      ⚔️ ดวลควิซ 1v1
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-indigo-300 mb-1">
                    8. Battle Arena ประลองควิซ 1v1
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ท้าดวลตอบคำถามแบบตัวต่อตัวกับเพื่อนร่วมห้อง หรือประลองกับ AI บอท
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-indigo-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +150 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เข้าสู่ลานประลอง <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Game 9: Practice Quiz Mastery */}
            {(activeGameCategory === 'all' || activeGameCategory === 'quiz') && (
              <div
                id="game-card-practice"
                onClick={() => {
                  const sub = subjects[0];
                  if (sub) handleStartQuiz(sub);
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 shadow-xl cursor-pointer group transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform text-2xl border border-emerald-500/30">
                      🎯
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      📝 ควิซมาตรฐาน
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-emerald-300 mb-1">
                    9. ควิซฝึกฝนรายวิชา (Practice Quiz)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ทำแบบฝึกหัดรายบทเรียน มีจับเวลา คำอธิบายเฉลยละเอียด และบันทึก XP
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span className="text-slate-400 font-normal">รางวัล: +100 XP</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    เริ่มฝึกฝน <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 📚 STUDY & ASSIGNMENTS (บทเรียน & การบ้านที่ครูมอบหมาย) */}
      {/* ======================================================== */}
      {dashboardTab === 'study' && (
        <div className="space-y-6 animate-pop-in">
          {/* Teacher Assignments Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">ภารกิจที่คุณครูมอบหมาย (Teacher Assignments)</h2>
                  <p className="text-xs text-slate-400">ทำข้อสอบที่ครูมอบหมายให้ทันตามกำหนดเพื่อรับ XP และเหรียญพิเศษ</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                {studentAssignments.length} ภารกิจ
              </span>
            </div>

            {studentAssignments.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
                ไม่มีภารกิจการบ้านที่ค้างส่งในขณะนี้ 🎉
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {studentAssignments.map(assign => {
                  const submission = assignmentSubmissions.find(
                    s => s.assignmentId === assign.id && s.studentId === currentStudent.id
                  );
                  const isSubmitted = !!submission;

                  return (
                    <div
                      key={assign.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSubmitted
                          ? 'bg-slate-900/60 border-emerald-500/40 opacity-80'
                          : 'bg-slate-800/80 border-purple-500/50 shadow-lg shadow-purple-950/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                            {assign.subjectName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>กำหนดส่ง: {assign.dueDate}</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white mb-1">{assign.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{assign.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-amber-400 font-bold">+{assign.rewardXp} XP</span>
                          <span className="text-yellow-400 font-bold">+{assign.rewardCoins} 🪙</span>
                        </div>

                        {isSubmitted ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ส่งแล้ว (ได้ {submission.score}/{submission.totalQuestions} คะแนน)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartAssignment(assign)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>เริ่มทำภารกิจ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Quests Section */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Target className="w-4 h-4 text-amber-400" />
                <span>ภารกิจประจำวัน (Daily Quests)</span>
              </div>
              <span className="text-[11px] text-slate-400">รีเซ็ตทุก 24 ชั่วโมง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                    📝
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">ทำแบบฝึกหัด 1 บท</div>
                    <div className="text-[10px] text-slate-400">รางวัล: +50 XP, 10 🪙</div>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">1/1 ✅</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm">
                    ⚔️
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">ชนะ Battle Mode 1 ครั้ง</div>
                    <div className="text-[10px] text-slate-400">รางวัล: +80 XP, 20 🪙</div>
                  </div>
                </div>
                <span className="text-amber-400 text-xs font-bold">{currentStudent.battleWins > 0 ? '1/1 ✅' : '0/1'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">
                    🔥
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">ล็อกอินต่อเนื่อง {currentStudent.streakDays} วัน</div>
                    <div className="text-[10px] text-slate-400">รางวัล: +30 XP</div>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">สำเร็จ ✅</span>
              </div>
            </div>
          </div>

          {/* Subjects Catalog Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  คลังรายวิชาและแบบทดสอบ (Subject Quests)
                </h2>
                <p className="text-xs text-slate-400">เลือกลุยทำข้อสอบตามรายวิชาที่ต้องการฝึกฝน</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => {
                const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
                const count = subjectQuestions.length;
                const hasMediaCount = subjectQuestions.filter(q => q.mediaType && q.mediaType !== 'none').length;

                return (
                  <motion.div
                    key={subject.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 shadow-xl flex flex-col justify-between group transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:scale-105 transition-transform">
                          {renderSubjectIcon(subject.icon)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasMediaCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> สื่อ
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                            {subject.code}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {subject.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        คลังข้อสอบ: <b className="text-slate-200">{count} ข้อ</b>
                      </span>

                      <button
                        onClick={() => handleStartQuiz(subject)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>เริ่มทำ</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 📖 MISTAKE NOTEBOOK & STATS (สมุดทบทวนข้อผิด & สถิติ) */}
      {/* ======================================================== */}
      {dashboardTab === 'review' && (
        <div className="space-y-6 animate-pop-in">
          {/* Mistake Notebook Main Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/70 border border-rose-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-rose-500/10">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">
                      สมุดทบทวนข้อที่เคยทำผิด (Mistake Notebook)
                    </h3>
                    {mistakeCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-slate-950 text-xs font-black animate-pulse">
                        {mistakeCount} ข้อที่ต้องทบทวน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    ระบบรวบรวมข้อที่คุณเคยตอบผิดจากทุกเกม เพื่อให้คุณทบทวนคำอธิบายเฉลยและทำแบบฝึกหัดแก้ตัว
                  </p>
                </div>
              </div>

              <button
                id="open-mistake-notebook-btn"
                onClick={() => {
                  playSound('click');
                  if (onGoToMistakeNotebook) onGoToMistakeNotebook();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>เปิดสมุดทบทวนข้อผิด</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary of Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">ข้อที่บันทึกไว้ในสมุด</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">{mistakeCount} ข้อ</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">อัตราความแม่นยำรวม</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{currentStudent.accuracyRate}%</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">ทำแบบทดสอบจบแล้ว</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">{currentStudent.totalQuizzesTaken} ครั้ง</div>
              </div>
            </div>
          </div>

          {/* Leaderboard & Achievements Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>อันดับของคุณในห้องเรียน</span>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    onGoToLeaderboard();
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  ดูตารางอันดับเต็ม →
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <div className="text-sm font-bold text-white">อันดับห้อง {currentStudent.classroom}</div>
                    <div className="text-xs text-slate-400">สะสม {currentStudent.xp} XP • {currentStudent.coins} 🪙</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  Top Player
                </span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>สถิติการประลอง Battle Mode</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">ชนะประลอง (Wins)</div>
                  <div className="text-lg font-black text-emerald-400">{currentStudent.battleWins} ครั้ง</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">แพ้ประลอง (Losses)</div>
                  <div className="text-lg font-black text-rose-400">{currentStudent.battleLosses} ครั้ง</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
