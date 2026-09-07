import React from 'react';
import {
  Atom,
  Calculator,
  BookOpen,
  Globe2,
  Landmark,
  Cpu,
  Sparkles,
  Layers,
  FlaskConical,
  Dna,
  Microscope,
  Compass,
  Orbit,
  Zap,
  Flame,
  Binary,
  Percent,
  Sigma,
  BarChart3,
  Scale,
  Languages,
  BookMarked,
  PenTool,
  Feather,
  FileText,
  MessageSquare,
  Scroll,
  Map,
  Castle,
  Flag,
  Shield,
  Laptop,
  Code2,
  Terminal,
  Bot,
  Database,
  Server,
  Smartphone,
  Palette,
  Music,
  Paintbrush,
  Film,
  Camera,
  Activity,
  Trophy,
  Medal,
  HeartPulse,
  Dumbbell,
  Bike,
  Briefcase,
  Wrench,
  Coins,
  Lightbulb,
  GraduationCap,
  Backpack,
  Award,
  LucideIcon
} from 'lucide-react';

export interface IconDefinition {
  name: string;
  label: string;
  category: string;
  keywords: string[];
  component: LucideIcon;
}

export const LUCIDE_SUBJECT_ICONS: IconDefinition[] = [
  // 1. วิทยาศาสตร์และการทดลอง
  { name: 'Atom', label: 'ฟิสิกส์ / อะตอม', category: 'วิทยาศาสตร์', keywords: ['atom', 'physics', 'ฟิสิกส์', 'วิทย์', 'อะตอม'], component: Atom },
  { name: 'FlaskConical', label: 'เคมี / การทดลอง', category: 'วิทยาศาสตร์', keywords: ['flask', 'chemistry', 'เคมี', 'หลอดทดลอง'], component: FlaskConical },
  { name: 'Dna', label: 'ชีววิทยา / พันธุศาสตร์', category: 'วิทยาศาสตร์', keywords: ['dna', 'biology', 'ชีวะ', 'ดีเอ็นเอ', 'พันธุกรรม'], component: Dna },
  { name: 'Microscope', label: 'กล้องจุลทรรศน์ / เซลล์', category: 'วิทยาศาสตร์', keywords: ['microscope', 'cells', 'กล้องจุลทรรศน์', 'จุลชีววิทยา'], component: Microscope },
  { name: 'Orbit', label: 'ดาราศาสตร์ / อวกาศ', category: 'วิทยาศาสตร์', keywords: ['orbit', 'space', 'astronomy', 'ดาราศาสตร์', 'ดาว', 'อวกาศ'], component: Orbit },
  { name: 'Compass', label: 'ธรณีวิทยา / การสำรวจ', category: 'วิทยาศาสตร์', keywords: ['compass', 'geology', 'เข็มทิศ', 'ภูมิศาสตร์', 'สำรวจ'], component: Compass },
  { name: 'Zap', label: 'พลังงาน / ไฟฟ้า', category: 'วิทยาศาสตร์', keywords: ['zap', 'energy', 'electric', 'ไฟฟ้า', 'พลังงาน'], component: Zap },
  { name: 'Flame', label: 'ความร้อน / เทอร์โมไดนามิกส์', category: 'วิทยาศาสตร์', keywords: ['flame', 'fire', 'ไฟ', 'ความร้อน'], component: Flame },

  // 2. คณิตศาสตร์และการคำนวณ
  { name: 'Calculator', label: 'เครื่องคิดเลข / คณิต', category: 'คณิตศาสตร์', keywords: ['calculator', 'math', 'คณิต', 'คำนวณ', 'เลข'], component: Calculator },
  { name: 'Sigma', label: 'พีชคณิต / แคลคูลัส (Σ)', category: 'คณิตศาสตร์', keywords: ['sigma', 'sum', 'math', 'ซิกมา', 'ผลรวม', 'แคลคูลัส'], component: Sigma },
  { name: 'Binary', label: 'คณิตศาสตร์คอมพิวเตอร์ (01)', category: 'คณิตศาสตร์', keywords: ['binary', 'math', 'ฐานสอง', 'ดิจิทัล'], component: Binary },
  { name: 'Percent', label: 'ร้อยละ / สถิติ (%)', category: 'คณิตศาสตร์', keywords: ['percent', 'statistics', 'เปอร์เซ็นต์', 'ร้อยละ'], component: Percent },
  { name: 'BarChart3', label: 'สถิติ / แผนภูมิ', category: 'คณิตศาสตร์', keywords: ['barchart', 'chart', 'stats', 'กราฟ', 'แผนภูมิ', 'สถิติ'], component: BarChart3 },
  { name: 'Scale', label: 'สมการ / การชั่งตวงวัด', category: 'คณิตศาสตร์', keywords: ['scale', 'balance', 'ตาชั่ง', 'สมดุล', 'สมการ'], component: Scale },

  // 3. ภาษา วรรณกรรม และการสื่อสาร
  { name: 'BookOpen', label: 'ภาษาไทย / วรรณคดี', category: 'ภาษาและการสื่อสาร', keywords: ['book', 'thai', 'reading', 'ภาษาไทย', 'หนังสือ', 'การอ่าน'], component: BookOpen },
  { name: 'Languages', label: 'ภาษาต่างประเทศ / แปลภาษา', category: 'ภาษาและการสื่อสาร', keywords: ['languages', 'english', 'foreign', 'ภาษาต่างประเทศ', 'อังกฤษ'], component: Languages },
  { name: 'Globe2', label: 'ภาษาอังกฤษสากล', category: 'ภาษาและการสื่อสาร', keywords: ['globe', 'english', 'world', 'สากล', 'ภาษาอังกฤษ'], component: Globe2 },
  { name: 'BookMarked', label: 'การอ่าน / การเขียนเรียงความ', category: 'ภาษาและการสื่อสาร', keywords: ['bookmark', 'reading', 'ที่คั่น', 'วรรณกรรม'], component: BookMarked },
  { name: 'PenTool', label: 'หลักภาษาและการเขียน', category: 'ภาษาและการสื่อสาร', keywords: ['pen', 'writing', 'ปากกา', 'การเขียน', 'ไวยากรณ์'], component: PenTool },
  { name: 'Feather', label: 'กวีนิพนธ์ / ร้อยกรอง', category: 'ภาษาและการสื่อสาร', keywords: ['feather', 'poetry', 'ขนนก', 'กลอน', 'กวี'], component: Feather },
  { name: 'MessageSquare', label: 'การพูดและการสนทนา', category: 'ภาษาและการสื่อสาร', keywords: ['message', 'speaking', 'chat', 'สนทนา', 'การพูด'], component: MessageSquare },
  { name: 'FileText', label: 'รายงานและบทความ', category: 'ภาษาและการสื่อสาร', keywords: ['file', 'text', 'doc', 'เอกสาร', 'บทความ'], component: FileText },

  // 4. สังคม ศาสนา ประวัติศาสตร์ ภูมิศาสตร์
  { name: 'Landmark', label: 'ประวัติศาสตร์ / รัฐศาสตร์', category: 'สังคมศึกษา', keywords: ['landmark', 'history', 'government', 'ประวัติศาสตร์', 'โบราณคดี', 'รัฐธรรมนูญ'], component: Landmark },
  { name: 'Scroll', label: 'อารยธรรม / เอกสารโบราณ', category: 'สังคมศึกษา', keywords: ['scroll', 'ancient', 'ใบลาน', 'ศิลาจารึก', 'คัมภีร์'], component: Scroll },
  { name: 'Map', label: 'ภูมิศาสตร์ / แผนที่โลก', category: 'สังคมศึกษา', keywords: ['map', 'geography', 'แผนที่', 'ภูมิศาสตร์', 'ประเทศ'], component: Map },
  { name: 'Castle', label: 'ประวัติศาสตร์โบราณสถาน', category: 'สังคมศึกษา', keywords: ['castle', 'medieval', 'ปราสาท', 'วัง', 'ประวัติศาสตร์'], component: Castle },
  { name: 'Flag', label: 'หน้าที่พลเมือง / ประชาธิปไตย', category: 'สังคมศึกษา', keywords: ['flag', 'civics', 'ธง', 'พลเมือง', 'ประชาธิปไตย'], component: Flag },
  { name: 'Shield', label: 'ศีลธรรม / กฎหมาย', category: 'สังคมศึกษา', keywords: ['shield', 'law', 'morals', 'โล่', 'ความปลอดภัย', 'กฎหมาย'], component: Shield },

  // 5. คอมพิวเตอร์ เทคโนโลยี และ AI
  { name: 'Cpu', label: 'วิทยาการคำนวณ / ฮาร์ดแวร์', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['cpu', 'computer', 'hardware', 'ซีพียู', 'ฮาร์ดแวร์', 'คอมพิวเตอร์'], component: Cpu },
  { name: 'Code2', label: 'การเขียนโค้ด / การเขียนโปรแกรม', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['code', 'programming', 'developer', 'โค้ด', 'โปรแกรม'], component: Code2 },
  { name: 'Laptop', label: 'เทคโนโลยีสารสนเทศ (ICT)', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['laptop', 'ict', 'notebook', 'โน้ตบุ๊ก', 'ไอซีที'], component: Laptop },
  { name: 'Bot', label: 'หุ่นยนต์และปัญญาประดิษฐ์ (AI)', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['bot', 'ai', 'robot', 'เอไอ', 'หุ่นยนต์', 'ปัญญาประดิษฐ์'], component: Bot },
  { name: 'Terminal', label: 'วิทยาการข้อมูล / คำสั่ง', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['terminal', 'cli', 'console', 'เทอร์มินัล'], component: Terminal },
  { name: 'Database', label: 'ระบบฐานข้อมูลและคลังข้อมูล', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['database', 'data', 'ฐานข้อมูล', 'ดาต้า'], component: Database },
  { name: 'Server', label: 'เครือข่ายและระบบคลาวด์', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['server', 'cloud', 'network', 'เน็ตเวิร์ก', 'เซิร์ฟเวอร์'], component: Server },
  { name: 'Smartphone', label: 'แอปพลิเคชันมือถือ / ดิจิทัล', category: 'เทคโนโลยีและคอมพิวเตอร์', keywords: ['phone', 'mobile', 'app', 'มือถือ', 'สมาร์ตโฟน'], component: Smartphone },

  // 6. ศิลปะ ดนตรี และนาฏศิลป์
  { name: 'Palette', label: 'ทัศนศิลป์ / วาดภาพ', category: 'ศิลปะและดนตรี', keywords: ['palette', 'art', 'drawing', 'จานสี', 'ศิลปะ', 'วาดรูป'], component: Palette },
  { name: 'Music', label: 'ดนตรีสากลและดนตรีไทย', category: 'ศิลปะและดนตรี', keywords: ['music', 'song', 'ดนตรี', 'เพลง', 'โน้ตดนตรี'], component: Music },
  { name: 'Paintbrush', label: 'จิตรกรรมและการออกแบบ', category: 'ศิลปะและดนตรี', keywords: ['brush', 'paint', 'design', 'พู่กัน', 'ออกแบบ'], component: Paintbrush },
  { name: 'Film', label: 'สื่อสารมวลชน / ภาพยนตร์', category: 'ศิลปะและดนตรี', keywords: ['film', 'movie', 'video', 'ภาพยนตร์', 'วิดีโอ'], component: Film },
  { name: 'Camera', label: 'การถ่ายภาพ / สื่อผสม', category: 'ศิลปะและดนตรี', keywords: ['camera', 'photo', 'กล้อง', 'ถ่ายรูป'], component: Camera },
  { name: 'Sparkles', label: 'นาฏศิลป์ / ความคิดสร้างสรรค์', category: 'ศิลปะและดนตรี', keywords: ['sparkles', 'dance', 'creative', 'ประกาย', 'สร้างสรรค์', 'นาฏศิลป์'], component: Sparkles },

  // 7. สุขศึกษา พลศึกษา และกีฬา
  { name: 'Activity', label: 'พลศึกษา / การเคลื่อนไหว', category: 'สุขศึกษาและพลศึกษา', keywords: ['activity', 'pe', 'sport', 'พลศึกษา', 'กีฬา', 'สุขภาพ'], component: Activity },
  { name: 'Trophy', label: 'การแข่งขันกีฬา / ถ้วยรางวัล', category: 'สุขศึกษาและพลศึกษา', keywords: ['trophy', 'winner', 'cup', 'ถ้วยรางวัล', 'แชมป์'], component: Trophy },
  { name: 'Medal', label: 'เหรียญรางวัล / เกียรติยศ', category: 'สุขศึกษาและพลศึกษา', keywords: ['medal', 'award', 'เหรียญ', 'รางวัล'], component: Medal },
  { name: 'HeartPulse', label: 'สุขศึกษา / ระบบร่างกาย', category: 'สุขศึกษาและพลศึกษา', keywords: ['heart', 'health', 'pulse', 'หัวใจ', 'ชีพจร', 'สุขภาพ'], component: HeartPulse },
  { name: 'Dumbbell', label: 'ฟิตเนส / การออกกำลังกาย', category: 'สุขศึกษาและพลศึกษา', keywords: ['dumbbell', 'fitness', 'gym', 'ดัมเบล', 'ออกกำลังกาย'], component: Dumbbell },
  { name: 'Bike', label: 'กิจกรรมกลางแจ้ง / นันทนาการ', category: 'สุขศึกษาและพลศึกษา', keywords: ['bike', 'cycling', 'outdoor', 'จักรยาน', 'นันทนาการ'], component: Bike },

  // 8. การงานอาชีพ ธุรกิจ และทักษะชีวิต
  { name: 'Briefcase', label: 'การงานอาชีพ / ธุรกิจ', category: 'การงานและอาชีพ', keywords: ['briefcase', 'work', 'business', 'การงาน', 'อาชีพ', 'ธุรกิจ'], component: Briefcase },
  { name: 'Wrench', label: 'งานช่าง / งานประดิษฐ์', category: 'การงานและอาชีพ', keywords: ['wrench', 'tool', 'craft', 'ช่าง', 'เครื่องมือ', 'ประดิษฐ์'], component: Wrench },
  { name: 'Coins', label: 'การเงิน / เศรษฐศาสตร์', category: 'การงานและอาชีพ', keywords: ['coins', 'money', 'finance', 'การเงิน', 'เศรษฐศาสตร์', 'เหรียญ'], component: Coins },
  { name: 'Lightbulb', label: 'นวัตกรรม / โครงงานบูรณาการ', category: 'การงานและอาชีพ', keywords: ['lightbulb', 'idea', 'innovation', 'ไอเดีย', 'หลอดไฟ', 'นวัตกรรม'], component: Lightbulb },
  { name: 'GraduationCap', label: 'แนะแนว / การศึกษาต่อ', category: 'การงานและอาชีพ', keywords: ['graduation', 'cap', 'education', 'หมวกปริญญา', 'แนะแนว', 'การศึกษา'], component: GraduationCap },
  { name: 'Backpack', label: 'กิจกรรมพัฒนาผู้เรียน / ลูกเสือ', category: 'การงานและอาชีพ', keywords: ['backpack', 'scout', 'กระเป๋า', 'ลูกเสือ', 'กิจกรรม'], component: Backpack },
  { name: 'Award', label: 'โครงงานดีเด่น / ผลงาน', category: 'การงานและอาชีพ', keywords: ['award', 'certificate', 'เกียรติบัตร', 'รางวัล'], component: Award },
  { name: 'Layers', label: 'วิชาทั่วไป / บูรณาการทุกสาระ', category: 'การงานและอาชีพ', keywords: ['layers', 'general', 'บูรณาการ', 'ทั่วไป'], component: Layers }
];

export interface SubjectEmojiCategory {
  category: string;
  emojis: { emoji: string; label: string; keywords: string[] }[];
}

export const POPULAR_SUBJECT_EMOJIS: SubjectEmojiCategory[] = [
  {
    category: 'วิทยาศาสตร์ & เทคโนโลยี',
    emojis: [
      { emoji: '🧪', label: 'หลอดทดลอง (เคมี)', keywords: ['flask', 'chemistry', 'เคมี', 'ทดลอง'] },
      { emoji: '🔬', label: 'กล้องจุลทรรศน์', keywords: ['microscope', 'bio', 'กล้อง'] },
      { emoji: '🧬', label: 'ดีเอ็นเอ (ชีววิทยา)', keywords: ['dna', 'biology', 'ดีเอ็นเอ'] },
      { emoji: '🔭', label: 'กล้องดูดาว (ดาราศาสตร์)', keywords: ['telescope', 'astronomy', 'ดาราศาสตร์'] },
      { emoji: '🪐', label: 'ดาวเสาร์ / อวกาศ', keywords: ['planet', 'space', 'ดาว', 'จักรวาล'] },
      { emoji: '🚀', label: 'จรวด / นวัตกรรมอวกาศ', keywords: ['rocket', 'space', 'จรวด'] },
      { emoji: '💻', label: 'คอมพิวเตอร์', keywords: ['laptop', 'computer', 'คอม'] },
      { emoji: '🤖', label: 'หุ่นยนต์ / AI', keywords: ['robot', 'ai', 'หุ่นยนต์'] },
      { emoji: '⚡', label: 'สายฟ้า (พลังงาน/ไฟฟ้า)', keywords: ['lightning', 'electric', 'ไฟฟ้า'] },
      { emoji: '💡', label: 'ไอเดีย / วิทยาการ', keywords: ['idea', 'lightbulb', 'คิด'] }
    ]
  },
  {
    category: 'คณิตศาสตร์ & การคำนวณ',
    emojis: [
      { emoji: '📐', label: 'ไม้บรรทัดสามเหลี่ยม', keywords: ['ruler', 'math', 'เรขาคณิต'] },
      { emoji: '📏', label: 'ไม้บรรทัดวัดระยะ', keywords: ['measure', 'ruler', 'วัด'] },
      { emoji: '🧮', label: 'ลูกคิด / การคิดเลข', keywords: ['abacus', 'math', 'คำนวณ'] },
      { emoji: '📊', label: 'กราฟแท่ง / สถิติ', keywords: ['chart', 'statistics', 'สถิติ'] },
      { emoji: '📈', label: 'กราฟเส้นขึ้น', keywords: ['trend', 'chart', 'การเติบโต'] },
      { emoji: '🎲', label: 'ลูกเต๋า (ความน่าจะเป็น)', keywords: ['dice', 'probability', 'ความน่าจะเป็น'] },
      { emoji: '🪙', label: 'เหรียญทอง', keywords: ['coin', 'money', 'เหรียญ'] }
    ]
  },
  {
    category: 'ภาษา & การอ่านเขียน',
    emojis: [
      { emoji: '📚', label: 'กองหนังสือวิชาการ', keywords: ['books', 'reading', 'หนังสือ', 'อ่าน'] },
      { emoji: '📖', label: 'หนังสือเปิดอ่าน', keywords: ['book', 'reading', 'เรียน'] },
      { emoji: '📝', label: 'สมุดบันทึกและดินสอ', keywords: ['memo', 'writing', 'จดบันทึก'] },
      { emoji: '✍️', label: 'การเขียน / ประพันธ์', keywords: ['writing', 'hand', 'เขียน'] },
      { emoji: '🇹🇭', label: 'ธงชาติไทย (ภาษาไทย)', keywords: ['thai', 'thailand', 'ภาษาไทย'] },
      { emoji: '🇬🇧', label: 'ธงชาติอังกฤษ (English)', keywords: ['english', 'uk', 'อังกฤษ'] },
      { emoji: '🌏', label: 'ลูกโลก (ภาษาต่างประเทศ)', keywords: ['globe', 'world', 'ต่างประเทศ'] },
      { emoji: '🗣️', label: 'การสนทนา / ภาษาพูด', keywords: ['speaking', 'talk', 'สนทนา'] }
    ]
  },
  {
    category: 'สังคม ประวัติศาสตร์ & ศิลปะ',
    emojis: [
      { emoji: '🏛️', label: 'สถาปัตยกรรมคลาสสิก', keywords: ['temple', 'museum', 'โบราณ', 'ประวัติศาสตร์'] },
      { emoji: '🗺️', label: 'แผนที่โลก', keywords: ['map', 'geography', 'แผนที่', 'ภูมิศาสตร์'] },
      { emoji: '🧭', label: 'เข็มทิศเดินทาง', keywords: ['compass', 'explore', 'เข็มทิศ'] },
      { emoji: '🎨', label: 'จานสีศิลปะ', keywords: ['palette', 'art', 'ศิลปะ', 'วาดรูป'] },
      { emoji: '🎵', label: 'โน้ตดนตรี', keywords: ['music', 'song', 'เพลง', 'ดนตรี'] },
      { emoji: '🎻', label: 'ไวโอลิน / ดนตรีสากล', keywords: ['violin', 'music', 'เครื่องสาย'] },
      { emoji: '🎭', label: 'หน้ากากการแสดง / ละคร', keywords: ['theater', 'drama', 'นาฏศิลป์', 'ละคร'] },
      { emoji: '📸', label: 'กล้องถ่ายภาพ', keywords: ['camera', 'photo', 'กล้อง'] }
    ]
  },
  {
    category: 'กีฬา อาชีพ & กิจกรรม',
    emojis: [
      { emoji: '⚽', label: 'ฟุตบอล (พลศึกษา)', keywords: ['soccer', 'football', 'บอล', 'กีฬา'] },
      { emoji: '🏀', label: 'บาสเกตบอล', keywords: ['basketball', 'sport', 'บาส'] },
      { emoji: '🏊‍♂️', label: 'ว่ายน้ำ', keywords: ['swimming', 'water', 'ว่ายน้ำ'] },
      { emoji: '🥋', label: 'ศิลปะการต่อสู้', keywords: ['martial', 'karate', 'ต่อสู้'] },
      { emoji: '🏆', label: 'ถ้วยรางวัลชนะเลิศ', keywords: ['trophy', 'champion', 'แชมป์'] },
      { emoji: '🥇', label: 'เหรียญทองอันดับ 1', keywords: ['gold', 'medal', 'เหรียญทอง'] },
      { emoji: '🍳', label: 'การทำอาหาร / คหกรรม', keywords: ['cooking', 'food', 'ทำอาหาร', 'คหกรรม'] },
      { emoji: '🌱', label: 'เกษตรกรรม / พฤกษศาสตร์', keywords: ['plant', 'agriculture', 'เกษตร', 'ต้นไม้'] },
      { emoji: '💼', label: 'การงานอาชีพและธุรกิจ', keywords: ['briefcase', 'career', 'งาน', 'อาชีพ'] },
      { emoji: '🛠️', label: 'งานช่างอุตสาหกรรม', keywords: ['tools', 'repair', 'งานช่าง'] },
      { emoji: '🩺', label: 'การปฐมพยาบาล / แพทย์', keywords: ['stethoscope', 'medical', 'พยาบาล', 'สุขภาพ'] },
      { emoji: '⛺', label: 'ค่ายลูกเสือ / เนตรนารี', keywords: ['camp', 'scout', 'เต็นท์', 'ลูกเสือ'] }
    ]
  }
];

// Helper to look up an icon component by name
export function getLucideIconByName(name: string): LucideIcon | null {
  if (!name) return null;
  const found = LUCIDE_SUBJECT_ICONS.find(i => i.name.toLowerCase() === name.toLowerCase());
  return found ? found.component : null;
}

// Helper to detect whether a string is an emoji
export function isEmojiString(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  // Regex to detect common emojis, flags, symbols
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
  return emojiRegex.test(trimmed) || (trimmed.length <= 4 && trimmed.codePointAt(0)! > 255);
}
