import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MascotGuide } from './components/MascotGuide';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { GasCodeViewerModal } from './components/GasCodeViewerModal';

// Student Portal Views
import { StudentDashboard } from './components/StudentPortal/StudentDashboard';
import { BattleArena } from './components/StudentPortal/BattleArena';
import { LeaderboardView } from './components/StudentPortal/LeaderboardView';
import { MatchingGame } from './components/StudentPortal/MatchingGame';
import { SurvivalBossGame } from './components/StudentPortal/SurvivalBossGame';
import { TowerClimbGame } from './components/StudentPortal/TowerClimbGame';
import { CrosswordGame } from './components/StudentPortal/CrosswordGame';
import { BombDefusalGame } from './components/StudentPortal/BombDefusalGame';
import { FlashcardSwipeGame } from './components/StudentPortal/FlashcardSwipeGame';
import { TreasureMazeGame } from './components/StudentPortal/TreasureMazeGame';
import { MistakeNotebook } from './components/StudentPortal/MistakeNotebook';
import { AvatarShop } from './components/StudentPortal/AvatarShop';
import { CertificateViewer } from './components/StudentPortal/CertificateViewer';
import { LearningPathView } from './components/StudentPortal/LearningPathView';
import { TimedExamMode } from './components/StudentPortal/TimedExamMode';

// Teacher Portal Views
import { TeacherDashboard } from './components/TeacherPortal/TeacherDashboard';
import { SubjectManager } from './components/TeacherPortal/SubjectManager';
import { AssignmentManager } from './components/TeacherPortal/AssignmentManager';
import { QuestionBankManager } from './components/TeacherPortal/QuestionBankManager';
import { StudentManager } from './components/TeacherPortal/StudentManager';
import { TeacherManager } from './components/TeacherPortal/TeacherManager';
import { ExportCenter } from './components/TeacherPortal/ExportCenter';
import { ExamAnalyticsView } from './components/TeacherPortal/ExamAnalyticsView';
import { AiQuizGenerator } from './components/TeacherPortal/AiQuizGenerator';
import { WorksheetGenerator } from './components/TeacherPortal/WorksheetGenerator';

const MainAppContent: React.FC = () => {
  const { role, theme } = useApp();
  const [activeTab, setActiveTab] = useState<string>(
    role === 'student' ? 'student-dashboard' : 'teacher-dashboard'
  );

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  // Sync default activeTab whenever role switches
  useEffect(() => {
    const studentTabs = [
      'student-dashboard', 'dashboard', 'battle-arena', 'battle', 'leaderboard',
      'matching-game', 'survival-boss', 'tower-climb',
      'crossword-game', 'bomb-defusal', 'flashcard-swipe', 'treasure-maze', 'mistake-notebook',
      'avatar-shop', 'certificates', 'learning-path', 'timed-exam'
    ];
    const teacherTabs = [
      'teacher-dashboard', 'subject-manager', 'assignment-manager',
      'question-bank', 'student-manager', 'teacher-manager', 'export-center', 'exam-analytics',
      'ai-quiz-generator', 'worksheet-generator'
    ];

    if (role === 'student' && !studentTabs.includes(activeTab)) {
      setActiveTab('student-dashboard');
    } else if (role === 'teacher' && !teacherTabs.includes(activeTab)) {
      setActiveTab('teacher-dashboard');
    }
  }, [role]);

  const getThemeBackgroundClass = (bg: string) => {
    switch (bg) {
      // ☀️ Bright / Light Themes
      case 'daylight-white':
        return 'bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 text-slate-800';
      case 'pastel-sky':
        return 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100/60 text-slate-800';
      case 'sunny-amber':
        return 'bg-gradient-to-br from-amber-100/80 via-yellow-50 to-orange-100/60 text-slate-800';
      case 'mint-fresh':
        return 'bg-gradient-to-br from-emerald-100/80 via-teal-50 to-cyan-100/60 text-slate-800';
      case 'bubblegum-pink':
        return 'bg-gradient-to-br from-pink-100/80 via-rose-50 to-purple-100/60 text-slate-800';
      case 'lavender-dream':
        return 'bg-gradient-to-br from-violet-100/80 via-purple-50 to-fuchsia-100/60 text-slate-800';

      // 🌙 Dark / Gaming Themes
      case 'aurora-blue':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950/80 to-blue-950 text-slate-100';
      case 'sakura-blossom':
        return 'bg-gradient-to-br from-slate-950 via-purple-950/80 to-pink-950/70 text-slate-100';
      case 'emerald-forest':
        return 'bg-gradient-to-br from-slate-950 via-teal-950/80 to-emerald-950/70 text-slate-100';
      case 'sunset-amber':
        return 'bg-gradient-to-br from-slate-950 via-orange-950/80 to-amber-950/70 text-slate-100';
      case 'cosmic-purple':
        return 'bg-gradient-to-br from-slate-950 via-fuchsia-950/80 to-purple-950/80 text-slate-100';
      case 'cyber-dark':
        return 'bg-slate-950 text-slate-100';
      case 'clean-minimal':
        return 'bg-slate-900 text-slate-100';
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  const isLightTheme = [
    'daylight-white',
    'pastel-sky',
    'sunny-amber',
    'mint-fresh',
    'bubblegum-pink',
    'lavender-dream'
  ].includes(theme.background);

  return (
    <div
      className={`min-h-screen ${getThemeBackgroundClass(
        theme.background
      )} flex flex-col font-${theme.font} selection:bg-indigo-500 selection:text-white transition-colors duration-500 relative overflow-x-hidden`}
    >
      {/* Online Game Ambient Floating Particles Effect */}
      {theme.animationsEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl animate-float" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl animate-float-slow" />
        </div>
      )}
      {/* Top Navbar */}
      <Navbar
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Student Views */}
        {role === 'student' && (
          <>
            {(activeTab === 'student-dashboard' || activeTab === 'dashboard') && (
              <StudentDashboard
                onGoToBattle={() => setActiveTab('battle-arena')}
                onGoToLeaderboard={() => setActiveTab('leaderboard')}
                onGoToMatchingGame={() => setActiveTab('matching-game')}
                onGoToSurvivalBoss={() => setActiveTab('survival-boss')}
                onGoToTowerClimb={() => setActiveTab('tower-climb')}
                onGoToCrossword={() => setActiveTab('crossword-game')}
                onGoToBombDefusal={() => setActiveTab('bomb-defusal')}
                onGoToFlashcardSwipe={() => setActiveTab('flashcard-swipe')}
                onGoToTreasureMaze={() => setActiveTab('treasure-maze')}
                onGoToMistakeNotebook={() => setActiveTab('mistake-notebook')}
                onGoToAvatarShop={() => setActiveTab('avatar-shop')}
                onGoToCertificates={() => setActiveTab('certificates')}
                onGoToLearningPath={() => setActiveTab('learning-path')}
                onGoToTimedExam={() => setActiveTab('timed-exam')}
              />
            )}
            {activeTab === 'matching-game' && (
              <MatchingGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'survival-boss' && (
              <SurvivalBossGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'tower-climb' && (
              <TowerClimbGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'crossword-game' && (
              <CrosswordGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'bomb-defusal' && (
              <BombDefusalGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'flashcard-swipe' && (
              <FlashcardSwipeGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'treasure-maze' && (
              <TreasureMazeGame onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'mistake-notebook' && (
              <MistakeNotebook onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'avatar-shop' && (
              <AvatarShop onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'certificates' && (
              <CertificateViewer onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'learning-path' && (
              <LearningPathView onBack={() => setActiveTab('student-dashboard')} />
            )}
            {activeTab === 'timed-exam' && (
              <TimedExamMode onBack={() => setActiveTab('student-dashboard')} />
            )}
            {(activeTab === 'battle-arena' || activeTab === 'battle') && <BattleArena />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
          </>
        )}

        {/* Teacher Views */}
        {role === 'teacher' && (
          <>
            {activeTab === 'teacher-dashboard' && (
              <TeacherDashboard
                onNavigateTab={tab => setActiveTab(tab)}
                onOpenGasModal={() => setIsGasModalOpen(true)}
              />
            )}
            {activeTab === 'exam-analytics' && <ExamAnalyticsView />}
            {activeTab === 'ai-quiz-generator' && (
              <AiQuizGenerator onNavigateToBank={() => setActiveTab('question-bank')} />
            )}
            {activeTab === 'worksheet-generator' && <WorksheetGenerator />}
            {activeTab === 'subject-manager' && <SubjectManager />}
            {activeTab === 'assignment-manager' && <AssignmentManager />}
            {activeTab === 'question-bank' && <QuestionBankManager />}
            {activeTab === 'student-manager' && <StudentManager />}
            {activeTab === 'teacher-manager' && <TeacherManager />}
            {activeTab === 'export-center' && <ExportCenter />}
          </>
        )}
      </main>

      {/* Floating Animated Mascot Assistant */}
      <MascotGuide />

      {/* Modals */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <GasCodeViewerModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          EduQuest GAS • นวัตกรรมระบบการเรียนรู้และประลองความรู้ผสาน Google Apps Script 13 โมดูล
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
