import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Question, Subject, Assignment } from '../../types';
import {
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  Zap,
  ChevronLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  ExternalLink,
  PlayCircle,
  Maximize2
} from 'lucide-react';

interface QuizPlayerProps {
  subject: Subject;
  questions: Question[];
  assignment?: Assignment;
  onBack: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ subject, questions, assignment, onBack }) => {
  const { currentStudent, submitAnswer, submitAssignment, playSound, triggerConfetti, triggerMascotTip } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    earnedXp: number;
    earnedCoins: number;
    explanation: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timerActive, setTimerActive] = useState(true);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [summaryScores, setSummaryScores] = useState({
    correct: 0,
    total: questions.length,
    totalXp: 0,
    totalCoins: 0
  });

  const currentQuestion = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (!timerActive || hasAnswered || quizFinished || !currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimitSeconds || 20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, timerActive, hasAnswered, quizFinished]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    handleSelectOption(-1, true);
  };

  const handleUseFiftyFifty = () => {
    if (fiftyFiftyUsed || hasAnswered || !currentQuestion) return;
    playSound('click');
    setFiftyFiftyUsed(true);

    const incorrectIndices = currentQuestion.options
      .map((_, i) => i)
      .filter(i => i !== currentQuestion.correctIndex);

    // Shuffle and pick 2 incorrect to hide
    const toHide = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
    triggerMascotTip('ใช้พลัง 50:50 ช่วยตัด 2 ตัวเลือกที่ผิดออกแล้วครับ!', 'thinking');
  };

  const handleSelectOption = (index: number, isTimeout: boolean = false) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedOption(index);
    setHasAnswered(true);
    setTimerActive(false);

    const timeSpent = (currentQuestion.timeLimitSeconds || 20) - timeLeft;

    const res = submitAnswer({
      questionId: currentQuestion.id,
      selectedOption: index,
      timeSpentSeconds: isTimeout ? currentQuestion.timeLimitSeconds || 20 : timeSpent,
      mode: assignment ? 'exam' : 'practice'
    });

    setLastResult(res);

    if (res.isCorrect) {
      setSummaryScores(prev => ({
        ...prev,
        correct: prev.correct + 1,
        totalXp: prev.totalXp + res.earnedXp,
        totalCoins: prev.totalCoins + res.earnedCoins
      }));
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setLastResult(null);
      setHiddenOptions([]);
      setFiftyFiftyUsed(false);
      setTimerActive(true);
    } else {
      setQuizFinished(true);
      triggerConfetti();
      playSound('victory');

      // If this is an assigned quest, automatically submit the assignment
      if (assignment) {
        const finalScore = summaryScores.correct + (lastResult?.isCorrect ? 1 : 0);
        submitAssignment({
          assignmentId: assignment.id,
          studentId: currentStudent.id,
          studentName: `${currentStudent.prefix}${currentStudent.firstName} ${currentStudent.lastName}`,
          score: finalScore,
          totalQuestions: questions.length,
          earnedXp: assignment.rewardXp,
          earnedCoins: assignment.rewardCoins
        });
        triggerMascotTip(`ส่งภารกิจ "${assignment.title}" ของคุณครูเรียบร้อยแล้วครับ! ได้รับ +${assignment.rewardXp} XP 🏆`, 'cheering');
      } else {
        triggerMascotTip('ยอดเยี่ยมมาก! ทำแบบทดสอบครบทุกข้อแล้ว มาดูสรุปคะแนนกัน! 🏆', 'cheering');
      }
    }
  };

  const handleRestartQuiz = () => {
    playSound('click');
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setLastResult(null);
    setHiddenOptions([]);
    setFiftyFiftyUsed(false);
    setQuizFinished(false);
    setTimerActive(true);
    setSummaryScores({
      correct: 0,
      total: questions.length,
      totalXp: 0,
      totalCoins: 0
    });
  };

  if (!currentQuestion && !quizFinished) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-300 mb-4">ไม่พบข้อสอบในหมวดนี้</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          กลับสู่หน้ารายวิชา
        </button>
      </div>
    );
  }

  // Finished Summary Screen
  if (quizFinished) {
    const accuracyPercent = Math.round((summaryScores.correct / summaryScores.total) * 100) || 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl text-center text-white backdrop-blur-xl"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 animate-bounce">
          {assignment ? '🎖️' : '🏆'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
          {assignment ? 'ส่งภารกิจข้อสอบสำเร็จ!' : 'ทำแบบทดสอบเสร็จสมบูรณ์!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          {assignment ? (
            <span className="text-purple-300 font-semibold">ภารกิจ: {assignment.title} ({subject.name})</span>
          ) : (
            `วิชา ${subject.name} (${subject.code})`
          )}
        </p>

        {/* Score metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-[11px] text-slate-400">ตอบถูกต้อง</div>
            <div className="text-xl font-bold text-emerald-400">
              {summaryScores.correct}/{summaryScores.total} ข้อ
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-[11px] text-slate-400">ความแม่นยำ</div>
            <div className="text-xl font-bold text-indigo-400">{accuracyPercent}%</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-[11px] text-slate-400">XP ที่ได้รับ</div>
            <div className="text-xl font-bold text-amber-400">
              +{assignment ? assignment.rewardXp : summaryScores.totalXp} XP
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-[11px] text-slate-400">เหรียญรางวัล</div>
            <div className="text-xl font-bold text-yellow-400">
              +{assignment ? assignment.rewardCoins : summaryScores.totalCoins} 🪙
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!assignment && (
            <button
              onClick={handleRestartQuiz}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ลองทำอีกครั้ง
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {assignment ? 'กลับสู่หน้าแดชบอร์ด' : 'กลับสู่คลังวิชา'}
          </button>
        </div>
      </motion.div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto my-4 px-3 sm:px-0">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>ออกจากควิซ</span>
        </button>

        <div className="text-xs font-semibold text-slate-200">
          {assignment ? (
            <span className="text-purple-400 font-bold">🎯 ภารกิจ: {assignment.title}</span>
          ) : (
            <>วิชา: <span className="text-indigo-400">{subject.name}</span></>
          )}
        </div>

        {/* 50:50 Lifeline Button */}
        <button
          onClick={handleUseFiftyFifty}
          disabled={fiftyFiftyUsed || hasAnswered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            fiftyFiftyUsed || hasAnswered
              ? 'opacity-40 bg-slate-800 text-slate-500 border-slate-800 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 text-amber-300 border-amber-500/40 shadow-sm'
          }`}
          title="ตัด 2 ตัวเลือกที่ผิด"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>พลัง 50:50</span>
        </button>
      </div>

      {/* Progress Bar & Timer */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md mb-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">
            คำถามข้อที่ {currentIndex + 1} จาก {questions.length}
          </span>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
              timeLeft <= 5
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-white mb-4 relative"
      >
        {/* Difficulty Badge & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
              currentQuestion.difficulty === 'hard'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : currentQuestion.difficulty === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            ระดับ: {currentQuestion.difficulty === 'hard' ? 'ยาก' : currentQuestion.difficulty === 'medium' ? 'ปานกลาง' : 'ง่าย'}
          </span>
          {currentQuestion.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Question Text */}
        <h3 className="text-base sm:text-lg font-bold leading-relaxed mb-4 text-slate-100">
          {currentQuestion.questionText}
        </h3>

        {/* --- RICH MEDIA RENDERING --- */}
        {/* 1. Image Media */}
        {currentQuestion.mediaType === 'image' && currentQuestion.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 relative group">
            <img
              src={currentQuestion.imageUrl}
              alt="Question Visual"
              className="w-full max-h-64 object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setZoomImage(currentQuestion.imageUrl || null)}
            />
            <button
              onClick={() => setZoomImage(currentQuestion.imageUrl || null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ขยายภาพ</span>
            </button>
          </div>
        )}

        {/* 2. Video Media (YouTube Embedded) */}
        {currentQuestion.mediaType === 'video' && currentQuestion.videoUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video">
            <iframe
              src={currentQuestion.videoUrl}
              title="Question Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* 3. Reference Link */}
        {currentQuestion.referenceLink && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">{currentQuestion.referenceLink.title || 'อ่านบทความเพื่อหาคำตอบ'}</span>
            </div>
            <a
              href={currentQuestion.referenceLink.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 text-[11px]"
            >
              <span>เปิดอ่าน</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            if (hiddenOptions.includes(idx)) {
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-800/40 bg-slate-950/40 text-slate-600 text-xs italic flex items-center justify-between"
                >
                  <span>(ตัวเลือกนี้ถูกตัดออกด้วย 50:50)</span>
                  <span className="text-[10px]">🚫</span>
                </div>
              );
            }

            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQuestion.correctIndex;

            let optionStyle = 'border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 text-slate-200';

            if (hasAnswered) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500/40 font-semibold';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-rose-500 bg-rose-950/60 text-rose-200 ring-2 ring-rose-500/40';
              } else {
                optionStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-500 opacity-60';
              }
            }

            return (
              <motion.button
                key={idx}
                disabled={hasAnswered}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                      hasAnswered && isCorrectOption
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : hasAnswered && isSelected && !isCorrectOption
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-700 text-slate-300 border-slate-600 group-hover:border-indigo-400 group-hover:text-white'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{option}</span>
                </div>

                {hasAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {hasAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation & Next Button Drawer */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-slate-800 space-y-4"
            >
              {/* Answer Result Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  lastResult?.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <span className="text-2xl">
                  {lastResult?.isCorrect ? '🎉' : '💡'}
                </span>
                <div>
                  <div className="text-xs font-bold mb-1">
                    {lastResult?.isCorrect
                      ? `ถูกต้องแล้วครับ! (+${lastResult.earnedXp} XP, +${lastResult.earnedCoins} 🪙)`
                      : 'ยังไม่ถูกต้องนะ! มาดูคำอธิบายกัน:'}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-normal">
                    {currentQuestion.explanation}
                  </div>
                </div>
              </div>

              {/* Next Question Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all group cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'คำถามถัดไป' : 'ดูผลคะแนนรวม'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Zoom Image Lightbox */}
      <AnimatePresence>
        {zoomImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setZoomImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] relative">
              <img src={zoomImage} alt="Zoomed Diagram" className="rounded-2xl max-h-[85vh] object-contain shadow-2xl" />
              <p className="text-center text-xs text-slate-400 mt-2">คลิกที่ใดก็ได้เพื่อปิด</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
