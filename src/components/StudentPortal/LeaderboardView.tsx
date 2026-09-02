import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Award, Crown, Flame, Trophy, Medal, Star, Sparkles } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { students, badges, currentStudent, playSound } = useApp();
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [viewTab, setViewTab] = useState<'ranking' | 'badges'>('ranking');

  // Filter students
  const filteredStudents = selectedClass === 'ALL'
    ? [...students]
    : students.filter(s => s.classroom === selectedClass);

  // Sort by XP descending
  const sortedStudents = filteredStudents.sort((a, b) => b.xp - a.xp);

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const restStudents = sortedStudents.slice(3);

  return (
    <div className="max-w-4xl mx-auto my-4 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              หอเกียรติยศ EduQuest Hall of Fame
            </div>
            <h2 className="text-xl sm:text-2xl font-black">ตารางอันดับคะแนนและเหรียญตรา</h2>
            <p className="text-xs text-slate-400">
              วัดผลคะแนนรวม XP จากการทำแบบทดสอบและการดวล Battle Mode ทั่วทั้งโรงเรียน
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex p-1 rounded-2xl bg-slate-800 border border-slate-700">
            <button
              onClick={() => {
                playSound('click');
                setViewTab('ranking');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'ranking' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300'
              }`}
            >
              🏆 อันดับคะแนน
            </button>
            <button
              onClick={() => {
                playSound('click');
                setViewTab('badges');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'badges' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300'
              }`}
            >
              🎖️ เหรียญตราทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {viewTab === 'ranking' && (
        <>
          {/* Class Filter Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">กรองตามห้องเรียน:</span>
            <div className="flex gap-1.5">
              {['ALL', 'ม.3/1', 'ม.3/2', 'ม.3/3'].map(c => (
                <button
                  key={c}
                  onClick={() => {
                    playSound('click');
                    setSelectedClass(c);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedClass === c
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'ALL' ? 'ทุกห้อง' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          {top1 && (
            <div className="grid grid-cols-3 gap-3 items-end pt-8 pb-4">
              {/* 2nd Place */}
              {top2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-xl text-center text-white flex flex-col items-center relative"
                >
                  <div className="absolute -top-5 w-9 h-9 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-sm shadow-md border-2 border-slate-400">
                    2
                  </div>
                  <div className="text-3xl mb-1 mt-2">{top2.avatar}</div>
                  <div className="text-xs font-bold truncate max-w-full">
                    {top2.firstName}
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2">{top2.classroom}</div>
                  <div className="text-xs font-mono font-bold text-slate-200">{top2.xp} XP</div>
                  <div className="text-[10px] text-slate-400">Lv.{top2.level}</div>
                </motion.div>
              )}

              {/* 1st Place (Center, Tallest) */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/90 to-slate-900 border-2 border-amber-500/60 shadow-2xl text-center text-white flex flex-col items-center relative scale-105 z-10"
              >
                <div className="absolute -top-7 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-xl border-2 border-white animate-bounce">
                  👑
                </div>
                <div className="text-4xl mb-1 mt-3">{top1.avatar}</div>
                <div className="text-sm font-black text-amber-300 truncate max-w-full">
                  {top1.prefix}{top1.firstName}
                </div>
                <div className="text-[10px] text-amber-200/80 mb-2">{top1.classroom} • แชมป์ประจำสัปดาห์</div>
                <div className="text-sm font-mono font-black text-amber-400">{top1.xp} XP</div>
                <div className="text-[10px] text-slate-300">Lv.{top1.level} ({top1.coins} 🪙)</div>
              </motion.div>

              {/* 3rd Place */}
              {top3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-amber-900/60 shadow-xl text-center text-white flex flex-col items-center relative"
                >
                  <div className="absolute -top-5 w-9 h-9 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-sm shadow-md border-2 border-amber-600">
                    3
                  </div>
                  <div className="text-3xl mb-1 mt-2">{top3.avatar}</div>
                  <div className="text-xs font-bold truncate max-w-full">
                    {top3.firstName}
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2">{top3.classroom}</div>
                  <div className="text-xs font-mono font-bold text-slate-200">{top3.xp} XP</div>
                  <div className="text-[10px] text-slate-400">Lv.{top3.level}</div>
                </motion.div>
              )}
            </div>
          )}

          {/* List of 4th+ students */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
            {restStudents.map((s, index) => {
              const isCurrentUser = s.id === currentStudent.id;
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                    isCurrentUser
                      ? 'bg-indigo-950/80 border border-indigo-500/50 shadow-md'
                      : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                      #{index + 4}
                    </span>
                    <span className="text-2xl">{s.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{s.prefix}{s.firstName} {s.lastName}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-normal">
                            คุณ
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.classroom} • ฉายา: {s.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-bold text-amber-400 font-mono">{s.xp} XP</div>
                      <div className="text-[10px] text-slate-400">ชนะ Battle {s.battleWins} ครั้ง</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
                      Lv.{s.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Badges Tab View */}
      {viewTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map(b => {
            const isUnlocked = currentStudent.badgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                className={`p-4 rounded-3xl border text-center transition-all flex flex-col items-center justify-between ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{b.icon}</div>
                <h4 className="text-xs font-bold text-white mb-1">{b.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{b.description}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? 'ปลดล็อกแล้ว ✅' : 'ยังไม่ปลดล็อก 🔒'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
