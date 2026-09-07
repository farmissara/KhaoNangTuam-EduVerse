import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import {
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Key,
  Mail,
  CheckCircle2,
  X,
  Lock,
  Building,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { GasCodeViewerModal } from '../GasCodeViewerModal';

export const TeacherManager: React.FC = () => {
  const {
    teachers,
    currentTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    playSound,
    triggerMascotTip,
    teacherPin,
    updateTeacherPin,
    gasUrl,
    syncAllToGas
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingTeachers, setIsSyncingTeachers] = useState(false);
  const [saveBanner, setSaveBanner] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // Teacher PIN Management
  const [pinInput, setPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลคุณครู');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTeacher) {
        await updateTeacher({
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
        setSaveBanner({
          type: gasUrl ? 'success' : 'info',
          text: gasUrl
            ? `อัปเดตข้อมูล ${formData.prefix}${formData.firstName} และส่งลง Google Sheets เรียบร้อยแล้ว 📊`
            : `อัปเดตข้อมูลคุณครูเรียบร้อย (ยังไม่ได้เชื่อมต่อ Google Sheets)`
        });
        triggerMascotTip(`อัปเดตข้อมูล ${formData.prefix}${formData.firstName} เรียบร้อยแล้วครับ! 🎓`, 'happy');
      } else {
        await addTeacher({
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
        setSaveBanner({
          type: gasUrl ? 'success' : 'info',
          text: gasUrl
            ? `เพิ่มบัญชีคุณครู ${formData.prefix}${formData.firstName} และบันทึกลง Google Sheets เรียบร้อยแล้ว 📊`
            : `เพิ่มบัญชีคุณครูเรียบร้อยแล้ว`
        });
        triggerMascotTip(`เพิ่มบัญชีคุณครู ${formData.prefix}${formData.firstName} เรียบร้อยแล้ว!`, 'cheering');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('บันทึกผิดพลาด: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveBanner(null), 6000);
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (teachers.length <= 1) {
      alert('ไม่สามารถลบคุณครูคนสุดท้ายในระบบได้ครับ');
      return;
    }
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคุณครู "${teacher.prefix}${teacher.firstName} ${teacher.lastName}" ออกจากระบบและ Google Sheets?`)) {
      return;
    }

    try {
      await deleteTeacher(teacher.teacherId);
      setSaveBanner({
        type: 'info',
        text: `ลบข้อมูลคุณครู ${teacher.prefix}${teacher.firstName} ออกจากระบบและ Google Sheets แล้ว`
      });
      setTimeout(() => setSaveBanner(null), 5000);
    } catch (err: any) {
      alert('ลบผิดพลาด: ' + err.message);
    }
  };

  const handleSyncAllTeachers = async () => {
    if (!gasUrl) {
      setIsCodeModalOpen(true);
      return;
    }
    setIsSyncingTeachers(true);
    try {
      const res = await syncAllToGas();
      if (res.success) {
        setSaveBanner({
          type: 'success',
          text: `ซิงค์ข้อมูลครูทั้งหมด ${teachers.length} ท่านลง Google Sheets เรียบร้อยแล้ว 📊`
        });
        playSound('victory');
        triggerMascotTip('ซิงค์ข้อมูลคณะครูลงชีท Google Sheets สำเร็จเรียบร้อยครับ! 🎉', 'cheering');
      } else {
        setSaveBanner({ type: 'warning', text: res.message });
      }
    } catch (err: any) {
      setSaveBanner({ type: 'warning', text: 'การเชื่อมต่อผิดพลาด: ' + err.message });
    } finally {
      setIsSyncingTeachers(false);
      setTimeout(() => setSaveBanner(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sheets Sync Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
            gasUrl 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                สถานะการบันทึกลง Google Sheets (Teachers Sheet)
              </h3>
              {gasUrl ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  ยังไม่เชื่อมต่อ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {gasUrl
                ? 'ข้อมูลคุณครูจะถูกบันทึกและซิงค์ลง Google Sheets อัตโนมัติทุกครั้งที่กดบันทึกหรือลบ'
                : 'ข้อมูลถูกเก็บในเบราว์เซอร์เท่านั้น กรุณาเชื่อมต่อ Web App URL เพื่อให้บันทึกลง Google Sheets จริง'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {gasUrl && (
            <button
              onClick={handleSyncAllTeachers}
              disabled={isSyncingTeachers}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="ส่งข้อมูลคุณครูทั้งหมดขึ้น Google Sheets ทันที"
            >
              {isSyncingTeachers ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>ซิงค์ข้อมูลครูลงชีท</span>
            </button>
          )}

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>{gasUrl ? 'ตั้งค่าชีท / ดูโค้ด GAS' : 'เชื่อมต่อ Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
            saveBanner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : saveBanner.type === 'warning'
              ? 'bg-amber-950/60 border-amber-800 text-amber-200'
              : 'bg-indigo-950/60 border-indigo-800 text-indigo-200'
          }`}
        >
          {saveBanner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{saveBanner.text}</span>
        </motion.div>
      )}

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
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มคุณครูใหม่</span>
        </button>
      </div>

      {/* Teacher PIN Security Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              รหัสผ่าน PIN สำหรับเข้าสู่ระบบครู (Teacher Access PIN)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            ใช้ป้องกันไม่ให้นักเรียนสลับเข้ามาดูคลังข้อสอบ เฉลย หรือแก้ไขคะแนน สามารถเปลี่ยนรหัสผ่านได้ตลอดเวลา
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
            <span>รหัสผ่านปัจจุบัน:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold text-amber-300">
              {showCurrentPin ? teacherPin : '••••'}
            </span>
            <button
              onClick={() => setShowCurrentPin(!showCurrentPin)}
              className="text-slate-400 hover:text-white p-1"
              title={showCurrentPin ? 'ซ่อนรหัส' : 'ดูรหัส'}
            >
              {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Change PIN Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const res = updateTeacherPin(pinInput);
            if (res.success) {
              setPinFeedback({ type: 'success', message: res.message });
              setPinInput('');
              triggerMascotTip('เปลี่ยนรหัส PIN คุณครูเรียบร้อยแล้วครับ! 🔑', 'happy');
            } else {
              setPinFeedback({ type: 'error', message: res.message });
            }
            setTimeout(() => setPinFeedback(null), 4000);
          }}
          className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative">
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="ตั้งรหัส PIN ใหม่ (4 หลักขึ้นไป)..."
              className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={!pinInput.trim()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>เปลี่ยนรหัส</span>
          </button>
        </form>

        {pinFeedback && (
          <div
            className={`w-full text-xs p-2 rounded-xl border flex items-center gap-2 ${
              pinFeedback.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800 text-rose-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{pinFeedback.message}</span>
          </div>
        )}
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลคุณครู"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {teachers.length > 1 && (
                      <button
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-800 transition-colors cursor-pointer"
                        title="ลบคุณครูออกจากระบบและ Google Sheets"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    {gasUrl 
                      ? 'ระบบจะบันทึกข้อมูลและส่งลงชีท Teachers ใน Google Sheets อัตโนมัติทันที' 
                      : 'ข้อมูลจะถูกเก็บในระบบ หากต้องการให้ลง Google Sheets กรุณาตั้งค่า Web App URL'}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังบันทึกลง Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>บันทึกข้อมูลคุณครู</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GAS Code Modal */}
      <GasCodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
};
