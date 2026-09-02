import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  X,
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Volume2,
  VolumeX,
  Smile,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  Shapes
} from 'lucide-react';
import { ThemeBackground, CardStyle, AppFont, SpacingDensity } from '../types';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    updateBackground,
    updateCardStyle,
    updateFont,
    updateSpacing,
    playSound,
    triggerMascotTip
  } = useApp();

  if (!isOpen) return null;

  const LIGHT_THEME_OPTIONS: { id: ThemeBackground; name: string; desc: string; preview: string; textColor: string }[] = [
    {
      id: 'daylight-white',
      name: 'สว่างขาว คลีนมินิมอล',
      desc: 'พื้นหลังขาวคลีน สบายตา โมเดิร์นระดับพรีเมียม',
      preview: 'bg-gradient-to-br from-slate-100 via-white to-slate-200 border border-slate-300',
      textColor: 'text-slate-800'
    },
    {
      id: 'pastel-sky',
      name: 'ฟ้าคราม พาสเทลสดใส',
      desc: 'โทนสีฟ้าอ่อนผ่อนคลาย สดใส อ่านง่าย',
      preview: 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 border border-sky-300',
      textColor: 'text-sky-900'
    },
    {
      id: 'sunny-amber',
      name: 'ส้มทอง แดดอบอุ่น',
      desc: 'โทนสีส้มอมเหลืองมีพลัง สนุกสนานสดใส',
      preview: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border border-amber-300',
      textColor: 'text-amber-900'
    },
    {
      id: 'mint-fresh',
      name: 'มินต์เขียว สดชื่นผ่อนคลาย',
      desc: 'โทนเขียวมินต์พาสเทลสบายตา ถนอมสายตา',
      preview: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 border border-emerald-300',
      textColor: 'text-emerald-900'
    },
    {
      id: 'bubblegum-pink',
      name: 'แคนดี้ ชมพูหวานสดใส',
      desc: 'โทนชมพูพาสเทลแสนหวาน สดใสร่าเริง',
      preview: 'bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 border border-pink-300',
      textColor: 'text-pink-900'
    },
    {
      id: 'lavender-dream',
      name: 'ลาเวนเดอร์ ดรีม',
      desc: 'โทนม่วงอ่อนพาสเทล ละมุนสายตา',
      preview: 'bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 border border-violet-300',
      textColor: 'text-violet-900'
    }
  ];

  const DARK_THEME_OPTIONS: { id: ThemeBackground; name: string; desc: string; preview: string; textColor: string }[] = [
    {
      id: 'aurora-blue',
      name: 'โอโรรา บลู (Aurora Blue)',
      desc: 'น้ำเงินแกมครามลุ่มลึก สไตล์นีออน',
      preview: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900',
      textColor: 'text-white'
    },
    {
      id: 'sakura-blossom',
      name: 'ซากุระ พิงค์ (Sakura Dark)',
      desc: 'ชมพูเข้มราตรี หรูหรามีมิติ',
      preview: 'bg-gradient-to-br from-pink-950 via-purple-950 to-slate-900',
      textColor: 'text-white'
    },
    {
      id: 'emerald-forest',
      name: 'มรกต ป่าเขียว (Emerald Forest)',
      desc: 'เขียวเข้มป่ามรกต สบายตาและลุ่มลึก',
      preview: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900',
      textColor: 'text-white'
    },
    {
      id: 'sunset-amber',
      name: 'ตะวันลับฟ้า (Sunset Amber)',
      desc: 'ส้มเปลวเพลิงราตรี สวยดุดัน',
      preview: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-900',
      textColor: 'text-white'
    },
    {
      id: 'cosmic-purple',
      name: 'จักรวาลสีม่วง (Cosmic Purple)',
      desc: 'ม่วงกาแล็กซี ลึกลับน่าค้นหา',
      preview: 'bg-gradient-to-br from-purple-950 via-fuchsia-950 to-slate-950',
      textColor: 'text-white'
    },
    {
      id: 'cyber-dark',
      name: 'ไซเบอร์มืด (Cyber Dark)',
      desc: 'สีดำสนิทคอนทราสต์จัดจ้าน สไตล์เกมเมอร์',
      preview: 'bg-slate-950 border border-cyan-500/30',
      textColor: 'text-white'
    },
    {
      id: 'clean-minimal',
      name: 'สเลท ดาร์ก (Slate Dark)',
      desc: 'เทาเข้มมินิมอล เรียบหรูทางการ',
      preview: 'bg-slate-900',
      textColor: 'text-white'
    }
  ];

  const CARD_STYLES: { id: CardStyle; name: string; desc: string; sampleClass: string }[] = [
    {
      id: 'glass',
      name: 'กลาสมอร์ฟิซึม (Glassmorphism)',
      desc: 'กระจกฝ้าโปร่งแสง หรูหราทันสมัย',
      sampleClass: 'bg-white/10 backdrop-blur-md border border-white/20'
    },
    {
      id: 'modern-gradient',
      name: 'โมเดิร์น เกรเดียนต์ (Modern Gradient)',
      desc: 'ไล่ระดับเฉดสีมีมิติและเงาลึก',
      sampleClass: 'bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30'
    },
    {
      id: 'soft-shadow',
      name: 'นุ่มนวล มินิมอล (Soft Minimal)',
      desc: 'ขอบเรียบ เงาฟุ้ง เบาสบายตา',
      sampleClass: 'bg-slate-800/90 shadow-xl border border-slate-700'
    },
    {
      id: 'playful-pop',
      name: 'เกมมิ่ง ป๊อปปูลาร์ (Gaming Pop)',
      desc: 'ขอบชัด สีสด สไตล์เกมแสนสนุก',
      sampleClass: 'bg-slate-900 border-2 border-indigo-500 shadow-[0_4px_0_0_#4f46e5]'
    }
  ];

  const FONT_OPTIONS: { id: AppFont; name: string; sample: string; cssClass: string }[] = [
    {
      id: 'prompt',
      name: 'Prompt (พร้อมพท์)',
      sample: 'ระบบการเรียนรู้และประลองควิซ EduQuest Thailand',
      cssClass: 'font-prompt'
    },
    {
      id: 'kanit',
      name: 'Kanit (คณิต)',
      sample: 'ระบบการเรียนรู้และประลองควิซ EduQuest Thailand',
      cssClass: 'font-kanit'
    },
    {
      id: 'sarabun',
      name: 'Sarabun (สารบรรณ)',
      sample: 'ระบบการเรียนรู้และประลองควิซ EduQuest Thailand',
      cssClass: 'font-sarabun'
    },
    {
      id: 'mitr',
      name: 'Mitr (มิตร)',
      sample: 'ระบบการเรียนรู้และประลองควิซ EduQuest Thailand',
      cssClass: 'font-mitr'
    }
  ];

  const SPACING_OPTIONS: { id: SpacingDensity; name: string; desc: string }[] = [
    { id: 'compact', name: 'กระชับ (Compact)', desc: 'แสดงข้อมูลได้มากขึ้นในหน้าจอเดียว' },
    { id: 'normal', name: 'ปกติ (Standard)', desc: 'ความห่างพอดี อ่านง่ายสบายตา' },
    { id: 'spacious', name: 'กว้างขวาง (Spacious)', desc: 'มีช่องว่างหายใจ เน้นความโปร่ง' }
  ];

  const MASCOT_CHARACTERS = [
    { id: 'tutor-owl', name: 'พี่นกฮูกติวเตอร์', icon: '🦉' },
    { id: 'cyber-cat', name: 'น้องเหมียวไซเบอร์', icon: '🐱' },
    { id: 'robot-bot', name: 'น้องโรบ็อต AI', icon: '🤖' },
    { id: 'dino-hero', name: 'น้องไดโนแชมป์เปี้ยน', icon: '🦖' }
  ];

  const resetToDefault = () => {
    playSound('click');
    setTheme({
      background: 'aurora-blue',
      cardStyle: 'glass',
      font: 'prompt',
      spacing: 'normal',
      buttonRadius: 'lg',
      animationsEnabled: true,
      soundEnabled: true,
      mascotEnabled: true,
      mascotCharacter: 'tutor-owl',
      mascotCostume: 'student'
    });
    triggerMascotTip('รีเซ็ตธีมและรูปแบบเป็นค่าเริ่มต้นเรียบร้อยครับ!', 'happy');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ตั้งค่าธีมและปรับแต่ง UI
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                  Customizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ปรับเปลี่ยนสีพื้นหลัง สไตล์การ์ด ฟอนต์ ขนาด และตัวการ์ตูนนำทางแบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              title="รีเซ็ตเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ต
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Background Color & Theme */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">✅ เลือกธีมสีพื้นหลัง (Bright & Dark Color Themes)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                13 ธีมสีให้เลือก
              </span>
            </div>

            {/* Sub-Category: ☀️ Bright & Light Themes */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <span>☀️ ธีมสีสว่างสดใส (Bright & Light Themes)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                  แนะนำสำหรับอ่านสบายตา
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LIGHT_THEME_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      playSound('click');
                      updateBackground(bg.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 relative overflow-hidden group ${
                      theme.background === bg.id
                        ? 'border-amber-400 ring-2 ring-amber-500/50 shadow-lg scale-[1.02]'
                        : 'border-slate-600/60 hover:border-amber-400/50 bg-slate-800/40'
                    }`}
                  >
                    <div className={`absolute inset-0 ${bg.preview} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${bg.textColor} drop-shadow-sm`}>{bg.name}</span>
                      {theme.background === bg.id && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] shadow font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className={`relative z-10 text-[10px] ${bg.textColor} opacity-80 line-clamp-1`}>
                      {bg.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Category: 🌙 Dark & Gaming Themes */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <span>🌙 ธีมมืดและเกมมิ่ง (Dark & Gaming Themes)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                  สไตล์เกมเมอร์ & คอนทราสต์สูง
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {DARK_THEME_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      playSound('click');
                      updateBackground(bg.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 relative overflow-hidden group ${
                      theme.background === bg.id
                        ? 'border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg scale-[1.02]'
                        : 'border-slate-700/80 hover:border-indigo-400/50 bg-slate-800/40'
                    }`}
                  >
                    <div className={`absolute inset-0 ${bg.preview} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white drop-shadow-md">{bg.name.split(' (')[0]}</span>
                      {theme.background === bg.id && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="relative z-10 text-[10px] text-slate-300 line-clamp-1">
                      {bg.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Card Style & Button Radius */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">✅ เปลี่ยน: สไตล์การ์ดและปุ่ม (Cards & Buttons)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CARD_STYLES.map(cs => (
                <button
                  key={cs.id}
                  onClick={() => {
                    playSound('click');
                    updateCardStyle(cs.id);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    theme.cardStyle === cs.id
                      ? 'border-emerald-400 ring-2 ring-emerald-500/50 bg-slate-800'
                      : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{cs.name}</span>
                    {theme.cardStyle === cs.id && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{cs.desc}</p>
                  <div className={`p-2.5 rounded-xl text-center text-xs font-medium text-slate-200 ${cs.sampleClass}`}>
                    ตัวอย่างพรีวิวกล่องการ์ด UI
                  </div>
                </button>
              ))}
            </div>

            {/* Button Radius selection */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-xs text-slate-300 font-medium">ความโค้งมนของปุ่ม (Button Corner):</span>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg', 'full'] as const).map(radius => (
                  <button
                    key={radius}
                    onClick={() => {
                      playSound('click');
                      setTheme(prev => ({ ...prev, buttonRadius: radius }));
                    }}
                    className={`px-3 py-1 text-xs font-semibold capitalize transition-all ${
                      theme.buttonRadius === radius
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } ${
                      radius === 'sm' ? 'rounded-md' : radius === 'md' ? 'rounded-lg' : radius === 'lg' ? 'rounded-xl' : 'rounded-full'
                    }`}
                  >
                    {radius === 'sm' ? 'เหลี่ยม (sm)' : radius === 'md' ? 'โค้ง (md)' : radius === 'lg' ? 'มนมาก (lg)' : 'วงรี (Pill)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Typography & Fonts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">✅ เปลี่ยน: ฟอนต์ตัวอักษรไทย (Thai Web Fonts)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    playSound('click');
                    updateFont(f.id);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${f.cssClass} ${
                    theme.font === f.id
                      ? 'border-amber-400 ring-2 ring-amber-500/50 bg-slate-800'
                      : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{f.name}</span>
                    {theme.font === f.id && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{f.sample}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Spacing & Density */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">✅ เปลี่ยน: ขนาดและระยะห่าง (Layout Density & Scale)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPACING_OPTIONS.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => {
                    playSound('click');
                    updateSpacing(sp.id);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    theme.spacing === sp.id
                      ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-slate-800'
                      : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{sp.name}</span>
                    {theme.spacing === sp.id && (
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-900 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{sp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Mascot & Animated Companion */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">✅ เพิ่ม: ตัวการ์ตูนนำทาง (Animated Mascot)</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-300">เปิดใช้งานมาสคอต</span>
                <input
                  type="checkbox"
                  checked={theme.mascotEnabled}
                  onChange={e => {
                    playSound('click');
                    setTheme(prev => ({ ...prev, mascotEnabled: e.target.checked }));
                  }}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {theme.mascotEnabled && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                {MASCOT_CHARACTERS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      playSound('click');
                      setTheme(prev => ({ ...prev, mascotCharacter: m.id as any }));
                      triggerMascotTip(`เปลี่ยนเป็น ${m.name} เรียบร้อยแล้วครับ! พร้อมลุย! ✨`, 'cheering');
                    }}
                    className={`p-2.5 rounded-xl flex items-center gap-2 border transition-all ${
                      theme.mascotCharacter === m.id
                        ? 'bg-indigo-600/30 border-indigo-400 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="text-left">
                      <div className="text-xs font-semibold">{m.name}</div>
                      <div className="text-[10px] text-slate-400">เลือกใช้งาน</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Sound & Animation Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-white">✅ อนิเมชั่นและเอฟเฟกต์ (Animations)</div>
                  <div className="text-[11px] text-slate-400">การเคลื่อนไหว พลุฉลอง และการสั่นไหว</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={theme.animationsEnabled}
                onChange={e => {
                  playSound('click');
                  setTheme(prev => ({ ...prev, animationsEnabled: e.target.checked }));
                }}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2.5">
                {theme.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">เสียงประกอบ (Sound Effects)</div>
                  <div className="text-[11px] text-slate-400">เสียงตอบถูก/ผิด เสียงการต่อสู้ และเลเวลอัป</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={theme.soundEnabled}
                onChange={e => {
                  setTheme(prev => ({ ...prev, soundEnabled: e.target.checked }));
                }}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            บันทึกและปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </div>
  );
};
