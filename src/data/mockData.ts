import {
  Student,
  Teacher,
  Subject,
  Question,
  Badge,
  AnswerLog,
  Assignment,
  AssignmentSubmission,
  AppNotification,
  BossMonster,
  TowerStage,
  GameInfo,
  WordPuzzleItem,
  ClanHouse
} from '../types';

export const INITIAL_CLANS: ClanHouse[] = [
  {
    id: 'fire',
    name: 'Crimson Peak',
    thaiName: 'บ้านศิลาเพลิง',
    mountainName: 'ยอดผาศิลาอัคนี (เขานางต่วม)',
    element: 'ธาตุไฟ & พลังใจ',
    symbol: '🌋',
    bannerColor: 'from-red-600 via-rose-600 to-amber-600',
    themeGradient: 'from-red-950/90 via-rose-900/40 to-slate-950',
    borderColor: 'border-red-500/50',
    motto: 'กล้าหาญ มุ่งมั่น ลุกโชติช่วงดั่งเปลวเพลิง',
    description: 'นักรบผู้เปี่ยมด้วยพลังความมุ่งมั่น ไม่ย่อท้อต่อโจทย์ยาก พิชิตคะแนนสูงสุดด้วยความเร็ว',
    totalXp: 18450,
    totalTrophies: 34,
    totalMembers: 28,
    leaderStudentName: 'ด.ช. ก้องภพ สิริรัตนากุล',
    guardianSpirit: 'มังกรเพลิงศิลาต่วม'
  },
  {
    id: 'water',
    name: 'Azure Stream',
    thaiName: 'บ้านวารีเวหา',
    mountainName: 'ผาน้ำตกเมฆา (เขานางต่วม)',
    element: 'ธาตุน้ำ & ปัญญาไหลลื่น',
    symbol: '🌊',
    bannerColor: 'from-blue-600 via-cyan-600 to-teal-600',
    themeGradient: 'from-blue-950/90 via-cyan-900/40 to-slate-950',
    borderColor: 'border-cyan-500/50',
    motto: 'สงบ ลุ่มลึก แม่นยำดั่งสายน้ำไหล',
    description: 'ผู้รักความแม่นยำและการคิดวิเคราะห์อย่างรอบคอบ ทำคะแนนความถูกต้องสูงลิ่วและยอดเยี่ยม',
    totalXp: 19820,
    totalTrophies: 38,
    totalMembers: 30,
    leaderStudentName: 'ด.ญ. พิชญา อรุณรุ่งโรจน์',
    guardianSpirit: 'พญานาควารีพิสุทธิ์'
  },
  {
    id: 'earth',
    name: 'Emerald Forest',
    thaiName: 'บ้านพฤกษาพนา',
    mountainName: 'หุบเขาพฤกษาพันปี (เขานางต่วม)',
    element: 'ธาตุดิน & การเติบโตมั่นคง',
    symbol: '🌿',
    bannerColor: 'from-emerald-600 via-green-600 to-teal-600',
    themeGradient: 'from-emerald-950/90 via-green-900/40 to-slate-950',
    borderColor: 'border-emerald-500/50',
    motto: 'มั่นคง สามัคคี เติบโตงอกงามไร้สิ้นสุด',
    description: 'กลุ่มนักเรียนผู้ขยัน อดทน สะสม Streak ต่อเนื่อง และช่วยเหลือเกื้อกูลกันในทีม',
    totalXp: 17640,
    totalTrophies: 31,
    totalMembers: 29,
    leaderStudentName: 'ด.ญ. นลินนิภา กิตติคุณากร',
    guardianSpirit: 'พฤกษาพิทักษ์แห่งขุนเขา'
  },
  {
    id: 'star',
    name: 'Cosmic Zenith',
    thaiName: 'บ้านดารารัศมี',
    mountainName: 'ลานดาวเหนือเมฆ (เขานางต่วม)',
    element: 'ธาตุแสง & ความคิดสร้างสรรค์',
    symbol: '✨',
    bannerColor: 'from-purple-600 via-fuchsia-600 to-amber-500',
    themeGradient: 'from-purple-950/90 via-fuchsia-900/40 to-slate-950',
    borderColor: 'border-purple-500/50',
    motto: 'จินตนาการกว้างไกล ส่องประกายแห่งอนาคต',
    description: 'จอมเวทย์ดาราศาสตร์ผู้สร้างสรรค์การคิดนอกกรอบ ชนะเกมคำศัพท์และปริศนาซับซ้อน',
    totalXp: 20110,
    totalTrophies: 42,
    totalMembers: 31,
    leaderStudentName: 'ด.ช. ธนกฤต วงษ์สุวรรณ',
    guardianSpirit: 'นกฟีนิกซ์ดาราจักร'
  }
];

export const DEFAULT_EMPTY_STUDENT: Student = {
  id: '',
  studentCode: '',
  prefix: '',
  firstName: '',
  lastName: '',
  classroom: '',
  number: 0,
  avatar: '👤',
  level: 1,
  xp: 0,
  coins: 0,
  streakDays: 0,
  title: '',
  clanId: 'fire',
  completedQuizzes: 0,
  battleWins: 0,
  battleLosses: 0,
  accuracy: 0,
  badgeIds: []
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
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
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'SUB_SCI',
    name: 'วิทยาศาสตร์และเทคโนโลยี',
    code: 'ว23101',
    icon: 'Atom',
    color: 'emerald',
    gradeLevel: 'ม.3',
    description: 'พันธุศาสตร์ ระบบนิเวศ แรงและการเคลื่อนที่ และพลังงานไฟฟ้า',
    questionCount: 8
  },
  {
    id: 'SUB_MATH',
    name: 'คณิตศาสตร์พื้นฐาน',
    code: 'ค23101',
    icon: 'Calculator',
    color: 'blue',
    gradeLevel: 'ม.3',
    description: 'อสมการเชิงเส้นตัวแปรเดียว ความน่าจะเป็น สถิติ และพื้นที่ผิวและปริมาตร',
    questionCount: 8
  },
  {
    id: 'SUB_THAI',
    name: 'ภาษาไทย วรรณคดีและหลักภาษา',
    code: 'ท23101',
    icon: 'BookOpen',
    color: 'amber',
    gradeLevel: 'ม.3',
    description: 'การอ่านจับใจความ คำสมาสสนธิ ราชาศัพท์ และวรรณคดีเรื่องอิศรญาณภาษิต',
    questionCount: 6
  },
  {
    id: 'SUB_ENG',
    name: 'ภาษาอังกฤษเพื่อการสื่อสาร',
    code: 'อ23101',
    icon: 'Globe2',
    color: 'indigo',
    gradeLevel: 'ม.3',
    description: 'Grammar, Reading Comprehension, Everyday Vocabulary & Idioms',
    questionCount: 6
  },
  {
    id: 'SUB_SOC',
    name: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    code: 'ส23101',
    icon: 'Landmark',
    color: 'rose',
    gradeLevel: 'ม.3',
    description: 'ประวัติศาสตร์ไทย ทวีปอเมริกาเหนือ-ใต้ สิทธิมนุษยชน และเศรษฐกิจพอเพียง',
    questionCount: 5
  },
  {
    id: 'SUB_COMP',
    name: 'วิทยาการคำนวณและ AI',
    code: 'ว23103',
    icon: 'Cpu',
    color: 'violet',
    gradeLevel: 'ม.3',
    description: 'การประมวลผลข้อมูล ปัญญาประดิษฐ์ (AI) ความปลอดภัยทางไซเบอร์ และ IoT',
    questionCount: 6
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'BADGE_FIRST_WIN',
    name: 'ชัยชนะแรก',
    description: 'ชนะการดวลควิซ Battle ครั้งแรกสำเร็จ',
    icon: '🏆',
    rarity: 'common'
  },
  {
    id: 'BADGE_STREAK_3',
    name: 'ไฟแห่งความขยัน (3 วัน)',
    description: 'เข้าทำแบบทดสอบติดต่อกันครบ 3 วัน',
    icon: '🔥',
    rarity: 'common'
  },
  {
    id: 'BADGE_STREAK_5',
    name: 'นักเรียนตัวอย่าง (5 วัน)',
    description: 'เข้าทำแบบทดสอบติดต่อกันครบ 5 วัน',
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'BADGE_STREAK_10',
    name: 'จิตวิญญาณแห่งปัญญา (10 วัน)',
    description: 'ทำแบบทดสอบต่อเนื่อง 10 วันไม่มีขาด',
    icon: '🌟',
    rarity: 'epic'
  },
  {
    id: 'BADGE_BATTLE_10',
    name: 'จอมยุทธ์แห่งสังเวียน',
    description: 'ชนะการประลองความรู้ใน Battle Mode รวม 10 ครั้ง',
    icon: '⚔️',
    rarity: 'rare'
  },
  {
    id: 'BADGE_QUIZ_MASTER',
    name: 'เซียนตอบไว 100%',
    description: 'ทำข้อสอบได้คะแนนเต็ม 100% ภายใน 60 วินาที',
    icon: '🎯',
    rarity: 'epic'
  },
  {
    id: 'BADGE_MASTER_SCI',
    name: 'อัจฉริยะวิทย์ ม.ต้น',
    description: 'ทำคะแนนวิทยาศาสตร์สะสมเกิน 1,000 แต้ม',
    icon: '🧪',
    rarity: 'legendary'
  },
  {
    id: 'BADGE_MASTER_MATH',
    name: 'จ้าวเรขาคณิตและพีชคณิต',
    description: 'ตอบถูกข้อสอบคณิตศาสตร์ระดับยากติดต่อกัน 5 ข้อ',
    icon: '📐',
    rarity: 'legendary'
  }
];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_BOSSES: BossMonster[] = [
  {
    id: 'BOSS_1',
    name: 'โกเลมศิลาคณิตศาสตร์ (Math Stone Golem)',
    title: 'ผู้พิทักษ์ประตูแห่งอสมการ',
    avatar: '🗿',
    maxHp: 400,
    currentHp: 400,
    attackPower: 25,
    element: 'ดิน & ตรรกะ',
    specialSkill: 'หินถล่มสมการ (ลดเวลาคิด 5 วินาที)',
    rewardXp: 300,
    rewardCoins: 80
  },
  {
    id: 'BOSS_2',
    name: 'มังกรไซเบอร์ควอนตัม (Cyber Dragon AI)',
    title: 'จอมราชันย์แห่งอัลกอริทึม',
    avatar: '🐉',
    maxHp: 650,
    currentHp: 650,
    attackPower: 35,
    element: 'สายฟ้า & นิวรอน',
    specialSkill: 'Overclock Shockwave (โจมตี 2 เท่าเมื่อผู้เล่นตอบช้า)',
    rewardXp: 500,
    rewardCoins: 150
  },
  {
    id: 'BOSS_3',
    name: 'อสูรพฤกษาพันธุศาสตร์ (Bio Titan)',
    title: 'จ้าวแห่งรหัสพันธุกรรม DNA',
    avatar: '🌳',
    maxHp: 800,
    currentHp: 800,
    attackPower: 45,
    element: 'ธรรมชาติ & เซลล์',
    specialSkill: 'Photosynthesis Heal (ฟื้นฟูเลือดถ้าผู้เล่นตอบผิด)',
    rewardXp: 750,
    rewardCoins: 250
  }
];

export const INITIAL_TOWER_STAGES: TowerStage[] = [
  {
    stageNumber: 1,
    name: 'ด่านที่ 1: ทุ่งหญ้าแห่งการเริ่มต้น',
    description: 'ทดสอบความรู้พื้นฐานวิทยาศาสตร์และคณิตศาสตร์ระดับง่าย',
    difficulty: 'easy',
    requiredStars: 0,
    starsEarned: 3,
    isUnlocked: true,
    isCompleted: true
  },
  {
    stageNumber: 2,
    name: 'ด่านที่ 2: ปราสาทศิลาคำศัพท์และหลักภาษา',
    description: 'ประลองความไวภาษาไทยและภาษาอังกฤษเพื่อการสื่อสาร',
    difficulty: 'easy',
    requiredStars: 2,
    starsEarned: 2,
    isUnlocked: true,
    isCompleted: true
  },
  {
    stageNumber: 3,
    name: 'ด่านที่ 3: หุบเขาฟิสิกส์และกฎของโอห์ม',
    description: 'โจทย์คำนวณและหลักการไฟฟ้า ท้าทายสมาธิ',
    difficulty: 'medium',
    requiredStars: 4,
    starsEarned: 0,
    isUnlocked: true,
    isCompleted: false
  },
  {
    stageNumber: 4,
    name: 'ด่านที่ 4: เครือข่ายปัญญาประดิษฐ์ AI',
    description: 'โจทย์สื่อผสม วิดีโอและรูปภาพวิเคราะห์ระดับสูง',
    difficulty: 'medium',
    requiredStars: 7,
    starsEarned: 0,
    isUnlocked: false,
    isCompleted: false
  },
  {
    stageNumber: 5,
    name: 'ด่านที่ 5: บัลลังก์ยอดหอคอยแห่งปัญญา',
    description: 'ประลองข้อสอบระดับยากกับบอสใหญ่เพื่อครอบครองมงกุฎแห่งตำนาน',
    difficulty: 'hard',
    requiredStars: 10,
    starsEarned: 0,
    isUnlocked: false,
    isCompleted: false,
    bossName: 'มังกรไซเบอร์ควอนตัม',
    bossAvatar: '👑'
  }
];

export const ALL_GAME_MODES: GameInfo[] = [
  {
    id: 'quiz',
    title: 'ควิซฝึกฝนมาตรฐาน',
    subtitle: 'Standard Subject Quiz',
    description: 'เลือกวิชาและระดับชั้นเพื่อฝึกทำโจทย์จับเวลา พร้อมเฉลยละเอียดและสื่อประกอบ',
    icon: '📝',
    badge: 'คลาสสิก',
    color: 'indigo',
    bgGradient: 'from-indigo-600/30 via-indigo-900/20 to-slate-900/80',
    borderColor: 'border-indigo-500/40',
    playerCount: 'เล่นเดี่ยว',
    rewardMultiplier: '1.0x XP',
    recommendedFor: 'ทบทวนสอบเก็บคะแนน'
  },
  {
    id: 'battle',
    title: 'ลานประลอง Battle Arena',
    subtitle: '1v1 Live PVP & Smart AI',
    description: 'ท้าดวลประลองความไวและปัญญาตัวต่อตัวกับเพื่อนหรือบอท AI สุดเฉียบคม!',
    icon: '⚔️',
    badge: 'ยอดฮิต',
    color: 'rose',
    bgGradient: 'from-rose-600/30 via-rose-900/20 to-slate-900/80',
    borderColor: 'border-rose-500/40',
    playerCount: 'ประลอง 1v1',
    rewardMultiplier: '1.5x XP',
    recommendedFor: 'ฝึกสปีดและการแข่งขัน'
  },
  {
    id: 'survival',
    title: 'เอาชีวิตรอด พิชิตบอส',
    subtitle: 'Survival Boss Rush',
    description: 'ต่อสู้แบบเทิร์นเบสกับบอสมอนสเตอร์ประจำวิชา ตอบถูกเพื่อโจมตีและเอาตัวรอด',
    icon: '🔥',
    badge: 'ท้าทาย',
    color: 'amber',
    bgGradient: 'from-amber-600/30 via-amber-900/20 to-slate-900/80',
    borderColor: 'border-amber-500/40',
    playerCount: 'เล่นเดี่ยว (บอส)',
    rewardMultiplier: '2.0x XP',
    recommendedFor: 'ล่าเหรียญทองและบอสการ์ด'
  },
  {
    id: 'tower',
    title: 'หอคอยไต่ระดับ 5 ชั้น',
    subtitle: 'Tower Climb Quest',
    description: 'พิชิตหอคอยแห่งปัญญา 5 ด่าน ตั้งแต่ง่ายจนถึงบอสใหญ่ชั้นบนสุดเพื่อปลดล็อก 3 ดาว',
    icon: '🏰',
    badge: 'สะสมดาว',
    color: 'purple',
    bgGradient: 'from-purple-600/30 via-purple-900/20 to-slate-900/80',
    borderColor: 'border-purple-500/40',
    playerCount: 'เล่นเดี่ยว',
    rewardMultiplier: '1.8x XP',
    recommendedFor: 'ผ่านด่านสะสมสถิติ'
  },
  {
    id: 'matching',
    title: 'เกมจับคู่การ์ดความรู้',
    subtitle: 'Memory Card Match',
    description: 'จับคู่คำศัพท์ คำจำกัดความ นิยาม และภาพประกอบ ฝึกความจำระยะสั้นและสายตา',
    icon: '🎴',
    badge: 'ฝึกความจำ',
    color: 'emerald',
    bgGradient: 'from-emerald-600/30 via-emerald-900/20 to-slate-900/80',
    borderColor: 'border-emerald-500/40',
    playerCount: 'เล่นเดี่ยว',
    rewardMultiplier: '1.2x XP',
    recommendedFor: 'จำคำศัพท์และศัพท์เฉพาะ'
  },
  {
    id: 'bomb',
    title: 'กู้ระเบิดเวลาสปีดรัน',
    subtitle: 'Time Bomb Defusal',
    description: 'ระเบิดเวลากำลังนับถอยหลัง! วิเคราะห์โจทย์และคลิกตัดสายชนวนสีที่ถูกต้องก่อนเวลาหมด!',
    icon: '💣',
    badge: 'ใหม่! สุดระทึก',
    color: 'red',
    bgGradient: 'from-red-600/30 via-red-900/20 to-slate-900/80',
    borderColor: 'border-red-500/40',
    playerCount: 'เล่นเดี่ยว (สปีดรัน)',
    rewardMultiplier: '1.6x XP',
    recommendedFor: 'ฝึกสมาธิภายใต้ความกดดัน'
  },
  {
    id: 'swipe',
    title: 'การ์ดสไวป์ จริงหรือเท็จ',
    subtitle: 'True / False Swipe Quest',
    description: 'ปัดขวาถ้าคิดว่าจริง ปัดซ้ายถ้าคิดว่าเท็จ! เล่นง่ายลื่นไหล เหมาะสำหรับมือถือและแท็บเล็ต',
    icon: '⚡',
    badge: 'ใหม่! เล่นเพลินบนมือถือ',
    color: 'cyan',
    bgGradient: 'from-cyan-600/30 via-cyan-900/20 to-slate-900/80',
    borderColor: 'border-cyan-500/40',
    playerCount: 'เล่นเดี่ยว',
    rewardMultiplier: '1.3x XP',
    recommendedFor: 'เช็คคอนเซปต์เร็วๆ'
  },
  {
    id: 'crossword',
    title: 'ปริศนาอักษรไขว้ & เรียงคำ',
    subtitle: 'Crossword & Word Puzzle',
    description: 'อ่านคำใบ้เชิงวิชาการแล้วพิมพ์หรือคลิกเรียงตัวอักษรให้ถูกต้อง มีระบบขอคำใบ้ช่วย',
    icon: '🔤',
    badge: 'ใหม่! ลับสมอง',
    color: 'teal',
    bgGradient: 'from-teal-600/30 via-teal-900/20 to-slate-900/80',
    borderColor: 'border-teal-500/40',
    playerCount: 'เล่นเดี่ยว',
    rewardMultiplier: '1.7x XP',
    recommendedFor: 'พัฒนาคลังคำศัพท์และการสะกด'
  },
  {
    id: 'dungeon',
    title: 'ดันเจี้ยนเขาวงกตล่าสมบัติ',
    subtitle: 'Treasure Dungeon Maze',
    description: 'ควบคุมตัวละครสำรวจเขาวงกต ตอบคำถามเปิดประตูกล ปลดล็อคหีบสมบัติ และค้นหาทางออก',
    icon: '🗝️',
    badge: 'ใหม่! สไตล์ RPG',
    color: 'yellow',
    bgGradient: 'from-yellow-600/30 via-amber-900/20 to-slate-900/80',
    borderColor: 'border-yellow-500/40',
    playerCount: 'เล่นเดี่ยว (ผจญภัย)',
    rewardMultiplier: '2.2x XP',
    recommendedFor: 'สำรวจและไขปริศนา'
  }
];

export const INITIAL_WORD_PUZZLES: WordPuzzleItem[] = [
  {
    id: 'WP_001',
    clue: 'กระบวนการที่พืชใช้พลังงานแสงเปลี่ยนน้ำและคาร์บอนไดออกไซด์เป็นน้ำตาล',
    word: 'PHOTOSYNTHESIS',
    hint: 'สังเคราะห์ด้วยแสง (อังกฤษ)',
    subjectId: 'SUB_SCI',
    subjectName: 'วิทยาศาสตร์และเทคโนโลยี'
  },
  {
    id: 'WP_002',
    clue: 'หน่วยทางพันธุกรรมที่อยู่บนโครโมโซม ควบคุมการถ่ายทอดลักษณะทางพันธุกรรม',
    word: 'GENE',
    hint: 'หน่วยพันธุกรรม 4 ตัวอักษร',
    subjectId: 'SUB_SCI',
    subjectName: 'วิทยาศาสตร์และเทคโนโลยี'
  },
  {
    id: 'WP_003',
    clue: 'กฎความสัมพันธ์ระหว่างแรงดันไฟฟ้า กระแส และความต้านทาน (V = IR)',
    word: 'OHM',
    hint: 'ชื่อนักฟิสิกส์ชาวเยอรมัน',
    subjectId: 'SUB_SCI',
    subjectName: 'วิทยาศาสตร์และเทคโนโลยี'
  },
  {
    id: 'WP_004',
    clue: 'คำที่เกิดจากการนำคำภาษาบาลีหรือสันสกฤตมาเชื่อมเสียงกันให้กลมกลืน',
    word: 'สนธิ',
    hint: 'สมาสหรือ...?',
    subjectId: 'SUB_THAI',
    subjectName: 'ภาษาไทย วรรณคดีและหลักภาษา'
  },
  {
    id: 'WP_005',
    clue: 'สมการหรือฟังก์ชันคณิตศาสตร์กำลังสองที่มีกราฟเป็นรูปพาราโบลา',
    word: 'QUADRATIC',
    hint: 'ฟังก์ชันกำลังสองในภาษาอังกฤษ',
    subjectId: 'SUB_MATH',
    subjectName: 'คณิตศาสตร์พื้นฐาน'
  },
  {
    id: 'WP_006',
    clue: 'โมเดลปัญญาประดิษฐ์ที่ผ่านการเทรนด้วยชุดข้อมูลขนาดใหญ่เพื่อสร้างข้อความหรือภาพ',
    word: 'GENERATIVE',
    hint: 'AI ที่สามารถสังเคราะห์เนื้อหาใหม่ได้',
    subjectId: 'SUB_COMP',
    subjectName: 'วิทยาการคำนวณและ AI'
  },
  {
    id: 'WP_007',
    clue: 'เมืองหลวงและศูนย์กลางอาณาจักรโบราณของไทย ยุคพ่อขุนรามคำแหงมหาราช',
    word: 'สุโขทัย',
    hint: 'รุ่งอรุณแห่งความสุข',
    subjectId: 'SUB_SOC',
    subjectName: 'สังคมศึกษา ศาสนา และวัฒนธรรม'
  }
];

export const INITIAL_ANSWER_LOGS: AnswerLog[] = [];

export const INITIAL_SHOP_ITEMS: any[] = [
  // Avatars
  {
    id: 'AVATAR_WIZARD',
    name: 'จอมเวทปราชญ์ดารา (Star Mage)',
    category: 'avatar',
    price: 150,
    icon: '🧙‍♂️',
    description: 'อวาตาร์จอมเวทผู้หยั่งรู้ทุกสรรพวิชา',
    requiredLevel: 2,
    isPurchased: true,
    isEquipped: false
  },
  {
    id: 'AVATAR_CYBER',
    name: 'ไซเบอร์นินจา (Cyber Shinobi)',
    category: 'avatar',
    price: 250,
    icon: '🥷',
    description: 'นักรบความเร็วสูงแห่งโลกดิจิทัล',
    requiredLevel: 3,
    isPurchased: false,
    isEquipped: false
  },
  {
    id: 'AVATAR_DRAGON',
    name: 'มังกรทองผู้พิทักษ์ (Gold Dragon)',
    category: 'avatar',
    price: 500,
    icon: '🐉',
    description: 'สัตว์เทพในตำนานแห่งความเฉลียวฉลาด',
    requiredLevel: 5,
    isPurchased: false,
    isEquipped: false
  },
  {
    id: 'AVATAR_ASTRONAUT',
    name: 'นักบินอวกาศกาแล็กซี (Cosmic Astronaut)',
    category: 'avatar',
    price: 300,
    icon: '🧑‍🚀',
    description: 'ผู้บุกเบิกความรู้สู่อวกาศอันไร้ขอบเขต',
    requiredLevel: 4,
    isPurchased: false,
    isEquipped: false
  },
  // Pets / Companions
  {
    id: 'PET_OWL',
    name: 'นกฮูกนักปราชญ์ (Wisdom Owl)',
    category: 'pet',
    price: 200,
    icon: '🦉',
    description: 'สัตว์เลี้ยงคู่ใจ ช่วยเพิ่มความมั่นใจในการตอบ',
    requiredLevel: 2,
    isPurchased: true,
    isEquipped: true
  },
  {
    id: 'PET_FOX',
    name: 'จิ้งจอกไฟเก้าหาง (Nine-tail Fox)',
    category: 'pet',
    price: 450,
    icon: '🦊',
    description: 'สัตว์เลี้ยงคู่ใจเปลวเพลิง คอมโบสะใจ',
    requiredLevel: 4,
    isPurchased: false,
    isEquipped: false
  },
  {
    id: 'PET_ROBOT',
    name: 'มินิบอท AI คู่คิด (AI Companion)',
    category: 'pet',
    price: 350,
    icon: '🤖',
    description: 'หุ่นยนต์ตัวจิ๋วช่วยสแกนทบทวนข้อสอบ',
    requiredLevel: 3,
    isPurchased: false,
    isEquipped: false
  },
  // Titles / ฉายา
  {
    id: 'TITLE_GENIUS',
    name: '👑 อัจฉริยะวิชาการ (Academic Genius)',
    category: 'title',
    price: 300,
    icon: '👑',
    description: 'ฉายาติดตัวสุดเท่เมื่อตอบถูกติดต่อกัน',
    requiredLevel: 3,
    isPurchased: false,
    isEquipped: false
  },
  {
    id: 'TITLE_SPEEDRUNNER',
    name: '⚡ จ้าวความเร็วสปีดรัน (Speedrun Master)',
    category: 'title',
    price: 200,
    icon: '⚡',
    description: 'ฉายาสำหรับผู้แก้โจทย์ไวที่สุดในห้อง',
    requiredLevel: 2,
    isPurchased: true,
    isEquipped: false
  },
  {
    id: 'TITLE_WARRIOR',
    name: '⚔️ ผู้ไร้พ่ายแห่งสนามรบ (Undefeated Warrior)',
    category: 'title',
    price: 400,
    icon: '⚔️',
    description: 'ฉายาสำหรับแชมป์โหมด Battle Arena',
    requiredLevel: 4,
    isPurchased: false,
    isEquipped: false
  },
  // Profile Frames
  {
    id: 'FRAME_GOLD',
    name: 'กรอบทองคำจักรพรรดิ (Imperial Gold)',
    category: 'frame',
    price: 350,
    icon: '🌟',
    previewColor: 'border-amber-400 ring-2 ring-amber-300 shadow-amber-500/50',
    description: 'กรอบรูปโปรไฟล์แสงสีทองอร่าม',
    requiredLevel: 3,
    isPurchased: false,
    isEquipped: false
  },
  {
    id: 'FRAME_NEON',
    name: 'กรอบนีออนไซเบอร์ (Cyber Neon)',
    category: 'frame',
    price: 280,
    icon: '💠',
    previewColor: 'border-cyan-400 ring-2 ring-purple-500 shadow-cyan-500/50',
    description: 'กรอบเรืองแสงสไตล์เกมเมอร์แห่งอนาคต',
    requiredLevel: 2,
    isPurchased: true,
    isEquipped: true
  }
];

export const INITIAL_CERTIFICATES: any[] = [
  {
    id: 'CERT_SCI_01',
    subjectId: 'SUB_SCI',
    subjectName: 'วิทยาศาสตร์และเทคโนโลยี',
    title: 'ประกาศนียบัตรยอดเยี่ยม ด้านวิทยาศาสตร์พื้นฐาน',
    minScorePercent: 80,
    issueDate: '2026-08-31',
    teacherSignName: 'ครูผุสรัตน์ บำรุงนา',
    schoolName: 'โรงเรียนบ้านเขานางต่วม',
    serialNumber: 'CERT-SCI-2026-0089'
  },
  {
    id: 'CERT_MATH_01',
    subjectId: 'SUB_MATH',
    subjectName: 'คณิตศาสตร์พื้นฐาน',
    title: 'ประกาศนียบัตรความเป็นเลิศ การคิดคำนวณและพีชคณิต',
    minScorePercent: 85,
    issueDate: '2026-08-31',
    teacherSignName: 'ดร.ศราวุฒ ญาวิชัย',
    schoolName: 'โรงเรียนบ้านเขานางต่วม',
    serialNumber: 'CERT-MATH-2026-0142'
  },
  {
    id: 'CERT_ENG_01',
    subjectId: 'SUB_ENG',
    subjectName: 'ภาษาอังกฤษเพื่อการสื่อสาร',
    title: 'Certificate of Excellence in English Communication',
    minScorePercent: 80,
    issueDate: '2026-08-31',
    teacherSignName: 'ครูพิมลวรรณ สิริโภคิน',
    schoolName: 'โรงเรียนบ้านเขานางต่วม',
    serialNumber: 'CERT-ENG-2026-0219'
  }
];

export const INITIAL_LEARNING_NODES: any[] = [
  {
    id: 'NODE_SCI_1',
    subjectId: 'SUB_SCI',
    stepNumber: 1,
    title: 'ด่าน 1: โครงสร้างเซลล์พืชและสัตว์',
    description: 'เรียนรู้หน้าที่ของผนังเซลล์ เยื่อหุ้มเซลล์ และคลอโรพลาสต์',
    icon: '🔬',
    requiredStars: 0,
    isUnlocked: true,
    isCompleted: true,
    scorePercent: 100,
    questionIds: ['Q_SCI_001', 'Q_SCI_002']
  },
  {
    id: 'NODE_SCI_2',
    subjectId: 'SUB_SCI',
    stepNumber: 2,
    title: 'ด่าน 2: การสังเคราะห์ด้วยแสงและการหายใจ',
    description: 'สมการเคมีการสังเคราะห์ด้วยแสงและปัจจัยที่มีผล',
    icon: '🌿',
    requiredStars: 1,
    isUnlocked: true,
    isCompleted: true,
    scorePercent: 90,
    questionIds: ['Q_SCI_003', 'Q_SCI_004']
  },
  {
    id: 'NODE_SCI_3',
    subjectId: 'SUB_SCI',
    stepNumber: 3,
    title: 'ด่าน 3: แรง กฎนิวตัน และการเคลื่อนที่',
    description: 'กฎการเคลื่อนที่ 3 ข้อของนิวตันและการคำนวณ F=ma',
    icon: '🚀',
    requiredStars: 2,
    isUnlocked: true,
    isCompleted: false,
    scorePercent: 0,
    questionIds: ['Q_SCI_005', 'Q_MEDIA_001']
  },
  {
    id: 'NODE_SCI_4',
    subjectId: 'SUB_SCI',
    stepNumber: 4,
    title: 'ด่าน 4: ตารางธาตุและปฏิกิริยาเคมี',
    description: 'ธาตุ หมู่ คาบ พันธะเคมี และปฏิกิริยากรด-เบส',
    icon: '⚗️',
    requiredStars: 3,
    isUnlocked: false,
    isCompleted: false,
    scorePercent: 0,
    questionIds: ['Q_SCI_006', 'Q_SCI_007']
  },
  {
    id: 'NODE_SCI_5',
    subjectId: 'SUB_SCI',
    stepNumber: 5,
    title: 'ด่าน 5: บอสใหญ่ผู้พิทักษ์จักรวาล',
    description: 'บททดสอบใหญ่รวบยอดความรู้วิทยาศาสตร์เพื่อพิชิตประกาศนียบัตร',
    icon: '👑',
    requiredStars: 4,
    isUnlocked: false,
    isCompleted: false,
    scorePercent: 0,
    questionIds: ['Q_BOSS_001', 'Q_MEDIA_002']
  }
];

