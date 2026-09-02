export type Role = 'student' | 'teacher' | 'admin';

export type ClanId = 'fire' | 'water' | 'earth' | 'star';

export interface ClanHouse {
  id: ClanId;
  name: string;
  thaiName: string;
  mountainName: string;
  element: string;
  symbol: string;
  bannerColor: string;
  themeGradient: string;
  borderColor: string;
  motto: string;
  description: string;
  totalXp: number;
  totalTrophies: number;
  totalMembers: number;
  leaderStudentName: string;
  guardianSpirit: string;
}

export interface Student {
  id: string;
  studentCode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  classroom: string; // e.g. "ม.3/1"
  number: number;
  level: number;
  xp: number;
  coins: number;
  streakDays: number;
  avatar: string;
  title: string;
  clanId: ClanId; // 4 Mountain Clan House
  completedQuizzes: number;
  battleWins: number;
  battleLosses: number;
  accuracy: number;
  badgeIds: string[];
}

export interface Teacher {
  teacherId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  role: 'ผู้ดูแลระบบ' | 'หัวหน้างานวิชาการ' | 'ครูผู้สอน' | 'ครูประจำชั้น';
  department: string;
  email?: string;
  assignedSubjects: string[];
  openRouterKey?: string;
  deepSeekKey?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  gradeLevel: string;
  description: string;
  questionCount?: number;
  authorTeacherId?: string;
  createdAt?: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false';
export type QuestionMediaType = 'none' | 'image' | 'video' | 'link';

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: string; // e.g. "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"
  questionText: string;
  mediaType?: QuestionMediaType;
  imageUrl?: string;
  videoUrl?: string; // YouTube embed or video link
  referenceLink?: ReferenceLink;
  type: QuestionType;
  options: string[];
  correctIndex: number; // 0, 1, 2, 3 (or 0/1 for true/false)
  explanation: string;
  difficulty: QuestionDifficulty;
  timeLimitSeconds: number;
  tags: string[];
  authorTeacherId?: string;
  createdAt: string;
  timesAnswered?: number;
  timesCorrect?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  topic?: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: string; // e.g. "ม.3"
  targetType: 'all' | 'classroom' | 'individual';
  targetClassroom?: string;
  targetClassrooms?: string[];
  targetStudentId?: string;
  targetStudentIds?: string[];
  questionIds: string[];
  dueDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  rewardXp: number;
  rewardCoins: number;
  createdByTeacherId: string;
  teacherName?: string;
  createdAt: string;
  isUrgent?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  classroom: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  earnedXp: number;
  earnedCoins: number;
  completedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  recipientRole?: 'all' | 'student' | 'teacher';
  recipientId?: string;
  title: string;
  message: string;
  type: 'assignment' | 'reward' | 'battle' | 'system';
  assignmentId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MatchingCard {
  id: string;
  pairId: string | number;
  type: 'question' | 'answer' | 'image';
  content: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface BossMonster {
  id: string;
  name: string;
  title: string;
  avatar: string;
  imageUrl?: string;
  description?: string;
  subjectId?: string;
  subjectName?: string;
  maxHp: number;
  currentHp: number;
  attackPower: number;
  element: string;
  specialSkill: string;
  rewardXp: number;
  rewardCoins: number;
}

export interface TowerStage {
  stageNumber: number;
  name: string;
  description: string;
  difficulty: QuestionDifficulty;
  requiredStars: number;
  starsEarned: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bossName?: string;
  bossAvatar?: string;
}

export interface AnswerLog {
  id: string;
  studentId: string;
  studentName: string;
  classroom: string;
  questionId: string;
  questionText?: string;
  subjectId: string;
  subjectName: string;
  selectedOption: number;
  selectedOptionText?: string;
  correctOption?: number;
  correctOptionText?: string;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  isCorrect: boolean;
  timeSpentSeconds: number;
  earnedXp: number;
  earnedCoins: number;
  mode: 'practice' | 'battle' | 'exam' | 'survival' | 'matching' | 'tower' | 'crossword' | 'bomb' | 'swipe' | 'dungeon';
  timestamp: string;
}

export type GameModeId = 
  | 'quiz'
  | 'matching'
  | 'survival'
  | 'tower'
  | 'battle'
  | 'crossword'
  | 'bomb'
  | 'swipe'
  | 'dungeon';

export interface GameInfo {
  id: GameModeId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  playerCount: string;
  rewardMultiplier: string;
  recommendedFor: string;
}

// Crossword & Word Scramble Types
export interface WordPuzzleItem {
  id: string;
  clue: string;
  word: string;
  hint: string;
  subjectId: string;
  subjectName: string;
}

// Dungeon Maze Types
export type MazeCellType = 'empty' | 'wall' | 'question' | 'chest' | 'trap' | 'exit' | 'player';

export interface MazeCell {
  x: number;
  y: number;
  type: MazeCellType;
  visited: boolean;
  questionId?: string;
  cleared?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface BattleOpponent {
  id: string;
  name: string;
  avatar: string;
  level: number;
  title: string;
  isBot?: boolean;
  botDifficulty?: 'easy' | 'medium' | 'smart';
}

export interface BattlePowerup {
  id: 'fiftyFifty' | 'shield' | 'doubleXp' | 'timeFreeze';
  name: string;
  description: string;
  icon: string;
  cost: number;
  quantity: number;
}

export type ThemeBackground = 
  | 'daylight-white'
  | 'pastel-sky'
  | 'sunny-amber'
  | 'mint-fresh'
  | 'bubblegum-pink'
  | 'lavender-dream'
  | 'aurora-blue'
  | 'sakura-blossom'
  | 'emerald-forest'
  | 'sunset-amber'
  | 'cosmic-purple'
  | 'cyber-dark'
  | 'clean-minimal';

export type CardStyle = 'glass' | 'modern-gradient' | 'soft-shadow' | 'playful-pop';
export type AppFont = 'prompt' | 'kanit' | 'sarabun' | 'mitr';
export type SpacingDensity = 'compact' | 'normal' | 'spacious';

export interface ThemeConfig {
  background: ThemeBackground;
  cardStyle: CardStyle;
  font: AppFont;
  spacing: SpacingDensity;
  buttonRadius: 'sm' | 'md' | 'lg' | 'full';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  mascotEnabled: boolean;
  mascotCharacter: 'tutor-owl' | 'cyber-cat' | 'robot-bot' | 'dino-hero';
  mascotCostume: 'student' | 'wizard' | 'detective' | 'superhero';
}

export interface MascotSpeech {
  message: string;
  mood: 'happy' | 'thinking' | 'cheering' | 'surprised' | 'proud' | 'idle';
  actionPrompt?: string;
  actionText?: string;
  onAction?: () => void;
}

export interface GASFile {
  name: string;
  type: 'gs' | 'html';
  description: string;
  code: string;
}

// ==========================================
// 🛒 Shop & Cosmetic Inventory Types
// ==========================================
export type ShopCategory = 'avatar' | 'title' | 'frame' | 'pet' | 'theme';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  icon: string;
  previewColor?: string;
  description: string;
  requiredLevel: number;
  isPurchased?: boolean;
  isEquipped?: boolean;
}

// ==========================================
// 🎓 E-Certificate Types
// ==========================================
export interface CertificateTemplate {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  minScorePercent: number;
  issueDate: string;
  teacherSignName: string;
  schoolName: string;
  serialNumber: string;
}

// ==========================================
// 🗺️ Learning Path / Skill Tree Types
// ==========================================
export interface LearningNode {
  id: string;
  subjectId: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  requiredStars: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  scorePercent?: number;
  questionIds: string[];
}

// ==========================================
// 🛡️ Exam Mode with Anti-Cheat
// ==========================================
export interface TimedExamSession {
  examId: string;
  title: string;
  subjectId: string;
  totalTimeSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  tabSwitchViolations: number;
  isLocked: boolean;
}
