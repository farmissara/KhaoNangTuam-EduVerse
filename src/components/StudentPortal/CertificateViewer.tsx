import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CertificateTemplate, Subject } from '../../types';
import {
  Award,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  Calendar,
  Building2,
  FileCheck,
  Share2
} from 'lucide-react';

interface CertificateViewerProps {
  onBack: () => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({ onBack }) => {
  const { currentStudent, certificates, answerLogs, subjects, playSound, theme } = useApp();
  const [selectedCert, setSelectedCert] = useState<CertificateTemplate>(certificates[0]);
  const certRef = useRef<HTMLDivElement>(null);

  const isLightTheme = [
    'daylight-white',
    'pastel-sky',
    'sunny-amber',
    'mint-fresh',
    'bubblegum-pink',
    'lavender-dream'
  ].includes(theme.background);

  // Calculate student performance in this certificate's subject
  const studentLogs = answerLogs.filter(
    l => l.studentId === currentStudent.id && l.subjectId === selectedCert.subjectId
  );
  const total = studentLogs.length;
  const correct = studentLogs.filter(l => l.isCorrect).length;
  const studentAccuracy = total > 0 ? Math.round((correct / total) * 100) : currentStudent.accuracy;
  const isEligible = studentAccuracy >= selectedCert.minScorePercent;

  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isLightTheme
          ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 border-amber-200 text-slate-800'
          : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/30 text-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 animate-pulse-glow">
            📜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                ระบบเกียรติบัตรอิเล็กทรอนิกส์ (E-Certificate Center)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Official E-Cert
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ทำคะแนนความถูกต้องเกิน {selectedCert.minScorePercent}% ในแต่ละรายวิชาเพื่อปลดล็อกและพิมพ์ใบประกาศนียบัตร
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-all"
        >
          กลับหน้าแดชบอร์ด
        </button>
      </div>

      {/* Select Subject Certificate Tab */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {certificates.map(cert => (
          <button
            key={cert.id}
            onClick={() => {
              playSound('click');
              setSelectedCert(cert);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedCert.id === cert.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{cert.subjectName}</span>
          </button>
        ))}
      </div>

      {/* Main Certificate Display & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Certificate Status & Actions (Left / Top) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            สถานะสิทธิ์การรับเกียรติบัตร
          </h2>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>เกณฑ์คะแนนขั้นต่ำ:</span>
              <span className="font-bold text-amber-400">{selectedCert.minScorePercent}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>คะแนนความถูกต้องของคุณ:</span>
              <span className={`font-black text-sm ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {studentAccuracy}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>สถานะ:</span>
              {isEligible ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์เรียบร้อย
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> ยังไม่ผ่านเกณฑ์ (ต้องทำเพิ่ม)
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              disabled={!isEligible}
              onClick={handlePrint}
              className={`w-full py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all ${
                isEligible
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 cursor-pointer hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึกเป็น PDF</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              * สามารถกดพิมพ์เป็นไฟล์ PDF เพื่อเก็บใส่แฟ้มสะสมผลงาน (Portfolio) หรือพิมพ์ลงกระดาษจริง
            </p>
          </div>
        </div>

        {/* The Printable Certificate Design (Right / Span 2) */}
        <div className="lg:col-span-2">
          <div
            ref={certRef}
            id="printable-certificate"
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/80 border-8 border-double border-amber-600/60 shadow-2xl text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[460px]"
          >
            {/* Elegant Vintage Corner Borders */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-[160px] font-black">🎓</span>
            </div>

            {/* Top Logo & School Name */}
            <div className="text-center relative z-10 space-y-1">
              <div className="inline-block p-2 rounded-2xl bg-amber-500/15 border border-amber-400 text-2xl mb-1 shadow-sm">
                🏛️
              </div>
              <h3 className="text-sm sm:text-base font-bold text-amber-900 tracking-wider">
                {selectedCert.schoolName}
              </h3>
              <p className="text-xs text-amber-800/80">ระบบประเมินและคลังข้อสอบเกมการศึกษาอัจฉริยะ (EduQuest)</p>
            </div>

            {/* Certificate Title */}
            <div className="text-center relative z-10 my-4 space-y-2">
              <div className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                CERTIFICATE OF ACHIEVEMENT
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
                {selectedCert.title}
              </h2>
              <p className="text-xs text-slate-600">ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า</p>

              {/* Student Name */}
              <div className="py-2">
                <div className="text-xl sm:text-2xl font-black text-indigo-950 border-b-2 border-dashed border-amber-400 inline-block px-8 py-1">
                  {currentStudent.prefix}{currentStudent.firstName} {currentStudent.lastName}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  ชั้นมัธยมศึกษาปีที่ {currentStudent.classroom} (เลขที่ {currentStudent.number})
                </div>
              </div>

              <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                ได้ผ่านการประเมินองค์ความรู้และทักษะในวิชา <b>{selectedCert.subjectName}</b> ด้วยผลคะแนนยอดเยี่ยม {studentAccuracy}%
              </p>
            </div>

            {/* Bottom Signatures & Serial */}
            <div className="pt-6 border-t border-amber-300 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-700">
              <div>
                <div className="font-bold text-slate-900">{selectedCert.teacherSignName}</div>
                <div className="text-[11px] text-slate-500">ครูผู้สอน / หัวหน้ากลุ่มสาระฯ</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-amber-600/60 bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-900 shadow-inner">
                  ตราประทับ
                </div>
              </div>

              <div className="text-right">
                <div>วันที่ออก: <span className="font-semibold">{selectedCert.issueDate}</span></div>
                <div className="text-[10px] font-mono text-slate-400">เลขที่: {selectedCert.serialNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
