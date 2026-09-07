import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Lock, Key, X, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface TeacherPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherPinModal: React.FC<TeacherPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { verifyTeacherPin, playSound, currentTeacher } = useApp();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyTeacherPin(pin)) {
      playSound('victory');
      setPin('');
      onSuccess();
      onClose();
    } else {
      playSound('wrong');
      setError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง (รหัสเริ่มต้น: 1234)');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ยืนยันสิทธิ์คุณครู / แอดมิน</h3>
              <p className="text-[10px] text-slate-400">ระบบป้องกันความปลอดภัยของข้อสอบ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="space-y-4 text-xs"
        >
          <p className="text-slate-300 leading-relaxed">
            กรุณากรอกรหัส PIN ของคุณครูเพื่อเข้าถึงเมนูบริหารจัดการ คลังข้อสอบ และข้อมูลวิชาการของโรงเรียน
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>รหัส PIN คุณครู (Teacher PIN):</span>
              <span className="text-[10px] text-amber-300 font-normal">รหัสเริ่มต้น: 1234</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="กรอกรหัส PIN 4 หลัก..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono tracking-widest text-sm focus:outline-none focus:border-amber-500"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>ปลดล็อคเพื่อเข้าสู่ระบบ</span>
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};
