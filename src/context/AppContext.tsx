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
  LearningNode,
  ClanId
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
  INITIAL_LEARNING_NODES,
  DEFAULT_EMPTY_STUDENT
} from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  resolveActiveGasUrl,
  generateShareableAppUrl,
  STORAGE_KEY_GAS_URL,
  STORAGE_KEY_GAS_CONNECTED,
  STORAGE_KEY_LAST_SYNC
} from '../config/gasConfig';
import {
  testGasConnection as testGasApi,
  syncAllFromGas,
  pushStudentToGas,
  deleteStudentFromGas,
  pushTeacherToGas,
  deleteTeacherFromGas,
  pushQuestionToGas,
  deleteQuestionFromGas,
  syncTeachersToGas,
  syncStudentsToGas,
  syncQuestionsToGas,
  submitAnswerLogToGas,
  fetchStudentsFromGas,
  fetchTeachersFromGas,
  fetchQuestionsFromGas,
  fetchSubjectsFromGas
} from '../services/apiService';

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
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  sendNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;

  // Tower Stages
  updateStageStars: (stageNumber: number, stars: number) => void;

  // Question operations
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  
  // Student & Teacher operations
  addStudent: (student: Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>) => Promise<{ success: boolean; message: string; student?: Student }>;
  updateStudent: (student: Student) => Promise<{ success: boolean; message: string }>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; message: string }>;
  clearAllStudents: () => void;
  bulkAddStudents: (students: Array<Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>>) => Promise<{ success: boolean; message: string; count: number }>;
  addTeacher: (teacher: Teacher) => Promise<{ success: boolean; message: string }>;
  updateTeacher: (teacher: Teacher) => Promise<{ success: boolean; message: string }>;
  deleteTeacher: (teacherId: string) => Promise<{ success: boolean; message: string }>;
  
  // Test Data & Production Reset
  clearTestScoresAndLogs: () => void;
  clearAllAssignments: () => void;
  clearAllQuestions: () => void;
  resetAllTestDataForProduction: () => { success: boolean; message: string };
  
  // Authentication & Security
  isAuthenticated: boolean;
  teacherPin: string;
  requireStudentPassword: boolean;
  requireTeacherPin: boolean;
  setRequireStudentPassword: (required: boolean) => void;
  setRequireTeacherPin: (required: boolean) => void;
  loginAsStudent: (student: Student, pinInput?: string) => { success: boolean; message?: string };
  loginWithStudentCode: (codeOrId: string, pinInput?: string) => Promise<{ success: boolean; message?: string; student?: Student }>;
  loginAsTeacher: (teacher: Teacher, pin?: string) => { success: boolean; message?: string };
  loginWithTeacherCredentials: (identifier: string, pinInput?: string) => Promise<{ success: boolean; message?: string; teacher?: Teacher }>;
  logout: () => void;
  updateTeacherPin: (newPin: string) => { success: boolean; message: string };
  verifyTeacherPin: (pin: string) => boolean;
  updateStudentPin: (studentId: string, newPin: string) => { success: boolean; message: string };

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

  // Google Sheets (GAS) Database Integration & Realtime Sync
  gasUrl: string;
  setGasUrl: (url: string) => void;
  isGasConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  testGasConnection: (testUrl?: string) => Promise<{ success: boolean; message: string }>;
  syncAllToGas: () => Promise<{ success: boolean; message: string }>;
  fetchDataFromGas: (url?: string, silent?: boolean) => Promise<{ success: boolean; message: string; counts?: { teachers: number; students: number; questions: number; subjects: number } }>;
  pushStudentRealtime: (student: Student) => void;
  pushTeacherRealtime: (teacher: Teacher) => void;
  pushQuestionRealtime: (question: Question) => void;
  getShareableStudentLink: (overrideUrl?: string) => string;

  // Teacher Quick Controls
  toggleSound: () => void;
  toggleMascot: () => void;
  toggleAnimations: () => void;
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isAuth = localStorage.getItem('eduquest_is_authenticated') === 'true';
    if (!isAuth) return false;
    const currentRole = localStorage.getItem('eduquest_role') || 'student';
    if (currentRole === 'student') {
      try {
        const raw = localStorage.getItem('eduquest_current_student');
        if (!raw) return false;
        const cur = JSON.parse(raw);
        if (!cur || !cur.id || cur.id === 'STD_EMPTY' || cur.id.startsWith('STD_00') || cur.firstName === 'นักเรียนใหม่') {
          localStorage.removeItem('eduquest_is_authenticated');
          return false;
        }
      } catch {
        return false;
      }
    }
    return true;
  });

  const [teacherPin, setTeacherPin] = useState<string>(() => {
    return localStorage.getItem('eduquest_teacher_pin') || '1234';
  });

  const [requireStudentPassword, setRequireStudentPasswordState] = useState<boolean>(() => {
    return localStorage.getItem('eduquest_require_student_password') === 'true';
  });

  const [requireTeacherPin, setRequireTeacherPinState] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduquest_require_teacher_pin');
    return saved === null ? true : saved === 'true';
  });

  // Safe Storage Helper to eliminate undefined/corrupted state bugs
  function safeStorageGet<T>(key: string, fallback: T, validator?: (data: any) => boolean): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || raw === 'undefined' || raw === 'null') return fallback;
      const parsed = JSON.parse(raw);
      if (validator) {
        return validator(parsed) ? (parsed as T) : fallback;
      }
      return (parsed ?? fallback) as T;
    } catch (err) {
      console.warn(`SafeStorage parse error for ${key}:`, err);
      return fallback;
    }
  }

  const FALLBACK_TEACHER: Teacher = (INITIAL_TEACHERS && INITIAL_TEACHERS[0] && (INITIAL_TEACHERS[0].teacherId || (INITIAL_TEACHERS[0] as any).id))
    ? INITIAL_TEACHERS[0]
    : {
        teacherId: 'T001',
        prefix: 'ครู',
        firstName: 'อิศรา',
        lastName: '',
        role: 'ผู้ดูแลระบบและครูผู้สอน',
        department: 'วิชาการ',
        email: 'farmissara@gmail.com',
        assignedSubjects: ['SUB_ALL']
      };

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const loaded = safeStorageGet<Teacher[]>(
      'eduquest_teachers',
      INITIAL_TEACHERS && INITIAL_TEACHERS.length > 0 ? INITIAL_TEACHERS : [FALLBACK_TEACHER],
      arr => Array.isArray(arr) && arr.length > 0 && arr.every(t => t && (t.teacherId || (t as any).id))
    );
    return loaded.length > 0 ? loaded : [FALLBACK_TEACHER];
  });

  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(() => {
    return safeStorageGet<Teacher>(
      'eduquest_current_teacher',
      FALLBACK_TEACHER,
      t => Boolean(t && typeof t === 'object' && (t.teacherId || (t as any).id))
    );
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const raw = safeStorageGet<Student[]>('eduquest_students', []);
    if (!Array.isArray(raw)) return [];
    // Filter out mock students from previous sessions
    return raw.filter(
      s => s && s.id && s.id !== 'STD_EMPTY' && !s.id.startsWith('STD_00') && s.firstName !== 'นักเรียนใหม่'
    );
  });

  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    const raw = safeStorageGet<Student | null>('eduquest_current_student', null);
    if (raw && raw.id && raw.id !== 'STD_EMPTY' && !raw.id.startsWith('STD_00') && raw.firstName !== 'นักเรียนใหม่') {
      return raw;
    }
    return DEFAULT_EMPTY_STUDENT;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    return safeStorageGet<Subject[]>(
      'eduquest_subjects',
      INITIAL_SUBJECTS && INITIAL_SUBJECTS.length > 0 ? INITIAL_SUBJECTS : [],
      arr => Array.isArray(arr) && (arr.length === 0 || arr.every(sub => sub && sub.id))
    );
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    return safeStorageGet<Question[]>('eduquest_questions', INITIAL_QUESTIONS || []);
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    return safeStorageGet<Assignment[]>('eduquest_assignments', INITIAL_ASSIGNMENTS || []);
  });

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    return safeStorageGet<AssignmentSubmission[]>('eduquest_submissions', INITIAL_ASSIGNMENT_SUBMISSIONS || []);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return safeStorageGet<AppNotification[]>('eduquest_notifications', INITIAL_NOTIFICATIONS || []);
  });

  const [towerStages, setTowerStages] = useState<TowerStage[]>(() => {
    return safeStorageGet<TowerStage[]>('eduquest_tower_stages', INITIAL_TOWER_STAGES || []);
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    return safeStorageGet<ShopItem[]>('eduquest_shop_items', INITIAL_SHOP_ITEMS || []);
  });

  const [certificates, setCertificates] = useState<CertificateTemplate[]>(() => {
    return safeStorageGet<CertificateTemplate[]>('eduquest_certificates', INITIAL_CERTIFICATES || []);
  });

  const [learningNodes, setLearningNodes] = useState<LearningNode[]>(() => {
    return safeStorageGet<LearningNode[]>('eduquest_learning_nodes', INITIAL_LEARNING_NODES || []);
  });

  const [badges] = useState<Badge[]>(INITIAL_BADGES || []);

  const [answerLogs, setAnswerLogs] = useState<AnswerLog[]>(() => {
    return safeStorageGet<AnswerLog[]>('eduquest_answer_logs', INITIAL_ANSWER_LOGS || []);
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    return safeStorageGet<ThemeConfig>('eduquest_theme', DEFAULT_THEME);
  });

  // Google Sheets (GAS) Database URL & Status
  const [gasUrl, setGasUrlState] = useState<string>(() => {
    return resolveActiveGasUrl();
  });
  const [isGasConnected, setIsGasConnected] = useState<boolean>(() => {
    const resolved = resolveActiveGasUrl();
    return !!resolved && (!!localStorage.getItem(STORAGE_KEY_GAS_CONNECTED) || resolved.length > 10);
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    return saved ? new Date(saved) : null;
  });

  const getShareableStudentLink = (overrideUrl?: string) => {
    return generateShareableAppUrl(overrideUrl || gasUrl);
  };

  const setGasUrl = (url: string) => {
    const trimmed = url.trim();
    setGasUrlState(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_GAS_URL, trimmed);
      localStorage.setItem(STORAGE_KEY_GAS_CONNECTED, 'true');
      setIsGasConnected(true);
      testGasConnection(trimmed);
      fetchDataFromGas(trimmed, false);
    } else {
      localStorage.removeItem(STORAGE_KEY_GAS_URL);
      localStorage.removeItem(STORAGE_KEY_GAS_CONNECTED);
      setIsGasConnected(false);
    }
  };

  const testGasConnection = async (testUrl?: string): Promise<{ success: boolean; message: string }> => {
    const targetUrl = (testUrl !== undefined ? testUrl : gasUrl).trim();
    if (!targetUrl) {
      setIsGasConnected(false);
      localStorage.removeItem(STORAGE_KEY_GAS_CONNECTED);
      return { success: false, message: 'กรุณากรอก Web App URL ก่อนทดสอบครับ' };
    }

    try {
      const res = await testGasApi(targetUrl);
      if (res.success) {
        setIsGasConnected(true);
        localStorage.setItem(STORAGE_KEY_GAS_CONNECTED, 'true');
        return res;
      }
      return res;
    } catch {
      // Fallback: try pinging via POST
      try {
        await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'test' }),
          mode: 'no-cors'
        });
        setIsGasConnected(true);
        localStorage.setItem(STORAGE_KEY_GAS_CONNECTED, 'true');
        return {
          success: true,
          message: 'เชื่อมต่อส่งข้อมูลเข้า Google Sheets สำเร็จเรียบร้อยแล้ว!'
        };
      } catch {
        setIsGasConnected(false);
        localStorage.removeItem(STORAGE_KEY_GAS_CONNECTED);
        return {
          success: false,
          message: 'ไม่สามารถเชื่อมต่อได้: กรุณาตรวจสอบว่าตั้งค่า "Who has access: Anyone" ใน Apps Script หรือยัง'
        };
      }
    }

    return {
      success: true,
      message: 'เชื่อมต่อกับ Google Apps Script สำเร็จเรียบร้อยแล้ว!'
    };
  };

  // Real-time Push Helpers to immediately sync single entity changes
  const pushStudentRealtime = (student: Student) => {
    if (!gasUrl) return;
    pushStudentToGas(student, gasUrl).catch(() => {});
    // Resilient fallback direct POST
    try {
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveStudent', student }),
        mode: 'no-cors'
      }).catch(() => {});
    } catch {
      // silent
    }
  };

  const pushTeacherRealtime = (teacher: Teacher) => {
    if (!gasUrl) return;
    pushTeacherToGas(teacher, gasUrl).catch(() => {});
    // Resilient fallback direct POST
    try {
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveTeacher', teacher }),
        mode: 'no-cors'
      }).catch(() => {});
    } catch {
      // silent
    }
  };

  const pushQuestionRealtime = (question: Question) => {
    if (!gasUrl) return;
    pushQuestionToGas(question, gasUrl).catch(() => {});
    try {
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveQuestion', question }),
        mode: 'no-cors'
      }).catch(() => {});
    } catch {
      // silent
    }
  };

  const syncAllToGas = async (): Promise<{ success: boolean; message: string }> => {
    if (!gasUrl) {
      return { success: false, message: 'ยังไม่ได้ระบุ Web App URL กรุณาเชื่อมต่อก่อนครับ' };
    }
    setIsSyncing(true);
    try {
      // Sync all datasets: Teachers, Students, Questions
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncTeachers', teachers }),
        mode: 'no-cors'
      });
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncStudents', students }),
        mode: 'no-cors'
      });
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncQuestions', questions }),
        mode: 'no-cors'
      });

      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('eduquest_last_sync_time', now.toISOString());
      setIsSyncing(false);

      return {
        success: true,
        message: `ซิงค์ข้อมูลสำเร็จ! ส่งข้อมูลคณะครู ${teachers.length} ท่าน, นักเรียน ${students.length} คน, และข้อสอบ ${questions.length} ข้อขึ้น Google Sheets เรียบร้อยแล้ว`
      };
    } catch (err: any) {
      setIsSyncing(false);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล: ' + err.toString()
      };
    }
  };

  const fetchDataFromGas = async (
    overrideUrl?: string,
    silent: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    counts?: { teachers: number; students: number; questions: number; subjects: number };
  }> => {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : gasUrl).trim();
    if (!targetUrl) {
      return { success: false, message: 'ยังไม่ได้ระบุ Web App URL กรุณาเชื่อมต่อก่อนครับ' };
    }
    const separator = targetUrl.includes('?') ? '&' : '?';
    setIsSyncing(true);

    let fetchedTeachersCount = 0;
    let fetchedStudentsCount = 0;
    let fetchedQuestionsCount = 0;
    let fetchedSubjectsCount = 0;

    try {
      // 1. Fetch Students
      try {
        const res = await fetch(`${targetUrl}${separator}action=getStudents&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.students;
          if (Array.isArray(list) && list.length > 0) {
            const valid = list.filter((s: any) => s && (s.id || s.studentCode || s.StudentCode || s['รหัสนักเรียน']));
            if (valid.length > 0) {
              const formatted: Student[] = valid.map((s: any) => {
                const code = String(s.studentCode || s.StudentCode || s['รหัสนักเรียน'] || s.id || '').trim();
                const prefix = String(s.prefix || s.Prefix || s['คำนำหน้า'] || 'ด.ช.').trim();
                const firstName = String(s.firstName || s.FirstName || s['ชื่อ'] || '').trim();
                const lastName = String(s.lastName || s.LastName || s['นามสกุล'] || '').trim();
                const classroom = String(s.classroom || s.Classroom || s['ชั้นเรียน'] || 'ป.1/1').trim();
                const number = Number(s.number || s.Number || s['เลขที่']) || 1;
                const level = Number(s.level || s.Level || s['เลเวล (Lv)']) || 1;
                const xp = Number(s.xp || s.XP || s['XP สะสม']) || 0;
                const coins = Number(s.coins || s.Coins || s['เหรียญทอง']) || 0;
                const streakDays = Number(s.streakDays || s.StreakDays || s['สตรีค (วัน)']) || 0;
                const battleWins = Number(s.battleWins || s.BattleWins || s['ชนะแบทเทิล']) || 0;
                const battleLosses = Number(s.battleLosses || s.BattleLosses) || 0;
                const completedQuizzes = Number(s.completedQuizzes || s.CompletedQuizzes) || 0;
                const rawAcc = s.accuracy !== undefined ? s.accuracy : s.Accuracy !== undefined ? s.Accuracy : s['ความแม่นยำ (%)'];
                const accuracy = rawAcc !== undefined ? Number(String(rawAcc).replace('%', '')) : 100;

                return {
                  id: s.id || `STD_${code || Math.random().toString(36).substring(2, 7)}`,
                  studentCode: code,
                  prefix,
                  firstName,
                  lastName,
                  classroom,
                  number,
                  avatar: s.avatar || s['อวตาร'] || '🌱',
                  level,
                  xp,
                  coins,
                  streakDays,
                  title: s.title || s['ฉายา'] || 'นักเรียนยอดนักสู้',
                  clanId: (s.clanId || 'fire') as ClanId,
                  completedQuizzes,
                  battleWins,
                  battleLosses,
                  accuracy: isNaN(accuracy) ? 100 : accuracy,
                  badgeIds: Array.isArray(s.badgeIds) ? s.badgeIds : [],
                  pin: s.pin ? String(s.pin) : undefined
                };
              });

              // Exclude any mock items
              const realStudents = formatted.filter(
                s => s.id !== 'STD_EMPTY' && !s.id.startsWith('STD_00') && s.firstName !== 'นักเรียนใหม่'
              );

              if (realStudents.length > 0) {
                setStudents(realStudents);
                localStorage.setItem('eduquest_students', JSON.stringify(realStudents));
                fetchedStudentsCount = realStudents.length;

                // If current student is empty or is not in the real students, update current student
                setCurrentStudent(prev => {
                  const match = realStudents.find(s => s.studentCode === prev?.studentCode || s.id === prev?.id);
                  if (match) return match;
                  return prev?.id && prev.id !== 'STD_EMPTY' ? prev : realStudents[0];
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching students from Google Sheets:', e);
      }

      // 2. Fetch Teachers
      try {
        const res = await fetch(`${targetUrl}${separator}action=getTeachers&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.teachers;
          if (Array.isArray(list) && list.length > 0) {
            const valid = list.filter((t: any) => t && (t.teacherId || t.TeacherID || t.id || t['รหัสครู']));
            if (valid.length > 0) {
              const formatted: Teacher[] = valid.map((t: any) => ({
                teacherId: String(t.teacherId || t.TeacherID || t.id || t['รหัสครู'] || 'T001').trim(),
                prefix: String(t.prefix || t.Prefix || t['คำนำหน้า'] || 'ครู').trim(),
                firstName: String(t.firstName || t.FirstName || t['ชื่อ'] || 'ผู้สอน').trim(),
                lastName: String(t.lastName || t.LastName || t['นามสกุล'] || '').trim(),
                role: String(t.role || t.Role || t['ตำแหน่ง / บทบาท'] || 'ครูผู้สอน').trim(),
                department: String(t.department || t.Department || t['กลุ่มสาระการเรียนรู้'] || 'วิชาการ').trim(),
                email: String(t.email || t.Email || t['อีเมล'] || '').trim(),
                assignedSubjects: Array.isArray(t.assignedSubjects)
                  ? t.assignedSubjects
                  : typeof t.assignedSubjects === 'string'
                  ? t.assignedSubjects.split(',').map((s: string) => s.trim())
                  : ['SUB_ALL'],
                pin: t.pin ? String(t.pin) : '1234'
              }));
              setTeachers(formatted);
              localStorage.setItem('eduquest_teachers', JSON.stringify(formatted));
              if (formatted.length > 0) {
                setCurrentTeacher(prev => {
                  const match = formatted.find(t => t.teacherId === prev?.teacherId);
                  return match || formatted[0];
                });
              }
              fetchedTeachersCount = formatted.length;
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching teachers from Google Sheets:', e);
      }

      // 3. Fetch Questions
      try {
        const res = await fetch(`${targetUrl}${separator}action=getQuestions&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.questions;
          if (Array.isArray(list) && list.length > 0) {
            const valid = list.filter((q: any) => q && (q.questionText || q.QuestionText || q['โจทย์คำถาม']));
            if (valid.length > 0) {
              const formatted: Question[] = valid.map((q: any, idx: number) => {
                const options = Array.isArray(q.options)
                  ? q.options
                  : [
                      String(q.option1 || q['ตัวเลือก ก'] || ''),
                      String(q.option2 || q['ตัวเลือก ข'] || ''),
                      String(q.option3 || q['ตัวเลือก ค'] || ''),
                      String(q.option4 || q['ตัวเลือก ง'] || '')
                    ];
                const correctIndex = Number(
                  q.correctIndex !== undefined
                    ? q.correctIndex
                    : q.CorrectIndex !== undefined
                    ? q.CorrectIndex
                    : q['ข้อที่ถูกต้อง (0-3)']
                ) || 0;

                return {
                  id: q.id || q.QuestionID || q['ID ข้อสอบ'] || `Q_${idx + 1}`,
                  subjectId: q.subjectId || 'SUB_THAI',
                  subjectName: String(q.subjectName || q.SubjectName || q['วิชา'] || 'วิชาการ').trim(),
                  gradeLevel: String(q.gradeLevel || q.GradeLevel || q['ระดับชั้น'] || 'ป.1').trim(),
                  questionText: String(q.questionText || q.QuestionText || q['โจทย์คำถาม']).trim(),
                  options,
                  correctIndex,
                  explanation: String(q.explanation || q.Explanation || q['คำอธิบายเฉลย'] || '').trim(),
                  timeLimitSeconds: Number(q.timeLimitSeconds || q['เวลา (วินาที)']) || 20,
                  difficulty: (q.difficulty || q['ระดับความยาก'] || 'medium') as 'easy' | 'medium' | 'hard',
                  type: (q.type || 'multiple_choice') as 'multiple_choice' | 'true_false',
                  tags: Array.isArray(q.tags) ? q.tags : ['ทั่วไป'],
                  createdAt: q.createdAt || new Date().toISOString()
                };
              });
              setQuestions(formatted);
              localStorage.setItem('eduquest_questions', JSON.stringify(formatted));
              fetchedQuestionsCount = formatted.length;
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching questions from Google Sheets:', e);
      }

      // 4. Fetch Subjects
      try {
        const res = await fetch(`${targetUrl}${separator}action=getSubjects&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.subjects;
          if (Array.isArray(list) && list.length > 0) {
            const valid = list.filter((s: any) => s && s.id && s.name);
            if (valid.length > 0) {
              setSubjects(valid);
              localStorage.setItem('eduquest_subjects', JSON.stringify(valid));
              fetchedSubjectsCount = valid.length;
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching subjects from Google Sheets:', e);
      }

      setIsGasConnected(true);
      localStorage.setItem('eduquest_gas_connected', 'true');
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('eduquest_last_sync_time', now.toISOString());
      setIsSyncing(false);

      if (!silent) {
        triggerMascotTip(
          `ดึงข้อมูลจริงจาก Google Sheets เรียบร้อยแล้ว! (ครู: ${fetchedTeachersCount}, นักเรียน: ${fetchedStudentsCount}, ข้อสอบ: ${fetchedQuestionsCount}) ✨`,
          'happy'
        );
      }

      return {
        success: true,
        message: `ดึงข้อมูลจาก Google Sheets เรียบร้อยแล้ว! (ครู: ${fetchedTeachersCount}, นักเรียน: ${fetchedStudentsCount}, ข้อสอบ: ${fetchedQuestionsCount}, วิชา: ${fetchedSubjectsCount})`,
        counts: {
          teachers: fetchedTeachersCount,
          students: fetchedStudentsCount,
          questions: fetchedQuestionsCount,
          subjects: fetchedSubjectsCount
        }
      };
    } catch (err: any) {
      setIsSyncing(false);
      return {
        success: false,
        message: 'ไม่สามารถดึงข้อมูลจาก Google Sheets ได้: ' + err.toString()
      };
    }
  };

  // Continuous Real-time Background Sync (every 30s + on tab visibility change)
  useEffect(() => {
    if (!gasUrl) return;

    // Initial silent sync on mount
    fetchDataFromGas(gasUrl, true);

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDataFromGas(gasUrl, true);
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDataFromGas(gasUrl, true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gasUrl]);

  // One-time startup migration: purge any old mock student records from localStorage
  useEffect(() => {
    try {
      const rawStd = localStorage.getItem('eduquest_students');
      if (rawStd) {
        const parsed = JSON.parse(rawStd);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            s => s && s.id && s.id !== 'STD_EMPTY' && !s.id.startsWith('STD_00') && s.firstName !== 'นักเรียนใหม่'
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('eduquest_students', JSON.stringify(cleaned));
            setStudents(cleaned);
          }
        }
      }
      const curStd = localStorage.getItem('eduquest_current_student');
      if (curStd) {
        const parsed = JSON.parse(curStd);
        if (parsed?.id === 'STD_EMPTY' || parsed?.id?.startsWith('STD_00') || parsed?.firstName === 'นักเรียนใหม่') {
          localStorage.removeItem('eduquest_current_student');
          setCurrentStudent(DEFAULT_EMPTY_STUDENT);
          localStorage.removeItem('eduquest_is_authenticated');
          setIsAuthenticated(false);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSound = () => {
    setTheme(prev => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      localStorage.setItem('eduquest_theme', JSON.stringify(next));
      return next;
    });
  };

  const toggleMascot = () => {
    setTheme(prev => {
      const next = { ...prev, mascotEnabled: !prev.mascotEnabled };
      localStorage.setItem('eduquest_theme', JSON.stringify(next));
      return next;
    });
  };

  const toggleAnimations = () => {
    setTheme(prev => {
      const next = { ...prev, animationsEnabled: !prev.animationsEnabled };
      localStorage.setItem('eduquest_theme', JSON.stringify(next));
      return next;
    });
  };

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
    pushQuestionRealtime(question);
    triggerMascotTip('เพิ่มข้อสอบลงคลังเรียบร้อยแล้วครับอาจารย์! 📝', 'cheering');
  };

  const updateQuestion = (updated: Question) => {
    setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)));
    pushQuestionRealtime(updated);
    triggerMascotTip('อัปเดตข้อมูลข้อสอบสำเร็จแล้วครับ!', 'happy');
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    triggerMascotTip('ลบข้อสอบออกจากคลังแล้วครับ!', 'thinking');
  };

  const addStudent = async (newS: Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>): Promise<{ success: boolean; message: string; student?: Student }> => {
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
    const nextStudents = [student, ...students];
    setStudents(nextStudents);
    localStorage.setItem('eduquest_students', JSON.stringify(nextStudents));
    pushStudentRealtime(student);

    if (gasUrl) {
      try {
        await syncStudentsToGas(nextStudents, gasUrl);
        return {
          success: true,
          message: `บันทึกนักเรียน ${student.prefix}${student.firstName} ${student.lastName} ลง Google Sheets เรียบร้อยแล้ว 📊`,
          student
        };
      } catch (err) {
        console.warn('Silent sync error:', err);
      }
    }
    return {
      success: true,
      message: `บันทึกนักเรียน ${student.prefix}${student.firstName} ในระบบเรียบร้อยแล้ว`,
      student
    };
  };

  const updateStudent = async (updated: Student): Promise<{ success: boolean; message: string }> => {
    if (!updated || !updated.id) return { success: false, message: 'ไม่มีข้อมูลนักเรียน' };
    const nextStudents = students.map(s => (s && s.id === updated.id ? updated : s));
    setStudents(nextStudents);
    localStorage.setItem('eduquest_students', JSON.stringify(nextStudents));
    if (currentStudent?.id === updated.id) {
      setCurrentStudent(updated);
      localStorage.setItem('eduquest_current_student', JSON.stringify(updated));
    }
    pushStudentRealtime(updated);

    if (gasUrl) {
      try {
        await syncStudentsToGas(nextStudents, gasUrl);
        return {
          success: true,
          message: `อัปเดตข้อมูล ${updated.firstName} ลง Google Sheets เรียบร้อยแล้ว 📊`
        };
      } catch (err) {
        console.warn('Silent sync error:', err);
      }
    }
    return { success: true, message: `อัปเดตข้อมูล ${updated.firstName} สำเร็จ` };
  };

  const deleteStudent = async (studentId: string): Promise<{ success: boolean; message: string }> => {
    const target = students.find(s => s && s.id === studentId);
    const studentCode = target?.studentCode || studentId;
    const remaining = students.filter(s => s && s.id !== studentId);
    setStudents(remaining);
    localStorage.setItem('eduquest_students', JSON.stringify(remaining));

    if (currentStudent?.id === studentId) {
      const nextCurrent = remaining[0] || DEFAULT_EMPTY_STUDENT;
      setCurrentStudent(nextCurrent);
      localStorage.setItem('eduquest_current_student', JSON.stringify(nextCurrent));
    }

    if (gasUrl) {
      try {
        await deleteStudentFromGas(studentCode, gasUrl);
        await syncStudentsToGas(remaining, gasUrl);
      } catch (err) {
        console.warn('Silent delete sync error:', err);
      }
    }
    triggerMascotTip('ลบข้อมูลนักเรียนออกจากระบบและ Google Sheets แล้วครับ', 'thinking');
    return { success: true, message: 'ลบข้อมูลนักเรียนเรียบร้อยแล้ว' };
  };

  const clearAllStudents = () => {
    setStudents([]);
    setCurrentStudent(DEFAULT_EMPTY_STUDENT);
    localStorage.removeItem('eduquest_students');
    localStorage.removeItem('eduquest_current_student');
    if (gasUrl) {
      syncStudentsToGas([], gasUrl).catch(() => {});
    }
    triggerMascotTip('ล้างรายชื่อนักเรียนทั้งหมดเรียบร้อยแล้ว พร้อมนำเข้าข้อมูลจริง!', 'happy');
  };

  const bulkAddStudents = async (newStudentsList: Array<Omit<Student, 'id' | 'level' | 'xp' | 'coins' | 'completedQuizzes' | 'battleWins' | 'battleLosses' | 'accuracy' | 'badgeIds'>>): Promise<{ success: boolean; message: string; count: number }> => {
    const created: Student[] = newStudentsList.map((s, idx) => ({
      ...s,
      id: `STD_${Date.now()}_${idx}`,
      level: 1,
      xp: 0,
      coins: 50,
      streakDays: 1,
      title: 'นักเรียนใหม่',
      completedQuizzes: 0,
      battleWins: 0,
      battleLosses: 0,
      accuracy: 100,
      badgeIds: ['BADGE_FIRST_WIN']
    }));
    const nextStudents = [...created, ...students];
    setStudents(nextStudents);
    localStorage.setItem('eduquest_students', JSON.stringify(nextStudents));
    if (students.length === 0 && created.length > 0) {
      setCurrentStudent(created[0]);
    }

    if (gasUrl) {
      try {
        await syncStudentsToGas(nextStudents, gasUrl);
        triggerMascotTip(`นำเข้านักเรียน ${created.length} คนและบันทึกลง Google Sheets เรียบร้อยแล้ว! 📊🎉`, 'cheering');
        return {
          success: true,
          message: `นำเข้าและบันทึกนักเรียน ${created.length} คนลง Google Sheets เรียบร้อยแล้ว`,
          count: created.length
        };
      } catch (err) {
        console.warn('Silent sync error:', err);
      }
    }

    triggerMascotTip(`นำเข้านักเรียน ${created.length} คนเข้าสู่ระบบเรียบร้อยแล้ว! 🎉`, 'cheering');
    return {
      success: true,
      message: `นำเข้านักเรียน ${created.length} คนเข้าสู่ระบบเรียบร้อยแล้ว`,
      count: created.length
    };
  };

  const clearTestScoresAndLogs = () => {
    setAnswerLogs([]);
    setAssignmentSubmissions([]);
    localStorage.removeItem('eduquest_answer_logs');
    localStorage.removeItem('eduquest_submissions');

    // Reset students' scores & stats
    setStudents(prev => prev.map(s => ({
      ...s,
      level: 1,
      xp: 0,
      coins: 50,
      streakDays: 0,
      completedQuizzes: 0,
      battleWins: 0,
      battleLosses: 0,
      accuracy: 100
    })));

    triggerMascotTip('ล้างประวัติการทำข้อสอบและคะแนนทั้งหมดเป็น 0 สะอาดเอี่ยมแล้วครับ!', 'happy');
  };

  const clearAllAssignments = () => {
    setAssignments([]);
    setAssignmentSubmissions([]);
    localStorage.removeItem('eduquest_assignments');
    localStorage.removeItem('eduquest_submissions');
    triggerMascotTip('ล้างงานที่มอบหมายทดสอบทั้งหมดเรียบร้อยแล้ว!', 'thinking');
  };

  const clearAllQuestions = () => {
    setQuestions([]);
    localStorage.removeItem('eduquest_questions');
    triggerMascotTip('ล้างคลังข้อสอบทั้งหมดเรียบร้อยแล้ว!', 'thinking');
  };

  const resetAllTestDataForProduction = () => {
    // 1. Clear test logs & submissions
    setAnswerLogs([]);
    localStorage.removeItem('eduquest_answer_logs');

    setAssignmentSubmissions([]);
    localStorage.removeItem('eduquest_submissions');

    setAssignments([]);
    localStorage.removeItem('eduquest_assignments');

    // 2. Set primary administrator & teacher to ครูอิศรา
    const teacherIssara: Teacher = {
      teacherId: 'T001',
      prefix: 'ครู',
      firstName: 'อิศรา',
      lastName: '',
      role: 'ผู้ดูแลระบบ',
      department: 'โรงเรียนบ้านเขานางต่วม',
      email: 'farmissara@gmail.com',
      assignedSubjects: ['SUB_ALL'],
      openRouterKey: '',
      deepSeekKey: ''
    };
    setTeachers([teacherIssara]);
    setCurrentTeacher(teacherIssara);
    localStorage.setItem('eduquest_teachers', JSON.stringify([teacherIssara]));
    localStorage.setItem('eduquest_current_teacher', JSON.stringify(teacherIssara));

    // 3. Clear mock students so teacher can add real ones
    setStudents([]);
    setCurrentStudent(DEFAULT_EMPTY_STUDENT);
    localStorage.removeItem('eduquest_students');
    localStorage.removeItem('eduquest_current_student');

    triggerMascotTip('ล้างข้อมูลทดสอบทั้งหมดเรียบร้อยแล้ว! ระบบพร้อมใช้งานจริง 100% แล้วครับ 🎉', 'cheering');
    return {
      success: true,
      message: 'ล้างข้อมูลทดสอบเรียบร้อยแล้ว! ผลคะแนนและสถิติเป็น 0, ล้างนักเรียนทดสอบ และตั้งค่าครูผู้ดูแลระบบเป็น "ครูอิศรา" เรียบร้อยแล้วครับ'
    };
  };

  const addTeacher = async (teacher: Teacher): Promise<{ success: boolean; message: string }> => {
    const nextTeachers = [teacher, ...teachers.filter(t => t.teacherId !== teacher.teacherId)];
    setTeachers(nextTeachers);
    localStorage.setItem('eduquest_teachers', JSON.stringify(nextTeachers));
    pushTeacherRealtime(teacher);

    if (gasUrl) {
      try {
        await syncTeachersToGas(nextTeachers, gasUrl);
        return {
          success: true,
          message: `บันทึกคุณครู ${teacher.prefix}${teacher.firstName} ${teacher.lastName} ลง Google Sheets เรียบร้อยแล้ว 📊`
        };
      } catch (err) {
        console.warn('Silent teacher sync error:', err);
      }
    }
    return {
      success: true,
      message: `บันทึกข้อมูลคุณครู ${teacher.prefix}${teacher.firstName} เรียบร้อยแล้ว`
    };
  };

  const updateTeacher = async (teacher: Teacher): Promise<{ success: boolean; message: string }> => {
    const nextTeachers = teachers.map(t => (t.teacherId === teacher.teacherId ? teacher : t));
    setTeachers(nextTeachers);
    localStorage.setItem('eduquest_teachers', JSON.stringify(nextTeachers));
    if (currentTeacher.teacherId === teacher.teacherId) {
      setCurrentTeacher(teacher);
      localStorage.setItem('eduquest_current_teacher', JSON.stringify(teacher));
    }
    pushTeacherRealtime(teacher);

    if (gasUrl) {
      try {
        await syncTeachersToGas(nextTeachers, gasUrl);
        return {
          success: true,
          message: `อัปเดตข้อมูล ${teacher.prefix}${teacher.firstName} ลง Google Sheets เรียบร้อยแล้ว 📊`
        };
      } catch (err) {
        console.warn('Silent teacher sync error:', err);
      }
    }
    return {
      success: true,
      message: `อัปเดตข้อมูลคุณครู ${teacher.prefix}${teacher.firstName} สำเร็จ`
    };
  };

  const deleteTeacher = async (teacherId: string): Promise<{ success: boolean; message: string }> => {
    const target = teachers.find(t => t.teacherId === teacherId);
    const remaining = teachers.filter(t => t.teacherId !== teacherId);
    setTeachers(remaining);
    localStorage.setItem('eduquest_teachers', JSON.stringify(remaining));

    if (currentTeacher.teacherId === teacherId && remaining.length > 0) {
      setCurrentTeacher(remaining[0]);
      localStorage.setItem('eduquest_current_teacher', JSON.stringify(remaining[0]));
    }

    if (gasUrl) {
      try {
        await deleteTeacherFromGas(teacherId, gasUrl);
        await syncTeachersToGas(remaining, gasUrl);
      } catch (err) {
        console.warn('Silent delete teacher error:', err);
      }
    }
    triggerMascotTip('ลบข้อมูลคุณครูออกจากระบบและ Google Sheets เรียบร้อยแล้ว', 'thinking');
    return {
      success: true,
      message: `ลบข้อมูลคุณครู ${target ? `${target.prefix}${target.firstName}` : ''} เรียบร้อยแล้ว`
    };
  };

  const setRequireStudentPassword = (required: boolean) => {
    setRequireStudentPasswordState(required);
    localStorage.setItem('eduquest_require_student_password', required ? 'true' : 'false');
    playSound('click');
    triggerMascotTip(
      required
        ? 'เปิดระบบรหัสผ่านนักเรียนแล้ว 🔒 (นักเรียนต้องกรอกรหัส PIN หรือรหัสนักเรียนก่อนเข้าสู่ระบบ)'
        : 'ปิดระบบรหัสผ่านนักเรียนแล้ว 🔓 (นักเรียนเลือกชื่อแล้วเข้าสู่ระบบได้ทันที สะดวก รวดเร็ว)',
      'thinking'
    );
  };

  const setRequireTeacherPin = (required: boolean) => {
    setRequireTeacherPinState(required);
    localStorage.setItem('eduquest_require_teacher_pin', required ? 'true' : 'false');
    playSound('click');
    triggerMascotTip(
      required
        ? 'เปิดระบบรหัส PIN คุณครูแล้ว 🔒 (ต้องกรอก PIN 4 หลักก่อนเข้าสู่ระบบครู)'
        : 'ปิดระบบรหัส PIN คุณครูแล้ว 🔓 (ครูสามารถคลิกเลือกชื่อแล้วเข้าสู่ระบบได้ทันที)',
      'thinking'
    );
  };

  const loginAsStudent = (student: Student, pinInput?: string): { success: boolean; message?: string } => {
    if (requireStudentPassword) {
      const input = (pinInput || '').trim().toLowerCase();
      const studentCode = student.studentCode.trim().toLowerCase();
      const studentPin = (student.pin || '').trim().toLowerCase();
      const rollNum = `${student.number}`.trim();
      const rollNumPadded = `${student.number}`.padStart(2, '0');

      // Valid if matches student.pin, or studentCode, or roll number, or default '1234'
      const isValid =
        (studentPin && input === studentPin) ||
        (!studentPin && (input === studentCode || input === rollNum || input === rollNumPadded || input === '1234')) ||
        (input === studentCode);

      if (!isValid) {
        playSound('wrong');
        return {
          success: false,
          message: `รหัสผ่านไม่ถูกต้อง (รหัสเริ่มต้น: รหัสนักเรียน "${student.studentCode}" หรือเลขที่ #${student.number} หรือ 1234)`
        };
      }
    }

    setCurrentStudent(student);
    setRole('student');
    setIsAuthenticated(true);
    localStorage.setItem('eduquest_is_authenticated', 'true');
    localStorage.setItem('eduquest_role', 'student');
    localStorage.setItem('eduquest_current_student', JSON.stringify(student));
    playSound('victory');
    triggerMascotTip(`ยินดีต้อนรับ ${student.prefix}${student.firstName}! เข้าสู่ระบบเรียบร้อยแล้วครับ 🎒`, 'happy');
    return { success: true };
  };

  const updateStudentPin = (studentId: string, newPin: string): { success: boolean; message: string } => {
    const cleanPin = newPin.trim();
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, pin: cleanPin } : s))
    );
    if (currentStudent?.id === studentId) {
      setCurrentStudent(prev => (prev ? { ...prev, pin: cleanPin } : prev));
    }
    playSound('victory');
    return {
      success: true,
      message: cleanPin ? `ตั้งรหัส PIN นักเรียนเป็น "${cleanPin}" สำเร็จ` : 'รีเซ็ตรหัส PIN เป็นค่าเริ่มต้นสำเร็จ'
    };
  };

  const loginAsTeacher = (teacher: Teacher, pin?: string): { success: boolean; message?: string } => {
    if (requireTeacherPin) {
      const inputPin = (pin || '').trim();
      const expectedPin = (teacher.pin || teacherPin || '1234').trim();
      if (inputPin !== expectedPin && inputPin !== teacherPin.trim()) {
        return {
          success: false,
          message: 'รหัส PIN คุณครูไม่ถูกต้อง (รหัสเริ่มต้น: 1234)'
        };
      }
    }
    setCurrentTeacher(teacher);
    setRole('teacher');
    setIsAuthenticated(true);
    localStorage.setItem('eduquest_is_authenticated', 'true');
    localStorage.setItem('eduquest_role', 'teacher');
    localStorage.setItem('eduquest_current_teacher', JSON.stringify(teacher));
    playSound('victory');
    triggerMascotTip(`ยินดีต้อนรับ ${teacher.prefix}${teacher.firstName} เข้าสู่ระบบบริหารจัดการ EduQuest 🎓`, 'proud');
    return { success: true };
  };

  const loginWithStudentCode = async (
    codeOrId: string,
    pinInput?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanCode = codeOrId.trim().toLowerCase();
    if (!cleanCode) {
      return { success: false, message: 'กรุณาระบุรหัสนักเรียนหรือเลขประจำตัว' };
    }

    // Try finding student in current memory
    let target = students.find(
      s =>
        s &&
        s.id !== 'STD_EMPTY' &&
        (s.studentCode.trim().toLowerCase() === cleanCode ||
          s.id.trim().toLowerCase() === cleanCode ||
          `${s.number}`.trim() === cleanCode)
    );

    // If not found in memory but gasUrl is configured, query Google Sheets directly
    if (!target && gasUrl) {
      setIsSyncing(true);
      try {
        const syncRes = await fetchDataFromGas(gasUrl, true);
        if (syncRes.success) {
          const stored = safeStorageGet<Student[]>('eduquest_students', []);
          target = stored.find(
            s =>
              s &&
              s.id !== 'STD_EMPTY' &&
              (s.studentCode.trim().toLowerCase() === cleanCode ||
                s.id.trim().toLowerCase() === cleanCode ||
                `${s.number}`.trim() === cleanCode)
          );
        }
      } catch (err) {
        console.warn('GAS live query error:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    if (!target) {
      playSound('wrong');
      return {
        success: false,
        message: `ไม่พบข้อมูลนักเรียนรหัส "${codeOrId}" ในระบบ กรุณาตรวจสอบรหัสนักเรียน หรือติดต่อคุณครูเพื่อเพิ่มรายชื่อลง Google Sheets`
      };
    }

    return loginAsStudent(target, pinInput);
  };

  const loginWithTeacherCredentials = async (
    identifier: string,
    pinInput?: string
  ): Promise<{ success: boolean; message?: string; teacher?: Teacher }> => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, message: 'กรุณากรอกรหัสครูผู้สอน หรืออีเมล' };
    }

    let target = teachers.find(
      t =>
        t &&
        (t.teacherId.trim().toLowerCase() === cleanId ||
          (t.email && t.email.trim().toLowerCase() === cleanId) ||
          t.firstName.trim().toLowerCase() === cleanId)
    );

    if (!target && teachers.length > 0) {
      if (cleanId === 'admin' || cleanId === 't001' || cleanId === 'teacher' || cleanId === 'ครู') {
        target = teachers[0];
      }
    }

    if (!target && gasUrl) {
      setIsSyncing(true);
      try {
        await fetchDataFromGas(gasUrl, true);
        const stored = safeStorageGet<Teacher[]>('eduquest_teachers', []);
        target = stored.find(
          t =>
            t &&
            (t.teacherId.trim().toLowerCase() === cleanId ||
              (t.email && t.email.trim().toLowerCase() === cleanId) ||
              t.firstName.trim().toLowerCase() === cleanId)
        );
      } catch (err) {
        console.warn('GAS query teachers error:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    if (!target) {
      playSound('wrong');
      return {
        success: false,
        message: `ไม่พบข้อมูลคุณครูผู้สอน "${identifier}" ในระบบ`
      };
    }

    if (requireTeacherPin) {
      const cleanPin = (pinInput || '').trim();
      const expectedPin = (target.pin || teacherPin || '1234').trim();
      if (cleanPin !== expectedPin && cleanPin !== teacherPin.trim()) {
        playSound('wrong');
        return {
          success: false,
          message: 'รหัส PIN คุณครูไม่ถูกต้อง (รหัสเริ่มต้น: 1234)'
        };
      }
    }

    const loginRes = loginAsTeacher(target, pinInput);
    if (!loginRes.success) {
      return loginRes;
    }
    return { success: true, teacher: target };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('eduquest_is_authenticated');
    localStorage.removeItem('eduquest_current_student');
    setCurrentStudent(DEFAULT_EMPTY_STUDENT);
    playSound('click');
    triggerMascotTip('ออกจากระบบเรียบร้อยแล้วครับ 👋', 'thinking');
  };

  const verifyTeacherPin = (pin: string): boolean => {
    return pin.trim() === teacherPin.trim();
  };

  const updateTeacherPin = (newPin: string): { success: boolean; message: string } => {
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'รหัส PIN ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }
    const cleanPin = newPin.trim();
    setTeacherPin(cleanPin);
    localStorage.setItem('eduquest_teacher_pin', cleanPin);
    playSound('victory');
    return { success: true, message: `เปลี่ยนรหัส PIN สำเร็จ เป็น: ${cleanPin}` };
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
      teacherName: (() => {
        const assignedTeacher = teachers.find(t => 
          t.assignedSubjects?.includes(q.subjectId) || 
          t.assignedSubjects?.includes(q.subjectName) ||
          t.assignedSubjects?.includes('SUB_ALL')
        ) || currentTeacher;
        return assignedTeacher ? `${assignedTeacher.prefix}${assignedTeacher.firstName} ${assignedTeacher.lastName}` : 'ครูผู้สอน';
      })(),
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

    // Auto-sync answer score to Google Sheets via GAS (Background non-blocking)
    if (gasUrl) {
      try {
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'submitAnswer', log: newLog }),
          mode: 'no-cors'
        }).catch(err => {
          console.warn('Google Sheets background sync silent notification:', err);
        });
      } catch (e) {
        // fail-safe
      }
    }

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
        markNotificationAsRead: markNotificationRead,
        clearAllNotifications: markAllNotificationsRead,
        sendNotification,
        updateStageStars,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addStudent,
        updateStudent,
        deleteStudent,
        clearAllStudents,
        bulkAddStudents,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        clearTestScoresAndLogs,
        clearAllAssignments,
        clearAllQuestions,
        resetAllTestDataForProduction,
        isAuthenticated,
        teacherPin,
        requireStudentPassword,
        requireTeacherPin,
        setRequireStudentPassword,
        setRequireTeacherPin,
        loginAsStudent,
        loginAsTeacher,
        loginWithStudentCode,
        loginWithTeacherCredentials,
        logout,
        verifyTeacherPin,
        updateTeacherPin,
        updateStudentPin,
        submitAnswer,
        triggerConfetti,
        playSound,
        updateBackground,
        updateCardStyle,
        updateFont,
        updateSpacing,
        gasUrl,
        setGasUrl,
        isGasConnected,
        isSyncing,
        lastSyncTime,
        pushStudentRealtime,
        pushTeacherRealtime,
        pushQuestionRealtime,
        getShareableStudentLink,
        testGasConnection,
        syncAllToGas,
        fetchDataFromGas,
        toggleSound,
        toggleMascot,
        toggleAnimations
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
