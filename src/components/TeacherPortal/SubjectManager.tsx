import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  X,
  Atom,
  Calculator,
  Globe2,
  Landmark,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const AVAILABLE_ICONS = [
  { name: 'Atom', label: 'วิทยาศาสตร์ / ฟิสิกส์', component: Atom },
  { name: 'Calculator', label: 'คณิตศาสตร์ / คำนวณ', component: Calculator },
  { name: 'BookOpen', label: 'ภาษาไทย / วรรณคดี', component: BookOpen },
  { name: 'Globe2', label: 'ภาษาต่างประเทศ / อังกฤษ', component: Globe2 },
  { name: 'Landmark', label: 'สังคม / ประวัติศาสตร์', component: Landmark },
  { name: 'Cpu', label: 'เทคโนโลยี / วิทยาการคำนวณ', component: Cpu },
  { name: 'Sparkles', label: 'ศิลปะ / ดนตรี', component: Sparkles },
  { name: 'Layers', label: 'วิชาทั่วไป / บูรณาการ', component: Layers }
];

const AVAILABLE_COLORS = [
  { id: 'emerald', name: 'เขียวมรกต', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-500', textClass: 'text-emerald-400' },
  { id: 'blue', name: 'น้ำเงินฟ้า', bgClass: 'bg-blue-600', borderClass: 'border-blue-500', textClass: 'text-blue-400' },
  { id: 'amber', name: 'ส้มทอง', bgClass: 'bg-amber-600', borderClass: 'border-amber-500', textClass: 'text-amber-400' },
  { id: 'indigo', name: 'ม่วงคราม', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-500', textClass: 'text-indigo-400' },
  { id: 'rose', name: 'กุหลาบแดง', bgClass: 'bg-rose-600', borderClass: 'border-rose-500', textClass: 'text-rose-400' },
  { id: 'violet', name: 'ม่วงไวโอเล็ต', bgClass: 'bg-violet-600', borderClass: 'border-violet-500', textClass: 'text-violet-400' },
  { id: 'teal', name: 'เขียวน้ำทะเล', bgClass: 'bg-teal-600', borderClass: 'border-teal-500', textClass: 'text-teal-400' }
];

export const SubjectManager: React.FC = () => {
  const { subjects, questions, assignments, addSubject, updateSubject, deleteSubject, playSound, triggerMascotTip } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    icon: 'Atom',
    color: 'emerald',
    gradeLevel: 'ม.3',
    description: ''
  });

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    playSound('click');
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      icon: 'Atom',
      color: 'emerald',
      gradeLevel: 'ม.3',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    playSound('click');
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      icon: subject.icon,
      color: subject.color,
      gradeLevel: subject.gradeLevel || 'ม.3',
      description: subject.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${subject.name}" (${subject.code})?`)) {
      playSound('click');
      deleteSubject(subject.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('กรุณากรอกชื่อวิชาและรหัสวิชาให้ครบถ้วน');
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name: formData.name.trim(),
        code: formData.code.trim(),
        icon: formData.icon,
        color: formData.color,
        gradeLevel: formData.gradeLevel,
        description: formData.description.trim()
      });
    } else {
      addSubject({
        name: formData.name.trim(),
        code: formData.code.trim(),
        icon: formData.icon,
        color: formData.color,
        gradeLevel: formData.gradeLevel,
        description: formData.description.trim()
      });
    }

    setIsModalOpen(false);
  };

  const renderSubjectIcon = (iconName: string) => {
    const found = AVAILABLE_ICONS.find(i => i.name === iconName);
    if (found) {
      const IconComp = found.component;
      return <IconComp className="w-6 h-6" />;
    }
    return <BookOpen className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">จัดการรายวิชาและกลุ่มการเรียนรู้</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            เพิ่ม แก้ไข และกำหนดรายละเอียดรายวิชา รหัสวิชา ไอคอน และระดับชั้นเพื่อใช้ในการออกข้อสอบและมอบหมายงาน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มวิชาใหม่</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อวิชา, รหัสวิชา, หรือคำอธิบาย..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
        </div>
        <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium whitespace-nowrap">
          จำนวนวิชาทั้งหมด: <b className="text-white">{filteredSubjects.length}</b> วิชา
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map(subject => {
          const qCount = questions.filter(q => q.subjectId === subject.id).length;
          const asnCount = assignments.filter(a => a.subjectId === subject.id).length;

          return (
            <motion.div
              key={subject.id}
              whileHover={{ y: -4 }}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center border border-slate-700 shadow-sm">
                    {renderSubjectIcon(subject.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      {subject.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {subject.gradeLevel || 'ม.3'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {subject.description || 'ยังไม่มีคำอธิบายรายวิชา'}
                </p>
              </div>

              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 py-3 border-t border-slate-800 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
                    <span className="text-[10px] text-slate-400 block">ข้อสอบในคลัง</span>
                    <b className="text-indigo-300 text-sm">{qCount} ข้อ</b>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
                    <span className="text-[10px] text-slate-400 block">ภารกิจที่มอบหมาย</span>
                    <b className="text-emerald-300 text-sm">{asnCount} ภารกิจ</b>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(subject)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="แก้ไขรายวิชา"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="ลบรายวิชา"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {editingSubject ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่'}
                    </h2>
                    <p className="text-xs text-slate-400">กำหนดชื่อ รหัส ไอคอน และระดับชั้น</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อรายวิชา <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วิทยาศาสตร์ชีวภาพ หรือ ปัญญาประดิษฐ์ประยุกต์"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      รหัสวิชา <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ว23101, ค31101"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ระดับชั้น</label>
                    <select
                      value={formData.gradeLevel}
                      onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                      <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                      <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                      <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                      <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                      <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                      <option value="ประถม/ทั่วไป">ประถม / ทุกระดับชั้น</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">เลือกไอคอนประจำวิชา</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_ICONS.map(iconItem => {
                      const IconComponent = iconItem.component;
                      const isSelected = formData.icon === iconItem.name;
                      return (
                        <button
                          key={iconItem.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconItem.name })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-[10px] text-center truncate max-w-full">{iconItem.label.split('/')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">เลือกโทนสีประจำวิชา</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.id })}
                        className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          formData.color === c.id
                            ? `${c.borderClass} ${c.bgClass} text-white font-bold`
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.bgClass}`} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    คำอธิบายรายวิชา / ขอบเขตเนื้อหา
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุหัวข้อบทเรียน เช่น พันธุศาสตร์, อสมการ, ไวยากรณ์ภาษาอังกฤษ ฯลฯ"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingSubject ? 'บันทึกการแก้ไข' : 'บันทึกวิชาใหม่'}</span>
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
