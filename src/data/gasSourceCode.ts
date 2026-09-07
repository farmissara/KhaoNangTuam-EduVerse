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
      Department: teacherData.department,
      Email: teacherData.email || '',
      AssignedSubjects: Array.isArray(teacherData.assignedSubjects) ? teacherData.assignedSubjects.join(', ') : (teacherData.assignedSubjects || 'ทุกวิชา')
    });
  },

  remove: function(teacherId) {
    var sheet = Config.getSpreadsheet().getSheetByName(Config.SHEET_NAMES.TEACHERS);
    if (!sheet) return { success: false, message: 'ไม่พบชีท Teachers' };
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === teacherId.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'ลบข้อมูลคุณครูเรียบร้อยแล้ว' };
      }
    }
    return { success: false, message: 'ไม่พบคุณครูที่ระบุ' };
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
  },
  
  save: function(studentData) {
    var studentCode = studentData.studentCode || studentData.id || studentData.StudentID;
    return Utils.upsertRow(Config.SHEET_NAMES.STUDENTS, 'StudentID', studentCode, {
      StudentID: studentCode,
      Prefix: studentData.prefix || '',
      FirstName: studentData.firstName || '',
      LastName: studentData.lastName || '',
      Classroom: studentData.classroom || '',
      Number: studentData.number || 0,
      Level: studentData.level || 1,
      XP: studentData.xp || 0,
      Coins: studentData.coins || 0,
      Streak: studentData.streakDays || 0,
      BattleWins: studentData.battleWins || 0,
      Accuracy: (studentData.accuracy !== undefined ? studentData.accuracy : 100) + '%',
      UpdatedAt: Utils.formatDate()
    });
  },

  remove: function(studentId) {
    var sheet = Config.getSpreadsheet().getSheetByName(Config.SHEET_NAMES.STUDENTS);
    if (!sheet) return { success: false, message: 'ไม่พบชีท Students' };
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === studentId.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'ลบข้อมูลนักเรียนแล้ว' };
      }
    }
    return { success: false, message: 'ไม่พบนักเรียน' };
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

export const GAS_SINGLE_SCRIPT = `/**
 * =========================================================================
 * KhaoNangTuam EduVerse - Google Sheets Database & Web App API
 * โรงเรียนบ้านเขานางต่วม • All-in-One Google Apps Script (100% Standalone)
 * =========================================================================
 * 
 * 📌 คำแนะนำการติดตั้ง (3 ขั้นตอนง่ายๆ):
 * 1. เปิด Google Sheets เปล่า (หรือแผ่นงานของโรงเรียน)
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดในไฟล์นี้ลงไปทั้งหมด
 * 4. กดบันทึก (Save รูปแผ่นดิสก์) แล้วกดเลือกฟังก์ชัน "setupSheets" กดปุ่ม "เรียกใช้" (Run) 1 ครั้ง
 *    (หากมีหน้าต่างขอสิทธิ์ ให้กด "ตรวจสอบสิทธิ์" > เลือกบัญชี Google > "ขั้นสูง" (Advanced) > ไปที่โครงการ (ไม่ปลอดภัย))
 * 5. กดปุ่มสีน้ำเงิน "การทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 *    - เลือกประเภท: "เว็บแอป" (Web app)
 *    - คำอธิบาย: "EduVerse Database API"
 *    - ผู้เรียกใช้ (Execute as): "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)  *** สำคัญมาก! ต้องเลือก 'ทุกคน'
 * 6. กด "นำไปใช้งาน" (Deploy) แล้วคัดลอก Web App URL (ลงท้ายด้วย /exec) นำไปวางในระบบ EduQuest!
 */

const SHEET_NAMES = {
  SCORES: 'Scores_Logs',
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  QUESTIONS: 'Questions',
  SUBJECTS: 'Subjects',
  ASSIGNMENTS: 'Assignments',
  CHANGE_LOGS: 'Change_Logs'
};

// ฟังก์ชันสร้างชีตและหัวตารางให้อัตโนมัติ (สามารถกด Run ด้วยตนเอง หรือระบบจะสร้างให้อัตโนมัติเมื่อมีข้อมูลเข้า)
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ชีตบันทึกคะแนนและการทำข้อสอบ (Scores_Logs)
  let scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  if (!scoreSheet) {
    scoreSheet = ss.insertSheet(SHEET_NAMES.SCORES);
  }
  const scoreHeaders = [
    'วันที่-เวลา (Timestamp)',
    'รหัสนักเรียน',
    'ชื่อ-นามสกุล',
    'ชั้นเรียน',
    'วิชา',
    'ครูผู้สอน/ผู้ตรวจ',
    'โหมดเกม/สอบ',
    'โจทย์ข้อสอบ',
    'คำตอบที่เลือก',
    'คำตอบที่ถูกต้อง',
    'ผลลัพธ์ (ถูกต้อง?)',
    'XP ที่ได้',
    'เหรียญที่ได้',
    'เวลาที่ใช้ (วินาที)',
    'ID ข้อสอบ'
  ];
  if (scoreSheet.getLastRow() === 0) {
    scoreSheet.appendRow(scoreHeaders);
    formatHeaderRow(scoreSheet, '#1e3a8a'); // สีกรมท่า
  }

  // 2. ชีตรายชื่อนักเรียนและคะแนนสะสม (Students)
  let studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(SHEET_NAMES.STUDENTS);
  }
  const studentHeaders = [
    'รหัสนักเรียน',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'ชั้นเรียน',
    'เลขที่',
    'เลเวล (Lv)',
    'XP สะสม',
    'เหรียญทอง',
    'สตรีค (วัน)',
    'ชนะแบทเทิล',
    'ความแม่นยำ (%)',
    'อัปเดตล่าสุด'
  ];
  if (studentSheet.getLastRow() === 0) {
    studentSheet.appendRow(studentHeaders);
    formatHeaderRow(studentSheet, '#065f46'); // สีเขียวมรกต
  }

  // 3. ชีตรายชื่อคณะครูและบุคลากร (Teachers)
  let teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
  if (!teacherSheet) {
    teacherSheet = ss.insertSheet(SHEET_NAMES.TEACHERS);
  }
  const teacherHeaders = [
    'รหัสครู',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'ตำแหน่ง / บทบาท',
    'กลุ่มสาระการเรียนรู้',
    'อีเมล',
    'วิชาที่รับผิดชอบสอน',
    'อัปเดตล่าสุด'
  ];
  if (teacherSheet.getLastRow() === 0) {
    teacherSheet.appendRow(teacherHeaders);
    formatHeaderRow(teacherSheet, '#4338ca'); // สีม่วงคราม
  }

  // 4. ชีตคลังข้อสอบ (Questions)
  let questionSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  if (!questionSheet) {
    questionSheet = ss.insertSheet(SHEET_NAMES.QUESTIONS);
  }
  const questionHeaders = [
    'ID ข้อสอบ',
    'วิชา',
    'ระดับชั้น',
    'โจทย์คำถาม',
    'ความยาก',
    'ตัวเลือก ก (0)',
    'ตัวเลือก ข (1)',
    'ตัวเลือก ค (2)',
    'ตัวเลือก ง (3)',
    'ข้อที่ถูก (0-3)',
    'คำอธิบายเฉลย',
    'เวลา (วินาที)',
    'อัปเดตล่าสุด'
  ];
  if (questionSheet.getLastRow() === 0) {
    questionSheet.appendRow(questionHeaders);
    formatHeaderRow(questionSheet, '#7c2d12'); // สีส้มอิฐ
  }

  // 5. ชีตรายวิชาและกลุ่มสาระ (Subjects)
  let subjectSheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
  if (!subjectSheet) {
    subjectSheet = ss.insertSheet(SHEET_NAMES.SUBJECTS);
  }
  const subjectHeaders = [
    'ID วิชา',
    'รหัสวิชา',
    'ชื่อวิชา',
    'ไอคอน/สัญลักษณ์',
    'โทนสี',
    'ระดับชั้น',
    'คำอธิบายรายวิชา',
    'จำนวนข้อสอบ',
    'อัปเดตล่าสุด'
  ];
  if (subjectSheet.getLastRow() === 0) {
    subjectSheet.appendRow(subjectHeaders);
    formatHeaderRow(subjectSheet, '#0f766e'); // สีเขียวน้ำทะเล
  }

  // 6. ชีตภารกิจและการบ้าน (Assignments)
  let assignmentSheet = ss.getSheetByName(SHEET_NAMES.ASSIGNMENTS);
  if (!assignmentSheet) {
    assignmentSheet = ss.insertSheet(SHEET_NAMES.ASSIGNMENTS);
  }
  const assignmentHeaders = [
    'ID ภารกิจ',
    'ชื่อภารกิจ',
    'วิชา',
    'ระดับชั้น',
    'กลุ่มเป้าหมาย',
    'กำหนดส่ง',
    'รางวัล XP',
    'รางวัลเหรียญทอง',
    'จำนวนข้อสอบ',
    'ครูผู้มอบหมาย',
    'วันที่สร้าง'
  ];
  if (assignmentSheet.getLastRow() === 0) {
    assignmentSheet.appendRow(assignmentHeaders);
    formatHeaderRow(assignmentSheet, '#6d28d9'); // สีม่วงเข้ม
  }

  // 7. ชีตประวัติการเปลี่ยนแปลงของระบบ (Change_Logs)
  let changeSheet = ss.getSheetByName(SHEET_NAMES.CHANGE_LOGS);
  if (!changeSheet) {
    changeSheet = ss.insertSheet(SHEET_NAMES.CHANGE_LOGS);
  }
  const changeHeaders = [
    'วันที่-เวลา (Timestamp)',
    'หมวดหมู่การเปลี่ยนแปลง',
    'ประเภทการดำเนินการ',
    'รายการที่เปลี่ยนแปลง',
    'ผู้ดำเนินการ',
    'รายละเอียดเพิ่มเติม'
  ];
  if (changeSheet.getLastRow() === 0) {
    changeSheet.appendRow(changeHeaders);
    formatHeaderRow(changeSheet, '#be123c'); // สีชมพูกุหลาบ
  }

  return 'สร้างชีตระบบฐานข้อมูลครบถ้วนทั้ง 7 แผ่นงาน (คะแนน, นักเรียน, ครู, ข้อสอบ, รายวิชา, ภารกิจ, ประวัติการเปลี่ยนแปลง) เรียบร้อยแล้ว!';
}

function formatHeaderRow(sheet, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground(bgColor);
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

// -------------------------------------------------------------
// GET Handler: รองรับการเข้าผ่านเบราว์เซอร์ และ API Test
// -------------------------------------------------------------
function doGet(e) {
  setupSheets();
  const action = e && e.parameter ? e.parameter.action : null;

  // 1. ถ้าเป็นการทดสอบการเชื่อมต่อ API จากหน้าเว็บ
  if (action === 'test' || action === 'ping') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
    const rowCount = scoreSheet ? Math.max(0, scoreSheet.getLastRow() - 1) : 0;
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Sheets เชื่อมต่อกับ KhaoNangTuam EduVerse สำเร็จ 100%!',
      sheetName: ss.getName(),
      totalAnswerLogs: rowCount,
      timestamp: new Date().toLocaleString('th-TH')
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. ดึงข้อมูลนักเรียน
  if (action === 'getStudents') {
    return ContentService.createTextOutput(JSON.stringify(getStudentsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 3. ดึงรายชื่อครู
  if (action === 'getTeachers') {
    return ContentService.createTextOutput(JSON.stringify(getTeachersData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 4. ดึงข้อสอบ
  if (action === 'getQuestions') {
    return ContentService.createTextOutput(JSON.stringify(getQuestionsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 5. ดึงรายวิชา
  if (action === 'getSubjects') {
    return ContentService.createTextOutput(JSON.stringify(getSubjectsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 6. ดึงภารกิจ/การบ้าน
  if (action === 'getAssignments') {
    return ContentService.createTextOutput(JSON.stringify(getAssignmentsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 7. ดึงบันทึกการเปลี่ยนแปลง
  if (action === 'getChangeLogs') {
    return ContentService.createTextOutput(JSON.stringify(getChangeLogsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 8. ถ้าเปิดดูจากเบราว์เซอร์ตรงๆ: แสดงหน้าเว็บสถานะยืนยันความพร้อม 100% ครบทุกชีต
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  const rowCount = scoreSheet ? Math.max(0, scoreSheet.getLastRow() - 1) : 0;
  const teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
  const teacherCount = teacherSheet ? Math.max(0, teacherSheet.getLastRow() - 1) : 0;
  const studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  const studentCount = studentSheet ? Math.max(0, studentSheet.getLastRow() - 1) : 0;
  const questionSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const questionCount = questionSheet ? Math.max(0, questionSheet.getLastRow() - 1) : 0;
  const subjectSheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
  const subjectCount = subjectSheet ? Math.max(0, subjectSheet.getLastRow() - 1) : 0;
  const assignmentSheet = ss.getSheetByName(SHEET_NAMES.ASSIGNMENTS);
  const assignmentCount = assignmentSheet ? Math.max(0, assignmentSheet.getLastRow() - 1) : 0;
  const changeSheet = ss.getSheetByName(SHEET_NAMES.CHANGE_LOGS);
  const changeCount = changeSheet ? Math.max(0, changeSheet.getLastRow() - 1) : 0;
  
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KhaoNangTuam EduVerse - Sheets Database API</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Prompt', sans-serif; }</style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
    <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-emerald-500/30 text-3xl font-bold">
      ✓
    </div>
    <h1 class="text-2xl font-bold text-white mb-1">KhaoNangTuam EduVerse</h1>
    <p class="text-emerald-400 font-medium text-sm mb-5">🟢 Google Sheets Database ทำงานปกติ 100%</p>
    
    <div class="bg-slate-900/80 rounded-2xl p-4 text-left text-xs space-y-2.5 border border-slate-700/60 mb-6 text-slate-300">
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">ชื่อแผ่นงาน Google Sheets:</span>
        <span class="font-bold text-white">\${ss.getName()}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">1. บันทึกผลคะแนน (Scores_Logs):</span>
        <span class="font-bold text-amber-400">\${rowCount} รายการ</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">2. รายชื่อนักเรียน (Students):</span>
        <span class="font-bold text-emerald-400">\${studentCount} คน</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">3. คณะครูผู้สอน (Teachers):</span>
        <span class="font-bold text-indigo-400">\${teacherCount} ท่าน</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">4. คลังข้อสอบ (Questions):</span>
        <span class="font-bold text-orange-400">\${questionCount} ข้อ</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">5. รายวิชา (Subjects):</span>
        <span class="font-bold text-teal-400">\${subjectCount} วิชา</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-2">
        <span class="text-slate-400">6. ภารกิจและการบ้าน (Assignments):</span>
        <span class="font-bold text-violet-400">\${assignmentCount} ภารกิจ</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">7. ประวัติการเปลี่ยนแปลง (Change_Logs):</span>
        <span class="font-bold text-rose-400">\${changeCount} เหตุการณ์</span>
      </div>
    </div>

    <p class="text-xs text-slate-400 leading-relaxed mb-6">
      ข้อมูลทุกส่วน (ข้อสอบ, คะแนน, นักเรียน, ครู, รายวิชา, ภารกิจ, และประวัติการเปลี่ยนแปลง) จัดเก็บใน Google Sheets เรียบร้อยแล้ว
    </p>

    <a href="\${ss.getUrl()}" target="_blank" class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30">
      📊 เปิดดู Google Sheets แผ่นงานนี้
    </a>
  </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html)
    .setTitle('KhaoNangTuam EduVerse - Sheets API')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// -------------------------------------------------------------
// POST Handler: รับข้อมูลคะแนน นักเรียน ครู ข้อสอบ รายวิชา ภารกิจ และบันทึกการเปลี่ยนแปลง
// -------------------------------------------------------------
function doPost(e) {
  setupSheets();
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. บันทึกผลการตอบคำถาม (Scores_Logs)
    if (action === 'submitAnswer') {
      const log = payload.log || payload.submission || {};
      const scoreSheet = ss.getSheetByName(SHEET_NAMES.SCORES);
      
      scoreSheet.appendRow([
        log.timestamp || new Date().toLocaleString('th-TH'),
        log.studentCode || log.studentId || '-',
        log.studentName || 'นักเรียน',
        log.classroom || '-',
        log.subjectName || '-',
        log.teacherName || log.teacher || '-',
        log.mode || 'practice',
        log.questionText || '-',
        log.selectedOptionText || (log.selectedOption !== undefined ? 'ตัวเลือก ' + log.selectedOption : '-'),
        log.correctOptionText || (log.correctOption !== undefined ? 'ตัวเลือก ' + log.correctOption : '-'),
        log.isCorrect ? '✓ ถูกต้อง' : '✗ ไม่ถูกต้อง',
        log.earnedXp || 0,
        log.earnedCoins || 0,
        log.timeSpentSeconds || 0,
        log.questionId || '-'
      ]);

      // ซิงค์คะแนนนักเรียนไปยังชีต Students ทันที (ถ้ามีข้อมูล)
      if (log.studentId || log.studentCode) {
        updateStudentScoreSummary(ss, log.studentCode || log.studentId, log.earnedXp || 0, log.earnedCoins || 0, log.isCorrect);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกคะแนนเข้า Google Sheets เรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. บันทึกการเปลี่ยนแปลงต่างๆ (Change_Logs)
    if (action === 'recordChangeLog') {
      const c = payload.log || payload.data || {};
      const changeSheet = ss.getSheetByName(SHEET_NAMES.CHANGE_LOGS);
      changeSheet.appendRow([
        c.timestamp || new Date().toLocaleString('th-TH'),
        c.category || 'ระบบ',
        c.action || 'แก้ไข',
        c.target || '-',
        c.modifiedBy || 'คุณครู/ผู้ดูแลระบบ',
        c.details || '-'
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกประวัติการเปลี่ยนแปลงลง Google Sheets แล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. บันทึก/อัปเดตรายวิชา (Save Single Subject)
    if (action === 'saveSubject') {
      const s = payload.subject || payload.data || {};
      const subId = String(s.id || s.code || '').trim();
      if (!subId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'ไม่มีรหัสหรือ ID รายวิชา'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const subjectSheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
      const data = subjectSheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === subId || String(data[i][1]).trim() === String(s.code).trim()) {
          rowIndex = i + 1;
          break;
        }
      }
      const rowValues = [
        s.id || subId,
        s.code || '',
        s.name || '',
        s.icon || 'BookOpen',
        s.color || 'indigo',
        s.gradeLevel || 'ม.3',
        s.description || '',
        s.questionCount || 0,
        new Date().toLocaleString('th-TH')
      ];
      if (rowIndex > 0) {
        subjectSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        subjectSheet.appendRow(rowValues);
      }
      appendChangeLog(ss, 'รายวิชา', rowIndex > 0 ? 'แก้ไข' : 'เพิ่ม', s.name + ' (' + s.code + ')', 'ครู/ผู้ดูแล', 'ไอคอน: ' + (s.icon || 'BookOpen'));
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลรายวิชา ' + s.name + ' ลง Google Sheets เรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. ลบรายวิชา (Delete Single Subject)
    if (action === 'deleteSubject') {
      const subId = String(payload.subjectId || payload.id || '').trim();
      const subjectSheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
      const data = subjectSheet.getDataRange().getValues();
      let deleted = false;
      let subName = subId;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === subId || String(data[i][1]).trim() === subId) {
          subName = String(data[i][2]);
          subjectSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        appendChangeLog(ss, 'รายวิชา', 'ลบ', subName, 'ครู/ผู้ดูแล', 'ลบรายวิชาออกจากระบบ');
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? 'ลบรายวิชาออกจาก Google Sheets เรียบร้อยแล้ว' : 'ไม่พบรายวิชา'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. ซิงค์รายวิชาทั้งหมด (Sync Subjects)
    if (action === 'syncSubjects') {
      const subjects = payload.subjects || [];
      const subjectSheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
      if (subjectSheet.getLastRow() > 1) {
        subjectSheet.deleteRows(2, subjectSheet.getLastRow() - 1);
      }
      subjects.forEach(s => {
        subjectSheet.appendRow([
          s.id || '',
          s.code || '',
          s.name || '',
          s.icon || 'BookOpen',
          s.color || 'indigo',
          s.gradeLevel || 'ม.3',
          s.description || '',
          s.questionCount || 0,
          new Date().toLocaleString('th-TH')
        ]);
      });
      appendChangeLog(ss, 'รายวิชา', 'ซิงค์', subjects.length + ' วิชา', 'ระบบ', 'ซิงค์รายวิชาทั้งหมดลงชีท');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'ซิงค์รายวิชา ' + subjects.length + ' วิชาลง Google Sheets เรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. บันทึก/อัปเดตนักเรียนรายคน (Save Single Student)
    if (action === 'saveStudent') {
      const s = payload.student || payload.data || {};
      const studentCode = String(s.studentCode || s.id || '').trim();
      if (!studentCode) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'ไม่มีรหัสนักเรียน'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const data = studentSheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === studentCode || (s.id && String(data[i][0]).trim() === String(s.id).trim())) {
          rowIndex = i + 1;
          break;
        }
      }

      const rowValues = [
        studentCode,
        s.prefix || '',
        s.firstName || '',
        s.lastName || '',
        s.classroom || '',
        s.number || 0,
        s.level || 1,
        s.xp || 0,
        s.coins || 0,
        s.streakDays || 0,
        s.battleWins || 0,
        (s.accuracy !== undefined ? String(s.accuracy).replace('%', '') : '100') + '%',
        new Date().toLocaleString('th-TH')
      ];

      if (rowIndex > 0) {
        studentSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        studentSheet.appendRow(rowValues);
      }

      appendChangeLog(ss, 'นักเรียน', rowIndex > 0 ? 'แก้ไข' : 'เพิ่ม', (s.prefix || '') + s.firstName + ' ' + (s.lastName || ''), 'ครู/ผู้ดูแล', 'ชั้น ' + (s.classroom || '-'));

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลนักเรียน ' + (s.prefix || '') + s.firstName + ' ' + (s.lastName || '') + ' ลง Google Sheets เรียบร้อยแล้ว',
        isNew: rowIndex === -1
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 7. ลบนักเรียน (Delete Single Student)
    if (action === 'deleteStudent') {
      const codeOrId = String(payload.studentCode || payload.studentId || payload.id || '').trim();
      const studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const data = studentSheet.getDataRange().getValues();
      let deleted = false;
      let stdName = codeOrId;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === codeOrId) {
          stdName = String(data[i][1]) + String(data[i][2]) + ' ' + String(data[i][3]);
          studentSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        appendChangeLog(ss, 'นักเรียน', 'ลบ', stdName, 'ครู/ผู้ดูแล', 'ลบข้อมูลนักเรียนออกจากระบบ');
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? 'ลบข้อมูลนักเรียนออกจาก Google Sheets เรียบร้อยแล้ว' : 'ไม่พบข้อมูลนักเรียน'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 8. บันทึก/อัปเดตคุณครูรายท่าน (Save Single Teacher)
    if (action === 'saveTeacher') {
      const t = payload.teacher || payload.data || {};
      const teacherId = String(t.teacherId || t.id || '').trim();
      if (!teacherId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'ไม่มีรหัสคุณครู'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
      const data = teacherSheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === teacherId) {
          rowIndex = i + 1;
          break;
        }
      }

      const assignedSubs = Array.isArray(t.assignedSubjects) ? t.assignedSubjects.join(', ') : (t.assignedSubjects || 'ทุกวิชา');
      const rowValues = [
        teacherId,
        t.prefix || '',
        t.firstName || '',
        t.lastName || '',
        t.role || 'ครูผู้สอน',
        t.department || 'กลุ่มสาระการเรียนรู้',
        t.email || '-',
        assignedSubs,
        new Date().toLocaleString('th-TH')
      ];

      if (rowIndex > 0) {
        teacherSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        teacherSheet.appendRow(rowValues);
      }

      appendChangeLog(ss, 'ครู', rowIndex > 0 ? 'แก้ไข' : 'เพิ่ม', (t.prefix || '') + t.firstName + ' ' + (t.lastName || ''), 'ผู้ดูแลระบบ', 'บทบาท: ' + (t.role || 'ครูผู้สอน'));

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลคุณครู ' + (t.prefix || '') + t.firstName + ' ' + (t.lastName || '') + ' ลง Google Sheets เรียบร้อยแล้ว',
        isNew: rowIndex === -1
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 9. ลบคุณครู (Delete Single Teacher)
    if (action === 'deleteTeacher') {
      const teacherId = String(payload.teacherId || payload.id || '').trim();
      const teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
      const data = teacherSheet.getDataRange().getValues();
      let deleted = false;
      let tName = teacherId;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === teacherId) {
          tName = String(data[i][1]) + String(data[i][2]) + ' ' + String(data[i][3]);
          teacherSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        appendChangeLog(ss, 'ครู', 'ลบ', tName, 'ผู้ดูแลระบบ', 'ลบข้อมูลคุณครูออกจากระบบ');
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? 'ลบข้อมูลคุณครูออกจาก Google Sheets เรียบร้อยแล้ว' : 'ไม่พบข้อมูลคุณครู'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 10. บันทึก/อัปเดตข้อสอบรายข้อ (Save Single Question)
    if (action === 'saveQuestion') {
      const q = payload.question || payload.data || {};
      const qId = String(q.id || '').trim();
      const qSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
      const data = qSheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === qId) {
          rowIndex = i + 1;
          break;
        }
      }
      const opts = q.options || [];
      const rowValues = [
        qId || ('Q_' + Date.now()),
        q.subjectName || '',
        q.gradeLevel || '',
        q.questionText || '',
        q.difficulty || 'medium',
        opts[0] || '',
        opts[1] || '',
        opts[2] || '',
        opts[3] || '',
        q.correctIndex !== undefined ? q.correctIndex : 0,
        q.explanation || '',
        q.timeLimitSeconds || 30,
        new Date().toLocaleString('th-TH')
      ];
      if (rowIndex > 0) {
        qSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        qSheet.appendRow(rowValues);
      }
      appendChangeLog(ss, 'ข้อสอบ', rowIndex > 0 ? 'แก้ไข' : 'เพิ่ม', q.subjectName + ' (' + (q.gradeLevel || 'ม.3') + ')', 'ครูผู้สอน', (q.questionText || '').substring(0, 40) + '...');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อสอบลง Google Sheets เรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 11. ลบข้อสอบ (Delete Single Question)
    if (action === 'deleteQuestion') {
      const qId = String(payload.questionId || payload.id || '').trim();
      const qSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
      const data = qSheet.getDataRange().getValues();
      let deleted = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === qId) {
          qSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        appendChangeLog(ss, 'ข้อสอบ', 'ลบ', 'ID: ' + qId, 'ครูผู้สอน', 'ลบข้อสอบออกจากคลัง');
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? 'ลบข้อสอบออกจาก Google Sheets เรียบร้อยแล้ว' : 'ไม่พบข้อสอบ'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 12. บันทึกภารกิจ (Save Assignment)
    if (action === 'saveAssignment') {
      const a = payload.assignment || payload.data || {};
      const aId = String(a.id || '').trim();
      const aSheet = ss.getSheetByName(SHEET_NAMES.ASSIGNMENTS);
      const data = aSheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === aId) {
          rowIndex = i + 1;
          break;
        }
      }
      const rowValues = [
        aId || ('ASN_' + Date.now()),
        a.title || '',
        a.subjectName || '',
        a.gradeLevel || '',
        a.targetType || 'all',
        a.dueDate || '',
        a.rewardXp || 100,
        a.rewardCoins || 20,
        Array.isArray(a.questionIds) ? a.questionIds.length : 0,
        a.teacherName || 'ครูผู้สอน',
        new Date().toLocaleString('th-TH')
      ];
      if (rowIndex > 0) {
        aSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        aSheet.appendRow(rowValues);
      }
      appendChangeLog(ss, 'ภารกิจ', rowIndex > 0 ? 'แก้ไข' : 'เพิ่ม', a.title, a.teacherName || 'ครูผู้สอน', 'กำหนดส่ง: ' + (a.dueDate || '-'));
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกภารกิจการบ้านลง Google Sheets เรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 13. ลบภารกิจ (Delete Assignment)
    if (action === 'deleteAssignment') {
      const aId = String(payload.assignmentId || payload.id || '').trim();
      const aSheet = ss.getSheetByName(SHEET_NAMES.ASSIGNMENTS);
      const data = aSheet.getDataRange().getValues();
      let deleted = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === aId) {
          aSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        appendChangeLog(ss, 'ภารกิจ', 'ลบ', 'ID: ' + aId, 'ครูผู้สอน', 'ลบภารกิจออกจากระบบ');
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? 'ลบภารกิจออกจาก Google Sheets เรียบร้อยแล้ว' : 'ไม่พบภารกิจ'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 14. ซิงค์รายชื่อคณะครู (Sync Teachers)
    if (action === 'syncTeachers') {
      const teachers = payload.teachers || [];
      const teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
      if (teacherSheet.getLastRow() > 1) {
        teacherSheet.deleteRows(2, teacherSheet.getLastRow() - 1);
      }
      teachers.forEach(t => {
        teacherSheet.appendRow([
          t.teacherId || t.id || '-',
          t.prefix || '',
          t.firstName || '',
          t.lastName || '',
          t.role || 'ครูผู้สอน',
          t.department || 'กลุ่มสาระการเรียนรู้',
          t.email || '-',
          (t.assignedSubjects || []).join(', ') || 'ทุกวิชา',
          new Date().toLocaleString('th-TH')
        ]);
      });
      appendChangeLog(ss, 'ครู', 'ซิงค์', teachers.length + ' ท่าน', 'ระบบ', 'ซิงค์รายชื่อคณะครูทั้งหมดลงชีท');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'ซิงค์รายชื่อคณะครู ' + teachers.length + ' ท่านเรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 15. ซิงค์รายชื่อนักเรียน (Sync Students)
    if (action === 'syncStudents') {
      const students = payload.students || [];
      const studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      if (studentSheet.getLastRow() > 1) {
        studentSheet.deleteRows(2, studentSheet.getLastRow() - 1);
      }
      students.forEach(s => {
        studentSheet.appendRow([
          s.studentCode || s.id,
          s.prefix || '',
          s.firstName || '',
          s.lastName || '',
          s.classroom || '',
          s.number || 0,
          s.level || 1,
          s.xp || 0,
          s.coins || 0,
          s.streakDays || 0,
          s.battleWins || 0,
          (s.accuracy || 100) + '%',
          new Date().toLocaleString('th-TH')
        ]);
      });
      appendChangeLog(ss, 'นักเรียน', 'ซิงค์', students.length + ' คน', 'ระบบ', 'ซิงค์รายชื่อนักเรียนทั้งหมดลงชีท');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'ซิงค์รายชื่อนักเรียน ' + students.length + ' คนเรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 16. ซิงค์คลังข้อสอบ (Sync Questions)
    if (action === 'syncQuestions') {
      const questions = payload.questions || [];
      const qSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
      if (qSheet.getLastRow() > 1) {
        qSheet.deleteRows(2, qSheet.getLastRow() - 1);
      }
      questions.forEach(q => {
        const opts = q.options || [];
        qSheet.appendRow([
          q.id,
          q.subjectName || '',
          q.gradeLevel || '',
          q.questionText || '',
          q.difficulty || 'medium',
          opts[0] || '',
          opts[1] || '',
          opts[2] || '',
          opts[3] || '',
          q.correctIndex,
          q.explanation || '',
          q.timeLimitSeconds || 30,
          new Date().toLocaleString('th-TH')
        ]);
      });
      appendChangeLog(ss, 'ข้อสอบ', 'ซิงค์', questions.length + ' ข้อ', 'ระบบ', 'ซิงค์ข้อสอบทั้งหมดลงชีท');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'ซิงค์ข้อสอบ ' + questions.length + ' ข้อเรียบร้อยแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 17. ซิงค์ข้อมูลทั้งหมด (Sync All)
    if (action === 'syncAll') {
      if (payload.students) doPost({ postData: { contents: JSON.stringify({ action: 'syncStudents', students: payload.students }) } });
      if (payload.teachers) doPost({ postData: { contents: JSON.stringify({ action: 'syncTeachers', teachers: payload.teachers }) } });
      if (payload.questions) doPost({ postData: { contents: JSON.stringify({ action: 'syncQuestions', questions: payload.questions }) } });
      if (payload.subjects) doPost({ postData: { contents: JSON.stringify({ action: 'syncSubjects', subjects: payload.subjects }) } });
      appendChangeLog(ss, 'ระบบ', 'ซิงค์', 'ทุกตาราง', 'ผู้ดูแลระบบ', 'ซิงค์ข้อมูลระบบทั้งหมดลง Google Sheets');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'ซิงค์ข้อมูลระบบทั้งหมดลง Google Sheets ครบถ้วนแล้ว'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 18. ทดสอบ ping POST
    if (action === 'test' || action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Google Sheets ตอบรับคำขอ POST เรียบร้อย 100%!',
        sheetName: ss.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'รับข้อมูลแล้ว'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ฟังก์ชันช่วยบันทึกการเปลี่ยนแปลงลงชีต Change_Logs
function appendChangeLog(ss, category, action, target, modifiedBy, details) {
  try {
    const sheet = ss.getSheetByName(SHEET_NAMES.CHANGE_LOGS);
    if (sheet) {
      sheet.appendRow([
        new Date().toLocaleString('th-TH'),
        category || 'ระบบ',
        action || 'แก้ไข',
        target || '-',
        modifiedBy || 'ผู้ใช้ระบบ',
        details || '-'
      ]);
    }
  } catch (e) {
    // silent
  }
}

// ฟังก์ชันอัปเดตสถิตินักเรียนในชีต Students เมื่อทำข้อสอบเสร็จ
function updateStudentScoreSummary(ss, studentCodeOrId, earnedXp, earnedCoins, isCorrect) {
  try {
    const studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
    if (!studentSheet || studentSheet.getLastRow() <= 1) return;
    const data = studentSheet.getDataRange().getValues();
    const code = String(studentCodeOrId).trim();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === code) {
        const row = i + 1;
        const currentXp = Number(data[i][7]) || 0;
        const currentCoins = Number(data[i][8]) || 0;
        const newXp = currentXp + earnedXp;
        const newCoins = currentCoins + earnedCoins;
        const newLevel = Math.floor(newXp / 500) + 1;
        studentSheet.getRange(row, 7).setValue(newLevel);
        studentSheet.getRange(row, 8).setValue(newXp);
        studentSheet.getRange(row, 9).setValue(newCoins);
        studentSheet.getRange(row, 13).setValue(new Date().toLocaleString('th-TH'));
        break;
      }
    }
  } catch (e) {
    // silent
  }
}

// ฟังก์ชันดึงข้อมูลนักเรียนจาก Sheet
function getStudentsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    studentCode: String(r[0]),
    prefix: String(r[1]),
    firstName: String(r[2]),
    lastName: String(r[3]),
    classroom: String(r[4]),
    number: Number(r[5]),
    level: Number(r[6]),
    xp: Number(r[7]),
    coins: Number(r[8]),
    streakDays: Number(r[9]),
    battleWins: Number(r[10])
  }));
}

// ฟังก์ชันดึงข้อมูลครูจาก Sheet
function getTeachersData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    teacherId: String(r[0]),
    prefix: String(r[1]),
    firstName: String(r[2]),
    lastName: String(r[3]),
    role: String(r[4]),
    department: String(r[5]),
    email: String(r[6]),
    assignedSubjects: String(r[7]).split(',').map(s => s.trim())
  }));
}

// ฟังก์ชันดึงข้อสอบจาก Sheet
function getQuestionsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    id: String(r[0]),
    subjectName: String(r[1]),
    gradeLevel: String(r[2]),
    questionText: String(r[3]),
    difficulty: String(r[4]),
    options: [String(r[5]), String(r[6]), String(r[7]), String(r[8])],
    correctIndex: Number(r[9]),
    explanation: String(r[10]),
    timeLimitSeconds: Number(r[11])
  }));
}

// ฟังก์ชันดึงรายวิชาจาก Sheet
function getSubjectsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    id: String(r[0]),
    code: String(r[1]),
    name: String(r[2]),
    icon: String(r[3]),
    color: String(r[4]),
    gradeLevel: String(r[5]),
    description: String(r[6]),
    questionCount: Number(r[7]) || 0
  }));
}

// ฟังก์ชันดึงภารกิจจาก Sheet
function getAssignmentsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ASSIGNMENTS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(r => ({
    id: String(r[0]),
    title: String(r[1]),
    subjectName: String(r[2]),
    gradeLevel: String(r[3]),
    targetType: String(r[4]),
    dueDate: String(r[5]),
    rewardXp: Number(r[6]) || 100,
    rewardCoins: Number(r[7]) || 20,
    questionCount: Number(r[8]) || 0,
    teacherName: String(r[9]),
    createdAt: String(r[10])
  }));
}

// ฟังก์ชันดึงประวัติการเปลี่ยนแปลงจาก Sheet
function getChangeLogsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CHANGE_LOGS);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.slice(-50).reverse().map(r => ({
    timestamp: String(r[0]),
    category: String(r[1]),
    action: String(r[2]),
    target: String(r[3]),
    modifiedBy: String(r[4]),
    details: String(r[5])
  }));
}
`;

