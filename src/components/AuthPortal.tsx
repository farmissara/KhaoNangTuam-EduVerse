import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Student, Teacher } from '../types';
import {
  GraduationCap,
  Shield,
  Key,
  Users,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  School,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Flame,
  Coins,
  RefreshCw,
  Database,
  ExternalLink,
  Settings,
  LogIn
} from 'lucide-react';

interface AuthPortalProps {
  onLoginSuccess?: () => void;
  onOpenGasModal?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess, onOpenGasModal }) => {
  const {
    students,
    teachers,
    loginAsStudent,
    loginAsTeacher,
    loginWithStudentCode,
    loginWithTeacherCredentials,
    playSound,
    requireStudentPassword,
    requireTeacherPin,
    gasUrl,
    setGasUrl,
    isGasConnected,
    isSyncing,
    lastSyncTime,
    fetchDataFromGas
  } = useApp();

  const [authRole, setAuthRole] = useState<'student' | 'teacher'>('student');
  const [studentLoginTab, setStudentLoginTab] = useState<'by-code' | 'by-list'>('by-code');

  // Student Direct Code Login States
  const [studentCodeInput, setStudentCodeInput] = useState<string>('');
  const [studentDirectPinInput, setStudentDirectPinInput] = useState<string>('');
  const [showDirectPin, setShowDirectPin] = useState<boolean>(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState<boolean>(false);

  // Student List Selection States
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPinInput, setStudentPinInput] = useState<string>('');
  const [showStudentPin, setShowStudentPin] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string>('');
  const [shakeStudent, setShakeStudent] = useState<boolean>(false);
  const [directGasInput, setDirectGasInput] = useState<string>('');

  // Auto-sync students on mount if gasUrl exists and student list is empty
  useEffect(() => {
    if (gasUrl && students.length === 0 && !isSyncing) {
      fetchDataFromGas(gasUrl, true);
    }
  }, [gasUrl, students.length]);

  // Teacher Login States
  const [teacherIdentifier, setTeacherIdentifier] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers.length > 0 ? teachers[0].teacherId : ''
  );
  const [teacherPinInput, setTeacherPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [teacherError, setTeacherError] = useState<string>('');
  const [shakeTeacher, setShakeTeacher] = useState<boolean>(false);
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState<boolean>(false);

  // Classrooms list from real students
  const availableClassrooms = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.classroom))).filter(Boolean);
    return ['all', ...list];
  }, [students]);

  // Filtered real students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (!s || s.id === 'STD_EMPTY' || s.id.startsWith('STD_00') || s.firstName === 'นักเรียนใหม่') {
        return false;
      }
      const matchClass = selectedClassroom === 'all' || s.classroom === selectedClassroom;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        `${s.number}`.includes(q);
      return matchClass && matchSearch;
    });
  }, [students, selectedClassroom, searchQuery]);

  // Handle Real Student Login via Student Code Input
  const handleStudentCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStudentError('');

    const cleanCode = studentCodeInput.trim();
    if (!cleanCode) {
      playSound('wrong');
      setStudentError('กรุณากรอกรหัสนักเรียน หรือเลขประจำตัวนักเรียน');
      setShakeStudent(true);
      setTimeout(() => setShakeStudent(false), 500);
      return;
    }

    setIsSubmittingStudent(true);
    const res = await loginWithStudentCode(cleanCode, studentDirectPinInput);
    setIsSubmittingStudent(false);

    if (!res.success) {
      playSound('wrong');
      setStudentError(res.message || 'ไม่พบรหัสนักเรียนนี้ในระบบ กรุณาตรวจสอบอีกครั้ง');
      setShakeStudent(true);
      setTimeout(() => setShakeStudent(false), 500);
      return;
    }

    onLoginSuccess?.();
  };

  // Handle Real Student Login via Student List Selection
  const handleStudentListLogin = (studentToLogin?: Student) => {
    const target = studentToLogin || selectedStudent;
    if (!target) return;
    setStudentError('');

    if (requireStudentPassword) {
      if (!studentPinInput.trim()) {
        playSound('wrong');
        setStudentError('กรุณากรอกรหัส PIN หรือรหัสนักเรียนเพื่อเข้าสู่ระบบ');
        setShakeStudent(true);
        setTimeout(() => setShakeStudent(false), 500);
        return;
      }

      const res = loginAsStudent(target, studentPinInput);
      if (!res.success) {
        setStudentError(res.message || 'รหัสผ่านไม่ถูกต้อง');
        setShakeStudent(true);
        setTimeout(() => setShakeStudent(false), 500);
        return;
      }
    } else {
      loginAsStudent(target);
    }

    onLoginSuccess?.();
  };

  // Handle Real Teacher Login
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    const id = (teacherIdentifier.trim() || selectedTeacherId).trim();
    if (!id) {
      setTeacherError('กรุณาเลือกบัญชีคุณครู หรือระบุรหัสครู / อีเมล');
      return;
    }

    if (requireTeacherPin && !teacherPinInput.trim()) {
      setTeacherError('กรุณากรอกรหัส PIN คุณครู (ค่าเริ่มต้น: 1234)');
      return;
    }

    setIsSubmittingTeacher(true);
    const res = await loginWithTeacherCredentials(id, requireTeacherPin ? teacherPinInput : undefined);
    setIsSubmittingTeacher(false);

    if (!res.success) {
      playSound('wrong');
      setTeacherError(res.message || 'รหัส PIN คุณครูไม่ถูกต้อง');
      setShakeTeacher(true);
      setTimeout(() => setShakeTeacher(false), 500);
      return;
    }

    onLoginSuccess?.();
  };

  // Manual Trigger to fetch latest Google Sheets data
  const handleRefreshFromGas = async () => {
    playSound('click');
    setStudentError('');
    setTeacherError('');
    if (!gasUrl) {
      if (onOpenGasModal) {
        onOpenGasModal();
      } else {
        setStudentError('ยังไม่ได้เชื่อมต่อ Google Sheets Web App กรุณาตั้งค่าก่อนครับ');
      }
      return;
    }
    await fetchDataFromGas(gasUrl, false);
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-3 sm:p-6 w-full">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col md:flex-row">
        {/* Left Side: School Identity & Live Google Sheets Sync Status */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-600/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  EduQuest
                </h1>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <School className="w-3.5 h-3.5 text-amber-400" /> โรงเรียนบ้านเขานางต่วม
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-lg font-bold text-white leading-snug">
                ระบบจัดการเรียนรู้และประลองปัญญาฐานข้อมูล Google Sheets
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                เชื่อมโยงข้อมูลจริง 100% จาก Google Sheets ไม่ใช้ข้อมูลจำลอง ทุกการประลอง คะแนน
                และการตอบคำถามจะถูกบันทึกขึ้นคลาวด์แบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Live Google Sheets Connection Info Card */}
          <div className="relative z-10 pt-5 mt-5 border-t border-slate-800/80 space-y-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Sheets Sync:</span>
                </span>
                {isGasConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    ยังไม่ได้เชื่อมต่อ
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>นักเรียนในระบบจริง:</span>
                <span className="font-mono font-bold text-indigo-300">{students.length} คน</span>
              </div>

              {lastSyncTime && (
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>ซิงค์ล่าสุด:</span>
                  <span className="font-mono">{lastSyncTime.toLocaleTimeString('th-TH')}</span>
                </div>
              )}

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleRefreshFromGas}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-indigo-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="กดเพื่อดึงข้อมูลล่าสุดจาก Google Sheets ทันที"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isSyncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลล่าสุด'}</span>
                </button>
                {onOpenGasModal && (
                  <button
                    type="button"
                    onClick={onOpenGasModal}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="ตั้งค่า Web App URL / โค้ด Apps Script"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>บันทึกคะแนนและสถิติส่งเข้า Google Sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>ระบบรักษาความปลอดภัย PIN สำหรับครูและนักเรียน</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selector & Login Forms */}
        <div className="md:w-7/12 p-5 sm:p-8 flex flex-col justify-between space-y-5">
          {/* Role Switcher Pills */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                playSound('click');
                setAuthRole('student');
                setStudentError('');
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authRole === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🎒 สำหรับนักเรียน</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                setAuthRole('teacher');
                setTeacherError('');
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authRole === 'teacher'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>👩‍🏫 สำหรับครู / แอดมิน</span>
            </button>
          </div>

          {/* TAB 1: REAL STUDENT LOGIN */}
          {authRole === 'student' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Method Switcher: By Student Code vs By List Selection */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setStudentLoginTab('by-code');
                      setStudentError('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      studentLoginTab === 'by-code'
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔑 กรอกรหัสนักเรียน (สะดวก รวดเร็ว)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setStudentLoginTab('by-list');
                      setStudentError('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      studentLoginTab === 'by-list'
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📋 เลือกจากรายชื่อ ({students.length})
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 hidden sm:block">
                  {requireStudentPassword ? (
                    <span className="text-amber-300 flex items-center gap-1 font-medium">
                      <Lock className="w-3 h-3" /> ต้องมี PIN
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Unlock className="w-3 h-3" /> เข้าได้ทันที
                    </span>
                  )}
                </div>
              </div>

              {/* Subtab A: Direct Student Code Entry Form */}
              {studentLoginTab === 'by-code' && (
                <motion.form
                  onSubmit={handleStudentCodeSubmit}
                  animate={shakeStudent ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="space-y-3.5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>รหัสนักเรียน / เลขประจำตัว (จาก Google Sheets):</span>
                        {students.length > 0 && (
                          <span className="text-[11px] text-indigo-400 font-mono">
                            เช่น {students[0].studentCode}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={studentCodeInput}
                          onChange={e => {
                            setStudentCodeInput(e.target.value);
                            if (studentError) setStudentError('');
                          }}
                          placeholder="พิมพ์รหัสนักเรียน (เช่น 1001, 1002)..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 font-mono tracking-wide focus:outline-none focus:border-indigo-500"
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {requireStudentPassword && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>รหัสผ่าน PIN นักเรียน:</span>
                          <span className="text-[10px] text-indigo-300/80">(ค่าเริ่มต้น: 1234)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showDirectPin ? 'text' : 'password'}
                            value={studentDirectPinInput}
                            onChange={e => {
                              setStudentDirectPinInput(e.target.value);
                              if (studentError) setStudentError('');
                            }}
                            placeholder="กรอกรหัส PIN..."
                            className="w-full px-3.5 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDirectPin(!showDirectPin)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showDirectPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {studentError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{studentError}</span>
                      </div>
                    )}

                    {students.length === 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 space-y-3 text-xs text-amber-200">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>ยังไม่พบข้อมูลนักเรียนในระบบ</span>
                        </div>
                        {gasUrl ? (
                          <>
                            <p className="text-[11px] text-amber-300/90 leading-relaxed">
                              ระบบเชื่อมต่อ Google Sheets แล้ว กดปุ่มด้านล่างเพื่อดึงรายชื่อนักเรียนและข้อสอบล่าสุดได้ทันทีครับ
                            </p>
                            <button
                              type="button"
                              onClick={handleRefreshFromGas}
                              disabled={isSyncing}
                              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                              <span>{isSyncing ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลจาก Google Sheets ทันที'}</span>
                            </button>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[11px] text-amber-300/90 leading-relaxed">
                              เปิดจากลิงก์ที่ยังไม่ได้ระบุ Google Sheets URL หรือคุณครูยังไม่ได้ตั้งค่า กรุณาวาง Web App URL เพื่อเชื่อมต่อทันที:
                            </p>
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                placeholder="https://script.google.com/macros/s/.../exec"
                                value={directGasInput}
                                onChange={e => setDirectGasInput(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-amber-700/60 text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (directGasInput.trim()) {
                                    setGasUrl(directGasInput.trim());
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex-shrink-0 cursor-pointer"
                              >
                                เชื่อมต่อ
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="submit"
                      disabled={isSubmittingStudent || !studentCodeInput.trim()}
                      className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isSubmittingStudent ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบนักเรียน 🚀'}</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Subtab B: List Selection of Real Students */}
              {studentLoginTab === 'by-list' && (
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Classroom Filter */}
                    <select
                      value={selectedClassroom}
                      onChange={e => setSelectedClassroom(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="all">ทุกชั้นเรียน ({students.length} คน)</option>
                      {availableClassrooms.map(cls =>
                        cls !== 'all' ? (
                          <option key={cls} value={cls}>
                            ห้อง {cls}
                          </option>
                        ) : null
                      )}
                    </select>

                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อ, รหัสนักเรียน หรือเลขที่..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Student Cards List */}
                  <div className="flex-1 min-h-[180px] max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                    {students.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          ยังไม่มีรายชื่อนักเรียนในระบบ กรุณากดดึงข้อมูลจาก Google Sheets
                        </p>
                        <button
                          type="button"
                          onClick={handleRefreshFromGas}
                          disabled={isSyncing}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer inline-flex items-center gap-2"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>ดึงข้อมูลนักเรียนจาก Google Sheets</span>
                        </button>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        ไม่พบรายชื่อนักเรียนที่ตรงกับคำค้นหา
                      </div>
                    ) : (
                      filteredStudents.map(student => {
                        const isSelected = selectedStudent?.id === student.id;
                        return (
                          <div
                            key={student.id}
                            onClick={() => {
                              playSound('click');
                              setSelectedStudent(student);
                              setStudentPinInput('');
                              setStudentError('');
                            }}
                            onDoubleClick={() => handleStudentListLogin(student)}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-500/80 shadow-md shadow-indigo-600/20'
                                : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xl border border-slate-700">
                                {student.avatar}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  <span>
                                    {student.prefix}
                                    {student.firstName} {student.lastName}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                    #{student.number}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  ห้อง {student.classroom} • รหัส {student.studentCode} • Lv.{student.level}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="hidden sm:flex items-center gap-2 text-[10px] text-amber-400 font-bold">
                                <Flame className="w-3 h-3 fill-amber-400" />
                                <span>{student.streakDays}</span>
                                <Coins className="w-3 h-3 text-yellow-400" />
                                <span>{student.coins}</span>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Password Prompt for List Selection */}
                  {selectedStudent && requireStudentPassword && (
                    <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/70 space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          รหัส PIN สำหรับ: {selectedStudent.prefix}{selectedStudent.firstName}
                        </span>
                        <span className="text-[10px] text-indigo-300/80 font-mono">
                          (รหัสเริ่มต้น: {selectedStudent.studentCode} หรือ 1234)
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type={showStudentPin ? 'text' : 'password'}
                          value={studentPinInput}
                          onChange={e => {
                            setStudentPinInput(e.target.value);
                            if (studentError) setStudentError('');
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleStudentListLogin();
                            }
                          }}
                          placeholder={`พิมพ์รหัส PIN หรือ "${selectedStudent.studentCode}"...`}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 pr-9"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPin(!showStudentPin)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showStudentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {studentError && (
                    <div className="text-[11px] text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{studentError}</span>
                    </div>
                  )}

                  {/* Action Button for List Selection */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      disabled={!selectedStudent}
                      onClick={() => handleStudentListLogin()}
                      className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedStudent
                          ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>
                        {selectedStudent
                          ? requireStudentPassword
                            ? `ยืนยันรหัสเข้าสู่ระบบ (${selectedStudent.prefix}${selectedStudent.firstName}) 🚀`
                            : `เข้าสู่ระบบเป็น "${selectedStudent.prefix}${selectedStudent.firstName}" 🚀`
                          : 'กรุณาแตะเลือกชื่อของตนเองจากรายการด้านบน'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REAL TEACHER / ADMIN LOGIN */}
          {authRole === 'teacher' && (
            <motion.form
              onSubmit={handleTeacherSubmit}
              animate={shakeTeacher ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Teacher Account Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>เลือกบัญชีคุณครู (จาก Google Sheets):</span>
                    </span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      {teachers.length} ท่านในระบบ
                    </span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => {
                      setSelectedTeacherId(e.target.value);
                      setTeacherIdentifier(e.target.value);
                      setTeacherError('');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.teacherId} value={t.teacherId}>
                        {t.prefix} {t.firstName} {t.lastName} ({t.role || 'ครูผู้สอน'} - {t.department || 'วิชาการ'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password / PIN Input or Bypass indicator */}
                {requireTeacherPin ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>รหัสผ่านครู (PIN Code):</span>
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-normal">
                        (รหัสเริ่มต้น: 1234)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={teacherPinInput}
                        onChange={e => {
                          setTeacherPinInput(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="กรอกรหัส PIN 4 หลัก (เช่น 1234)..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>โหมดเข้าสู่ระบบรวดเร็ว (ไม่ต้องใส่รหัส PIN)</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          ปิดระบบรหัสครูอยู่
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        คุณครูสามารถคลิกเลือกบัญชีด้านบน แล้วกดปุ่มเข้าแดชบอร์ดด้านล่างได้ทันทีครับ
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {teacherError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{teacherError}</span>
                  </div>
                )}

                {/* Hint Card */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                  💡 <strong>ความปลอดภัย:</strong> คุณครูสามารถเปิด-ปิดระบบรหัสผ่านของทั้งนักเรียนและครูได้อิสระใน <strong>"แดชบอร์ดครู &gt; รหัสผ่าน & ความปลอดภัย"</strong>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={isSubmittingTeacher}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>
                    {isSubmittingTeacher
                      ? 'กำลังเข้าสู่ระบบ...'
                      : requireTeacherPin
                      ? 'เข้าสู่ระบบครู / แดชบอร์ดบริหาร 🔒'
                      : 'เข้าสู่ระบบครูทันที (คลิกเดียว) 🚀'}
                  </span>
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};
