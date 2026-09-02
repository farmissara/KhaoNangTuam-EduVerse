import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { LearningNode } from '../../types';
import { QuizPlayer } from './QuizPlayer';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  Star,
  ChevronRight,
  Trophy,
  Award,
  BookOpen
} from 'lucide-react';

interface LearningPathViewProps {
  onBack: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({ onBack }) => {
  const { learningNodes, completeLearningNode, questions, subjects, playSound, theme } = useApp();
  const [activeNode, setActiveNode] = useState<LearningNode | null>(null);

  const isLightTheme = [
    'daylight-white',
    'pastel-sky',
    'sunny-amber',
    'mint-fresh',
    'bubblegum-pink',
    'lavender-dream'
  ].includes(theme.background);

  const completedCount = learningNodes.filter(n => n.isCompleted).length;
  const progressPercent = Math.round((completedCount / learningNodes.length) * 100);

  if (activeNode) {
    const nodeQuestions = questions.filter(q => activeNode.questionIds.includes(q.id));
    const targetSubject = subjects.find(s => s.id === activeNode.subjectId) || subjects[0];

    return (
      <QuizPlayer
        subject={targetSubject}
        questions={nodeQuestions.length > 0 ? nodeQuestions : questions.slice(0, 3)}
        onBack={() => {
          completeLearningNode(activeNode.id, 95);
          setActiveNode(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isLightTheme
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-emerald-200 text-slate-800'
          : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/30 text-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-pulse-glow">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                แผนที่การเรียนรู้ตามลำดับด่าน (Learning Path / Skill Tree)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Quest Map
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              พิชิตด่านทีละสเต็ปเพื่อปลดล็อกเนื้อหาถัดไป สร้างพื้นฐานความเข้าใจอย่างเป็นระบบ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">ความคืบหน้าเส้นทาง</div>
            <div className="text-sm font-black text-emerald-400">{completedCount}/{learningNodes.length} ด่าน ({progressPercent}%)</div>
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
      </div>

      {/* Interactive Map Visual Roadmap (Duolingo style) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background Road / Line */}
        <div className="relative max-w-2xl mx-auto space-y-8">
          {learningNodes.map((node, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={node.id} className="relative flex flex-col items-center">
                {/* Connecting Path Line */}
                {index < learningNodes.length - 1 && (
                  <div
                    className={`absolute top-16 w-1 h-12 -z-0 transition-colors ${
                      node.isCompleted ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-800'
                    }`}
                  />
                )}

                {/* Node Box */}
                <motion.div
                  whileHover={{ scale: node.isUnlocked ? 1.03 : 1 }}
                  className={`w-full max-w-md p-5 rounded-3xl border transition-all relative z-10 ${
                    node.isCompleted
                      ? 'bg-gradient-to-r from-emerald-950/90 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : node.isUnlocked
                      ? 'bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-indigo-500 shadow-xl shadow-indigo-500/30 animate-pulse-glow'
                      : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border ${
                          node.isCompleted
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : node.isUnlocked
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {node.isUnlocked ? node.icon : <Lock className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            สเต็ปที่ {node.stepNumber}
                          </span>
                          {node.isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ผ่านแล้ว ({node.scorePercent}%)
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-white mt-0.5">{node.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{node.description}</p>
                      </div>
                    </div>

                    <div>
                      {node.isUnlocked ? (
                        <button
                          onClick={() => {
                            playSound('start');
                            setActiveNode(node);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            node.isCompleted
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/25'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{node.isCompleted ? 'ทบทวน' : 'ลุยด่าน'}</span>
                        </button>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-600 border border-slate-750">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
