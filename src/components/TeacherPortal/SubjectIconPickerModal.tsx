import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Check,
  Sparkles,
  HelpCircle,
  Smile,
  Shapes,
  Keyboard,
  Info
} from 'lucide-react';
import {
  LUCIDE_SUBJECT_ICONS,
  POPULAR_SUBJECT_EMOJIS,
  IconDefinition,
  isEmojiString
} from '../../data/subjectIcons';
import { SubjectIcon } from '../SubjectIcon';

interface SubjectIconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  subjectColor?: string;
  subjectName?: string;
}

const CATEGORIES = [
  'ทั้งหมด',
  'วิทยาศาสตร์',
  'คณิตศาสตร์',
  'ภาษาและการสื่อสาร',
  'สังคมศึกษา',
  'เทคโนโลยีและคอมพิวเตอร์',
  'ศิลปะและดนตรี',
  'สุขศึกษาและพลศึกษา',
  'การงานและอาชีพ'
];

export const SubjectIconPickerModal: React.FC<SubjectIconPickerModalProps> = ({
  isOpen,
  onClose,
  selectedIcon,
  onSelectIcon,
  subjectColor = 'indigo',
  subjectName = 'วิชาตัวอย่าง'
}) => {
  const [activeTab, setActiveTab] = useState<'lucide' | 'emoji' | 'custom'>('lucide');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [customInput, setCustomInput] = useState(selectedIcon || '');
  const [tempSelectedIcon, setTempSelectedIcon] = useState(selectedIcon || 'BookOpen');

  // Filter Lucide icons
  const filteredLucideIcons = useMemo(() => {
    return LUCIDE_SUBJECT_ICONS.filter(item => {
      const matchCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Filter Emojis
  const filteredEmojis = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return POPULAR_SUBJECT_EMOJIS.map(cat => {
      const emojis = cat.emojis.filter(item => {
        if (!q) return true;
        return (
          item.emoji.includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.keywords.some(k => k.toLowerCase().includes(q))
        );
      });
      return { ...cat, emojis };
    }).filter(cat => cat.emojis.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleApply = (icon: string) => {
    onSelectIcon(icon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 10 }}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">เลือกไอคอนและสัญลักษณ์ประจำวิชา</h2>
              <p className="text-xs text-slate-400">เลือกจากไอคอนมาตรฐาน อีโมจิ หรือพิมพ์กำหนดเองได้อย่างอิสระ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner flex items-center justify-center text-indigo-400">
              <SubjectIcon icon={tempSelectedIcon} className="w-7 h-7 text-indigo-400" emojiClassName="text-2xl" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">ไอคอนที่กำลังเลือก:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="font-mono text-indigo-300">{tempSelectedIcon}</span>
                {isEmojiString(tempSelectedIcon) ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    อีโมจิ
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Lucide Icon
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleApply(tempSelectedIcon)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ใช้ไอคอนนี้</span>
          </button>
        </div>

        {/* Tab Selection & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800/90 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('lucide');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'lucide'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shapes className="w-3.5 h-3.5" />
                <span>ไอคอนวิชา ({LUCIDE_SUBJECT_ICONS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('emoji');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'emoji'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>อีโมจิยอดนิยม</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('custom');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>พิมพ์อิสระ</span>
              </button>
            </div>

            {/* Search Bar */}
            {activeTab !== 'custom' && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหา เช่น คณิต, วิทย์, code, flask, กล้อง..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>
            )}
          </div>

          {/* Category Filter for Lucide tab */}
          {activeTab === 'lucide' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
          {/* TAB 1: Lucide Icons */}
          {activeTab === 'lucide' && (
            <div>
              {filteredLucideIcons.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  ไม่พบไอคอนที่ตรงกับคำค้นหา "{searchQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredLucideIcons.map(item => {
                    const IconComp = item.component;
                    const isSelected = tempSelectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setTempSelectedIcon(item.name)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-900 text-indigo-400 border-slate-700'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate text-white">{item.label}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">{item.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Emojis */}
          {activeTab === 'emoji' && (
            <div className="space-y-4">
              {filteredEmojis.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  ไม่พบอีโมจิที่ตรงกับคำค้นหา "{searchQuery}"
                </div>
              ) : (
                filteredEmojis.map(cat => (
                  <div key={cat.category} className="space-y-2">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <span>{cat.category}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {cat.emojis.map(item => {
                        const isSelected = tempSelectedIcon === item.emoji;
                        return (
                          <button
                            key={item.emoji}
                            type="button"
                            onClick={() => setTempSelectedIcon(item.emoji)}
                            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <span className="text-2xl select-none leading-none">{item.emoji}</span>
                            <span className="text-xs font-medium text-slate-200 truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Custom Input */}
          {activeTab === 'custom' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <b>เลือกหรือพิมพ์ไอคอนอิสระได้ 100%:</b>
                  <p className="text-indigo-300/90 leading-relaxed">
                    คุณสามารถพิมพ์อีโมจิใดๆ จากแป้นพิมพ์ (เช่น 🧪, 🎮, 🛸, 🎻, 🥋, 🧮, 🪐) หรือใส่ชื่อไอคอนของ Lucide เช่น <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-300 font-mono">Atom</code>, <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-300 font-mono">Calculator</code>, <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-300 font-mono">BookOpen</code> ได้ทันที
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  พิมพ์อีโมจิ หรือชื่อไอคอนที่ต้องการ:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น 🛸, 🎮, 🪐 หรือชื่อเช่น Dna, FlaskConical"
                    value={customInput}
                    onChange={e => {
                      setCustomInput(e.target.value);
                      if (e.target.value.trim()) {
                        setTempSelectedIcon(e.target.value.trim());
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customInput.trim()) {
                        setTempSelectedIcon(customInput.trim());
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                  >
                    ดูตัวอย่าง
                  </button>
                </div>
              </div>

              {/* Quick Preset Emoji Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  หรือคลิกเลือกอีโมจิด่วน:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🧪', '📐', '💻', '🎨', '🎵', '📚', '🌏', '⚽', '🧬', '🚀', '🤖', '🏛️', '🇹🇭', '🇬🇧', '📝', '💡', '🔬', '🩺', '🎭', '🛡️', '♟️', '🕹️', '🎻', '🏊‍♂️', '🥋', '🍳', '💼', '📊', '⚡', '🪐', '🎯', '🏆'].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setCustomInput(em);
                        setTempSelectedIcon(em);
                      }}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => handleApply(tempSelectedIcon)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ยืนยันการเลือก</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubjectIconPickerModal;
