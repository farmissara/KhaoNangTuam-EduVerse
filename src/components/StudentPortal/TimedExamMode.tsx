import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Question, Subject } from '../../types';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Send
} from 'lucide-react';

interface TimedExamModeProps {
  onBack: () => void;
}

export const TimedExamMode: React.FC<TimedExamModeProps> = ({ onBack }) => {
  const { subjects, questions, currentStudent, submitAnswer, triggerConfetti, playSound, theme } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300); // 5 minutes
  const [violations, setViolations] = useState<number>(0);
  const [isExamFinished, setIsExamFinished] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<{ score: number; total: number; percent: number } | null>(null);

  const subjectQuestions = questions.filter(q => q.subjectId === selectedSubject.id).slice(0, 5);

  // Anti-Cheat: Detect Tab switching or blur event
  useEffect(() => {
    if (!isExamStarted || isExamFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const next = prev + 1;
          playSound('wrong');
          alert(`⚠️ คำเตือนการทุจริต! คุณได้สลับหน้าจอหรือเปิดแท็บอื่น (พบการกระทำไม่พึงประสงค์ครั้งที่ ${next}/3)`);
          if (next >= 3) {
            handleFinishExam();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamStarted, isExamFinished]);

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted || isExamFinished) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isExamFinished]);

  const handleStart = () => {
    playSound('start');
    setIsExamStarted(true);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setViolations(0);
    setTimeLeftSeconds(300);
    setIsExamFinished(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    playSound('click');
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleFinishExam = () => {
    let score = 0;
    subjectQuestions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected === q.correctIndex) {
        score++;
      }
      // Record answer
      if (selected !== undefined) {
        submitAnswer({
          questionId: q.id,
          selectedOption: selected,
          timeSpentSeconds: 10,
          mode: 'exam'
        });
      }
    });

    const percent = Math.round((score / subjectQuestions.length) * 100);
    setFinalScore({ score, total: subjectQuestions.length, percent });
    setIsExamFinished(true);
    playSound('victory');
    triggerConfetti();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-3xl shadow-lg shadow-red-500/25 animate-pulse-glow">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                โหมดสอบจริงจังจับเวลา (Official Exam Mode & Anti-Cheat)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                Anti-Cheat Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ระบบสอบจับเวลารวม ล็อกการสลับหน้าจอ สุ่มข้อสอบ และตรวจความซื่อสัตย์อัตโนมัติ
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

      {/* Pre-Exam Selection Screen */}
      {!isExamStarted && !isExamFinished && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-4xl border border-red-500/40 animate-pulse">
            ⏱️
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">กติกาการสอบในโหมดจับเวลา</h2>
            <div className="text-xs text-slate-400 space-y-2 text-left bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>มีเวลาจำกัดรวม 5 นาที สำหรับทำข้อสอบ 5 ข้อ</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>ห้ามสลับแท็บหรือเปิดหน้าต่างอื่น (เตือนครบ 3 ครั้งจะยุติการสอบทันที)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>คะแนนจะถูกบันทึกลง Google Sheets และมีผลต่ออันดับเกียรติบัตร</span>
              </div>
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">เลือกวิชาที่ต้องการเข้าสอบ</label>
            <select
              value={selectedSubject.id}
              onChange={e => {
                const s = subjects.find(sub => sub.id === e.target.value);
                if (s) setSelectedSubject(s);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <Lock className="w-4 h-4" />
            <span>เริ่มการสอบอย่างเป็นทางการ (Start Official Exam)</span>
          </button>
        </div>
      )}

      {/* Active Exam Running */}
      {isExamStarted && !isExamFinished && (
        <div className="space-y-4">
          {/* Exam HUD Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/50 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">
                ข้อที่ {currentIndex + 1} จาก {subjectQuestions.length} ข้อ
              </span>
              {violations > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> สลับจอ {violations}/3 ครั้ง
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm font-black text-amber-400 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>เวลาที่เหลือ: {formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Current Question Box */}
          {subjectQuestions[currentIndex] && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base sm:text-lg font-black text-white leading-relaxed">
                {currentIndex + 1}. {subjectQuestions[currentIndex].questionText}
              </h2>

              <div className="space-y-2.5">
                {subjectQuestions[currentIndex].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-500 shadow-lg shadow-red-600/20 scale-[1.01]'
                          : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-750 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    playSound('click');
                    setCurrentIndex(prev => prev - 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  ย้อนกลับ
                </button>

                {currentIndex < subjectQuestions.length - 1 ? (
                  <button
                    onClick={() => {
                      playSound('click');
                      setCurrentIndex(prev => prev + 1);
                    }}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>ข้อถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งคำตอบเพื่อประมวลผล</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finished Exam Results */}
      {isExamFinished && finalScore && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-4xl border border-emerald-500/40">
            🏆
          </div>

          <div>
            <h2 className="text-xl font-black text-white">ประมวลผลคะแนนสอบสำเร็จ!</h2>
            <p className="text-xs text-slate-400 mt-1">วิชา {selectedSubject.name}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="text-4xl font-black text-emerald-400">
              {finalScore.score} / {finalScore.total}
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              คิดเป็นร้อยละ <b>{finalScore.percent}%</b>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700">
              บันทึกคะแนนลง Google Sheets และอัปเดตสถิติประจำตัวเรียบร้อยแล้ว
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
            >
              สอบอีกครั้ง
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
