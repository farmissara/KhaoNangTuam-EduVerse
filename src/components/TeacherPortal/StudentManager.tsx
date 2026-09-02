import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Award,
  Flame,
  Coins,
  Edit,
  X,
  CheckCircle,
  GraduationCap
} from 'lucide-react';

export const StudentManager: React.FC = () => {
  const { students, addStudent, updateStudent, playSound, triggerMascotTip } = useApp();

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentCode: '',
    prefix: 'ด.ช.',
    firstName: '',
    lastName: '',
    classroom: 'ม.3/1',
    number: 1,
    avatar: '🦁',
    streakDays: 1
  });

  const filteredStudents = students.filter(s => {
    const matchClass = selectedClass === 'ALL' || s.classroom === selectedClass;
    const matchSearch =
      searchQuery.trim() === '' ||
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.includes(searchQuery);
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    playSound('click');
    setEditingStudent(null);
    setFormData({
      studentCode: `5840${students.length + 1}`,
      prefix: 'ด.ช.',
      firstName: '',
      lastName: '',
      classroom: 'ม.3/1',
      number: students.length + 1,
      avatar: '🦁',
      streakDays: 1
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    playSound('click');
    setEditingStudent(s);
    setFormData({
      studentCode: s.studentCode,
      prefix: s.prefix,
      firstName: s.firstName,
      lastName: s.lastName,
      classroom: s.classroom,
      number: s.number,
      avatar: s.avatar,
      streakDays: s.streakDays
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลนักเรียน');
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        studentCode: formData.studentCode,
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        classroom: formData.classroom,
        number: formData.number,
        avatar: formData.avatar,
        streakDays: formData.streakDays
      });
      triggerMascotTip(`อัปเดตข้อมูล ${formData.firstName} เรียบร้อยแล้วครับ!`, 'happy');
    } else {
      addStudent({
        studentCode: formData.studentCode,
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        classroom: formData.classroom,
        number: formData.number,
        avatar: formData.avatar,
        streakDays: formData.streakDays,
        title: 'นักเรียนใหม่แกะกล่อง'
      });
      triggerMascotTip(`เพิ่มนักเรียน ${formData.firstName} เข้าสู่ห้องเรียนสำเร็จแล้ว! 🎉`, 'cheering');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            จัดการรายชื่อนักเรียนและคะแนนสะสม ({students.length} คน)
          </h2>
          <p className="text-xs text-slate-400">
            ดูความก้าวหน้า เลเวล ประวัติการทำแบบทดสอบ และปรับปรุงข้อมูลนักเรียน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มนักเรียนใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto">
          {['ALL', 'ม.3/1', 'ม.3/2', 'ม.3/3'].map(c => (
            <button
              key={c}
              onClick={() => {
                playSound('click');
                setSelectedClass(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

      {/* Student List Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">รหัส / อวาตาร์</th>
                <th className="p-4">ชื่อ - สกุล</th>
                <th className="p-4">ห้อง / เลขที่</th>
                <th className="p-4">เลเวล / XP</th>
                <th className="p-4">Streak & เหรียญ</th>
                <th className="p-4">Battle ชนะ/แพ้</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{s.avatar}</span>
                      <span className="font-mono text-slate-400">{s.studentCode}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-100">
                    {s.prefix}{s.firstName} {s.lastName}
                    <div className="text-[10px] text-slate-400 font-normal">{s.title}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {s.classroom} #{s.number}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                        Lv.{s.level}
                      </span>
                      <span className="font-mono text-amber-400 font-semibold">{s.xp} XP</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" /> {s.streakDays}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Coins className="w-3.5 h-3.5" /> {s.coins}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold">{s.battleWins}W</span> /{' '}
                    <span className="text-rose-400 font-bold">{s.battleLosses}L</span>
                    <span className="text-slate-400 text-[10px] ml-1">({s.accuracy}%)</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition-colors"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  {editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">รหัสนักเรียน</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">คำนำหน้า</label>
                    <select
                      value={formData.prefix}
                      onChange={e => setFormData({ ...formData, prefix: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <option value="ด.ช.">ด.ช.</option>
                      <option value="ด.ญ.">ด.ญ.</option>
                      <option value="นาย">นาย</option>
                      <option value="น.ส.">น.ส.</option>
                    </select>
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
                    <label className="block text-slate-400 mb-1">ห้องเรียน</label>
                    <select
                      value={formData.classroom}
                      onChange={e => setFormData({ ...formData, classroom: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <option value="ม.3/1">ม.3/1</option>
                      <option value="ม.3/2">ม.3/2</option>
                      <option value="ม.3/3">ม.3/3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">เลขที่</label>
                    <input
                      type="number"
                      value={formData.number}
                      onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">เลือกอวาตาร์</label>
                  <div className="flex gap-2">
                    {['🦁', '🦊', '🐼', '🐰', '🐯', '🦄', '🐨', '🐸'].map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setFormData({ ...formData, avatar: emoji })}
                        className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          formData.avatar === emoji
                            ? 'bg-indigo-600/40 border-indigo-400 scale-110'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
