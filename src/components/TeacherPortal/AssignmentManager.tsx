import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Assignment, Question, Student } from '../../types';
import {
  Calendar,
  Clock,
  Users,
  User,
  Plus,
  Trash2,
  Edit3,
  Bell,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  BookOpen,
  Search,
  Filter,
  Send,
  X,
  FileText,
  CheckSquare,
  Square,
  Zap,
  ChevronRight
} from 'lucide-react';

export const AssignmentManager: React.FC = () => {
  const {
    assignments,
    assignmentSubmissions,
    subjects,
    questions,
    students,
    currentTeacher,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    sendNotification,
    playSound,
    triggerMascotTip
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSubmissionsAssignment, setViewingSubmissionsAssignment] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form State for creating/editing assignment
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || 'SUB_THAI');
  const [formTitle, setFormTitle] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGradeLevel, setFormGradeLevel] = useState('ม.3');
  const [formTargetType, setFormTargetType] = useState<'classroom' | 'individual'>('classroom');
  const [formSelectedClassrooms, setFormSelectedClassrooms] = useState<string[]>(['ม.3/1', 'ม.3/2']);
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([]);
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [formSelectedQuestionIds, setFormSelectedQuestionIds] = useState<string[]>([]);
  const [formRewardXp, setFormRewardXp] = useState(150);
  const [formRewardCoins, setFormRewardCoins] = useState(30);
  const [formIsUrgent, setFormIsUrgent] = useState(false);

  // Filtered lists
  const availableQuestionsForSubject = questions.filter(q => q.subjectId === formSubjectId);

  const filteredAssignments = assignments.filter(a => {
    const matchSubject = selectedSubjectFilter === 'ALL' || a.subjectId === selectedSubjectFilter;
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const availableClassrooms = Array.from(new Set(students.map(s => s.classroom))).sort();

  const handleOpenAdd = () => {
    playSound('click');
    setEditingAssignment(null);
    const sub = subjects[0];
    setFormSubjectId(sub ? sub.id : '');
    setFormTitle('');
    setFormTopic('');
    setFormDescription('ให้นักเรียนศึกษาโจทย์และทำแบบทดสอบให้ครบทุกข้อก่อนหมดเวลา');
    setFormGradeLevel('ม.3');
    setFormTargetType('classroom');
    setFormSelectedClassrooms(['ม.3/1', 'ม.3/2']);
    setFormSelectedStudentIds([]);
    const defaultQs = questions.filter(q => q.subjectId === (sub ? sub.id : '')).map(q => q.id);
    setFormSelectedQuestionIds(defaultQs.slice(0, 5));
    setFormRewardXp(150);
    setFormRewardCoins(30);
    setFormIsUrgent(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asn: Assignment) => {
    playSound('click');
    setEditingAssignment(asn);
    setFormSubjectId(asn.subjectId);
    setFormTitle(asn.title);
    setFormTopic(asn.topic);
    setFormDescription(asn.description);
    setFormGradeLevel(asn.gradeLevel);
    setFormTargetType(asn.targetType);
    setFormSelectedClassrooms(asn.targetClassrooms || []);
    setFormSelectedStudentIds(asn.targetStudentIds || []);
    setFormDueDate(asn.dueDate);
    setFormSelectedQuestionIds(asn.questionIds || []);
    setFormRewardXp(asn.rewardXp);
    setFormRewardCoins(asn.rewardCoins);
    setFormIsUrgent(asn.isUrgent);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('กรุณาระบุชื่อหัวข้อภารกิจ');
      return;
    }
    if (formSelectedQuestionIds.length === 0) {
      alert('กรุณาเลือกข้อสอบอย่างน้อย 1 ข้อสำหรับภารกิจนี้');
      return;
    }
    if (formTargetType === 'classroom' && formSelectedClassrooms.length === 0) {
      alert('กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง');
      return;
    }
    if (formTargetType === 'individual' && formSelectedStudentIds.length === 0) {
      alert('กรุณาเลือกนักเรียนอย่างน้อย 1 คน');
      return;
    }

    const currentSub = subjects.find(s => s.id === formSubjectId);
    const subjectName = currentSub ? currentSub.name : 'วิชาทั่วไป';

    if (editingAssignment) {
      updateAssignment({
        ...editingAssignment,
        title: formTitle.trim(),
        topic: formTopic.trim() || formTitle.trim(),
        description: formDescription.trim(),
        subjectId: formSubjectId,
        subjectName,
        gradeLevel: formGradeLevel,
        targetType: formTargetType,
        targetClassrooms: formSelectedClassrooms,
        targetStudentIds: formSelectedStudentIds,
        dueDate: formDueDate,
        questionIds: formSelectedQuestionIds,
        rewardXp: formRewardXp,
        rewardCoins: formRewardCoins,
        isUrgent: formIsUrgent
      });
    } else {
      addAssignment({
        title: formTitle.trim(),
        topic: formTopic.trim() || formTitle.trim(),
        description: formDescription.trim(),
        subjectId: formSubjectId,
        subjectName,
        gradeLevel: formGradeLevel,
        targetType: formTargetType,
        targetClassrooms: formSelectedClassrooms,
        targetStudentIds: formSelectedStudentIds,
        dueDate: formDueDate,
        questionIds: formSelectedQuestionIds,
        rewardXp: formRewardXp,
        rewardCoins: formRewardCoins,
        isUrgent: formIsUrgent,
        createdByTeacherId: currentTeacher.teacherId,
        teacherName: `${currentTeacher.prefix}${currentTeacher.firstName} ${currentTeacher.lastName}`
      });
    }

    setIsModalOpen(false);
  };

  const handleSendReminderAlert = (asn: Assignment) => {
    playSound('click');
    const msg = `🔔 แจ้งเตือนด่วน: อย่าลืมทำภารกิจ "${asn.title}" (${asn.subjectName}) กำหนดส่ง ${asn.dueDate} เข้าเล่นเพื่อรับ XP และเหรียญรางวัล!`;
    
    if (asn.targetType === 'individual') {
      asn.targetStudentIds.forEach(stdId => {
        sendNotification({
          userId: stdId,
          title: `⏰ แจ้งเตือนภารกิจใกล้ถึงกำหนดส่ง: ${asn.title}`,
          message: msg,
          type: 'assignment',
          assignmentId: asn.id
        });
      });
    } else {
      sendNotification({
        userId: 'ALL_STUDENTS',
        title: `⏰ แจ้งเตือนภารกิจ "${asn.title}" (${asn.targetClassrooms.join(', ')})`,
        message: msg,
        type: 'assignment',
        assignmentId: asn.id
      });
    }

    triggerMascotTip(`ส่งการแจ้งเตือนเตือนความจำไปยังนักเรียนเกี่ยวกับภารกิจ "${asn.title}" เรียบร้อยแล้ว! 📢`, 'cheering');
  };

  const toggleSelectAllQuestions = () => {
    if (formSelectedQuestionIds.length === availableQuestionsForSubject.length) {
      setFormSelectedQuestionIds([]);
    } else {
      setFormSelectedQuestionIds(availableQuestionsForSubject.map(q => q.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">ระบบมอบหมายข้อสอบ & แจ้งเตือนภารกิจ</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            เลือกวิชา หัวข้อ ระดับชั้น และส่งภารกิจข้อสอบให้นักเรียนทั้งห้องหรือรายบุคคล พร้อมระบบส่งการแจ้งเตือนอัตโนมัติ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างภารกิจใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อภารกิจ, หัวข้อ, หรือวิชา..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500"
          />
        </div>

        <div>
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">ทุกกลุ่มสาระวิชา ({assignments.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map(asn => {
          const subs = assignmentSubmissions.filter(s => s.assignmentId === asn.id);
          const totalTargetStudents = asn.targetType === 'individual'
            ? asn.targetStudentIds.length
            : students.filter(s => asn.targetClassrooms.includes(s.classroom)).length;
          
          const completionRate = totalTargetStudents > 0 ? Math.round((subs.length / totalTargetStudents) * 100) : 0;

          return (
            <motion.div
              key={asn.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      {asn.subjectName}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {asn.gradeLevel}
                    </span>
                    {asn.isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-rose-400" /> ด่วน
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendReminderAlert(asn)}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                      title="ส่งแจ้งเตือนซ้ำให้นักเรียน"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(asn)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="แก้ไขภารกิจ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบภารกิจ "${asn.title}" หรือไม่?`)) {
                          deleteAssignment(asn.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="ลบภารกิจ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{asn.title}</h3>
                <p className="text-xs text-indigo-300 font-medium mb-2">หัวข้อ: {asn.topic}</p>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {asn.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                </p>

                {/* Target & Deadline info */}
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs mb-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {asn.targetType === 'individual' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                      <span>เป้าหมาย:</span>
                    </div>
                    <span className="font-semibold text-white">
                      {asn.targetType === 'individual'
                        ? `รายบุคคล (${asn.targetStudentIds.length} คน)`
                        : `ทั้งห้อง: ${asn.targetClassrooms.join(', ')}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>กำหนดส่ง:</span>
                    </div>
                    <span className="font-semibold text-amber-300">{asn.dueDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>จำนวนข้อสอบ:</span>
                    </div>
                    <span className="font-bold text-indigo-300">{asn.questionIds.length} ข้อ</span>
                  </div>
                </div>
              </div>

              {/* Progress & Submissions Viewer */}
              <div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">อัตราการส่งงาน</span>
                    <span className="font-bold text-white">
                      {subs.length} / {totalTargetStudents} คน ({completionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(completionRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400 font-bold">+{asn.rewardXp} XP</span>
                    <span className="text-yellow-400 font-bold">+{asn.rewardCoins} 🪙</span>
                  </div>

                  <button
                    onClick={() => setViewingSubmissionsAssignment(asn)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>ดูรายชื่อผู้ส่ง</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submissions Detail Modal */}
      <AnimatePresence>
        {viewingSubmissionsAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white max-h-[85vh] flex flex-col"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold">ผลการส่งงาน: {viewingSubmissionsAssignment.title}</h2>
                  <p className="text-xs text-slate-400">
                    วิชา {viewingSubmissionsAssignment.subjectName} • กำหนดส่ง {viewingSubmissionsAssignment.dueDate}
                  </p>
                </div>
                <button
                  onClick={() => setViewingSubmissionsAssignment(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 overflow-y-auto flex-1 space-y-3">
                {(() => {
                  const targetList = viewingSubmissionsAssignment.targetType === 'individual'
                    ? students.filter(s => viewingSubmissionsAssignment.targetStudentIds.includes(s.id))
                    : students.filter(s => viewingSubmissionsAssignment.targetClassrooms.includes(s.classroom));

                  return (
                    <div className="space-y-2">
                      {targetList.map(std => {
                        const submission = assignmentSubmissions.find(
                          sub => sub.assignmentId === viewingSubmissionsAssignment.id && sub.studentId === std.id
                        );

                        return (
                          <div
                            key={std.id}
                            className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={std.avatar}
                                alt={std.firstName}
                                className="w-9 h-9 rounded-xl bg-slate-700 object-cover"
                              />
                              <div>
                                <h4 className="font-bold text-white">
                                  {std.prefix}{std.firstName} {std.lastName}
                                </h4>
                                <p className="text-[11px] text-slate-400">ห้อง {std.classroom} • เลขที่ {std.studentNumber}</p>
                              </div>
                            </div>

                            <div>
                              {submission ? (
                                <div className="text-right">
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    คะแนน {submission.score} / {submission.totalQuestions} ({Math.round((submission.score / submission.totalQuestions) * 100)}%)
                                  </span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    ส่งเมื่อ {submission.completedAt}
                                  </span>
                                </div>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                  ยังไม่ส่งงาน ⏳
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewingSubmissionsAssignment(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Assignment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {editingAssignment ? 'แก้ไขภารกิจข้อสอบ' : 'สร้างภารกิจมอบหมายข้อสอบใหม่'}
                    </h2>
                    <p className="text-xs text-slate-400">กำหนดกลุ่มเป้าหมาย ข้อสอบ และการแจ้งเตือน</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      เลือกกลุ่มสาระ / รายวิชา <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formSubjectId}
                      onChange={e => {
                        setFormSubjectId(e.target.value);
                        const newQs = questions.filter(q => q.subjectId === e.target.value);
                        setFormSelectedQuestionIds(newQs.slice(0, 5).map(q => q.id));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ระดับชั้น</label>
                    <select
                      value={formGradeLevel}
                      onChange={e => setFormGradeLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                      <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                      <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                      <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                      <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                      <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ชื่อภารกิจ / ชื่องาน <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ภารกิจทบทวนพันธุศาสตร์และโครโมโซม"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">หัวข้อย่อย / บทเรียน</label>
                    <input
                      type="text"
                      placeholder="เช่น หน่วยที่ 2 การถ่ายทอดลักษณะทางพันธุกรรม"
                      value={formTopic}
                      onChange={e => setFormTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    คำชี้แจงและคำแนะนำสำหรับนักเรียน
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>

                {/* Target Type Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    รูปแบบการมอบหมายเป้าหมาย <span className="text-rose-400">*</span>
                  </label>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={formTargetType === 'classroom'}
                        onChange={() => setFormTargetType('classroom')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-slate-200">มอบหมายทั้งห้อง / ระดับชั้น</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={formTargetType === 'individual'}
                        onChange={() => setFormTargetType('individual')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-slate-200">มอบหมายรายบุคคล (ติ๊กเลือกนักเรียน)</span>
                    </label>
                  </div>

                  {formTargetType === 'classroom' ? (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">เลือกห้องเรียนที่ต้องการมอบหมาย:</span>
                      <div className="flex flex-wrap gap-2">
                        {availableClassrooms.map(c => {
                          const isSelected = formSelectedClassrooms.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setFormSelectedClassrooms(formSelectedClassrooms.filter(item => item !== c));
                                } else {
                                  setFormSelectedClassrooms([...formSelectedClassrooms, c]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-500 text-white font-bold'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                              <span>ห้อง {c}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">ติ๊กเลือกนักเรียนที่ต้องการมอบหมาย:</span>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                        {students.map(s => {
                          const isSelected = formSelectedStudentIds.includes(s.id);
                          return (
                            <label
                              key={s.id}
                              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-700/40"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setFormSelectedStudentIds(formSelectedStudentIds.filter(id => id !== s.id));
                                    } else {
                                      setFormSelectedStudentIds([...formSelectedStudentIds, s.id]);
                                    }
                                  }}
                                  className="text-purple-600 rounded"
                                />
                                <span className="text-xs text-white">
                                  {s.prefix}{s.firstName} {s.lastName} (ห้อง {s.classroom})
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">Lv.{s.level}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      เลือกข้อสอบจากคลังวิชา ({formSelectedQuestionIds.length} / {availableQuestionsForSubject.length} ข้อ)
                    </label>
                    <button
                      type="button"
                      onClick={toggleSelectAllQuestions}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      {formSelectedQuestionIds.length === availableQuestionsForSubject.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {availableQuestionsForSubject.map((q, idx) => {
                      const isSelected = formSelectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => {
                            if (isSelected) {
                              setFormSelectedQuestionIds(formSelectedQuestionIds.filter(id => id !== q.id));
                            } else {
                              setFormSelectedQuestionIds([...formSelectedQuestionIds, q.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-950/50 border-purple-500 text-white'
                              : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="line-clamp-2 leading-relaxed text-slate-200">
                                <b>ข้อที่ {idx + 1}:</b> {q.questionText}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                <span className="uppercase font-mono">{q.difficulty}</span>
                                {q.mediaType && q.mediaType !== 'none' && (
                                  <span className="text-amber-400 font-semibold">• มีสื่อมัลติมีเดีย ({q.mediaType})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Due Date & Rewards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      กำหนดส่ง (วัน/เดือน/ปี)
                    </label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={e => setFormDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">รางวัล XP</label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={formRewardXp}
                      onChange={e => setFormRewardXp(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">รางวัลเหรียญ 🪙</label>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={formRewardCoins}
                      onChange={e => setFormRewardCoins(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="urgentFlag"
                    checked={formIsUrgent}
                    onChange={e => setFormIsUrgent(e.target.checked)}
                    className="text-purple-600 rounded"
                  />
                  <label htmlFor="urgentFlag" className="text-xs text-slate-300 cursor-pointer">
                    ติดแท็ก <b className="text-rose-400">"ภารกิจด่วน"</b> (แจ้งเตือนความสำคัญระดับสูงแก่นักเรียน)
                  </label>
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
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{editingAssignment ? 'บันทึกการแก้ไข' : 'มอบหมาย & แจ้งเตือนนักเรียน'}</span>
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
