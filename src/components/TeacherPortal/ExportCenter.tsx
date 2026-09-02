import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Table,
  FileText,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';

export const ExportCenter: React.FC = () => {
  const { students, questions, answerLogs, teachers, playSound, triggerMascotTip } = useApp();
  const [selectedExport, setSelectedExport] = useState<'students' | 'questions' | 'logs' | 'item_analysis' | 'teachers'>('students');
  const [copied, setCopied] = useState(false);

  const generateCsvData = () => {
    if (selectedExport === 'students') {
      const headers = ['StudentID', 'Prefix', 'FirstName', 'LastName', 'Classroom', 'Number', 'Level', 'XP', 'Coins', 'StreakDays', 'BattleWins', 'Accuracy'];
      const rows = students.map(s => [
        s.studentCode,
        s.prefix,
        s.firstName,
        s.lastName,
        s.classroom,
        s.number,
        s.level,
        s.xp,
        s.coins,
        s.streakDays,
        s.battleWins,
        `${s.accuracy}%`
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (selectedExport === 'questions') {
      const headers = ['QuestionID', 'Subject', 'GradeLevel', 'QuestionText', 'Difficulty', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectIndex', 'Explanation', 'TimeLimitSeconds'];
      const rows = questions.map(q => [
        q.id,
        `"${q.subjectName}"`,
        `"${q.gradeLevel}"`,
        `"${q.questionText.replace(/"/g, '""')}"`,
        q.difficulty,
        `"${(q.options[0] || '').replace(/"/g, '""')}"`,
        `"${(q.options[1] || '').replace(/"/g, '""')}"`,
        `"${(q.options[2] || '').replace(/"/g, '""')}"`,
        `"${(q.options[3] || '').replace(/"/g, '""')}"`,
        q.correctIndex,
        `"${q.explanation.replace(/"/g, '""')}"`,
        q.timeLimitSeconds
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (selectedExport === 'item_analysis') {
      const headers = [
        'QuestionID', 'Subject', 'GradeLevel', 'Difficulty', 'QuestionText',
        'TimesAnswered', 'TimesCorrect', 'TimesWrong', 'AccuracyPercent',
        'DifficultyIndex_p', 'DistractorA_Count', 'DistractorB_Count', 'DistractorC_Count', 'DistractorD_Count',
        'CorrectAnswer', 'Explanation'
      ];
      const rows = questions.map(q => {
        const qLogs = answerLogs.filter(l => l.questionId === q.id);
        const answered = qLogs.length > 0 ? qLogs.length : (q.timesAnswered || 0);
        const correct = qLogs.length > 0 ? qLogs.filter(l => l.isCorrect).length : (q.timesCorrect || 0);
        const wrong = answered - correct;
        const acc = answered > 0 ? Math.round((correct / answered) * 100) : 100;
        const p = answered > 0 ? (correct / answered).toFixed(2) : '0.50';

        const optCounts = [0, 0, 0, 0];
        qLogs.forEach(l => {
          if (l.selectedOption >= 0 && l.selectedOption < 4) optCounts[l.selectedOption]++;
        });

        return [
          q.id,
          `"${q.subjectName}"`,
          `"${q.gradeLevel}"`,
          q.difficulty,
          `"${q.questionText.replace(/"/g, '""')}"`,
          answered,
          correct,
          wrong,
          `${acc}%`,
          p,
          optCounts[0],
          optCounts[1],
          optCounts[2],
          optCounts[3],
          `"${(q.options[q.correctIndex] || '').replace(/"/g, '""')}"`,
          `"${q.explanation.replace(/"/g, '""')}"`
        ];
      });
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (selectedExport === 'logs') {
      const headers = [
        'LogID', 'StudentID', 'StudentName', 'Classroom', 'Subject',
        'QuestionID', 'QuestionText', 'SelectedOptionText', 'CorrectOptionText',
        'Result', 'TimeSpentSeconds', 'EarnedXP', 'EarnedCoins', 'GameMode', 'Timestamp', 'Explanation'
      ];
      const rows = answerLogs.map(l => {
        const q = questions.find(item => item.id === l.questionId);
        const qText = l.questionText || q?.questionText || '';
        const selectedText = l.selectedOptionText || (q && l.selectedOption >= 0 ? q.options[l.selectedOption] : '');
        const correctText = l.correctOptionText || (q ? q.options[q.correctIndex] : '');
        const expl = l.explanation || q?.explanation || '';

        return [
          l.id,
          l.studentId,
          `"${l.studentName}"`,
          l.classroom,
          `"${l.subjectName}"`,
          l.questionId,
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
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (selectedExport === 'teachers') {
      const headers = ['TeacherID', 'Password', 'Prefix', 'FirstName', 'LastName', 'Role', 'Department'];
      const rows = teachers.map(t => [
        t.teacherId,
        'password',
        t.prefix,
        t.firstName,
        t.lastName,
        t.role,
        t.department
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return '';
  };

  const csvContent = generateCsvData();

  const handleCopy = () => {
    playSound('click');
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    triggerMascotTip('คัดลอกข้อมูลตาราง CSV เรียบร้อยแล้ว! นำไปวางใน Excel ได้ทันที 📋', 'cheering');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCsv = () => {
    playSound('click');
    // Add UTF-8 BOM so Excel opens Thai correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eduquest_${selectedExport}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerMascotTip('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้วครับ! 💾', 'happy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            ศูนย์ส่งออกข้อมูลและรายงาน (Data & Grade Export)
          </h2>
          <p className="text-xs text-slate-400">
            ส่งออกผลการเรียน สถิติข้อสอบ และข้อมูลผู้ใช้ เป็นไฟล์ Excel / CSV หรือ Google Sheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก CSV'}</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด .CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => {
            playSound('click');
            setSelectedExport('students');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedExport === 'students'
              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">1. ผลการเรียนนักเรียน</span>
            <span className="text-xs">👥</span>
          </div>
          <p className="text-[11px] text-slate-400">XP, เลเวล, ความแม่นยำ ({students.length} คน)</p>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setSelectedExport('item_analysis');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedExport === 'item_analysis'
              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">2. วิเคราะห์ข้อสอบ</span>
            <span className="text-xs">📊</span>
          </div>
          <p className="text-[11px] text-slate-400">ค่าความยาก p, ตัวลวง ({questions.length} ข้อ)</p>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setSelectedExport('questions');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedExport === 'questions'
              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">3. คลังข้อสอบ</span>
            <span className="text-xs">📝</span>
          </div>
          <p className="text-[11px] text-slate-400">โจทย์และตัวเลือก ({questions.length} ข้อ)</p>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setSelectedExport('logs');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedExport === 'logs'
              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">4. ประวัติการตอบควิซ</span>
            <span className="text-xs">⏱️</span>
          </div>
          <p className="text-[11px] text-slate-400">บันทึกถูกผิดรายข้อ ({answerLogs.length} รายการ)</p>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setSelectedExport('teachers');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedExport === 'teachers'
              ? 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">5. รายชื่อคุณครู</span>
            <span className="text-xs">🎓</span>
          </div>
          <p className="text-[11px] text-slate-400">ฝ่ายงานและสิทธิ์ ({teachers.length} ท่าน)</p>
        </button>
      </div>

      {/* Preview Box */}
      <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" />
            พรีวิวโครงสร้างไฟล์ CSV (พร้อมรองรับภาษาไทย UTF-8)
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Format: RFC 4180 CSV</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-72 whitespace-pre leading-relaxed selection:bg-emerald-900">
          {csvContent}
        </div>
      </div>
    </div>
  );
};
