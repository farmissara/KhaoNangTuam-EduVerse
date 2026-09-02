import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  Flame,
  Coins,
  Shield,
  Palette,
  FileCode2,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronDown,
  Award,
  BookOpen,
  Sword,
  BarChart3,
  Users,
  Settings2,
  Bell,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  Printer
} from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  onOpenThemeModal: () => void;
  onOpenGasModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenThemeModal,
  onOpenGasModal,
  activeTab,
  setActiveTab
}) => {
  const {
    role,
    setRole,
    currentStudent,
    setCurrentStudent,
    currentTeacher,
    setCurrentTeacher,
    students,
    teachers,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    theme,
    setTheme,
    playSound,
    triggerMascotTip
  } = useApp();

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    n =>
      n.recipientRole === 'all' ||
      n.recipientRole === role ||
      n.recipientId === (role === 'student' ? currentStudent.id : currentTeacher.teacherId)
  );

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleRoleChange = (newRole: Role) => {
    playSound('click');
    setRole(newRole);
    if (newRole === 'student') {
      setActiveTab('student-dashboard');
      triggerMascotTip(`ยินดีต้อนรับ ${currentStudent.prefix}${currentStudent.firstName}! พร้อมลุยทำเควสต์วันนี้แล้วหรือยัง? 🎒`, 'happy');
    } else {
      setActiveTab('teacher-dashboard');
      triggerMascotTip(`ยินดีต้อนรับ ${currentTeacher.prefix}${currentTeacher.firstName} ${currentTeacher.lastName} (${currentTeacher.role}) ครับอาจารย์! 🎓`, 'proud');
    }
  };

  const getButtonRadiusClass = () => {
    switch (theme.buttonRadius) {
      case 'sm': return 'rounded-md';
      case 'md': return 'rounded-lg';
      case 'lg': return 'rounded-2xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/80 text-white shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab(role === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  EduQuest
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  GAS App
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                ระบบการเรียนรู้และประลองควิซ
              </p>
            </div>
          </div>

          {/* Navigation Pills for Role */}
          <div className="hidden lg:flex items-center ml-3 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => setActiveTab('student-dashboard')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'student-dashboard'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> คลังวิชา & เกม
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('matching-game')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'matching-game'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-300" /> เกมจับคู่
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('survival-boss')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'survival-boss'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-300" /> เอาชีวิตรอดบอส
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('tower-climb')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'tower-climb'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> หอคอย 5 ชั้น
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('battle-arena')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'battle-arena'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Battle Arena
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> อันดับ
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('ai-quiz-generator')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'ai-quiz-generator'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" /> AI ออกข้อสอบ
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('worksheet-generator')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'worksheet-generator'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow'
                      : 'text-teal-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Printer className="w-3.5 h-3.5 text-teal-300" /> พิมพ์ใบงาน A4
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('teacher-dashboard')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'teacher-dashboard'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> ภาพรวม
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('exam-analytics')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'exam-analytics'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-300" /> วิเคราะห์ข้อสอบ
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('subject-manager')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'subject-manager'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> จัดการวิชา
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('assignment-manager')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'assignment-manager'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-purple-300" /> มอบหมายข้อสอบ
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('question-bank')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'question-bank'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> คลังข้อสอบสื่อ
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('student-manager')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'student-manager'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> นักเรียน
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('teacher-manager')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'teacher-manager'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> ครู
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('export-center')}
                  className={`px-2.5 py-1.5 font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'export-center'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5" /> ส่งออก
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: User Stats, Role Selector, Notifications, Theme & GAS buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Student Status Stats Bar */}
          {role === 'student' ? (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold" title="Streak ต่อเนื่อง">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentStudent.streakDays} วัน</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-1 text-yellow-400 font-bold" title="เหรียญรางวัล">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span>{currentStudent.coins}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-1.5 font-bold text-indigo-300" title="เลเวล">
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[10px]">
                  Lv.{currentStudent.level}
                </span>
                <span className="text-[11px] font-normal text-slate-300">{currentStudent.xp} XP</span>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">{currentTeacher.role}</span>
              <span className="text-[11px] text-slate-400">({currentTeacher.department})</span>
            </div>
          )}

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(prev => !prev)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              title="การแจ้งเตือนและการบ้าน"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">แจ้งเตือนภารกิจ & ข่าวสาร</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {userNotifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">ไม่มีการแจ้งเตือนใหม่ในขณะนี้</p>
                  ) : (
                    userNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.assignmentId) {
                            setActiveTab(role === 'student' ? 'student-dashboard' : 'assignment-manager');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          !n.isRead
                            ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-100'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-white leading-tight">{n.title}</span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed mb-1">{n.message}</p>
                        <span className="text-[9px] text-slate-500">{n.createdAt}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Code Exporter / GAS Modal Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenGasModal();
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold ${getButtonRadiusClass()} transition-all shadow-sm cursor-pointer`}
            title="เปิดดูและดาวน์โหลดโค้ด Google Apps Script (13 ไฟล์)"
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">โค้ด GAS</span>
          </button>

          {/* Quick Theme Customizer Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenThemeModal();
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium ${getButtonRadiusClass()} transition-all cursor-pointer`}
            title="ปรับแต่งสี ฟอนต์ และการ์ด"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ธีม UI</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setTheme(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
              playSound('click');
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
            title={theme.soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
          >
            {theme.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Account & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(prev => !prev)}
              className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-white flex items-center justify-center text-sm border border-indigo-500/30">
                {role === 'student' ? currentStudent.avatar : '🎓'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-white truncate max-w-[100px]">
                  {role === 'student'
                    ? `${currentStudent.firstName}`
                    : `${currentTeacher.prefix}${currentTeacher.firstName}`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {role === 'student' ? currentStudent.classroom : currentTeacher.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-slate-200">
                <div className="text-[11px] font-semibold text-slate-400 px-2 pb-2 mb-2 border-b border-slate-800">
                  สลับบทบาทการใช้งาน (Role)
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <button
                    onClick={() => {
                      handleRoleChange('student');
                      setShowAccountDropdown(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>🎒</span> นักเรียน
                  </button>
                  <button
                    onClick={() => {
                      handleRoleChange('teacher');
                      setShowAccountDropdown(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>🎓</span> ครู / แอดมิน
                  </button>
                </div>

                {role === 'teacher' ? (
                  <>
                    <div className="text-[11px] font-semibold text-slate-400 px-2 pb-1 border-t border-slate-800 pt-2">
                      เลือกบัญชีคุณครู (Accounts):
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {teachers.map(t => (
                        <button
                          key={t.teacherId}
                          onClick={() => {
                            playSound('click');
                            setCurrentTeacher(t);
                            setShowAccountDropdown(false);
                            triggerMascotTip(`สลับเป็น ${t.prefix}${t.firstName} ${t.lastName} (${t.role}) แล้วครับ!`, 'happy');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            currentTeacher.teacherId === t.teacherId
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-bold">{t.teacherId}:</span> {t.prefix}
                            {t.firstName} {t.lastName}
                            <div className="text-[10px] text-slate-400">{t.role} ({t.department})</div>
                          </div>
                          {currentTeacher.teacherId === t.teacherId && (
                            <span className="text-emerald-400 text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] font-semibold text-slate-400 px-2 pb-1 border-t border-slate-800 pt-2">
                      เลือกบัญชีนักเรียน (Student Profiles):
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {students.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            playSound('click');
                            setCurrentStudent(s);
                            setShowAccountDropdown(false);
                            triggerMascotTip(`สลับเป็น ${s.prefix}${s.firstName} (${s.classroom}) เรียบร้อย!`, 'happy');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            currentStudent.id === s.id
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{s.avatar}</span>
                            <div>
                              <div className="font-bold">
                                {s.prefix}{s.firstName} {s.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {s.classroom} • Lv.{s.level} ({s.xp} XP)
                              </div>
                            </div>
                          </div>
                          {currentStudent.id === s.id && (
                            <span className="text-emerald-400 text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/80 bg-slate-950/70 text-[11px] overflow-x-auto gap-1">
        {role === 'student' ? (
          <>
            <button
              onClick={() => setActiveTab('student-dashboard')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'student-dashboard' ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400'
              }`}
            >
              📚 คลังวิชา
            </button>
            <button
              onClick={() => setActiveTab('matching-game')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'matching-game' ? 'text-purple-400 font-bold bg-purple-950/60' : 'text-slate-400'
              }`}
            >
              🎴 จับคู่
            </button>
            <button
              onClick={() => setActiveTab('survival-boss')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'survival-boss' ? 'text-rose-400 font-bold bg-rose-950/60' : 'text-slate-400'
              }`}
            >
              🔥 บอส
            </button>
            <button
              onClick={() => setActiveTab('tower-climb')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'tower-climb' ? 'text-amber-400 font-bold bg-amber-950/60' : 'text-slate-400'
              }`}
            >
              🏰 หอคอย
            </button>
            <button
              onClick={() => setActiveTab('battle-arena')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'battle-arena' ? 'text-rose-400 font-bold bg-rose-950/60' : 'text-slate-400'
              }`}
            >
              ⚔️ Battle
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-2.5 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'leaderboard' ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400'
              }`}
            >
              🏆 อันดับ
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('teacher-dashboard')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'teacher-dashboard' ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400'
              }`}
            >
              📊 แดชบอร์ด
            </button>
            <button
              onClick={() => setActiveTab('subject-manager')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'subject-manager' ? 'text-emerald-400 font-bold bg-emerald-950/60' : 'text-slate-400'
              }`}
            >
              📚 วิชา
            </button>
            <button
              onClick={() => setActiveTab('assignment-manager')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'assignment-manager' ? 'text-purple-400 font-bold bg-purple-950/60' : 'text-slate-400'
              }`}
            >
              🎯 มอบหมาย
            </button>
            <button
              onClick={() => setActiveTab('exam-analytics')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'exam-analytics' ? 'text-amber-400 font-bold bg-amber-950/60' : 'text-slate-400'
              }`}
            >
              📊 วิเคราะห์ข้อสอบ
            </button>
            <button
              onClick={() => setActiveTab('question-bank')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'question-bank' ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400'
              }`}
            >
              📝 ข้อสอบ
            </button>
            <button
              onClick={() => setActiveTab('student-manager')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'student-manager' ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400'
              }`}
            >
              👥 นักเรียน
            </button>
            <button
              onClick={() => setActiveTab('export-center')}
              className={`px-2 py-1 rounded-lg flex-shrink-0 cursor-pointer ${
                activeTab === 'export-center' ? 'text-emerald-400 font-bold bg-emerald-950/60' : 'text-slate-400'
              }`}
            >
              💾 ส่งออก
            </button>
          </>
        )}
      </div>
    </header>
  );
};
