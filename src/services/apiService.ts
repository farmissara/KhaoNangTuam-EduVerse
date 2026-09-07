/**
 * @file apiService.ts
 * @description Robust API service layer for Google Apps Script Web App integrations.
 * Handles CORS, redirects, query normalization, payload encoding, and direct Google Sheets communication.
 */

import { Student, Teacher, Question, Subject, Assignment, AnswerLog, ClanId } from '../types';
import { resolveActiveGasUrl } from '../config/gasConfig';

export interface GasApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  students?: any[];
  teachers?: any[];
  questions?: any[];
  subjects?: any[];
  assignments?: any[];
  logs?: any[];
  stats?: any;
  [key: string]: any;
}

export interface SyncResult {
  success: boolean;
  message: string;
  counts: {
    students: number;
    teachers: number;
    questions: number;
    subjects: number;
  };
  data?: {
    students?: Student[];
    teachers?: Teacher[];
    questions?: Question[];
    subjects?: Subject[];
  };
}

/**
 * Executes a robust HTTP request to Google Apps Script Web App.
 * Uses text/plain for POST to avoid CORS preflight (OPTIONS) which GAS does not support.
 */
export async function executeGasRequest<T = any>(
  action: string,
  payload: Record<string, any> = {},
  options?: {
    gasUrl?: string;
    method?: 'GET' | 'POST';
    timeoutMs?: number;
  }
): Promise<GasApiResponse<T>> {
  const targetUrl = (options?.gasUrl || resolveActiveGasUrl() || '').trim();

  if (!targetUrl) {
    return {
      success: false,
      message: 'ยังไม่ได้ระบุ Web App URL ของ Google Apps Script'
    };
  }

  const method = options?.method || (Object.keys(payload).length > 0 && action.startsWith('save') || action.startsWith('submit') || action === 'syncAll' ? 'POST' : 'GET');
  const timeoutMs = options?.timeoutMs || 20000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;

    if (method === 'GET') {
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set('action', action);
      urlObj.searchParams.set('_t', Date.now().toString());

      // Append simple payload items as query params
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          urlObj.searchParams.set(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });

      response = await fetch(urlObj.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        },
        signal: controller.signal
      });
    } else {
      // POST Request: Use 'text/plain;charset=utf-8' to bypass CORS Preflight (OPTIONS)
      const postBody = JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      });

      try {
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: postBody,
          redirect: 'follow',
          signal: controller.signal
        });
      } catch (fetchErr: any) {
        // Fallback for CORS redirect limitations in strict browser environments
        try {
          await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: postBody,
            mode: 'no-cors'
          });
          clearTimeout(timeoutId);
          return {
            success: true,
            message: `ส่งข้อมูลการดำเนินการ "${action}" ไปยัง Google Sheets เรียบร้อยแล้ว`
          };
        } catch {
          throw fetchErr;
        }
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP Error: ${response.status} ${response.statusText}`
      };
    }

    const text = await response.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      // If response text is not direct JSON, check if it contains JSON or HTML
      if (text.includes('{') && text.includes('}')) {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
        try {
          data = JSON.parse(jsonSubstring);
        } catch {
          data = { success: true, message: text };
        }
      } else {
        data = { success: true, message: text };
      }
    }

    return {
      success: data.success !== false,
      message: data.message,
      data: data.data || data,
      ...data
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'คำขอใช้เวลานานเกินกำหนด (Timeout) กรุณาลองใหม่อีกครั้ง'
      };
    }
    console.warn(`[GAS apiService] Error calling action "${action}":`, err);
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้: ${err.message || err.toString()}`
    };
  }
}

/**
 * Tests connection to Google Apps Script Web App
 */
export async function testGasConnection(gasUrl?: string): Promise<{ success: boolean; message: string }> {
  const url = (gasUrl || resolveActiveGasUrl() || '').trim();
  if (!url) {
    return { success: false, message: 'กรุณาระบุ Web App URL ก่อนทดสอบครับ' };
  }

  const res = await executeGasRequest('getSubjects', {}, { gasUrl: url, method: 'GET', timeoutMs: 12000 });
  if (res.success) {
    return { success: true, message: 'เชื่อมต่อ Google Apps Script สำเร็จเรียบร้อยแล้ว!' };
  }

  // Fallback test with getStudents
  const resStudents = await executeGasRequest('getStudents', {}, { gasUrl: url, method: 'GET', timeoutMs: 12000 });
  if (resStudents.success) {
    return { success: true, message: 'เชื่อมต่อ Google Apps Script สำเร็จเรียบร้อยแล้ว!' };
  }

  return {
    success: false,
    message: res.message || 'ไม่สามารถติดต่อ Google Apps Script ได้ กรุณาตรวจสอบสิทธิ์การ Deploy (Anyone)'
  };
}

/**
 * Normalizes raw Student records from Google Sheets
 */
export function normalizeStudent(raw: any, index: number = 0): Student {
  const code = String(raw.studentCode || raw.StudentCode || raw['รหัสนักเรียน'] || raw.id || `STD_${index + 1}`).trim();
  const prefix = String(raw.prefix || raw.Prefix || raw['คำนำหน้า'] || 'ด.ช.').trim();
  const firstName = String(raw.firstName || raw.FirstName || raw['ชื่อ'] || `นักเรียน ${index + 1}`).trim();
  const lastName = String(raw.lastName || raw.LastName || raw['นามสกุล'] || '').trim();
  const classroom = String(raw.classroom || raw.Classroom || raw['ชั้นเรียน'] || 'ป.1/1').trim();
  const number = Number(raw.number || raw.Number || raw['เลขที่']) || index + 1;
  const level = Number(raw.level || raw.Level || raw['เลเวล (Lv)']) || 1;
  const xp = Number(raw.xp || raw.XP || raw['XP สะสม']) || 0;
  const coins = Number(raw.coins || raw.Coins || raw['เหรียญทอง']) || 0;
  const streakDays = Number(raw.streakDays || raw.StreakDays || raw['สตรีค (วัน)']) || 0;
  const battleWins = Number(raw.battleWins || raw.BattleWins || raw['ชนะแบทเทิล']) || 0;
  const battleLosses = Number(raw.battleLosses || raw.BattleLosses) || 0;
  const completedQuizzes = Number(raw.completedQuizzes || raw.CompletedQuizzes) || 0;

  const rawAcc = raw.accuracy !== undefined ? raw.accuracy : raw.Accuracy !== undefined ? raw.Accuracy : raw['ความแม่นยำ (%)'];
  const accuracy = rawAcc !== undefined ? Number(String(rawAcc).replace('%', '')) : 100;

  let badgeIds: string[] = [];
  if (Array.isArray(raw.badgeIds)) {
    badgeIds = raw.badgeIds;
  } else if (typeof raw.badgeIds === 'string' && raw.badgeIds.trim()) {
    badgeIds = raw.badgeIds.split(',').map((b: string) => b.trim());
  }

  return {
    id: raw.id || `STD_${code}`,
    studentCode: code,
    prefix,
    firstName,
    lastName,
    classroom,
    number,
    avatar: raw.avatar || raw['อวตาร'] || '🌱',
    level,
    xp,
    coins,
    streakDays,
    title: raw.title || raw['ฉายา'] || 'นักเรียนยอดนักสู้',
    clanId: (raw.clanId || 'fire') as ClanId,
    completedQuizzes,
    battleWins,
    battleLosses,
    accuracy: isNaN(accuracy) ? 100 : accuracy,
    badgeIds,
    pin: raw.pin ? String(raw.pin) : undefined
  };
}

/**
 * Normalizes raw Question records from Google Sheets
 */
export function normalizeQuestion(raw: any, index: number = 0): Question {
  const options = Array.isArray(raw.options)
    ? raw.options
    : [
        String(raw.option1 || raw['ตัวเลือก ก'] || ''),
        String(raw.option2 || raw['ตัวเลือก ข'] || ''),
        String(raw.option3 || raw['ตัวเลือก ค'] || ''),
        String(raw.option4 || raw['ตัวเลือก ง'] || '')
      ];

  const correctIndex = Number(
    raw.correctIndex !== undefined
      ? raw.correctIndex
      : raw.CorrectIndex !== undefined
      ? raw.CorrectIndex
      : raw['ข้อที่ถูกต้อง (0-3)']
  ) || 0;

  return {
    id: raw.id || raw.QuestionID || raw['ID ข้อสอบ'] || `Q_${index + 1}`,
    subjectId: raw.subjectId || 'SUB_THAI',
    subjectName: String(raw.subjectName || raw.SubjectName || raw['วิชา'] || 'วิชาการ').trim(),
    gradeLevel: String(raw.gradeLevel || raw.GradeLevel || raw['ระดับชั้น'] || 'ม.3').trim(),
    questionText: String(raw.questionText || raw.QuestionText || raw['โจทย์คำถาม'] || '').trim(),
    options,
    correctIndex,
    explanation: String(raw.explanation || raw.Explanation || raw['คำอธิบายเฉลย'] || '').trim(),
    timeLimitSeconds: Number(raw.timeLimitSeconds || raw['เวลา (วินาที)']) || 20,
    difficulty: (raw.difficulty || raw['ระดับความยาก'] || 'medium') as 'easy' | 'medium' | 'hard',
    type: (raw.type || 'multiple_choice') as 'multiple_choice' | 'true_false',
    tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? raw.tags.split(',') : ['ทั่วไป'],
    createdAt: raw.createdAt || new Date().toISOString()
  };
}

/**
 * Normalizes raw Teacher records from Google Sheets
 */
export function normalizeTeacher(raw: any, index: number = 0): Teacher {
  return {
    teacherId: String(raw.teacherId || raw.TeacherID || raw.id || raw['รหัสครู'] || `T${String(index + 1).padStart(3, '0')}`).trim(),
    prefix: String(raw.prefix || raw.Prefix || raw['คำนำหน้า'] || 'ครู').trim(),
    firstName: String(raw.firstName || raw.FirstName || raw['ชื่อ'] || 'ผู้สอน').trim(),
    lastName: String(raw.lastName || raw.LastName || raw['นามสกุล'] || '').trim(),
    role: String(raw.role || raw.Role || raw['ตำแหน่ง / บทบาท'] || 'ครูผู้สอน').trim(),
    department: String(raw.department || raw.Department || raw['กลุ่มสาระการเรียนรู้'] || 'โรงเรียนบ้านเขานางต่วม').trim(),
    email: String(raw.email || raw.Email || raw['อีเมล'] || '').trim(),
    assignedSubjects: Array.isArray(raw.assignedSubjects)
      ? raw.assignedSubjects
      : typeof raw.assignedSubjects === 'string'
      ? raw.assignedSubjects.split(',').map((s: string) => s.trim())
      : ['SUB_ALL'],
    pin: raw.pin ? String(raw.pin) : '1234'
  };
}

/**
 * Normalizes raw Subject records from Google Sheets
 */
export function normalizeSubject(raw: any, index: number = 0): Subject {
  return {
    id: raw.id || raw.SubjectID || `SUB_${index + 1}`,
    name: String(raw.name || raw.SubjectName || raw['ชื่อวิชา'] || `วิชาที่ ${index + 1}`).trim(),
    code: String(raw.code || raw.SubjectCode || raw['รหัสวิชา'] || `ว00${index + 1}`).trim(),
    icon: raw.icon || 'BookOpen',
    color: raw.color || 'indigo',
    gradeLevel: String(raw.gradeLevel || raw['ระดับชั้น'] || 'ม.3').trim(),
    description: String(raw.description || raw['คำอธิบายรายวิชา'] || '').trim(),
    questionCount: Number(raw.questionCount || raw['จำนวนข้อสอบ']) || 0
  };
}

/**
 * Fetches Students directly from Google Sheets
 */
export async function fetchStudentsFromGas(gasUrl?: string, classroom?: string): Promise<Student[]> {
  const res = await executeGasRequest('getStudents', { classroom }, { gasUrl });
  if (!res.success) return [];

  const rawList = Array.isArray(res.data) ? res.data : res.students || [];
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item, idx) => normalizeStudent(item, idx))
    .filter(s => s.id !== 'STD_EMPTY' && s.firstName !== 'นักเรียนใหม่');
}

/**
 * Fetches Teachers directly from Google Sheets
 */
export async function fetchTeachersFromGas(gasUrl?: string): Promise<Teacher[]> {
  const res = await executeGasRequest('getTeachers', {}, { gasUrl });
  if (!res.success) return [];

  const rawList = Array.isArray(res.data) ? res.data : res.teachers || [];
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item, idx) => normalizeTeacher(item, idx));
}

/**
 * Fetches Questions directly from Google Sheets
 */
export async function fetchQuestionsFromGas(gasUrl?: string, subjectId?: string, gradeLevel?: string): Promise<Question[]> {
  const res = await executeGasRequest('getQuestions', { subjectId, gradeLevel }, { gasUrl });
  if (!res.success) return [];

  const rawList = Array.isArray(res.data) ? res.data : res.questions || [];
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item, idx) => normalizeQuestion(item, idx))
    .filter(q => q.questionText && q.questionText.trim().length > 0);
}

/**
 * Fetches Subjects directly from Google Sheets
 */
export async function fetchSubjectsFromGas(gasUrl?: string): Promise<Subject[]> {
  const res = await executeGasRequest('getSubjects', {}, { gasUrl });
  if (!res.success) return [];

  const rawList = Array.isArray(res.data) ? res.data : res.subjects || [];
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  return rawList.map((item, idx) => normalizeSubject(item, idx));
}

/**
 * Fetches Live Teacher Dashboard Analytics from Google Sheets
 */
export async function fetchTeacherDashboardStats(gasUrl?: string, teacherId?: string): Promise<any> {
  const res = await executeGasRequest('getTeacherDashboard', { teacherId }, { gasUrl });
  return res.success ? (res.stats || res.data) : null;
}

/**
 * Submits Quiz Answer Log to Google Sheets
 */
export async function submitAnswerLogToGas(log: AnswerLog, gasUrl?: string): Promise<boolean> {
  const res = await executeGasRequest('submitAnswer', { submission: log }, { gasUrl, method: 'POST' });
  return res.success;
}

/**
 * Pushes updated Student Profile / Progress to Google Sheets
 */
export async function pushStudentToGas(student: Student, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('saveStudent', { student }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Deletes Student from Google Sheets
 */
export async function deleteStudentFromGas(studentCodeOrId: string, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('deleteStudent', { studentCode: studentCodeOrId, studentId: studentCodeOrId }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Pushes Teacher Profile / Account to Google Sheets
 */
export async function pushTeacherToGas(teacher: Teacher, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('saveTeacher', { teacher }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Deletes Teacher from Google Sheets
 */
export async function deleteTeacherFromGas(teacherId: string, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('deleteTeacher', { teacherId }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Pushes Question directly to Google Sheets
 */
export async function pushQuestionToGas(question: Question, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('saveQuestion', { question }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Deletes Question from Google Sheets
 */
export async function deleteQuestionFromGas(questionId: string, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('deleteQuestion', { questionId }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Syncs full Teachers list to Google Sheets
 */
export async function syncTeachersToGas(teachers: Teacher[], gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('syncTeachers', { teachers }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Syncs full Students list to Google Sheets
 */
export async function syncStudentsToGas(students: Student[], gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('syncStudents', { students }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Syncs full Questions list to Google Sheets
 */
export async function syncQuestionsToGas(questions: Question[], gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('syncQuestions', { questions }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Pushes single Subject to Google Sheets
 */
export async function pushSubjectToGas(subject: Subject, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('saveSubject', { subject }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Deletes single Subject from Google Sheets
 */
export async function deleteSubjectFromGas(subjectId: string, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('deleteSubject', { subjectId, id: subjectId }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Syncs full Subjects list to Google Sheets
 */
export async function syncSubjectsToGas(subjects: Subject[], gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('syncSubjects', { subjects }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Records system change / audit log to Google Sheets
 */
export async function recordChangeLogToGas(
  log: {
    category: 'ข้อสอบ' | 'รายวิชา' | 'นักเรียน' | 'ครู' | 'คะแนน' | 'ภารกิจ' | 'ระบบ';
    action: 'เพิ่ม' | 'แก้ไข' | 'ลบ' | 'ซิงค์' | 'รีเซ็ต';
    target: string;
    details?: string;
    modifiedBy?: string;
  },
  gasUrl?: string
): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('recordChangeLog', { log }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Pushes Assignment to Google Sheets
 */
export async function pushAssignmentToGas(assignment: Assignment, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('saveAssignment', { assignment }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Deletes Assignment from Google Sheets
 */
export async function deleteAssignmentFromGas(assignmentId: string, gasUrl?: string): Promise<{ success: boolean; message?: string }> {
  const res = await executeGasRequest('deleteAssignment', { assignmentId, id: assignmentId }, { gasUrl, method: 'POST' });
  return { success: res.success, message: res.message };
}

/**
 * Performs a comprehensive sync fetching all core collections from Google Sheets
 */
export async function syncAllFromGas(gasUrl?: string): Promise<SyncResult> {
  const url = (gasUrl || resolveActiveGasUrl() || '').trim();
  if (!url) {
    return {
      success: false,
      message: 'ยังไม่ได้ระบุ Web App URL กรุณาเชื่อมต่อ Google Sheets ก่อนครับ',
      counts: { students: 0, teachers: 0, questions: 0, subjects: 0 }
    };
  }

  try {
    const [students, teachers, questions, subjects] = await Promise.all([
      fetchStudentsFromGas(url),
      fetchTeachersFromGas(url),
      fetchQuestionsFromGas(url),
      fetchSubjectsFromGas(url)
    ]);

    return {
      success: true,
      message: 'ดึงข้อมูลล่าสุดจาก Google Sheets สำเร็จเรียบร้อย',
      counts: {
        students: students.length,
        teachers: teachers.length,
        questions: questions.length,
        subjects: subjects.length
      },
      data: {
        students,
        teachers,
        questions,
        subjects
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message || err.toString()}`,
      counts: { students: 0, teachers: 0, questions: 0, subjects: 0 }
    };
  }
}
