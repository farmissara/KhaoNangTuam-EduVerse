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
  GraduationCap,
  Trash2,
  FileSpreadsheet,
  Upload,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { GasCodeViewerModal } from '../GasCodeViewerModal';

export const StudentManager: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    clearAllStudents,
    bulkAddStudents,
    playSound,
    triggerMascotTip,
    gasUrl,
    syncAllToGas
  } = useApp();

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingStudents, setIsSyncingStudents] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassroom, setBulkClassroom] = useState('ม.3/1');
  const [bulkText, setBulkText] = useState('');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลนักเรียน');
      return;
    }

    setIsSaving(true);
    try {
      if (editingStudent) {
        await updateStudent({
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
        setSaveFeedback({
          type: gasUrl ? 'success' : 'info',
          text: gasUrl
            ? `อัปเดตข้อมูล ${formData.prefix}${formData.firstName} และส่งลงชีท Students ใน Google Sheets เรียบร้อยแล้ว 📊`
            : `อัปเดตข้อมูลนักเรียนเรียบร้อย (ยังไม่ได้เชื่อมต่อ Google Sheets)`
        });
        triggerMascotTip(`อัปเดตข้อมูล ${formData.firstName} เรียบร้อยแล้วครับ!`, 'happy');
      } else {
        await addStudent({
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
        setSaveFeedback({
          type: gasUrl ? 'success' : 'info',
          text: gasUrl
            ? `เพิ่มนักเรียน ${formData.prefix}${formData.firstName} และส่งเข้าชีท Students ใน Google Sheets สำเร็จ 📊`
            : `เพิ่มนักเรียนเข้าสู่ระบบเรียบร้อยแล้ว`
        });
        triggerMascotTip(`เพิ่มนักเรียน ${formData.firstName} เข้าสู่ห้องเรียนสำเร็จแล้ว! 🎉`, 'cheering');
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert('บันทึกผิดพลาด: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveFeedback(null), 6000);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล ${student.prefix}${student.firstName} ${student.lastName} ออกจากระบบและ Google Sheets?`)) {
      return;
    }
    try {
      await deleteStudent(student.studentCode);
      setSaveFeedback({
        type: 'info',
        text: `ลบนักเรียน ${student.prefix}${student.firstName} ออกจากระบบและ Google Sheets แล้ว`
      });
      setTimeout(() => setSaveFeedback(null), 5000);
    } catch (err: any) {
      alert('ลบผิดพลาด: ' + err.message);
    }
  };

  const handleSyncAllStudents = async () => {
    if (!gasUrl) {
      setIsCodeModalOpen(true);
      return;
    }
    setIsSyncingStudents(true);
    try {
      const res = await syncAllToGas();
      if (res.success) {
        setSaveFeedback({
          type: 'success',
          text: `ซิงค์ข้อมูลนักเรียนทั้งหมด ${students.length} คนลง Google Sheets สำเร็จเรียบร้อย 📊`
        });
        playSound('victory');
        triggerMascotTip('ส่งข้อมูลนักเรียนลง Google Sheets เรียบร้อยแล้วครับ! 🎉', 'cheering');
      } else {
        setSaveFeedback({ type: 'warning', text: res.message });
      }
    } catch (err: any) {
      setSaveFeedback({ type: 'warning', text: 'การเชื่อมต่อผิดพลาด: ' + err.message });
    } finally {
      setIsSyncingStudents(false);
      setTimeout(() => setSaveFeedback(null), 6000);
    }
  };

  // Bulk import parser: parses rows pasted from Excel or Google Sheets
  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: Array<{
      studentCode: string;
      prefix: string;
      firstName: string;
      lastName: string;
      classroom: string;
      number: number;
      avatar: string;
    }> = [];

    const avatars = ['🦁', '🦊', '🐼', '🐰', '🐯', '🦄', '🐨', '🐸'];

    lines.forEach((line, idx) => {
      const parts = line.includes('\t') 
        ? line.split('\t').map(p => p.trim()) 
        : line.includes(',') 
          ? line.split(',').map(p => p.trim()) 
          : line.split(/\s+/).map(p => p.trim());

      let num = idx + 1;
      let code = `5840${students.length + idx + 1}`;
      let prefix = 'ด.ช.';
      let first = '';
      let last = '';
      let cls = bulkClassroom;

      if (parts.length >= 4) {
        if (!isNaN(Number(parts[0]))) {
          num = parseInt(parts[0], 10);
          code = parts[1] || code;
          prefix = parts[2] || prefix;
          first = parts[3] || '';
          last = parts.slice(4).join(' ');
        } else {
          code = parts[0];
          prefix = parts[1];
          first = parts[2];
          last = parts.slice(3).join(' ');
        }
      } else if (parts.length >= 2) {
        const fullFirst = parts[0];
        if (fullFirst.startsWith('ด.ช.') || fullFirst.startsWith('เด็กชาย')) {
          prefix = 'ด.ช.';
          first = fullFirst.replace(/^(ด\.ช\.|เด็กชาย)/, '').trim() || parts[1];
          last = parts.slice(parts[0].replace(/^(ด\.ช\.|เด็กชาย)/, '').trim() ? 1 : 2).join(' ');
        } else if (fullFirst.startsWith('ด.ญ.') || fullFirst.startsWith('เด็กหญิง')) {
          prefix = 'ด.ญ.';
          first = fullFirst.replace(/^(ด\.ญ\.|เด็กหญิง)/, '').trim() || parts[1];
          last = parts.slice(parts[0].replace(/^(ด\.ญ\.|เด็กหญิง)/, '').trim() ? 1 : 2).join(' ');
        } else if (fullFirst.startsWith('นาย')) {
          prefix = 'นาย';
          first = fullFirst.replace(/^นาย/, '').trim() || parts[1];
          last = parts.slice(parts[0].replace(/^นาย/, '').trim() ? 1 : 2).join(' ');
        } else if (fullFirst.startsWith('น.ส.') || fullFirst.startsWith('นางสาว')) {
          prefix = 'น.ส.';
          first = fullFirst.replace(/^(น\.ส\.|นางสาว)/, '').trim() || parts[1];
          last = parts.slice(parts[0].replace(/^(น\.ส\.|นางสาว)/, '').trim() ? 1 : 2).join(' ');
        } else {
          first = parts[0];
          last = parts.slice(1).join(' ');
        }
      } else if (parts.length === 1 && parts[0]) {
        first = parts[0];
      }

      if (first) {
        parsed.push({
          studentCode: code,
          prefix: prefix || 'ด.ช.',
          firstName: first,
          lastName: last || '',
          classroom: cls,
          number: num,
          avatar: avatars[idx % avatars.length]
        });
      }
    });

    if (parsed.length === 0) {
      alert('ไม่พบข้อมูลรายชื่อนักเรียน กรุณาตรวจสอบรูปแบบข้อความครับ');
      return;
    }

    setIsSaving(true);
    try {
      await bulkAddStudents(parsed as any);
      playSound('victory');
      setBulkText('');
      setIsBulkModalOpen(false);
      setSaveFeedback({
        type: gasUrl ? 'success' : 'info',
        text: gasUrl
          ? `นำเข้านักเรียน ${parsed.length} คนและส่งลง Google Sheets เรียบร้อยแล้ว 📊`
          : `นำเข้านักเรียน ${parsed.length} คนเรียบร้อยแล้ว`
      });
      setTimeout(() => setSaveFeedback(null), 6000);
    } catch (err: any) {
      alert('นำเข้าผิดพลาด: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sheets Sync Status Bar */}
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
                สถานะการบันทึกลง Google Sheets (Students Sheet)
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
                ? 'ข้อมูลนักเรียน (เพิ่ม แก้ไข ลบ) จะส่งเข้าชีท Students ใน Google Sheets อัตโนมัติทันที'
                : 'ข้อมูลถูกเก็บในเบราว์เซอร์เท่านั้น กรุณาเชื่อมต่อ Web App URL เพื่อให้บันทึกเข้า Google Sheets จริง'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {gasUrl && (
            <button
              onClick={handleSyncAllStudents}
              disabled={isSyncingStudents}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="ส่งข้อมูลนักเรียนทั้งหมดขึ้น Google Sheets ทันที"
            >
              {isSyncingStudents ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>ซิงค์รายชื่อนักเรียนลงชีท</span>
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
      {saveFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
            saveFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : saveFeedback.type === 'warning'
              ? 'bg-amber-950/60 border-amber-800 text-amber-200'
              : 'bg-indigo-950/60 border-indigo-800 text-indigo-200'
          }`}
        >
          {saveFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{saveFeedback.text}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            จัดการรายชื่อนักเรียนและคะแนนสะสม ({students.length} คน)
          </h2>
          <p className="text-xs text-slate-400">
            ดูความก้าวหน้า เลเวล ประวัติการทำแบบทดสอบ และปรับปรุงข้อมูลนักเรียนจริง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ เพิ่ม 1 คน</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setIsBulkModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📋 นำเข้ากลุ่ม (วางจาก Excel)</span>
          </button>

          {students.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ คุณต้องการลบรายชื่อนักเรียนทั้งหมดใช่หรือไม่? (เพื่อเตรียมใส่รายชื่อนักเรียนจริง)')) {
                  playSound('click');
                  clearAllStudents();
                }
              }}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="ล้างนักเรียนทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างนักเรียนทั้งหมด</span>
            </button>
          )}
        </div>
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

      {/* Student List Table or Empty State */}
      {students.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl">
            ✨
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ระบบพร้อมสำหรับการใส่ข้อมูลนักเรียนจริงแล้ว!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              ข้อมูลทดสอบเดิมถูกเคลียร์เรียบร้อยแล้ว คุณครูสามารถกดปุ่มเพิ่มรายชื่อทีละคน หรือก๊อปปี้รายชื่อจาก Excel / Google Sheets มาวางเพื่อนำเข้าพร้อมกันได้ทันทีครับ
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playSound('click');
                setIsBulkModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📋 วางรายชื่อจาก Excel/Sheets นำเข้าทันที</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มนักเรียนทีละคน</span>
            </button>
          </div>
        </div>
      ) : (
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s)}
                          className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                          title="ลบนักเรียนออกจากระบบและ Google Sheets"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  นำเข้ารายชื่อนักเรียนแบบกลุ่ม (วางจาก Excel / Google Sheets)
                </h3>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200/90 leading-relaxed">
                💡 <strong>คำแนะนำ:</strong> ก๊อปปี้แถวนักเรียนจาก Excel หรือ Google Sheets แล้ววางลงในช่องด้านล่างได้ทันที <br />
                รองรับรูปแบบ: <code>ด.ช.สมชาย ใจดี</code> หรือ <code>1001 ด.ญ.กานดา สุขใจ</code> หรือ <code>เลขที่, รหัส, คำนำหน้า, ชื่อ, นามสกุล</code>
              </div>

              <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">เลือกชั้นห้องเรียนตั้งต้น</label>
                  <select
                    value={bulkClassroom}
                    onChange={e => setBulkClassroom(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="ป.1/1">ป.1/1</option>
                    <option value="ป.2/1">ป.2/1</option>
                    <option value="ป.3/1">ป.3/1</option>
                    <option value="ป.4/1">ป.4/1</option>
                    <option value="ป.5/1">ป.5/1</option>
                    <option value="ป.6/1">ป.6/1</option>
                    <option value="ม.1/1">ม.1/1</option>
                    <option value="ม.2/1">ม.2/1</option>
                    <option value="ม.3/1">ม.3/1</option>
                    <option value="ม.3/2">ม.3/2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    วางรายชื่อนักเรียนที่นี่ (บรรทัดละ 1 คน):
                  </label>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    placeholder={`ตัวอย่าง:\n1\t58401\tด.ช.\tกิตติพงษ์\tพงษ์ศิริ\n2\t58402\tด.ญ.\tรัตนาภรณ์\tยอดดี\nหรือ:\nด.ช.อนุชา ใจเด็ด\nด.ญ.พิมพ์ชนก สุขสำราญ`}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>นำเข้านักเรียนทันที</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    {gasUrl 
                      ? 'ระบบจะบันทึกข้อมูลและส่งลงชีท Students ใน Google Sheets อัตโนมัติทันที' 
                      : 'ข้อมูลจะถูกเก็บในระบบ หากต้องการให้ลง Google Sheets กรุณาตั้งค่า Web App URL'}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                        <span>บันทึกข้อมูลนักเรียน</span>
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
