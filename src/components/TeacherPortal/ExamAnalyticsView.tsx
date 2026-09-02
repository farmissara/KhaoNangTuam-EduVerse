import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, AnswerLog } from '../../types';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  FileSpreadsheet,
  Tv,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Users,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Eye,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExamAnalyticsViewProps {
  onBack?: () => void;
}

export const ExamAnalyticsView: React.FC<ExamAnalyticsViewProps> = ({ onBack }) => {
  const { questions, answerLogs, subjects, students } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'errorRate' | 'timesAnswered' | 'pIndex'>('errorRate');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [projectorQuestion, setProjectorQuestion] = useState<Question | null>(null);

  // Compute analytics for each question from answerLogs
  const questionAnalytics = questions.map(q => {
    // Filter logs for this question
    const qLogs = answerLogs.filter(log => {
      const matchQ = log.questionId === q.id;
      const matchClass = selectedClassroom === 'all' || log.classroom === selectedClassroom;
      return matchQ && matchClass;
    });

    const timesAnswered = qLogs.length > 0 ? qLogs.length : (q.timesAnswered || 0);
    const timesCorrect = qLogs.length > 0 ? qLogs.filter(l => l.isCorrect).length : (q.timesCorrect || 0);
    const timesWrong = timesAnswered - timesCorrect;
    const accuracy = timesAnswered > 0 ? Math.round((timesCorrect / timesAnswered) * 100) : 100;
    const errorRate = 100 - accuracy;
    const pValue = timesAnswered > 0 ? Number((timesCorrect / timesAnswered).toFixed(2)) : 0.5; // Difficulty Index p

    // Distractor breakdown (how many students chose option 0, 1, 2, 3)
    const optionCounts = [0, 0, 0, 0];
    qLogs.forEach(l => {
      if (l.selectedOption >= 0 && l.selectedOption < 4) {
        optionCounts[l.selectedOption]++;
      }
    });

    // Average time spent
    const avgTime = qLogs.length > 0
      ? Math.round(qLogs.reduce((acc, l) => acc + (l.timeSpentSeconds || 0), 0) / qLogs.length)
      : 8;

    return {
      question: q,
      timesAnswered,
      timesCorrect,
      timesWrong,
      accuracy,
      errorRate,
      pValue,
      optionCounts,
      avgTime,
      logs: qLogs
    };
  });

  // Filter and sort questions
  const filteredAnalytics = questionAnalytics
    .filter(item => {
      const matchSubject = selectedSubjectId === 'all' || item.question.subjectId === selectedSubjectId;
      const matchSearch = searchQuery.trim() === '' ||
        item.question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.question.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  // Classroom list
  const classrooms = Array.from(new Set(students.map(s => s.classroom)));

  // Total aggregate metrics
  const totalSubmissions = answerLogs.length;
  const overallCorrect = answerLogs.filter(l => l.isCorrect).length;
  const overallAccuracy = totalSubmissions > 0 ? Math.round((overallCorrect / totalSubmissions) * 100) : 0;
  const hardQuestionsCount = questionAnalytics.filter(q => q.errorRate >= 50).length;

  // Export Item Analysis CSV
  const handleExportItemAnalysisCsv = () => {
    const headers = [
      'รหัสคำถาม (ID)',
      'วิชา (Subject)',
      'ระดับชั้น (Grade)',
      'ความยาก (Difficulty)',
      'ข้อความโจทย์ (Question)',
      'จำนวนครั้งที่ตอบ (Total Attempts)',
      'ตอบถูก (Correct Count)',
      'ตอบผิด (Wrong Count)',
      'ร้อยละความถูกต้อง (Accuracy %)',
      'ร้อยละความผิดพลาด (Error Rate %)',
      'ค่าความยากง่าย (p-value)',
      'เวลาเฉลี่ย (วินาที)',
      'ตัวเลือก A',
      'ตัวเลือก B',
      'ตัวเลือก C',
      'ตัวเลือก D',
      'เฉลยที่ถูกต้อง',
      'คำอธิบายเฉลย (Explanation)'
    ];

    const rows = filteredAnalytics.map(item => [
      `"${item.question.id}"`,
      `"${item.question.subjectName}"`,
      `"${item.question.gradeLevel}"`,
      `"${item.question.difficulty}"`,
      `"${item.question.questionText.replace(/"/g, '""')}"`,
      item.timesAnswered,
      item.timesCorrect,
      item.timesWrong,
      `${item.accuracy}%`,
      `${item.errorRate}%`,
      item.pValue,
      item.avgTime,
      `"${(item.question.options[0] || '').replace(/"/g, '""')}"`,
      `"${(item.question.options[1] || '').replace(/"/g, '""')}"`,
      `"${(item.question.options[2] || '').replace(/"/g, '""')}"`,
      `"${(item.question.options[3] || '').replace(/"/g, '""')}"`,
      `"${(item.question.options[item.question.correctIndex] || '').replace(/"/g, '""')}"`,
      `"${item.question.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Item_Analysis_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Detailed Student Log CSV
  const handleExportAnswerLogsCsv = () => {
    const headers = [
      'Log ID',
      'รหัสนักเรียน',
      'ชื่อ-นามสกุล',
      'ห้องเรียน',
      'วิชา',
      'รหัสคำถาม',
      'ข้อความโจทย์',
      'ตัวเลือกที่เด็กตอบ',
      'คำตอบที่ถูก',
      'ผลการตอบ (ถูก/ผิด)',
      'เวลาที่ใช้ (วินาที)',
      'XP ที่ได้',
      'เหรียญที่ได้',
      'โหมดเกม (Game Mode)',
      'วันเวลาที่ทำ (Timestamp)',
      'คำอธิบายเฉลย'
    ];

    const rows = answerLogs.map(l => {
      const q = questions.find(item => item.id === l.questionId);
      const qText = l.questionText || q?.questionText || '';
      const selectedText = l.selectedOptionText || (q && l.selectedOption >= 0 ? q.options[l.selectedOption] : '');
      const correctText = l.correctOptionText || (q ? q.options[q.correctIndex] : '');
      const expl = l.explanation || q?.explanation || '';

      return [
        `"${l.id}"`,
        `"${l.studentId}"`,
        `"${l.studentName}"`,
        `"${l.classroom}"`,
        `"${l.subjectName}"`,
        `"${l.questionId}"`,
        `"${qText.replace(/"/g, '""')}"`,
        `"${selectedText.replace(/"/g, '""')}"`,
        `"${correctText.replace(/"/g, '""')}"`,
        l.isCorrect ? 'ถูก (Correct)' : 'ผิด (Wrong)',
        l.timeSpentSeconds,
        l.earnedXp,
        l.earnedCoins,
        `"${l.mode}"`,
        `"${l.timestamp}"`,
        `"${expl.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Answer_Logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              ← ย้อนกลับ
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              แดชบอร์ดวิเคราะห์ข้อสอบ & สถิติถูกผิดรายข้อ (Item Analysis)
            </h1>
            <p className="text-xs text-slate-400">
              วิเคราะห์ความยากง่าย (p-value), ตัวลวงที่เด็กมักตอบผิด และโหมดฉายจอทบทวนในห้องเรียน
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="export-item-analysis-csv"
            onClick={handleExportItemAnalysisCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export วิเคราะห์รายข้อ CSV</span>
          </button>
          <button
            id="export-raw-logs-csv"
            onClick={handleExportAnswerLogsCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium active:scale-95 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Export ข้อมูลดิบนักเรียน CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">จำนวนครั้งที่ทำข้อสอบ</span>
            <p className="text-2xl font-black text-white">{totalSubmissions.toLocaleString()} ครั้ง</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">อัตราความถูกต้องเฉลี่ย</span>
            <p className="text-2xl font-black text-emerald-400">{overallAccuracy}%</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">ข้อที่เด็กตอบผิดสูง (&gt;50%)</span>
            <p className="text-2xl font-black text-rose-400">{hardQuestionsCount} ข้อ</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">เวลาคิดต่อข้อเฉลี่ย</span>
            <p className="text-2xl font-black text-amber-400">7.8 วินาที</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">🌟 ทุกหมวดวิชา</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          {/* Classroom Filter */}
          <select
            value={selectedClassroom}
            onChange={e => setSelectedClassroom(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">🏫 ทุกห้องเรียน</option>
            {classrooms.map(c => (
              <option key={c} value={c}>
                ห้อง {c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => { setSortField('errorRate'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sortField === 'errorRate' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'
              }`}
            >
              อัตราตอบผิด {sortField === 'errorRate' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => { setSortField('timesAnswered'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sortField === 'timesAnswered' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'
              }`}
            >
              จำนวนครั้ง {sortField === 'timesAnswered' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อสอบ / คำสำคัญ..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Item Analysis Detailed Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              ตารางวิเคราะห์รายข้อ (Item Analysis & Distractor Distribution)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            แสดง {filteredAnalytics.length} ข้อสอบ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">ข้อสอบ & วิชา</th>
                <th className="p-4 text-center">ทำแล้ว</th>
                <th className="p-4 text-center">ความถูกต้อง</th>
                <th className="p-4 text-center">ค่าความยาก (p)</th>
                <th className="p-4 text-center">การกระจายตัวเลือก (A / B / C / D)</th>
                <th className="p-4 text-center">สอนทบทวน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAnalytics.map((item, idx) => {
                const isHard = item.errorRate >= 50;
                const isModerate = item.errorRate >= 20 && item.errorRate < 50;

                return (
                  <tr key={item.question.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Question & Subject */}
                    <td className="p-4 max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-teal-300 border border-slate-700">
                          {item.question.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.question.id}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2">
                        {item.question.questionText}
                      </p>
                    </td>

                    {/* Times answered */}
                    <td className="p-4 text-center font-mono text-slate-300">
                      {item.timesAnswered} ครั้ง
                    </td>

                    {/* Accuracy Badge */}
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                          isHard
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isModerate
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {item.accuracy}% ถูก
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          (ผิด {item.timesWrong} คน)
                        </span>
                      </div>
                    </td>

                    {/* p-value difficulty index */}
                    <td className="p-4 text-center font-mono">
                      <span className="font-bold text-white">{item.pValue}</span>
                      <p className="text-[10px] text-slate-500">
                        {item.pValue < 0.3 ? 'ยากมาก' : item.pValue > 0.75 ? 'ง่ายมาก' : 'จำแนกดี'}
                      </p>
                    </td>

                    {/* Distractor Distribution Bars */}
                    <td className="p-4 text-center min-w-[160px]">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                        {item.optionCounts.map((count, optIdx) => {
                          const isCorrectOpt = optIdx === item.question.correctIndex;
                          const total = item.timesAnswered || 1;
                          const pct = Math.round((count / total) * 100);

                          return (
                            <div
                              key={optIdx}
                              title={`ตัวเลือก ${String.fromCharCode(65 + optIdx)}: ${count} คน (${pct}%)`}
                              className={`px-1.5 py-1 rounded-lg flex flex-col items-center min-w-[32px] ${
                                isCorrectOpt
                                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                                  : count > 0
                                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                                  : 'bg-slate-800 text-slate-600'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}</span>
                              <span className="text-[9px] opacity-80">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Review Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setProjectorQuestion(item.question)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>ฉายจอสอน</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classroom Review Projector Modal */}
      <AnimatePresence>
        {projectorQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> โหมดฉายจอสอนทบทวน (Classroom Review Mode)
                  </span>
                  <span className="text-xs text-slate-400">{projectorQuestion.subjectName}</span>
                </div>
                <button
                  onClick={() => setProjectorQuestion(null)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  ✕ ปิด
                </button>
              </div>

              {/* Question Large Display */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                  โจทย์ข้อสอบ:
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {projectorQuestion.questionText}
                </h2>
              </div>

              {/* Options Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ตัวเลือกและเฉลย:
                </span>
                {projectorQuestion.options.map((opt, idx) => {
                  const isCorrect = idx === projectorQuestion.correctIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                        isCorrect
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm sm:text-base font-medium">{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase">
                          ✓ คำตอบที่ถูกต้อง
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Explanation Box */}
              <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-sm space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> แนวคิดคำอธิบายเฉลยและจุดที่เด็กมักเข้าใจผิด:
                </h4>
                <p className="text-slate-200 leading-relaxed">
                  {projectorQuestion.explanation}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setProjectorQuestion(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
                >
                  เสร็จสิ้นการทบทวน
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
