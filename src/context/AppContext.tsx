import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Student,
  Teacher,
  Subject,
  Question,
  AnswerLog,
  Badge,
  ThemeConfig,
  MascotSpeech,
  ThemeBackground,
  CardStyle,
  AppFont,
  SpacingDensity,
  Assignment,
  AssignmentSubmission,
  AppNotification,
  TowerStage,
  ShopItem,
  CertificateTemplate,
  LearningNode
} from '../types';
import {
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_BADGES,
  INITIAL_QUESTIONS,
  INITIAL_ANSWER_LOGS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ASSIGNMENT_SUBMISSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TOWER_STAGES,
  INITIAL_SHOP_ITEMS,
  INITIAL_CERTIFICATES,
  INITIAL_LEARNING_NODES
} from '../data/mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentStudent: Student;
  setCurrentStudent: (student: Student) => void;
  currentTeacher: Teacher;
  setCurrentTeacher: (teacher: Teacher) => void;
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  questions: Question[];
  badges: Badge[];
  answerLogs: AnswerLog[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  notifications: AppNotification[];
  towerStages: TowerStage[];
  shopItems: ShopItem[];
  certificates: CertificateTemplate[];
  learningNodes: LearningNode[];
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  mascotSpeech: MascotSpeech;
  setMascotSpeech: (speech: MascotSpeech) => void;
  triggerMascotTip: (message: string, mood?: MascotSpeech['mood'], durationMs?: number) => void;
  
  // Shop operations
  buyShopItem: (item: ShopItem) => { success: boolean; message: string };
  equipShopItem: (item: ShopItem) => void;

  // Learning Path
  completeLearningNode: (nodeId: string, scorePercent: number) => void;

  // Subject operations
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;

  // Assignment operations
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (assignmentId: string) => void;
  submitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'completedAt'>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;

  // Tower Stages
  updateStageStars: (stageNumber: number, stars: number) => void;

  // Question operations
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  
  // Student & Teacher operations
  addStudent: (student: Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>) => void;
  updateStudent: (student: Student) => void;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  
  // Game & Quiz Actions
  submitAnswer: (submission: {
    questionId: string;
    selectedOption: number;
    timeSpentSeconds: number;
    mode: 'practice' | 'battle' | 'exam' | 'survival' | 'matching' | 'tower' | 'crossword' | 'bomb' | 'swipe' | 'dungeon';
  }) => { isCorrect: boolean; earnedXp: number; earnedCoins: number; explanation: string };
  
  triggerConfetti: () => void;
  playSound: (type: 'correct' | 'wrong' | 'levelup' | 'battle-hit' | 'victory' | 'click') => void;
  
  // Quick Theme Switchers
  updateBackground: (bg: ThemeBackground) => void;
  updateCardStyle: (cardStyle: CardStyle) => void;
  updateFont: (font: AppFont) => void;
  updateSpacing: (spacing: SpacingDensity) => void;
}

const DEFAULT_THEME: ThemeConfig = {
  background: 'aurora-blue',
  cardStyle: 'glass',
  font: 'prompt',
  spacing: 'normal',
  buttonRadius: 'lg',
  animationsEnabled: true,
  soundEnabled: true,
  mascotEnabled: true,
  mascotCharacter: 'tutor-owl',
  mascotCostume: 'student'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state from localStorage or use defaults
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem('eduquest_role') as Role) || 'student';
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('eduquest_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(() => {
    const saved = localStorage.getItem('eduquest_current_teacher');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS[0];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eduquest_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    const saved = localStorage.getItem('eduquest_current_student');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS[0];
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('eduquest_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('eduquest_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('eduquest_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('eduquest_submissions');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENT_SUBMISSIONS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('eduquest_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [towerStages, setTowerStages] = useState<TowerStage[]>(() => {
    const saved = localStorage.getItem('eduquest_tower_stages');
    return saved ? JSON.parse(saved) : INITIAL_TOWER_STAGES;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem('eduquest_shop_items');
    return saved ? JSON.parse(saved) : INITIAL_SHOP_ITEMS;
  });

  const [certificates, setCertificates] = useState<CertificateTemplate[]>(() => {
    const saved = localStorage.getItem('eduquest_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [learningNodes, setLearningNodes] = useState<LearningNode[]>(() => {
    const saved = localStorage.getItem('eduquest_learning_nodes');
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_NODES;
  });

  const [badges] = useState<Badge[]>(INITIAL_BADGES);

  const [answerLogs, setAnswerLogs] = useState<AnswerLog[]>(() => {
    const saved = localStorage.getItem('eduquest_answer_logs');
    return saved ? JSON.parse(saved) : INITIAL_ANSWER_LOGS;
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('eduquest_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [mascotSpeech, setMascotSpeech] = useState<MascotSpeech>({
    message: 'สวัสดีครับ! ยินดีต้อนรับสู่ EduQuest มีภารกิจใหม่และโหมดเกมรอท้าทายอยู่เพียบเลย! ✨',
    mood: 'happy'
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('eduquest_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('eduquest_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('eduquest_current_teacher', JSON.stringify(currentTeacher));
  }, [currentTeacher]);

  useEffect(() => {
    localStorage.setItem('eduquest_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('eduquest_current_student', JSON.stringify(currentStudent));
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem('eduquest_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('eduquest_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('eduquest_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('eduquest_submissions', JSON.stringify(assignmentSubmissions));
  }, [assignmentSubmissions]);

  useEffect(() => {
    localStorage.setItem('eduquest_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('eduquest_tower_stages', JSON.stringify(towerStages));
  }, [towerStages]);

  useEffect(() => {
    localStorage.setItem('eduquest_shop_items', JSON.stringify(shopItems));
  }, [shopItems]);

  useEffect(() => {
    localStorage.setItem('eduquest_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('eduquest_learning_nodes', JSON.stringify(learningNodes));
  }, [learningNodes]);

  useEffect(() => {
    localStorage.setItem('eduquest_answer_logs', JSON.stringify(answerLogs));
  }, [answerLogs]);

  useEffect(() => {
    localStorage.setItem('eduquest_theme', JSON.stringify(theme));
  }, [theme]);

  // Apply font family dynamically to body
  useEffect(() => {
    document.body.className = document.body.className.replace(/font-(prompt|kanit|sarabun|mitr)/g, '');
    document.body.classList.add(`font-${theme.font}`);
  }, [theme.font]);

  // Synthetic Audio Generator with Web Audio API (iOS / Safari friendly)
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      getAudioContext();
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('touchend', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('touchend', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('touchend', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  const playSound = (type: 'correct' | 'wrong' | 'levelup' | 'battle-hit' | 'victory' | 'click') => {
    if (!theme.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'correct') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, ctx.currentTime + idx * 0.07);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.2);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'battle-hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'levelup' || type === 'victory') {
        const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.06);
          osc.stop(ctx.currentTime + i * 0.06 + 0.6);
        });
      }
    } catch {
      // Audio fallback without error
    }
  };

  const triggerConfetti = () => {
    if (!theme.animationsEnabled) return;
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
      });
    } catch {
      // Ignore
    }
  };

  const triggerMascotTip = (message: string, mood: MascotSpeech['mood'] = 'happy', durationMs: number = 6000) => {
    setMascotSpeech({ message, mood });
    if (durationMs > 0) {
      setTimeout(() => {
        setMascotSpeech(prev => {
          if (prev.message === message) {
            return { message: 'มีอะไรให้พี่ติวเตอร์ช่วย แตะที่ตัวผมได้เลยนะ!', mood: 'idle' };
          }
          return prev;
        });
      }, durationMs);
    }
  };

  // --- Subject Operations ---
  const addSubject = (newSubject: Omit<Subject, 'id'>) => {
    const id = `SUB_${Date.now()}`;
    const subject: Subject = {
      ...newSubject,
      id,
      questionCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      authorTeacherId: currentTeacher.teacherId
    };
    setSubjects(prev => [subject, ...prev]);
    triggerMascotTip(`เพิ่มรายวิชา "${subject.name}" สำเร็จแล้วครับอาจารย์! 📚`, 'cheering');
  };

  const updateSubject = (updated: Subject) => {
    setSubjects(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    triggerMascotTip(`อัปเดตข้อมูลวิชา "${updated.name}" เรียบร้อยแล้วครับ!`, 'happy');
  };

  const deleteSubject = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    triggerMascotTip(`ลบรายวิชา ${sub ? sub.name : ''} เรียบร้อยแล้วครับ!`, 'thinking');
  };

  // --- Assignment Operations ---
  const addAssignment = (newAsn: Omit<Assignment, 'id' | 'createdAt'>) => {
    const id = `ASN_${Date.now()}`;
    const assignment: Assignment = {
      ...newAsn,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      createdByTeacherId: currentTeacher.teacherId,
      teacherName: `${currentTeacher.prefix}${currentTeacher.firstName} ${currentTeacher.lastName}`
    };
    setAssignments(prev => [assignment, ...prev]);

    // Send automatic notification to assigned students
    const notifMessage = `${assignment.teacherName} ได้มอบหมายภารกิจใหม่: "${assignment.title}" กำหนดส่ง ${assignment.dueDate} (รับ +${assignment.rewardXp} XP, +${assignment.rewardCoins} 🪙)`;
    
    if (assignment.targetType === 'individual') {
      assignment.targetStudentIds.forEach(stdId => {
        sendNotification({
          userId: stdId,
          title: '🎯 มีภารกิจข้อสอบใหม่มอบหมายถึงคุณ!',
          message: notifMessage,
          type: 'assignment',
          assignmentId: id
        });
      });
    } else {
      sendNotification({
        userId: 'ALL_STUDENTS',
        title: `📢 ภารกิจข้อสอบใหม่สำหรับ ${assignment.targetClassrooms.join(', ')}`,
        message: notifMessage,
        type: 'assignment',
        assignmentId: id
      });
    }

    triggerMascotTip(`สร้างและแจ้งเตือนภารกิจ "${assignment.title}" ไปยังนักเรียนเรียบร้อยแล้วครับ! 🚀`, 'cheering');
  };

  const updateAssignment = (updated: Assignment) => {
    setAssignments(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    triggerMascotTip(`แก้ไขภารกิจ "${updated.title}" สำเร็จ!`, 'happy');
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    triggerMascotTip('ลบภารกิจเรียบร้อยแล้วครับ!', 'thinking');
  };

  const submitAssignment = (subm: Omit<AssignmentSubmission, 'id' | 'completedAt'>) => {
    const id = `SUBM_${Date.now()}`;
    const submission: AssignmentSubmission = {
      ...subm,
      id,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setAssignmentSubmissions(prev => [submission, ...prev]);

    // Reward student
    const updatedStudent: Student = {
      ...currentStudent,
      xp: currentStudent.xp + subm.earnedXp,
      coins: currentStudent.coins + subm.earnedCoins,
      level: Math.floor((currentStudent.xp + subm.earnedXp) / 500) + 1,
      completedQuizzes: currentStudent.completedQuizzes + 1
    };
    updateStudent(updatedStudent);

    triggerConfetti();
    playSound('victory');
    triggerMascotTip(`ยินดีด้วย! ส่งภารกิจสำเร็จ ได้รับ +${subm.earnedXp} XP และ +${subm.earnedCoins} เหรียญทอง! 🎉`, 'cheering');
  };

  // --- Notification Operations ---
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    playSound('click');
  };

  const sendNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- Tower Stages ---
  const updateStageStars = (stageNumber: number, stars: number) => {
    setTowerStages(prev => {
      const nextStages = prev.map(stage => {
        if (stage.stageNumber === stageNumber) {
          return {
            ...stage,
            starsEarned: Math.max(stage.starsEarned, stars),
            isCompleted: true
          };
        }
        return stage;
      });

      // Recalculate unlocked stages
      const totalStars = nextStages.reduce((acc, s) => acc + s.starsEarned, 0);
      return nextStages.map(stage => ({
        ...stage,
        isUnlocked: totalStars >= stage.requiredStars
      }));
    });
  };

  // --- Question Operations ---
  const addQuestion = (newQ: Omit<Question, 'id' | 'createdAt'>) => {
    const id = `Q_${Date.now()}`;
    const question: Question = {
      ...newQ,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      timesAnswered: 0,
      timesCorrect: 0
    };
    setQuestions(prev => [question, ...prev]);
    triggerMascotTip('เพิ่มข้อสอบลงคลังเรียบร้อยแล้วครับอาจารย์! 📝', 'cheering');
  };

  const updateQuestion = (updated: Question) => {
    setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)));
    triggerMascotTip('อัปเดตข้อมูลข้อสอบสำเร็จแล้วครับ!', 'happy');
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    triggerMascotTip('ลบข้อสอบออกจากคลังแล้วครับ!', 'thinking');
  };

  const addStudent = (newS: Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>) => {
    const id = `STD_${Date.now()}`;
    const student: Student = {
      ...newS,
      id,
      level: 1,
      xp: 0,
      coins: 50,
      streakDays: 1,
      title: 'นักเรียนใหม่แกะกล่อง',
      completedQuizzes: 0,
      battleWins: 0,
      battleLosses: 0,
      accuracy: 100,
      badgeIds: ['BADGE_FIRST_WIN']
    };
    setStudents(prev => [student, ...prev]);
  };

  const updateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    if (currentStudent.id === updated.id) {
      setCurrentStudent(updated);
    }
  };

  const addTeacher = (teacher: Teacher) => {
    setTeachers(prev => [teacher, ...prev]);
  };

  const updateTeacher = (teacher: Teacher) => {
    setTeachers(prev => prev.map(t => (t.teacherId === teacher.teacherId ? teacher : t)));
    if (currentTeacher.teacherId === teacher.teacherId) {
      setCurrentTeacher(teacher);
    }
  };

  const submitAnswer = (submission: {
    questionId: string;
    selectedOption: number;
    timeSpentSeconds: number;
    mode: 'practice' | 'battle' | 'exam' | 'survival' | 'matching' | 'tower' | 'crossword' | 'bomb' | 'swipe' | 'dungeon';
  }) => {
    const q = questions.find(item => item.id === submission.questionId);
    if (!q) {
      return { isCorrect: false, earnedXp: 0, earnedCoins: 0, explanation: '' };
    }

    const isCorrect = submission.selectedOption === q.correctIndex;
    let earnedXp = isCorrect ? (q.difficulty === 'hard' ? 70 : q.difficulty === 'medium' ? 50 : 35) : 10;
    let earnedCoins = isCorrect ? (q.difficulty === 'hard' ? 15 : q.difficulty === 'medium' ? 10 : 5) : 2;

    if (isCorrect && submission.timeSpentSeconds < 8) {
      earnedXp += 15; // Speed bonus
    }

    // Update stats on question
    setQuestions(prev =>
      prev.map(item => {
        if (item.id === q.id) {
          return {
            ...item,
            timesAnswered: (item.timesAnswered || 0) + 1,
            timesCorrect: (item.timesCorrect || 0) + (isCorrect ? 1 : 0)
          };
        }
        return item;
      })
    );

    // Update current student progress
    const updatedStudent: Student = {
      ...currentStudent,
      xp: currentStudent.xp + earnedXp,
      coins: currentStudent.coins + earnedCoins,
      level: Math.floor((currentStudent.xp + earnedXp) / 500) + 1,
      completedQuizzes: currentStudent.completedQuizzes + 1,
      accuracy: Math.round(
        ((currentStudent.completedQuizzes * (currentStudent.accuracy / 100) + (isCorrect ? 1 : 0)) /
          (currentStudent.completedQuizzes + 1)) *
          100
      )
    };

    updateStudent(updatedStudent);

    // Record rich answer log for teacher item analysis & student review
    const selectedText = q.options[submission.selectedOption] || (submission.selectedOption === 0 ? 'จริง (True)' : 'เท็จ (False)');
    const correctText = q.options[q.correctIndex] || (q.correctIndex === 0 ? 'จริง (True)' : 'เท็จ (False)');

    const newLog: AnswerLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: currentStudent.id,
      studentName: `${currentStudent.prefix}${currentStudent.firstName} ${currentStudent.lastName}`,
      classroom: currentStudent.classroom,
      questionId: q.id,
      questionText: q.questionText,
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      selectedOption: submission.selectedOption,
      selectedOptionText: selectedText,
      correctOption: q.correctIndex,
      correctOptionText: correctText,
      explanation: q.explanation,
      difficulty: q.difficulty,
      isCorrect,
      timeSpentSeconds: submission.timeSpentSeconds,
      earnedXp,
      earnedCoins,
      mode: submission.mode,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setAnswerLogs(prev => [newLog, ...prev]);

    if (isCorrect) {
      playSound('correct');
      triggerMascotTip('เก่งมากกก! ตอบถูกต้องเลยครับ รับแต้ม XP ไปเต็มๆ! 🌟', 'cheering');
    } else {
      playSound('wrong');
      triggerMascotTip('ข้อนี้เกือบถูกแล้วนะ! ดูคำอธิบายเฉลยแล้วลองจำไว้ใช้นะครับ สู้ๆ 💪', 'thinking');
    }

    return {
      isCorrect,
      earnedXp,
      earnedCoins,
      explanation: q.explanation
    };
  };

  const updateBackground = (bg: ThemeBackground) => {
    setTheme(prev => ({ ...prev, background: bg }));
  };

  const updateCardStyle = (cardStyle: CardStyle) => {
    setTheme(prev => ({ ...prev, cardStyle }));
  };

  const updateFont = (font: AppFont) => {
    setTheme(prev => ({ ...prev, font }));
  };

  const updateSpacing = (spacing: SpacingDensity) => {
    setTheme(prev => ({ ...prev, spacing }));
  };

  // Shop item purchase & equip
  const buyShopItem = (item: ShopItem): { success: boolean; message: string } => {
    if (currentStudent.coins < item.price) {
      playSound('wrong');
      return { success: false, message: `เหรียญทองไม่เพียงพอ (ต้องการ ${item.price} เหรียญ มี ${currentStudent.coins} เหรียญ)` };
    }

    if (currentStudent.level < item.requiredLevel) {
      playSound('wrong');
      return { success: false, message: `ต้องการเลเวล ${item.requiredLevel} ขึ้นไปเพื่อปลดล็อกไอเทมนี้` };
    }

    const updatedCoins = currentStudent.coins - item.price;
    const updatedStudent = { ...currentStudent, coins: updatedCoins };
    updateStudent(updatedStudent);

    setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, isPurchased: true } : i));
    playSound('victory');
    triggerConfetti();
    triggerMascotTip(`เย้! ซื้อ "${item.name}" สำเร็จแล้ว! นำไปใส่แต่งตัวได้เลย! 🛍️🎉`, 'proud');

    return { success: true, message: `ซื้อ "${item.name}" เรียบร้อยแล้ว!` };
  };

  const equipShopItem = (item: ShopItem) => {
    setShopItems(prev =>
      prev.map(i => {
        if (i.category === item.category) {
          return { ...i, isEquipped: i.id === item.id };
        }
        return i;
      })
    );

    if (item.category === 'avatar') {
      updateStudent({ ...currentStudent, avatar: item.icon });
    } else if (item.category === 'title') {
      updateStudent({ ...currentStudent, title: item.name });
    }

    playSound('click');
    triggerMascotTip(`สวมใส่ "${item.name}" เท่สุดๆ ไปเลย! ✨`, 'cheering');
  };

  // Learning Path Node Completion
  const completeLearningNode = (nodeId: string, scorePercent: number) => {
    setLearningNodes(prev => {
      const idx = prev.findIndex(n => n.id === nodeId);
      if (idx === -1) return prev;

      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        isCompleted: true,
        scorePercent: Math.max(updated[idx].scorePercent || 0, scorePercent)
      };

      // Unlock next node
      if (idx + 1 < updated.length) {
        updated[idx + 1] = {
          ...updated[idx + 1],
          isUnlocked: true
        };
      }

      return updated;
    });

    playSound('levelup');
    triggerConfetti();
    triggerMascotTip('ยินดีด้วย! พิชิตด่านเส้นทางการเรียนรู้สำเร็จ ปลดล็อกด่านถัดไปแล้ว! 🗺️🎖️', 'cheering');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentStudent,
        setCurrentStudent,
        currentTeacher,
        setCurrentTeacher,
        teachers,
        students,
        subjects,
        questions,
        badges,
        answerLogs,
        assignments,
        assignmentSubmissions,
        notifications,
        towerStages,
        shopItems,
        certificates,
        learningNodes,
        theme,
        setTheme,
        mascotSpeech,
        setMascotSpeech,
        triggerMascotTip,
        buyShopItem,
        equipShopItem,
        completeLearningNode,
        addSubject,
        updateSubject,
        deleteSubject,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        markNotificationRead,
        markAllNotificationsRead,
        sendNotification,
        updateStageStars,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addStudent,
        updateStudent,
        addTeacher,
        updateTeacher,
        submitAnswer,
        triggerConfetti,
        playSound,
        updateBackground,
        updateCardStyle,
        updateFont,
        updateSpacing
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
