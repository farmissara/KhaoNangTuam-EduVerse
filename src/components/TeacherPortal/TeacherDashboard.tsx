import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Sparkles,
  FileCode2,
  Clock,
  Shield,
  Send,
  ChevronRight,
  Database,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Bot,
  Sliders,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  X,
  Lock,
  Unlock,
  Key,
  Settings,
  HelpCircle
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenGasModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateTab,
  onOpenGasModal
}) => {
  const {
    currentTeacher,
    students,
    questions,
    answerLogs,
    subjects,
    assignments,
    playSound,
    isGasConnected,
    gasUrl,
    isSyncing,
    lastSyncTime,
    fetchDataFromGas,
    getShareableStudentLink,
    requireStudentPassword,
    requireTeacherPin,
    setRequireStudentPassword,
    setRequireTeacherPin,
    teacherPin,
    updateTeacherPin,
    theme,
    toggleSound,
    toggleMascot,
    toggleAnimations,
    clearTestScoresAndLogs,
    resetAllTestDataForProduction
  } = useApp();

  // Sub-navigation tab for uncluttered clean organization
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'security' | 'cloud' | 'production'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Master PIN change local state
  const [newMasterPin, setNewMasterPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const shareableUrl = getShareableStudentLink ? getShareableStudentLink() : window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      playSound('correct');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      window.prompt('คัดลอกลิงก์นี้ส่งให้นักเรียน:', shareableUrl);
    }
  };

  const handleUpdateMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPin.trim() || newMasterPin.trim().length < 4) {
      setPinChangeMsg({ type: 'error', text: 'กรุณากรอกรหัส PIN อย่างน้อย 4 หลัก' });
      playSound('wrong');
      return;
    }
    const res = updateTeacherPin(newMasterPin.trim());
    if (res.success) {
      setPinChangeMsg({ type: 'success', text: `บันทึกรหัส PIN ใหม่ (${newMasterPin.trim()}) สำเร็จแล้ว!` });
      setNewMasterPin('');
      playSound('victory');
      setTimeout(() => setPinChangeMsg(null), 4000);
    }
  };

  const totalStudents = students.length;
  const totalQuestions = questions.length;
  const totalSubmissions = answerLogs.length;
  const totalSubjects = subjects.length;
  const totalAssignments = assignments.length;

  const correctCount = answerLogs.filter(a => a.isCorrect).length;
  const overallAccuracy = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 85;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CLEAN PROFILE & STATUS HEADER */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              🎓
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentTeacher?.prefix || 'ครู'}{currentTeacher?.firstName || 'ผู้สอน'} {currentTeacher?.lastName || ''}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {currentTeacher?.role || 'คุณครู'}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  โรงเรียนบ้านเขานางต่วม
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span>กลุ่มสาระฯ: <strong className="text-slate-200">{currentTeacher?.department || 'วิชาการ'}</strong></span>
                <span>รหัสครู: <strong className="text-indigo-300 font-mono">{currentTeacher?.teacherId || 'T001'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick System Status Badges */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            {/* Google Sheets Status */}
            <div
              onClick={onOpenGasModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                isGasConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="สถานะ Google Sheets"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isGasConnected ? 'Sheets: ออนไลน์ 🟢' : 'Sheets: ออฟไลน์ 🟡'}</span>
            </div>

            {/* Student Password Status Badge */}
            <button
              onClick={() => {
                playSound('click');
                setActiveSubTab('security');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                requireStudentPassword
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
              }`}
              title="คลิกเพื่อจัดการระบบรหัสผ่าน"
            >
              {requireStudentPassword ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{requireStudentPassword ? 'รหัสนักเรียน: เปิด 🔒' : 'รหัสนักเรียน: ปิด (เข้าด่วน) 🔓'}</span>
            </button>

            {/* Teacher PIN Status Badge */}
            <button
              onClick={() => {
                playSound('click');
                setActiveSubTab('security');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                requireTeacherPin
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="คลิกเพื่อจัดการระบบรหัสผ่าน"
            >
              {requireTeacherPin ? <Key className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{requireTeacherPin ? 'PIN ครู: เปิด 🔒' : 'PIN ครู: ปิด 🔓'}</span>
            </button>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION TABS (จัดหมวดหมู่สะอาดตา ไม่รก) */}
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={() => {
              playSound('click');
              setActiveSubTab('overview');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ภาพรวม & กิจกรรม</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveSubTab('security');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'security'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>รหัสผ่าน & ควบคุมระบบ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              สำคัญ
            </span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveSubTab('cloud');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'cloud'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Google Sheets & แชร์ลิงก์</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveSubTab('production');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'production'
                ? 'bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>เตรียมใช้งานจริง & รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
      {activeSubTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Quick Tools Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('ai-quiz-generator');
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span className="text-xl">🤖</span>
              <span>AI ออกข้อสอบอัตโนมัติ</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('worksheet-generator');
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span className="text-xl">🖨️</span>
              <span>พิมพ์ใบงาน A4 พร้อมเฉลย</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('assignment-manager');
              }}
              className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-purple-300 border border-purple-500/30 font-bold text-xs shadow-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Send className="w-5 h-5 text-purple-400" />
              <span>มอบหมายข้อสอบ</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('question-bank');
              }}
              className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 font-bold text-xs shadow-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>คลังข้อสอบ ({totalQuestions} ข้อ)</span>
            </button>
          </div>

          {/* 5 Clean Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div
              onClick={() => onNavigateTab('student-manager')}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 shadow-md flex items-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">นักเรียนในระบบ</div>
                <div className="text-lg font-black text-white">{totalStudents} คน</div>
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('subject-manager')}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 shadow-md flex items-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">กลุ่มสาระวิชา</div>
                <div className="text-lg font-black text-emerald-400">{totalSubjects} วิชา</div>
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('question-bank')}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 shadow-md flex items-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">ข้อสอบในคลัง</div>
                <div className="text-lg font-black text-white">{totalQuestions} ข้อ</div>
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('assignment-manager')}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 shadow-md flex items-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">งานที่มอบหมาย</div>
                <div className="text-lg font-black text-purple-300">{totalAssignments} งาน</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">ความแม่นยำรวม</div>
                <div className="text-lg font-black text-amber-400">{overallAccuracy}%</div>
              </div>
            </div>
          </div>

          {/* Quick Access Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => {
                playSound('click');
                onNavigateTab('exam-analytics');
              }}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 shadow-md cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">วิเคราะห์ข้อสอบ & ทบทวน</h3>
              <p className="text-xs text-slate-400">สถิติค่าความยาก p-value ตัวลวง และเปิดโหมดทบทวน</p>
            </div>

            <div
              onClick={() => {
                playSound('click');
                onNavigateTab('assignment-manager');
              }}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 shadow-md cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">มอบหมายภารกิจ</h3>
              <p className="text-xs text-slate-400">สั่งงานตามห้องหรือรายบุคคล กำหนดวันส่ง</p>
            </div>

            <div
              onClick={() => {
                playSound('click');
                onNavigateTab('subject-manager');
              }}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 shadow-md cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">จัดการรายวิชา</h3>
              <p className="text-xs text-slate-400">เพิ่ม/แก้ไขกลุ่มสาระ กำหนดรหัสวิชา สี และไอคอน</p>
            </div>

            <div
              onClick={() => {
                playSound('click');
                onNavigateTab('student-manager');
              }}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 shadow-md cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">รายชื่อนักเรียน & ห้องเรียน</h3>
              <p className="text-xs text-slate-400">จัดการข้อมูลนักเรียน นำเข้าไฟล์ Excel/CSV และแก้ไข PIN</p>
            </div>
          </div>

          {/* Two Columns: Live Activity Logs & Subject Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>ประวัติการทำแบบทดสอบล่าสุด ({totalSubmissions} ครั้ง)</span>
                </h3>
                <span className="text-[11px] text-slate-400">อัปเดตเรียลไทม์</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {answerLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    ยังไม่มีประวัติการส่งคำตอบ (นักเรียนสามารถเริ่มเล่นเกมหรือทำแบบทดสอบได้ทันที)
                  </div>
                ) : (
                  answerLogs.slice(0, 8).map(log => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {log.isCorrect ? '✅' : '❌'}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {log.studentName} <span className="text-slate-400 font-normal">({log.classroom})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            วิชา: {log.subjectName} • โหมด: {log.mode === 'battle' ? 'Battle Arena ⚔️' : log.mode === 'survival' ? 'บอส 🔥' : log.mode === 'matching' ? 'จับคู่ 🎴' : log.mode === 'tower' ? 'หอคอย 🏰' : log.mode === 'exam' ? 'ภารกิจ 🎯' : 'ฝึกฝน 📝'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-bold ${log.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.isCorrect ? `+${log.earnedXp} XP` : '0 XP'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.timestamp.split(' ')[1] || log.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subject Overview Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>กลุ่มสาระวิชา ({subjects.length})</span>
                </h3>
                <button
                  onClick={() => onNavigateTab('subject-manager')}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  จัดการวิชา
                </button>
              </div>

              <div className="space-y-3">
                {subjects.map(s => {
                  const qCount = questions.filter(q => q.subjectId === s.id).length;
                  return (
                    <div key={s.id} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-200">{s.name} ({s.code})</span>
                        <span className="font-mono font-bold text-indigo-300">{qCount} ข้อ</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (qCount / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: SECURITY & TOGGLES (ตอบคำถามข้อ 1 ของคุณครูอย่างตรงจุดและชัดเจน) */}
      {activeSubTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Explanation Header */}
          <div className="p-5 rounded-3xl bg-purple-950/40 border border-purple-500/30 text-white space-y-1">
            <h2 className="text-base font-bold flex items-center gap-2 text-purple-200">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>ระบบเปิด-ปิดการใส่รหัสผ่านก่อน Login ของนักเรียนและครู</span>
            </h2>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              คุณครูสามารถเลือกเปิดหรือปิดระบบรหัสผ่านได้อย่างอิสระตามความเหมาะสมของการเรียนการสอน โดยการตั้งค่าจะมีผลทันทีกับทุกคนที่เข้าสู่ระบบ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control 1: Student Password Requirement Switch */}
            <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
              requireStudentPassword
                ? 'bg-indigo-950/30 border-indigo-500/50 shadow-xl shadow-indigo-950/50'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    requireStudentPassword ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {requireStudentPassword ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      รหัสผ่านนักเรียนก่อน Login
                    </h3>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                      requireStudentPassword ? 'bg-indigo-500/20 text-indigo-300' : 'bg-teal-500/20 text-teal-300'
                    }`}>
                      {requireStudentPassword ? '🔒 เปิดอยู่ (ต้องใส่รหัส PIN)' : '🔓 ปิดอยู่ (เข้าสู่ระบบด่วน)'}
                    </span>
                  </div>
                </div>

                {/* Big Toggle Switch */}
                <button
                  onClick={() => setRequireStudentPassword(!requireStudentPassword)}
                  className={`w-16 h-9 rounded-full p-1 transition-colors cursor-pointer relative flex items-center ${
                    requireStudentPassword ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                  title="คลิกเพื่อสลับ เปิด/ปิด รหัสผ่านนักเรียน"
                >
                  <div className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform ${
                    requireStudentPassword ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <div>
                  <strong>💡 คำแนะนำการใช้งาน:</strong>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>เมื่อปิด (แนะนำสำหรับคาบปกติ):</strong> นักเรียนคลิกเลือกชื่อตนเองแล้วกดเข้าห้องเรียนได้ทันที 1 คลิก สะดวก รวดเร็วมาก เด็กไม่ลืมรหัส</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>เมื่อเปิด (สำหรับช่วงสอบ/แข่งขัน):</strong> นักเรียนต้องพิมพ์รหัส PIN 4 หลัก หรือรหัสนักเรียน เพื่อป้องกันไม่ให้เพื่อนเข้าทำข้อสอบแทนกัน</span>
                </div>
              </div>
            </div>

            {/* Control 2: Teacher PIN Requirement Switch */}
            <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
              requireTeacherPin
                ? 'bg-purple-950/30 border-purple-500/50 shadow-xl shadow-purple-950/50'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    requireTeacherPin ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {requireTeacherPin ? <Key className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      รหัส PIN คุณครูก่อน Login
                    </h3>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                      requireTeacherPin ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {requireTeacherPin ? '🔒 เปิดอยู่ (ต้องกรอก PIN ครู)' : '🔓 ปิดอยู่ (เลือกชื่อแล้วเข้าทันที)'}
                    </span>
                  </div>
                </div>

                {/* Big Toggle Switch */}
                <button
                  onClick={() => setRequireTeacherPin(!requireTeacherPin)}
                  className={`w-16 h-9 rounded-full p-1 transition-colors cursor-pointer relative flex items-center ${
                    requireTeacherPin ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                  title="คลิกเพื่อสลับ เปิด/ปิด รหัส PIN คุณครู"
                >
                  <div className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform ${
                    requireTeacherPin ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <div>
                  <strong>💡 คำแนะนำการใช้งาน:</strong>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>เมื่อเปิด (ค่าแนะนำ):</strong> ต้องพิมพ์รหัส PIN 4 หลัก (ค่าเริ่มต้น: 1234) ก่อนเข้าแดชบอร์ด เพื่อป้องกันนักเรียนแอบเข้ามาดูเฉลยข้อสอบ</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>เมื่อปิด:</strong> คุณครูคลิกเลือกชื่อตนเองแล้วเข้าจัดการระบบได้ทันทีโดยไม่ต้องพิมพ์ PIN สะดวกมากเมื่อสอนในห้องเรียน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Master PIN Change Form */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">เปลี่ยนรหัส Master PIN ครูผู้สอน</h3>
                  <p className="text-xs text-slate-400">
                    รหัส PIN ปัจจุบันคือ: <strong className="font-mono text-amber-300">{teacherPin}</strong>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateMasterPin} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={newMasterPin}
                onChange={e => setNewMasterPin(e.target.value)}
                placeholder="ระบุรหัส PIN 4-6 หลักใหม่ (เช่น 5678)..."
                maxLength={8}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกรหัส PIN ใหม่</span>
              </button>
            </form>

            {pinChangeMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                pinChangeMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {pinChangeMsg.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>{pinChangeMsg.text}</span>
              </div>
            )}
          </div>

          {/* Sound & Animation Toggles */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">สวิตช์บรรยากาศและเอฟเฟกต์ (Audio & Visuals)</h3>
                <p className="text-xs text-slate-400">ควบคุมเสียงและภาพเคลื่อนไหวตามบรรยากาศในห้องเรียน</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Sound */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    theme.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {theme.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">เสียงประกอบเกม</div>
                    <div className="text-[10px] text-slate-400">{theme.soundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSound();
                    if (!theme.soundEnabled) playSound('click');
                  }}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors relative flex items-center ${
                    theme.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    theme.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Mascot */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    theme.mascotEnabled ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">มาสคอตผู้ช่วย</div>
                    <div className="text-[10px] text-slate-400">{theme.mascotEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    toggleMascot();
                  }}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors relative flex items-center ${
                    theme.mascotEnabled ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    theme.mascotEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Animations */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    theme.animationsEnabled ? 'bg-amber-600 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">แอนิเมชัน & คอนเฟตติ</div>
                    <div className="text-[10px] text-slate-400">{theme.animationsEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    toggleAnimations();
                  }}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors relative flex items-center ${
                    theme.animationsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    theme.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: GOOGLE SHEETS & SHARE LINKS */}
      {activeSubTab === 'cloud' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Google Sheets Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-emerald-500/30 shadow-2xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>การเชื่อมต่อ Google Sheets คลาวด์</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      isGasConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isGasConnected ? '🟢 เชื่อมต่อสด' : '🟡 รอการเชื่อมต่อ'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {gasUrl ? `เชื่อมต่อไปยัง: ${gasUrl.slice(0, 45)}...` : 'ยังไม่ได้ระบุ Google Apps Script Web App URL'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    fetchDataFromGas(gasUrl, false);
                  }}
                  disabled={isSyncing || !gasUrl}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลล่าสุดจาก Sheets'}</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    onOpenGasModal();
                  }}
                  className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>ตั้งค่า Sheets URL</span>
                </button>
              </div>
            </div>

            {/* Quick Share to Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🔗 ลิงก์สำหรับส่งให้นักเรียนเข้าเรียน:</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">ฝังการเชื่อมต่อ Google Sheets อัตโนมัติ</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                  {shareableUrl}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกลิงก์เรียบร้อยแล้ว! 🎉' : 'คัดลอกลิงก์ส่งให้นักเรียน'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      setShowQrModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>แสดง QR Code</span>
                  </button>
                </div>
              </div>

              {/* Data Summary on Google Sheets */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-200">📊 ข้อมูลที่บันทึกบน Google Sheets อัตโนมัติ:</div>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>ชีต "Students":</strong> รายชื่อ, เลขที่, ห้องเรียน, คะแนนรวม XP, เลเวล</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>ชีต "Questions":</strong> ข้อสอบทุกวิชา พร้อมเฉลยและคำอธิบาย</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>ชีต "AnswerLogs":</strong> ประวัติการส่งคำตอบแบบละเอียด (คะแนน, เวลา, โหมดเกม)</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">
                    💡 หากต้องการเปิด Google Sheets ไปที่ลิงก์ชีตของคุณครูเพื่อดูข้อมูลทั้งหมดในรูปแบบตาราง Excel ได้ตลอดเวลา
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: PRODUCTION READY & DATA RESET (ตอบคำถามข้อ 2 ของคุณครู: ระบบนี้เปิดใช้งานจริงได้หรือยัง?) */}
      {activeSubTab === 'production' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Readiness Evaluation Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                🚀
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  การประเมินความพร้อมใช้งานจริง (โรงเรียนบ้านเขานางต่วม)
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบได้รับการออกแบบให้พร้อมสำหรับการใช้งานจริงในห้องเรียนและการเรียนออนไลน์
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-white">1. ระบบฐานข้อมูล (Google Sheets)</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isGasConnected
                      ? 'เชื่อมต่อสมบูรณ์แล้ว ข้อมูลนักเรียนและคะแนนจะบันทึกลง Google Sheets ของครูถาวร'
                      : 'แนะนำให้ตั้งค่า Web App URL ของ Google Sheets เพื่อบันทึกข้อมูลถาวร'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-white">2. ระบบยืนยันตัวตน (Authentication)</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {requireStudentPassword
                      ? 'เปิดระบบรหัสผ่านนักเรียนแล้ว ป้องกันการเข้าทำข้อสอบแทนกัน'
                      : 'เปิดโหมดเข้าสู่ระบบด่วน นักเรียนคลิกเลือกชื่อตนเองแล้วเข้าเรียนได้ทันที สะดวกมาก'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-white">3. คลังข้อสอบและเกมการเรียนรู้</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    มีข้อสอบในคลัง {totalQuestions} ข้อ พร้อม 9 โหมดเกมประลอง, บทเรียน, และเครื่องมือพิมพ์ใบงาน A4
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-white">4. การแชร์ให้นักเรียนผ่านลิงก์หรือ QR Code</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    นักเรียนไม่ต้องลงแอปใดๆ เพียงเปิดผ่านเบราว์เซอร์บนมือถือ แท็บเล็ต หรือคอมพิวเตอร์
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Data & Reset Tools */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">เครื่องมือจัดการข้อมูลสำหรับการเริ่มสอนจริง</h3>
                <p className="text-xs text-slate-400">
                  ล้างคะแนนทดสอบที่ครูได้ลองเล่น เพื่อให้คะแนนของนักเรียนทุกคนเริ่มนับจาก 0
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (window.confirm('คุณต้องการรีเซ็ตประวัติการสอบและคะแนนทั้งหมดเป็น 0 ใช่หรือไม่?\n\n- คะแนน XP ของนักเรียนจะกลายเป็น 0\n- ประวัติ AnswerLogs จะถูกล้าง\n- เพื่อเริ่มต้นเก็บคะแนนนักเรียนจริง')) {
                    playSound('click');
                    clearTestScoresAndLogs();
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>🧹 รีเซ็ตคะแนนและประวัติทดสอบเป็น 0</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('⚠️ คุณต้องการล้างข้อมูลทดสอบทั้งหมดเพื่อเริ่มใช้งานจริงใช่หรือไม่?\n\n- ประวัติและคะแนนสอบทั้งหมดจะกลายเป็น 0\n- ล้างงานมอบหมายทดสอบ\n- ล้างรายชื่อนักเรียนทดสอบ\n- ตั้งค่าครูผู้ดูแลระบบเป็น "ครูอิศรา"')) {
                    playSound('victory');
                    resetAllTestDataForProduction();
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>⚡ รีเซ็ตระบบเพื่อเริ่มใช้งานจริง (Production Reset)</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  onNavigateTab('student-manager');
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ใส่/นำเข้ารายชื่อนักเรียนจริง</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* QR Code Modal for Student Portal Share */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center text-white relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-1">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black">สแกน QR Code เพื่อเข้าสู่ห้องเรียน</h3>
                <p className="text-xs text-slate-300">
                  นักเรียนสามารถเปิดกล้องมือถือ/แท็บเล็ตเพื่อสแกนเข้าเว็บพร้อมเชื่อมต่อ Google Sheets อัตโนมัติทันที
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareableUrl)}`}
                  alt="Student Portal QR Code"
                  className="w-56 h-56 mx-auto block"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 font-mono break-all text-left">
                <div className="text-slate-400 text-[10px] mb-1 font-sans">ลิงก์ที่เชื่อมต่อ:</div>
                {shareableUrl}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
