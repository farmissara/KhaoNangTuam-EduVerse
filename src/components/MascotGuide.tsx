import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Sparkles, Volume2, X, ChevronRight, HelpCircle, Flame } from 'lucide-react';

const MASCOT_PROFILES = {
  'tutor-owl': {
    name: 'พี่นกฮูกติวเตอร์ (Hooty)',
    icon: '🦉',
    color: 'from-amber-400 to-orange-500',
    title: 'ผู้รู้รอบด้าน',
    voice: 'น้องๆ อยากทบทวนวิชาไหน ถามพี่ฮูกได้ตลอดเลยนะ!'
  },
  'cyber-cat': {
    name: 'น้องเหมียวไซเบอร์ (Neko)',
    icon: '🐱',
    color: 'from-purple-400 to-pink-500',
    title: 'สายสปีดตอบไว',
    voice: 'เมี๊ยวว! ลุยประลอง Battle Mode ชนะแล้วรับเหรียญรัวๆ เลย!'
  },
  'robot-bot': {
    name: 'น้องโรบ็อต AI (Astro)',
    icon: '🤖',
    color: 'from-cyan-400 to-blue-600',
    title: 'นักประมวลผลอัจฉริยะ',
    voice: 'ระบบตรวจพบว่าคะแนนหมวดวิทยาศาสตร์กำลังพุ่งสูงขึ้น 15% ครับ!'
  },
  'dino-hero': {
    name: 'น้องไดโนแชมป์เปี้ยน (Rexy)',
    icon: '🦖',
    color: 'from-emerald-400 to-teal-600',
    title: 'พลังแห่งความพยายาม',
    voice: 'ฮึดสู้เข้าไว้! ทำ Streak ให้ครบ 7 วันเพื่อรับตราในตำนาน!'
  }
};

const RANDOM_TIPS = [
  '💡 เคล็ดลับ: การทำข้อสอบติดกัน 3 วัน จะช่วยให้สมองจดจำเนื้อหาได้ดีขึ้น 40% เลยนะ!',
  '⚡ ใน Battle Mode ถ้าตอบถูกติดกัน 3 ข้อ จะได้ดาเมจคอมโบ X2 พลังทำลายล้าง!',
  '🎯 ถ้าเจอข้อสอบยาก ลองใช้พลัง 50:50 ตัด 2 ตัวเลือกที่ผิดออกไปก่อนได้นะ',
  '🌟 คุณครูสามารถกดปุ่ม "ส่งออกโค้ด GAS" ด้านบนเพื่อนำไฟล์ไปเปิดใช้บน Google Sheet ได้ทันที!',
  '🔥 พยายามรักษา Streak อย่าให้ไฟดับ จะได้รับเหรียญทองพิเศษทุกวัน!'
];

export const MascotGuide: React.FC = () => {
  const { theme, mascotSpeech, setMascotSpeech, playSound, role } = useApp();
  const [isOpen, setIsOpen] = useState(true);
  const [dialogExpanded, setDialogExpanded] = useState(false);

  if (!theme.mascotEnabled) return null;

  const currentProfile = MASCOT_PROFILES[theme.mascotCharacter] || MASCOT_PROFILES['tutor-owl'];

  const getMoodEmoji = () => {
    switch (mascotSpeech.mood) {
      case 'cheering':
        return '🎉';
      case 'thinking':
        return '🤔';
      case 'surprised':
        return '😲';
      case 'proud':
        return '👑';
      default:
        return '✨';
    }
  };

  const handleMascotClick = () => {
    playSound('click');
    const randomTip = RANDOM_TIPS[Math.floor(Math.random() * RANDOM_TIPS.length)];
    setMascotSpeech({
      message: randomTip,
      mood: 'thinking'
    });
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto mb-3 max-w-xs md:max-w-sm rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-indigo-100 dark:border-slate-700/60 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 relative"
          >
            {/* Mascot header bar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentProfile.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-normal">
                  {currentProfile.title}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-md"
                title="ซ่อนคำแนะนำ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bubble content */}
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0 animate-bounce">{getMoodEmoji()}</span>
              <div className="text-xs md:text-sm leading-relaxed font-medium">
                {mascotSpeech.message}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={handleMascotClick}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                ขอเคล็ดลับอื่น
              </button>
              <span className="text-[10px] text-slate-400">
                {role === 'teacher' ? 'โหมดครูผู้สอน 🎓' : 'โหมดนักเรียน 🎒'}
              </span>
            </div>

            {/* Speech bubble pointer triangle */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/95 dark:bg-slate-900/95 border-r border-b border-indigo-100 dark:border-slate-700/60 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Avatar Button */}
      <motion.div
        className="pointer-events-auto relative group cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMascotClick}
      >
        {/* Glow Ring */}
        <div
          className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${currentProfile.color} opacity-60 blur-md group-hover:opacity-100 transition duration-300 animate-pulse`}
        />

        {/* Mascot Face Circle */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-2 border-white dark:border-slate-700 flex items-center justify-center text-3xl md:text-4xl shadow-indigo-500/20">
          <span className="animate-float transform select-none">{currentProfile.icon}</span>

          {/* Online badge / Streak flame */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
            <Flame className="w-3 h-3 fill-white text-white" />
          </div>
        </div>

        {/* Hover Hint */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
          แตะเพื่อคุยกับพี่ติวเตอร์ 💬
        </div>
      </motion.div>
    </div>
  );
};
