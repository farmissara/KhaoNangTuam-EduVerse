import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ShopItem, ShopCategory } from '../../types';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  ShieldCheck,
  Check,
  Lock,
  Crown,
  Tag,
  Palette,
  Heart
} from 'lucide-react';

interface AvatarShopProps {
  onBack: () => void;
}

export const AvatarShop: React.FC<AvatarShopProps> = ({ onBack }) => {
  const { currentStudent, shopItems, buyShopItem, equipShopItem, playSound, theme } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const isLightTheme = [
    'daylight-white',
    'pastel-sky',
    'sunny-amber',
    'mint-fresh',
    'bubblegum-pink',
    'lavender-dream'
  ].includes(theme.background);

  const categories: { id: ShopCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: '🌟 ทั้งหมด', icon: '🌟' },
    { id: 'avatar', label: '🧙‍♂️ ตัวละครอวาตาร์', icon: '🧙‍♂️' },
    { id: 'pet', label: '🦉 สัตว์เลี้ยงคู่หู', icon: '🦉' },
    { id: 'title', label: '👑 ฉายาติดตัว', icon: '👑' },
    { id: 'frame', label: '🌟 กรอบโปรไฟล์', icon: '🌟' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? shopItems
    : shopItems.filter(item => item.category === selectedCategory);

  const handleBuy = (item: ShopItem) => {
    const res = buyShopItem(item);
    setActiveNotification(res.message);
    setTimeout(() => setActiveNotification(null), 3500);
  };

  const handleEquip = (item: ShopItem) => {
    equipShopItem(item);
    setActiveNotification(`สวมใส่ "${item.name}" แล้ว!`);
    setTimeout(() => setActiveNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isLightTheme
          ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-amber-200 text-slate-800'
          : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/30 text-white'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 animate-pulse-glow">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  ร้านค้าของรางวัล & อวาตาร์ (Avatar & Pet Shop)
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Item Store
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                สะสมเหรียญทองจากการเล่นเกมและทำควิซ มาแลกซื้อสกิน อวาตาร์ สัตว์เลี้ยง และกรอบโปรไฟล์สุดพรีเมียม
              </p>
            </div>
          </div>

          {/* Student Coins & Level Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-black text-sm shadow-md">
              <Coins className="w-5 h-5 fill-amber-400 text-amber-500 animate-spin-slow" />
              <span>{currentStudent.coins} เหรียญทอง</span>
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

        {/* Current Equipped Preview Banner */}
        <div className="mt-4 pt-4 border-t border-amber-500/20 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-semibold">ไอเทมที่ใส่อยู่ปัจจุบัน:</span>
          <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1.5">
            <span>{currentStudent.avatar}</span> อวาตาร์: {currentStudent.firstName}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" /> ฉายา: {currentStudent.title}
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold text-center shadow-lg"
        >
          {activeNotification}
        </motion.div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              playSound('click');
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => {
          const isPurchased = !!item.isPurchased;
          const isEquipped = !!item.isEquipped;
          const canAfford = currentStudent.coins >= item.price;
          const levelLocked = currentStudent.level < item.requiredLevel;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isEquipped
                  ? 'bg-gradient-to-br from-indigo-950/90 to-purple-950/80 border-indigo-500 shadow-xl shadow-indigo-500/20'
                  : isPurchased
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 shadow-lg'
              }`}
            >
              {/* Top Badges */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.category}
                </span>

                {isEquipped ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500 text-white shadow">
                    สวมใส่อยู่ ✨
                  </span>
                ) : isPurchased ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    เป็นเจ้าของแล้ว ✅
                  </span>
                ) : levelLocked ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> ต้องการ Lv.{item.requiredLevel}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Coins className="w-3 h-3 fill-amber-400" /> {item.price} เหรียญ
                  </span>
                )}
              </div>

              {/* Item Avatar/Icon Box */}
              <div className="flex flex-col items-center justify-center my-3 text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-3 transition-transform group-hover:scale-110 ${
                  item.previewColor || 'bg-slate-800 border border-slate-700'
                }`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-sm text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Action Button Footer */}
              <div className="pt-3 border-t border-slate-800 mt-2">
                {isEquipped ? (
                  <div className="w-full py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> สวมใส่อยู่ในปัจจุบัน
                  </div>
                ) : isPurchased ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> สวมใส่ไอเทมนี้
                  </button>
                ) : (
                  <button
                    disabled={levelLocked || !canAfford}
                    onClick={() => handleBuy(item)}
                    className={`w-full py-2 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all ${
                      levelLocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : !canAfford
                        ? 'bg-slate-800 text-amber-400/60 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 cursor-pointer hover:scale-[1.02]'
                    }`}
                  >
                    {levelLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> ล็อก (ต้องการ Lv.{item.requiredLevel})
                      </>
                    ) : !canAfford ? (
                      <>
                        <Coins className="w-3.5 h-3.5" /> เหรียญไม่พอ ({item.price} เหรียญ)
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> ซื้อ ({item.price} 🪙)
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
