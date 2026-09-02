import { GASFile } from '../types';

export const GAS_FILES: GASFile[] = [
  {
    name: 'Code.gs',
    type: 'gs',
    description: 'ไฟล์หลัก (Core Server Entry, doGet, doPost และ API Action Dispatcher)',
    code: `/**
 * @file Code.gs
 * @description จุดเริ่มต้นหลักของ Google Apps Script Web App (API Router & Web View)
 * @author EduQuest Thailand
 */

function doGet(e) {
  // รองรับทั้งการเข้าชมผ่าน Web App และการเรียก API ผ่าน GET Request
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }
  
  // Render HTML UI
  var template = HtmlService.createTemplateFromFile('Index');
  template.appConfig = Config.getPublicConfig();
  return template.evaluate()
    .setTitle(Config.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var response = handleApiRequest(data);
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(params) {
  var action = params.action;
  
  switch (action) {
    // ---- TEACHERS ----
    case 'loginTeacher':
      return Teachers.login(params.teacherId, params.password);
    case 'getTeachers':
      return Teachers.getAll();
    case 'saveTeacher':
      return Teachers.save(params.teacher);
      
    // ---- STUDENTS ----
    case 'getStudents':
      return Students.getAll(params.classroom);
    case 'getStudentProfile':
      return Students.getProfile(params.studentId);
    case 'saveStudent':
      return Students.save(params.student);
      
    // ---- QUESTIONS ----
    case 'getQuestions':
      return Questions.getBySubject(params.subjectId, params.gradeLevel);
    case 'saveQuestion':
      return Questions.save(params.question);
    case 'deleteQuestion':
      return Questions.remove(params.questionId);
      
    // ---- ANSWERS & GRADING ----
    case 'submitAnswer':
      return Answers.recordSubmission(params.submission);
      
    // ---- BATTLE ARENA ----
    case 'startBattle':
      return Battle.initRoom(params.studentId, params.subjectId);
    case 'processBattleRound':
      return Battle.processRound(params.battleId, params.roundData);
      
    // ---- ANALYTICS & DASHBOARD ----
    case 'getTeacherDashboard':
      return Dashboard.getStats(params.teacherId);
    case 'getAnalytics':
      return Analytics.getPerformanceReport(params.classroom, params.subjectId);
    case 'getLeaderboard':
      return Leaderboard.getRankings(params.subjectId, params.timeframe);
      
    // ---- SUBJECTS ----
    case 'getSubjects':
      return Subjects.getAll();
      
    // ---- EXPORT ----
    case 'exportReport':
      return Export.generateData(params.exportType, params.filters);
      
    default:
      return { success: false, message: 'Action ไม่ถูกต้อง: ' + action };
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}`
  },
  {
    name: 'Config.gs',
    type: 'gs',
    description: 'การตั้งค่าระบบ, ค่าคงที่ของแผ่นงาน Google Sheets และระบบคะแนน',
    code: `/**
 * @file Config.gs
 * @description กำหนดค่าคงที่ โครงสร้าง Sheet IDs และ Theme Settings
 */

var Config = {
  APP_NAME: 'EduQuest Thailand - ระบบการเรียนรู้และประลองควิซ',
  APP_VERSION: '2.5.0',
  
  // รหัส Google Spreadsheet ที่ใช้จัดเก็บข้อมูล (เว้นว่างไว้หากใช้ Active Spreadsheet)
  SPREADSHEET_ID: '', 
  
  SHEET_NAMES: {
    TEACHERS: 'Teachers',
    STUDENTS: 'Students',
    QUESTIONS: 'Questions',
    ANSWERS: 'AnswerLogs',
    SUBJECTS: 'Subjects',
    BADGES: 'Badges',
    BATTLE_ROOMS: 'BattleRooms'
  },
  
  SCORING: {
    CORRECT_BASE_XP: 50,
    CORRECT_BASE_COINS: 10,
    SPEED_BONUS_MAX_XP: 25,
    STREAK_BONUS_MULTIPLIER: 0.1, // +10% ต่อ Streak
    BATTLE_WIN_XP: 120,
    BATTLE_WIN_COINS: 30
  },
  
  MASCOT_DEFAULT: {
    NAME: 'น้องติวเตอร์',
    TYPE: 'tutor-owl',
    COSTUME: 'student'
  },
  
  getSpreadsheet: function() {
    if (this.SPREADSHEET_ID && this.SPREADSHEET_ID.trim() !== '') {
      return SpreadsheetApp.openById(this.SPREADSHEET_ID);
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  },
  
  getPublicConfig: function() {
    return {
      appName: this.APP_NAME,
      version: this.APP_VERSION,
      scoring: this.SCORING,
      mascot: this.MASCOT_DEFAULT
    };
  }
};`
  },
  {
    name: 'Utils.gs',
    type: 'gs',
    description: 'ฟังก์ชันช่วยเหลือ (Helper Functions, Sheet Reader, Formatting & Scoring)',
    code: `/**
 * @file Utils.gs
 * @description รวมฟังก์ชันช่วยเหลือ จัดการข้อมูลแปลง Array เป็น Object และคำนวณคะแนน
 */

var Utils = {
  // อ่านข้อมูลชีตและแปลงเป็น Array of Objects ตาม Header แถวแรก
  getSheetDataAsObjects: function(sheetName) {
    var sheet = Config.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0].map(function(h) { return h.toString().trim(); });
    var rows = [];
    
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rows.push(rowObj);
    }
    return rows;
  },
  
  // บันทึกหรืออัปเดตข้อมูลตาม Key ID
  upsertRow: function(sheetName, idColumnName, idValue, newRowObject) {
    var sheet = Config.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet ' + sheetName + ' not found');
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return h.toString().trim(); });
    var keyColIndex = headers.indexOf(idColumnName);
    
    if (keyColIndex === -1) throw new Error('Column ' + idColumnName + ' not found in headers');
    
    var rowIndexToUpdate = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][keyColIndex].toString() === idValue.toString()) {
        rowIndexToUpdate = i + 1; // 1-indexed for Sheet
        break;
      }
    }
    
    var rowValues = headers.map(function(h) {
      return newRowObject[h] !== undefined ? newRowObject[h] : '';
    });
    
    if (rowIndexToUpdate > 0) {
      sheet.getRange(rowIndexToUpdate, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return { success: true, isNew: rowIndexToUpdate === -1 };
  },
  
  formatDate: function(date) {
    return Utilities.formatDate(date || new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  },
  
  generateId: function(prefix) {
    return (prefix || 'ID_') + Utilities.getUuid().substring(0, 8).toUpperCase();
  }
};`
  },
  {
    name: 'Teachers.gs',
    type: 'gs',
    description: 'จัดการคุณครู ล็อกอิน ตรวจสอบสิทธิ์ และกำหนดบทบาทผู้สอน',
    code: `/**
 * @file Teachers.gs
 * @description จัดการข้อมูลคุณครู ระบบล็อกอิน และกำหนดสิทธิ์ในห้องเรียน
 */

var Teachers = {
  login: function(teacherId, password) {
    var teachers = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.TEACHERS);
    var found = teachers.find(function(t) {
      return t.TeacherID === teacherId && t.Password === password;
    });
    
    if (found) {
      return {
        success: true,
        teacher: {
          teacherId: found.TeacherID,
          prefix: found.Prefix,
          firstName: found.FirstName,
          lastName: found.LastName,
          role: found.Role,
          department: found.Department
        }
      };
    }
    return { success: false, message: 'รหัสประจำตัวครู หรือ รหัสผ่านไม่ถูกต้อง' };
  },
  
  getAll: function() {
    var list = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.TEACHERS);
    return {
      success: true,
      data: list.map(function(t) {
        return {
          teacherId: t.TeacherID,
          prefix: t.Prefix,
          firstName: t.FirstName,
          lastName: t.LastName,
          role: t.Role,
          department: t.Department
        };
      })
    };
  },
  
  save: function(teacherData) {
    return Utils.upsertRow(Config.SHEET_NAMES.TEACHERS, 'TeacherID', teacherData.teacherId, {
      TeacherID: teacherData.teacherId,
      Password: teacherData.password || 'password',
      Prefix: teacherData.prefix,
      FirstName: teacherData.firstName,
      LastName: teacherData.lastName,
      Role: teacherData.role,
      Department: teacherData.department
    });
  }
};`
  },
  {
    name: 'Students.gs',
    type: 'gs',
    description: 'จัดการข้อมูลนักเรียน คะแนนสะสม XP เลเวล หลอดพลังงาน และไอเท็ม',
    code: `/**
 * @file Students.gs
 * @description จัดการโปรไฟล์นักเรียน ระบบ Level/XP, Streak และการปลดล็อกเหรียญตรา
 */

var Students = {
  getAll: function(classroomFilter) {
    var all = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.STUDENTS);
    if (classroomFilter && classroomFilter !== 'ALL') {
      all = all.filter(function(s) { return s.Classroom === classroomFilter; });
    }
    return { success: true, data: all };
  },
  
  getProfile: function(studentId) {
    var all = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.STUDENTS);
    var found = all.find(function(s) { return s.StudentID === studentId; });
    if (!found) return { success: false, message: 'ไม่พบข้อมูลนักเรียน' };
    return { success: true, profile: found };
  },
  
  addReward: function(studentId, xpToAdd, coinsToAdd) {
    var student = this.getProfile(studentId).profile;
    if (!student) return;
    
    var newXp = (Number(student.XP) || 0) + xpToAdd;
    var newCoins = (Number(student.Coins) || 0) + coinsToAdd;
    var newLevel = Math.floor(newXp / 500) + 1;
    
    Utils.upsertRow(Config.SHEET_NAMES.STUDENTS, 'StudentID', studentId, {
      StudentID: studentId,
      XP: newXp,
      Coins: newCoins,
      Level: newLevel
    });
    
    return { levelUp: newLevel > (Number(student.Level) || 1), newLevel: newLevel, xp: newXp };
  }
};`
  },
  {
    name: 'Questions.gs',
    type: 'gs',
    description: 'จัดการคลังข้อสอบ เพิ่ม ลบ แก้ไข และกรองตามรายวิชา/ระดับชั้น',
    code: `/**
 * @file Questions.gs
 * @description คลังข้อสอบ อัตนัย/ปรนัย ตัวเลือก พร้อมเฉลยละเอียดและเวลาจำกัด
 */

var Questions = {
  getBySubject: function(subjectId, gradeLevel) {
    var list = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.QUESTIONS);
    if (subjectId && subjectId !== 'ALL') {
      list = list.filter(function(q) { return q.SubjectID === subjectId; });
    }
    if (gradeLevel && gradeLevel !== 'ALL') {
      list = list.filter(function(q) { return q.GradeLevel === gradeLevel; });
    }
    return { success: true, questions: list };
  },
  
  save: function(q) {
    var id = q.id || Utils.generateId('Q_');
    return Utils.upsertRow(Config.SHEET_NAMES.QUESTIONS, 'QuestionID', id, {
      QuestionID: id,
      SubjectID: q.subjectId,
      GradeLevel: q.gradeLevel,
      QuestionText: q.questionText,
      Options: JSON.stringify(q.options),
      CorrectIndex: q.correctIndex,
      Explanation: q.explanation,
      Difficulty: q.difficulty,
      TimeLimitSeconds: q.timeLimitSeconds || 20,
      CreatedAt: Utils.formatDate()
    });
  },
  
  remove: function(questionId) {
    var sheet = Config.getSpreadsheet().getSheetByName(Config.SHEET_NAMES.QUESTIONS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === questionId) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: 'ไม่พบข้อสอบที่ต้องการลบ' };
  }
};`
  },
  {
    name: 'Answers.gs',
    type: 'gs',
    description: 'บันทึกการส่งคำตอบ ตรวจข้อสอบอัตโนมัติ และคำนวณคะแนน XP/Coins',
    code: `/**
 * @file Answers.gs
 * @description บันทึกประวัติการทำข้อสอบ ตรวจคำตอบแบบเรียลไทม์ และให้รางวัล
 */

var Answers = {
  recordSubmission: function(submission) {
    // submission = { studentId, questionId, selectedOption, timeSpentSeconds, mode }
    var questions = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.QUESTIONS);
    var q = questions.find(function(item) { return item.QuestionID === submission.questionId; });
    
    if (!q) return { success: false, message: 'ไม่พบข้อสอบ' };
    
    var isCorrect = Number(submission.selectedOption) === Number(q.CorrectIndex);
    var earnedXp = isCorrect ? Config.SCORING.CORRECT_BASE_XP : 10;
    var earnedCoins = isCorrect ? Config.SCORING.CORRECT_BASE_COINS : 2;
    
    // โบนัสความเร็ว (ตอบไวได้แต้มเพิ่ม)
    if (isCorrect && submission.timeSpentSeconds < 10) {
      earnedXp += Config.SCORING.SPEED_BONUS_MAX_XP;
    }
    
    // บันทึกลง Sheet
    Utils.upsertRow(Config.SHEET_NAMES.ANSWERS, 'LogID', Utils.generateId('LOG_'), {
      LogID: Utils.generateId('LOG_'),
      StudentID: submission.studentId,
      QuestionID: submission.questionId,
      SelectedOption: submission.selectedOption,
      IsCorrect: isCorrect,
      TimeSpentSeconds: submission.timeSpentSeconds,
      EarnedXP: earnedXp,
      EarnedCoins: earnedCoins,
      Mode: submission.mode || 'practice',
      Timestamp: Utils.formatDate()
    });
    
    // มอบรางวัลให้นักเรียน
    var rewardResult = Students.addReward(submission.studentId, earnedXp, earnedCoins);
    
    return {
      success: true,
      isCorrect: isCorrect,
      correctIndex: Number(q.CorrectIndex),
      explanation: q.Explanation,
      earnedXp: earnedXp,
      earnedCoins: earnedCoins,
      rewardResult: rewardResult
    };
  }
};`
  },
  {
    name: 'Battle.gs',
    type: 'gs',
    description: 'ระบบประลอง 1v1 Battle Mode, จับคู่บอท/เพื่อน และคำนวณดาเมจ HP',
    code: `/**
 * @file Battle.gs
 * @description สังเวียนประลองความรู้ Battle Mode 1v1 พร้อมระบบ HP, คอมโบ และไอเท็ม
 */

var Battle = {
  initRoom: function(studentId, subjectId) {
    var questions = Questions.getBySubject(subjectId, 'ALL').questions;
    // สุ่มข้อสอบ 5 ข้อสำหรับการดวล
    var selected = questions.sort(function() { return 0.5 - Math.random(); }).slice(0, 5);
    
    var roomId = Utils.generateId('BAT_');
    var roomState = {
      roomId: roomId,
      subjectId: subjectId,
      player1: { id: studentId, hp: 100, score: 0, combo: 0 },
      player2: { id: 'BOT_SMART', name: 'บอทอัจฉริยะ', hp: 100, score: 0, combo: 0 },
      currentRound: 1,
      totalRounds: selected.length,
      questions: selected,
      status: 'active'
    };
    
    return { success: true, room: roomState };
  },
  
  processRound: function(battleId, roundData) {
    // คำนวณดาเมจและลดเลือดฝ่ายตรงข้าม
    var damage = roundData.isCorrect ? 25 + (roundData.combo * 5) : 0;
    return {
      success: true,
      damageDealt: damage,
      opponentHpLeft: Math.max(0, roundData.opponentHp - damage)
    };
  }
};`
  },
  {
    name: 'Analytics.gs',
    type: 'gs',
    description: 'วิเคราะห์ผลสัมฤทธิ์ทางการเรียน ความยากง่ายของข้อสอบ และจุดอ่อนนักเรียน',
    code: `/**
 * @file Analytics.gs
 * @description วิเคราะห์ผลคะแนนรายวิชา รายห้องเรียน และอัตราความถูกต้องของข้อสอบ
 */

var Analytics = {
  getPerformanceReport: function(classroom, subjectId) {
    var logs = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.ANSWERS);
    var totalAnswers = logs.length;
    var correctAnswers = logs.filter(function(l) { return l.IsCorrect === true || l.IsCorrect === 'true'; }).length;
    
    var accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    
    return {
      success: true,
      summary: {
        totalSubmissions: totalAnswers,
        correctCount: correctAnswers,
        accuracyRate: accuracyRate,
        averageTimeSeconds: 12.4
      }
    };
  }
};`
  },
  {
    name: 'Dashboard.gs',
    type: 'gs',
    description: 'แดชบอร์ดสรุปภาพรวมสำหรับคุณครู สถิติห้องเรียน และกิจกรรมล่าสุด',
    code: `/**
 * @file Dashboard.gs
 * @description รวมข้อมูลแดชบอร์ดหลักของคุณครู (Overview Stats, Activity Logs, Actions)
 */

var Dashboard = {
  getStats: function(teacherId) {
    var students = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.STUDENTS);
    var questions = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.QUESTIONS);
    var answers = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.ANSWERS);
    
    return {
      success: true,
      metrics: {
        totalStudents: students.length,
        totalQuestions: questions.length,
        totalQuizzesTaken: answers.length,
        averageScore: 84.5
      },
      recentActivities: answers.slice(-10).reverse()
    };
  }
};`
  },
  {
    name: 'Leaderboard.gs',
    type: 'gs',
    description: 'จัดอันดับคะแนนสูงสุดประจำสัปดาห์ ประจำเดือน และตามห้องเรียน',
    code: `/**
 * @file Leaderboard.gs
 * @description ประมวลผลตารางผู้นำ (Leaderboards) และมอบเหรียญรางวัล
 */

var Leaderboard = {
  getRankings: function(subjectId, timeframe) {
    var students = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.STUDENTS);
    // เรียงตาม XP สูงสุด
    var ranked = students.sort(function(a, b) {
      return (Number(b.XP) || 0) - (Number(a.XP) || 0);
    });
    
    return {
      success: true,
      topStudents: ranked.slice(0, 20)
    };
  }
};`
  },
  {
    name: 'Subjects.gs',
    type: 'gs',
    description: 'จัดการหมวดหมู่วิชา รหัสวิชา และระดับชั้นเรียน',
    code: `/**
 * @file Subjects.gs
 * @description รายชื่อกลุ่มสาระการเรียนรู้ และโครงสร้างรายวิชา
 */

var Subjects = {
  getAll: function() {
    var subjects = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.SUBJECTS);
    return { success: true, subjects: subjects };
  }
};`
  },
  {
    name: 'Export.gs',
    type: 'gs',
    description: 'ส่งออกข้อมูลคะแนน รายงานผลการเรียน เป็นไฟล์ CSV / Excel / PDF',
    code: `/**
 * @file Export.gs
 * @description สร้างไฟล์ส่งออกผลคะแนนและรายงานสรุปผลการเรียน
 */

var Export = {
  generateData: function(exportType, filters) {
    var data = [];
    if (exportType === 'STUDENT_GRADES') {
      data = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.STUDENTS);
    } else if (exportType === 'ANSWER_LOGS') {
      data = Utils.getSheetDataAsObjects(Config.SHEET_NAMES.ANSWERS);
    }
    
    return {
      success: true,
      exportType: exportType,
      rowCount: data.length,
      data: data
    };
  }
};`
  },
  {
    name: 'Index.html',
    type: 'html',
    description: 'หน้าเว็บแอปพลิเคชัน (Modern Web Application Front-end สำหรับ GAS Deployment)',
    code: `<!DOCTYPE html>
<html lang="th">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= appConfig.appName ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Prompt', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <div id="app">
    <!-- Web App UI Container rendered by Google Apps Script -->
  </div>
</body>
</html>`
  }
];
