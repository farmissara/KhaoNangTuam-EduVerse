import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import {
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Key,
  Mail,
  CheckCircle2,
  X,
  Lock,
  Building
} from 'lucide-react';

export const TeacherManager: React.FC = () => {
  const { teachers, currentTeacher, addTeacher, updateTeacher, playSound, triggerMascotTip } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    teacherId: '',
    prefix: 'ครู',
    firstName: '',
    lastName: '',
    role: 'ครูผู้สอน' as Teacher['role'],
    department: 'วิชาการ',
    email: '',
    openRouterKey: '',
    deepSeekKey: ''
  });

  const handleOpenAdd = () => {
    playSound('click');
    setEditingTeacher(null);
    setFormData({
      teacherId: `T00${teachers.length + 1}`,
      prefix: 'ครู',
      firstName: '',
      lastName: '',
      role: 'ครูผู้สอน',
      department: 'วิชาการ',
      email: '',
      openRouterKey: '',
      deepSeekKey: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    playSound('click');
    setEditingTeacher(t);
    setFormData({
      teacherId: t.teacherId,
      prefix: t.prefix,
      firstName: t.firstName,
      lastName: t.lastName,
      role: t.role,
      department: t.department,
      email: t.email || '',
      openRouterKey: t.openRouterKey || '',
      deepSeekKey: t.deepSeekKey || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลคุณครู');
      return;
    }

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department,
        email: formData.email,
        openRouterKey: formData.openRouterKey,
        deepSeekKey: formData.deepSeekKey
      });
      triggerMascotTip(`อัปเดตข้อมูล ${formData.prefix}${formData.firstName} เรียบร้อยแล้วครับ! 🎓`, 'happy');
    } else {
      addTeacher({
        teacherId: formData.teacherId,
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department,
        email: formData.email,
        assignedSubjects: ['SUB_ALL'],
        openRouterKey: formData.openRouterKey,
        deepSeekKey: formData.deepSeekKey
      });
      triggerMascotTip(`เพิ่มบัญชีคุณครู ${formData.prefix}${formData.firstName} เรียบร้อยแล้ว!`, 'cheering');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            จัดการบุคลากรและคุณครูผู้ดูแลระบบ (Teachers & Staff)
          </h2>
          <p className="text-xs text-slate-400">
            รายชื่อผู้ดูแลระบบ หัวหน้างานวิชาการ และครูผู้สอนในระบบ EduQuest GAS
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มคุณครูใหม่</span>
        </button>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.map(teacher => {
          const isCurrent = currentTeacher.teacherId === teacher.teacherId;
          return (
            <div
              key={teacher.teacherId}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900/95 border-indigo-500/60 shadow-xl ring-2 ring-indigo-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center justify-center text-xl font-bold font-mono">
                      {teacher.teacherId}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{teacher.prefix}{teacher.firstName} {teacher.lastName}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-normal">
                            บัญชีปัจจุบัน
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                        {teacher.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="แก้ไขข้อมูลคุณครู"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 py-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>ฝ่าย/กลุ่มสาระฯ: <b className="text-slate-200">{teacher.department}</b></span>
                  </div>
                  {teacher.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">{teacher.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> สิทธิ์ใช้งานพร้อม
                </span>
                <span className="font-mono text-slate-500">รหัสผ่าน: *******</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  {editingTeacher ? 'แก้ไขข้อมูลคุณครู' : 'เพิ่มบัญชีคุณครูใหม่'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">รหัสประจำตัวครู</label>
                    <input
                      type="text"
                      value={formData.teacherId}
                      onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                      required
                      disabled={!!editingTeacher}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">คำนำหน้า</label>
                    <input
                      type="text"
                      value={formData.prefix}
                      onChange={e => setFormData({ ...formData, prefix: e.target.value })}
                      placeholder="เช่น ครู, ดร., อ."
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ชื่อ</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ตำแหน่ง / บทบาท</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                      <option value="หัวหน้างานวิชาการ">หัวหน้างานวิชาการ</option>
                      <option value="ครูผู้สอน">ครูผู้สอน</option>
                      <option value="ครูประจำชั้น">ครูประจำชั้น</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ฝ่าย / กลุ่มสาระฯ</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="เช่น บริหาร, วิชาการ"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@school.ac.th"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
