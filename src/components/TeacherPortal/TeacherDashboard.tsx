import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileCode2,
  PlusCircle,
  Clock,
  Shield,
  Send,
  Target,
  Layers,
  Flame,
  ChevronRight
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenGasModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateTab,
  onOpenGasModal
}) => {
  const { currentTeacher, students, questions, answerLogs, subjects, assignments, playSound } = useApp();

  const totalStudents = students.length;
  const totalQuestions = questions.length;
  const totalSubmissions = answerLogs.length;
  const totalSubjects = subjects.length;
  const totalAssignments = assignments.length;

  const correctCount = answerLogs.filter(a => a.isCorrect).length;
  const overallAccuracy = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 85;

  return (
    <div className="space-y-6">
      {/* Teacher Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-600 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
                🎓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  {currentTeacher.prefix}{currentTeacher.firstName} {currentTeacher.lastName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {currentTeacher.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                กลุ่มสาระฯ / ฝ่ายงาน: <span className="text-slate-200">{currentTeacher.department}</span>
              </p>
              <div className="text-[11px] text-slate-400 mt-1">
                รหัสประจำตัวครู: <span className="font-mono text-indigo-300 font-bold">{currentTeacher.teacherId}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('ai-quiz-generator');
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <span>🤖 AI ออกข้อสอบ</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('worksheet-generator');
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <span>🖨️ พิมพ์ใบงาน A4</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('exam-analytics');
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>วิเคราะห์ข้อสอบ</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('assignment-manager');
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>มอบหมายข้อสอบ</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onNavigateTab('subject-manager');
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มวิชา</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onOpenGasModal();
              }}
              className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileCode2 className="w-4 h-4" />
              <span>โค้ด GAS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigateTab('student-manager')}
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 shadow-xl flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">นักเรียนในระบบ</div>
            <div className="text-xl font-black text-white">{totalStudents} คน</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('subject-manager')}
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 shadow-xl flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">กลุ่มสาระวิชา</div>
            <div className="text-xl font-black text-emerald-400">{totalSubjects} วิชา</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('question-bank')}
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 shadow-xl flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ข้อสอบในคลัง</div>
            <div className="text-xl font-black text-white">{totalQuestions} ข้อ</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('assignment-manager')}
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 shadow-xl flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ภารกิจที่มอบหมาย</div>
            <div className="text-xl font-black text-purple-300">{totalAssignments} งาน</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ความแม่นยำรวม</div>
            <div className="text-xl font-black text-amber-400">{overallAccuracy}%</div>
          </div>
        </div>
      </div>

      {/* Quick Access Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            playSound('click');
            onNavigateTab('exam-analytics');
          }}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">วิเคราะห์ข้อสอบ & ทบทวน</h3>
          <p className="text-xs text-slate-400">ดูสถิติค่าความยาก p-value ตัวลวง และเปิดโหมดทบทวนให้นักเรียน</p>
        </div>

        <div
          onClick={() => {
            playSound('click');
            onNavigateTab('assignment-manager');
          }}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">มอบหมายข้อสอบ (Assignment Hub)</h3>
          <p className="text-xs text-slate-400">สั่งงานตามห้องหรือรายบุคคล กำหนดวันส่ง และส่งการแจ้งเตือนอัตโนมัติ</p>
        </div>

        <div
          onClick={() => {
            playSound('click');
            onNavigateTab('subject-manager');
          }}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">จัดการรายวิชา (Subject Manager)</h3>
          <p className="text-xs text-slate-400">เพิ่ม/แก้ไขกลุ่มสาระ กำหนดรหัสวิชา ไอคอน สีประจำวิชา และคำอธิบาย</p>
        </div>

        <div
          onClick={() => {
            playSound('click');
            onNavigateTab('question-bank');
          }}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">คลังข้อสอบมัลติมีเดีย (Media Questions)</h3>
          <p className="text-xs text-slate-400">สร้างข้อสอบแนบรูปภาพ วิดีโอ YouTube ลิงก์อ้างอิง พร้อมระบบ AI ช่วยแต่งโจทย์</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Student Activity & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              ประวัติการทำแบบทดสอบล่าสุด (Live Activity Logs)
            </h3>
            <span className="text-[11px] text-slate-400">อัปเดตแบบเรียลไทม์</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {answerLogs.slice(0, 8).map(log => (
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
                      วิชา: {log.subjectName} • โหมด: {log.mode === 'battle' ? 'Battle Arena ⚔️' : log.mode === 'survival' ? 'เอาชีวิตรอดบอส 🔥' : log.mode === 'matching' ? 'จับคู่ 🎴' : log.mode === 'tower' ? 'หอคอย 🏰' : log.mode === 'exam' ? 'ภารกิจที่มอบหมาย 🎯' : 'ฝึกฝน 📝'}
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
            ))}
          </div>
        </div>

        {/* Right: Subject Catalog Stats */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              กลุ่มสาระวิชาในระบบ ({subjects.length})
            </h3>
            <button
              onClick={() => onNavigateTab('subject-manager')}
              className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
            >
              จัดการ
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
    </div>
  );
};
