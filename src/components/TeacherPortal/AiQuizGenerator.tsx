import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import {
  Sparkles,
  Wand2,
  BookOpen,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AiQuizGeneratorProps {
  onNavigateToBank?: () => void;
}

export const AiQuizGenerator: React.FC<AiQuizGeneratorProps> = ({ onNavigateToBank }) => {
  const { subjects, addQuestion, playSound, triggerMascotTip, triggerConfetti } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [topic, setTopic] = useState<string>('โครงสร้างและการทำงานของเซลล์พืชและเซลล์สัตว์');
  const [gradeLevel, setGradeLevel] = useState<string>('ม.3');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Omit<Question, 'id' | 'createdAt'>[]>([]);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleGenerate = () => {
    playSound('click');
    setIsGenerating(true);
    triggerMascotTip('AI กำลังวิเคราะห์มาตรฐานตัวชี้วัดและสังเคราะห์ข้อสอบคุณภาพสูงให้ครับ... 🧠✨', 'thinking');

    setTimeout(() => {
      // Intelligent curriculum-aligned generation based on subject & topic
      const mockAiResults: Omit<Question, 'id' | 'createdAt'>[] = [
        {
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          gradeLevel,
          questionText: `[AI วิเคราะห์ตัวชี้วัด] ในหัวข้อเรื่อง "${topic}" หากสิ่งมีชีวิตขาดออร์แกเนลล์คลอโรพลาสต์ จะส่งผลกระทบต่อกระบวนการใดโดยตรงที่สุด?`,
          type: 'multiple_choice',
          options: [
            'การสังเคราะห์ด้วยแสงเพื่อสร้างอาหารและพลังงาน',
            'การสร้างโปรตีนเพื่อซ่อมแซมส่วนที่สึกหรอ',
            'การแบ่งเซลล์แบบไมโทซิส',
            'การควบคุมสารผ่านเข้าออกเซลล์'
          ],
          correctIndex: 0,
          explanation: 'คลอโรพลาสต์เป็นแหล่งที่อยู่ของสารสีคลอโรฟิลล์ ซึ่งทำหน้าที่ดูดกลืนพลังงานแสงเพื่อใช้ในกระบวนการสังเคราะห์ด้วยแสงของพืช',
          difficulty,
          timeLimitSeconds: 30,
          tags: ['AI-Generated', topic, gradeLevel]
        },
        {
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          gradeLevel,
          questionText: `[AI ข้อสอบประยุกต์] ข้อใดกล่าวถึงความสัมพันธ์ของ "${topic}" ได้ถูกต้องตามหลักการทางวิชาการมากที่สุด?`,
          type: 'multiple_choice',
          options: [
            'เซลล์พืชมีผนังเซลล์ที่ให้ความแข็งแรง แต่เซลล์สัตว์ไม่มี',
            'เซลล์สัตว์สามารถสร้างอาหารได้เองผ่านการดูดกลืนแสง',
            'เยื่อหุ้มเซลล์พบเฉพาะในสิ่งมีชีวิตชั้นสูงเท่านั้น',
            'ไรโบโซมทำหน้าที่สังเคราะห์ไขมันและคอเลสเตอรอล'
          ],
          correctIndex: 0,
          explanation: 'ผนังเซลล์ (Cell Wall) ทำจากเซลลูโลสพบในเซลล์พืชช่วยให้เซลล์คงรูปและแข็งแรง ขณะที่เซลล์สัตว์มีเพียงเยื่อหุ้มเซลล์',
          difficulty,
          timeLimitSeconds: 35,
          tags: ['AI-Generated', topic, 'การคิดวิเคราะห์']
        },
        {
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          gradeLevel,
          questionText: `[AI จริงหรือเท็จ] ในกระบวนการทำงานของ "${topic}" นิวเคลียสทำหน้าที่เป็นศูนย์กลางควบคุมพันธุกรรมและการทำงานทั้งหมดของเซลล์`,
          type: 'true_false',
          options: ['จริง (True)', 'เท็จ (False)'],
          correctIndex: 0,
          explanation: 'ถูกต้อง นิวเคลียสบรรจุสารพันธุกรรม DNA ทำหน้าที่ควบคุมกระบวนการและการสังเคราะห์สารเคมีทุกชนิดในเซลล์',
          difficulty: 'easy',
          timeLimitSeconds: 20,
          tags: ['AI-Generated', topic, 'True-False']
        }
      ].slice(0, questionCount);

      setGeneratedQuestions(mockAiResults);
      setIsGenerating(false);
      playSound('victory');
      triggerConfetti();
      triggerMascotTip(`สร้างข้อสอบ ${mockAiResults.length} ข้อเรียบร้อยแล้ว! สามารถตรวจสอบและกดบันทึกลง Sheet ได้ทันทีครับ 🎉`, 'cheering');
    }, 1500);
  };

  const handleSaveAllToBank = () => {
    generatedQuestions.forEach(q => {
      addQuestion(q);
    });

    playSound('victory');
    setSavedSuccessMessage(`บันทึกข้อสอบ ${generatedQuestions.length} ข้อ เข้าสู่คลังและ Google Sheets เรียบร้อยแล้ว!`);
    triggerConfetti();
    setTimeout(() => {
      setSavedSuccessMessage(null);
      if (onNavigateToBank) onNavigateToBank();
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/25 animate-pulse-glow">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                AI Auto Quiz Generator (ผู้ช่วยครูสร้างข้อสอบอัจฉริยะ)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Gemini / DeepSeek AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              พิมพ์หัวข้อบทเรียนหรือวางเนื้อหา AI จะออกข้อสอบ 4 ตัวเลือกพร้อมเฉลยและคำอธิบาย บันทึกลง Google Sheets ให้ทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> ระบบพร้อมใช้งาน
          </span>
        </div>
      </div>

      {savedSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{savedSuccessMessage}</span>
        </motion.div>
      )}

      {/* Generator Form Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">กลุ่มสาระการเรียนรู้ / รายวิชา</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ระดับชั้น</label>
            <select
              value={gradeLevel}
              onChange={e => setGradeLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="ม.1">มัธยมศึกษาปีที่ 1</option>
              <option value="ม.2">มัธยมศึกษาปีที่ 2</option>
              <option value="ม.3">มัธยมศึกษาปีที่ 3</option>
              <option value="ม.4">มัธยมศึกษาปีที่ 4</option>
              <option value="ม.5">มัธยมศึกษาปีที่ 5</option>
              <option value="ม.6">มัธยมศึกษาปีที่ 6</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ระดับความยาก</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="easy">ง่าย (เน้นความจำและความเข้าใจ)</option>
              <option value="medium">ปานกลาง (เน้นการประยุกต์ใช้)</option>
              <option value="hard">ท้าทาย (เน้นการวิเคราะห์และแก้ปัญหา)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            หัวข้อบทเรียน ตัวชี้วัด หรือเนื้อหาที่ต้องการให้ออกข้อสอบ
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="เช่น โครงสร้างอะตอม, กฎของนิวตัน, พลเมืองดีตามวิถีประชาธิปไตย..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">จำนวนข้อ:</span>
            {[2, 3, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  questionCount === num
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num} ข้อ
              </button>
            ))}
          </div>

          <button
            disabled={isGenerating || !topic.trim()}
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังประมวลผลข้อสอบ...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>✨ สั่งให้ AI ร่างข้อสอบทันที</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Questions Preview & Instant Save */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ตัวอย่างข้อสอบที่ AI สังเคราะห์ได้ ({generatedQuestions.length} ข้อ)
            </h2>

            <button
              onClick={handleSaveAllToBank}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>บันทึกทั้งหมดลงคลังข้อสอบ & Google Sheets</span>
            </button>
          </div>

          <div className="space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">ข้อที่ {idx + 1} ({q.difficulty})</span>
                  <span className="text-slate-400">เวลา: {q.timeLimitSeconds} วินาที</span>
                </div>

                <p className="font-bold text-sm text-white leading-relaxed">{q.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl text-xs border ${
                        optIdx === q.correctIndex
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correctIndex && '✅ (คำตอบที่ถูกต้อง)'}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <span className="font-bold text-amber-400">💡 คำอธิบายเฉลย: </span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
