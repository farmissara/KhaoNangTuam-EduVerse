import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Question } from '../../types';
import {
  Printer,
  FileText,
  CheckSquare,
  BookOpen,
  Filter,
  Download,
  School,
  FileCheck
} from 'lucide-react';

export const WorksheetGenerator: React.FC = () => {
  const { subjects, questions, playSound, theme } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [examTitle, setExamTitle] = useState<string>('แบบทดสอบวัดผลสัมฤทธิ์ทางการเรียน');
  const [examCode, setExamCode] = useState<string>('ชุดที่ 1');
  const [schoolName, setSchoolName] = useState<string>('โรงเรียนตัวอย่างวิทยาการ สพฐ.');
  const [timeAllowed, setTimeAllowed] = useState<string>('60 นาที');
  const [totalScore, setTotalScore] = useState<number>(20);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectQuestions = questions.filter(q => q.subjectId === selectedSubject.id);

  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Configuration Header Controls (Hidden during print) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/30">
              🖨️
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">
                ระบบจัดพิมพ์ใบงาน & กระดาษคำตอบ (Printable Worksheet & Answer Key)
              </h1>
              <p className="text-xs text-slate-400">
                แปลงคลังข้อสอบในระบบเป็นเอกสาร A4 สำหรับพิมพ์แจกนักเรียนในห้องเรียนแบบออฟไลน์
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ข้อสอบ A4 (Print to PDF)</span>
          </button>
        </div>

        {/* Setting Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">เลือกวิชา</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">หัวข้อเอกสาร</label>
            <input
              type="text"
              value={examTitle}
              onChange={e => setExamTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">ชื่อโรงเรียน / สถาบัน</label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="includeAnswers"
              checked={includeAnswers}
              onChange={e => setIncludeAnswers(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="includeAnswers" className="text-slate-300 font-bold cursor-pointer">
              แนบเฉลยละเอียดท้ายชุด
            </label>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRINTABLE A4 PREVIEW CONTAINER */}
      {/* ======================================================== */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-300 max-w-4xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Exam Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h2 className="text-lg sm:text-xl font-bold font-serif">{schoolName}</h2>
          <h3 className="text-base font-bold">{examTitle}</h3>
          <p className="text-xs text-slate-700">
            วิชา <b>{selectedSubject.name} ({selectedSubject.code})</b> • ชั้น {selectedSubject.gradeLevel} • เวลาสอบ: {timeAllowed} • คะแนนเต็ม: {subjectQuestions.length} คะแนน
          </p>

          {/* Student Fill-in Info */}
          <div className="pt-4 flex flex-wrap items-center justify-between text-xs text-slate-800 border-t border-slate-300 mt-3">
            <div>ชื่อ - นามสกุล: ........................................................................</div>
            <div>ชั้น ม.........../.......... เลขที่: ...........</div>
            <div>คะแนนที่ได้: ............. / {subjectQuestions.length}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-600 italic bg-slate-100 p-2.5 rounded-lg border border-slate-200">
          <b>คำชี้แจง:</b> ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว แล้วทำเครื่องหมายกากบาท (X) ลงในกระดาษคำตอบ
        </div>

        {/* Questions List */}
        <div className="space-y-6 text-xs text-slate-900 leading-relaxed">
          {subjectQuestions.map((q, idx) => (
            <div key={q.id} className="space-y-1.5 break-inside-avoid">
              <div className="font-bold flex items-start gap-1.5">
                <span className="font-mono">{idx + 1}.</span>
                <span>{q.questionText}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-4 pt-1">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key Section (Page Break during print if enabled) */}
        {includeAnswers && (
          <div className="pt-8 border-t-2 border-dashed border-slate-400 space-y-4 break-before-page">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950 font-serif">
                --- เฉลยและคำอธิบายละเอียด (Answer Key & Explanations) ---
              </h3>
              <p className="text-[10px] text-slate-500">สำหรับคุณครูผู้สอนในการตรวจและเฉลยในห้องเรียน</p>
            </div>

            <div className="space-y-3 text-xs">
              {subjectQuestions.map((q, idx) => (
                <div key={q.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">
                    ข้อ {idx + 1}: ตอบ {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    <span className="font-semibold text-indigo-900">เหตุผล: </span>{q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
