import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { GAS_FILES, GAS_SINGLE_SCRIPT } from '../data/gasSourceCode';
import { GASFile } from '../types';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderOpen,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Send,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Sheet
} from 'lucide-react';

interface GasCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCodeViewerModal: React.FC<GasCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const {
    playSound,
    triggerMascotTip,
    gasUrl,
    setGasUrl,
    isGasConnected,
    testGasConnection,
    syncAllToGas
  } = useApp();

  const [activeTab, setActiveTab] = useState<'connect' | 'single-code' | 'files-13' | 'faq'>('connect');
  const [urlInput, setUrlInput] = useState(gasUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);

  // For 13 files browser
  const [selectedFile, setSelectedFile] = useState<GASFile>(GAS_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);

  useEffect(() => {
    setUrlInput(gasUrl || '');
  }, [gasUrl]);

  if (!isOpen) return null;

  const handleCopySingleCode = () => {
    playSound('click');
    navigator.clipboard.writeText(GAS_SINGLE_SCRIPT);
    setCopiedSingle(true);
    triggerMascotTip('คัดลอกโค้ด Code.gs (ไฟล์เดียวจบ 100%) แล้วครับ! นำไปวางใน Google Apps Script ได้ทันที 📋', 'cheering');
    setTimeout(() => setCopiedSingle(false), 3000);
  };

  const handleDownloadSingleCode = () => {
    playSound('click');
    const blob = new Blob([GAS_SINGLE_SCRIPT], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Code.gs';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerMascotTip('ดาวน์โหลดไฟล์ Code.gs เรียบร้อยแล้ว! 💾', 'happy');
  };

  const handleTestAndSaveUrl = async () => {
    playSound('click');
    setIsTesting(true);
    setTestResult(null);

    const res = await testGasConnection(urlInput);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      setGasUrl(urlInput);
      playSound('victory');
      triggerMascotTip('ยอดเยี่ยมเลยครับ! เชื่อมต่อ Google Sheets สำเร็จ 100% แล้ว! 🎉', 'proud');
    } else {
      playSound('wrong');
      triggerMascotTip('เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบลิงก์ Web App และสิทธิ์การเข้าถึงครับ ⚠️', 'thinking');
    }
  };

  const handleManualSync = async () => {
    playSound('click');
    setIsSyncing(true);
    const res = await syncAllToGas();
    setIsSyncing(false);
    if (res.success) {
      playSound('levelup');
      triggerMascotTip(res.message, 'cheering');
    } else {
      playSound('wrong');
      triggerMascotTip(res.message, 'thinking');
    }
  };

  const handleCopyMultiFileCode = () => {
    playSound('click');
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedFile(true);
    triggerMascotTip(`คัดลอกโค้ดไฟล์ ${selectedFile.name} ลงคลิปบอร์ดแล้ว! 📋`, 'cheering');
    setTimeout(() => setCopiedFile(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white">
                  ศูนย์เชื่อมต่อ Google Sheets & Google Apps Script
                </h2>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  isGasConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isGasConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isGasConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                โรงเรียนบ้านเขานางต่วม • บันทึกคะแนน การสอบ และวิเคราะห์ผลลง Google Sheets แบบเรียลไทม์
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/60 overflow-x-auto gap-2 flex-shrink-0 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('connect');
            }}
            className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'connect'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. เชื่อมต่อ Google Sheets (แนวทางที่ 2 แนะนำ)</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('single-code');
            }}
            className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'single-code'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. ดูโค้ด Code.gs (ไฟล์เดียวจบ 100%)</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('faq');
            }}
            className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'faq'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. คำแนะนำแก้ปัญหา (ไม่ให้เกิดหน้าว่างเปล่า)</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('files-13');
            }}
            className={`py-3 px-4 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'files-13'
                ? 'border-slate-500 text-slate-200 bg-slate-800/40'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>โครงสร้าง 13 ไฟล์เดิม (อ้างอิง)</span>
          </button>
        </div>

        {/* Tab 1: Connect to Google Sheets */}
        {activeTab === 'connect' && (
          <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6 bg-slate-900/50">
            {/* Connection Status Box */}
            <div className={`p-5 rounded-3xl border transition-all ${
              isGasConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-800/60 border-slate-700 shadow-md'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                    isGasConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}>
                    {isGasConnected ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Database className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      สถานะการเชื่อมต่อฐานข้อมูล Google Sheets
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isGasConnected
                        ? '🟢 เชื่อมต่อเรียบร้อย: ทุกครั้งที่นักเรียนตอบคำถาม คะแนนจะถูกบันทึกลง Google Sheets ทันที'
                        : '⚪ ยังไม่ได้เชื่อมต่อ: ตอนนี้ระบบกำลังทำงานและบันทึกคะแนนในเครื่อง กรุณานำ URL มาใส่เพื่อบันทึกลงชีต'}
                    </p>
                  </div>
                </div>

                {isGasConnected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'กำลังซิงค์...' : '☁️ ส่งข้อมูลขึ้นชีตทั้งหมด (ครู + นร. + ข้อสอบ)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Web App URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Google Apps Script Web App URL:</span>
                  <span className="text-[11px] text-slate-400 font-normal">(ลิงก์ที่ลงท้ายด้วย /exec)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handleTestAndSaveUrl}
                    disabled={isTesting || !urlInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังทดสอบ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>บันทึก & ทดสอบเชื่อมต่อ</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Feedback Message */}
                {testResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mt-2 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick 1-Click Code Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      โค้ด Code.gs สำเร็จรูป (ไฟล์เดียวจบ 100% ไม่ต้องแยก 13 ไฟล์)
                    </h4>
                    <p className="text-xs text-indigo-200/80">
                      มีระบบสร้าง 4 แผ่นงานอัตโนมัติ (Scores_Logs, Students, Teachers, Questions) และเชื่อมต่อ API ทันที
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopySingleCode}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    {copiedSingle ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSingle ? 'คัดลอกสำเร็จแล้ว!' : '📋 คัดลอกโค้ด Code.gs ใหม่'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSingleCode}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="ดาวน์โหลดไฟล์ Code.gs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl font-mono border border-slate-800">
                <span className="text-emerald-400 font-bold">✓ 4 แผ่นงานในชีต:</span>
                <span className="text-indigo-300 font-semibold">1. Scores_Logs (มีชื่อครู)</span>
                <span>•</span>
                <span className="text-purple-300 font-semibold">2. Teachers (รายชื่อครู)</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">3. Students (นักเรียน)</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">4. Questions (ข้อสอบ)</span>
              </div>
            </div>

            {/* 3 Step Visual Installation Guide */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📖 วิธีนำโค้ดไปติดตั้งใน Google Sheets (3 ขั้นตอน):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <span className="font-bold text-white">เปิด Apps Script</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    เปิด <b>Google Sheets</b> ของคุณครู (สร้างใหม่หรือใช้แผ่นงานเดิม) ➔ ไปที่เมนูด้านบน <b>ส่วนขยาย (Extensions)</b> ➔ เลือก <b>Apps Script</b>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <span className="font-bold text-white">วางโค้ด & สั่งสร้างชีต</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    ลบโค้ดเดิมใน <b>Code.gs</b> ออกทั้งหมด ➔ กดปุ่ม <b>"คัดลอกโค้ด Code.gs"</b> ด้านบนไปวาง ➔ กด <b>บันทึก (แผ่นดิสก์)</b> ➔ เลือกฟังก์ชัน <b>setupSheets</b> แล้วกด <b>เรียกใช้ (Run)</b> 1 ครั้ง
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <span className="font-bold text-white">Deploy เป็น Web App</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    กดปุ่มสีน้ำเงิน <b>การทำให้ใช้งานได้ (Deploy)</b> ➔ รายการใหม่ ➔ เลือกประเภท <b>เว็บแอป (Web app)</b> ➔ ผู้มีสิทธิ์เข้าถึง: เลือก <b>"ทุกคน (Anyone)"</b> ➔ คัดลอก Web App URL มาใส่ในช่องด้านบน!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Single-code view */}
        {activeTab === 'single-code' && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">Code.gs (All-in-One Standalone)</span>
                <span className="text-xs text-slate-400 hidden sm:inline">— รวมทุกคำสั่งในไฟล์เดียว 100%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySingleCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow transition-all cursor-pointer"
                >
                  {copiedSingle ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSingle ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดนี้'}</span>
                </button>
                <button
                  onClick={handleDownloadSingleCode}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="ดาวน์โหลด Code.gs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 selection:bg-indigo-600 selection:text-white">
              <pre className="whitespace-pre">
                <code>{GAS_SINGLE_SCRIPT}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: FAQ & Troubleshooting */}
        {activeTab === 'faq' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/40 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                ทำไมรอบก่อนนำโค้ดไปวางแล้วเป็น "หน้าว่างเปล่า (Blank Page)"?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                ในโค้ดเดิม ไฟล์ <code className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300">Index.html</code> มีแค่โครงเปล่า <code className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300">&lt;div id="app"&gt;&lt;/div&gt;</code> โดยยังไม่มีระบบเกมหรือ UI ฝังอยู่ด้านใน ทำให้เมื่อเปิดผ่าน Web App ของ Google จึงเห็นเป็นหน้าสีขาวเปล่า
              </p>
              <p className="text-emerald-300 leading-relaxed">
                ✅ <b>การแก้ไขด้วยแนวทางที่ 2:</b> เว็บแอปหน้าตาหลัก (9 โหมดเกม + AI) จะทำงานผ่านระบบเว็บความเร็วสูงนี้อย่างลื่นไหล ส่วน Google Apps Script จะทำหน้าที่เป็น <b>ฐานข้อมูลหลังบ้าน (Backend API)</b> คอยรับคะแนนไปลงใน Google Sheets ของคุณครูอย่างแม่นยำ และหากคุณครูเปิดดูลิงก์ Web App ตรงๆ จะพบหน้าแดชบอร์ดสีเขียวยืนยันสถานะเรียบร้อย ไม่ว่างเปล่าแน่นอนครับ!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                ขึ้นเตือน "Google ยังไม่ได้ยืนยันแอปนี้ (Google hasn't verified this app)" ทำอย่างไร?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                นี่เป็นระบบความปลอดภัยปกติของ Google เมื่อคุณครูเขียนสคริปต์ในบัญชีของตนเอง:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-2">
                <li>กดปุ่ม <b>"ตรวจสอบสิทธิ์ (Review permissions)"</b></li>
                <li>เลือกบัญชี Google ของคุณครู</li>
                <li>กดที่คำว่า <b>"ขั้นสูง (Advanced)"</b> ที่มุมล่างซ้าย</li>
                <li>กดที่ <b>"ไปที่ ... (ไม่ปลอดภัย) / Go to ... (unsafe)"</b></li>
                <li>กด <b>"อนุญาต (Allow)"</b></li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                ทำไมตอน Deploy ต้องเลือก ผู้มีสิทธิ์เข้าถึง: "ทุกคน (Anyone)"?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                เพราะเวลาที่นักเรียนเข้ามาทำควิซหรือเล่นเกมจากมือถือหรือแท็บเล็ต นักเรียนไม่ได้ล็อกอินบัญชี Google เดียวกันกับคุณครู การตั้งค่าเป็น <b>"ทุกคน (Anyone)"</b> จะช่วยให้นักเรียนสามารถส่งคะแนนและสถิติเข้าสู่ Google Sheets ของโรงเรียนได้ทันทีโดยไม่ต้องขอสิทธิ์ใดๆ เพิ่มเติม
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Legacy 13 Files Browser */}
        {activeTab === 'files-13' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* File Tree Sidebar */}
            <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto flex-shrink-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
                ไฟล์ทั้งหมด ({GAS_FILES.length})
              </div>
              <div className="space-y-1">
                {GAS_FILES.map(file => {
                  const isSelected = selectedFile.name === file.name;
                  return (
                    <button
                      key={file.name}
                      onClick={() => {
                        playSound('click');
                        setSelectedFile(file);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {file.type === 'gs' ? (
                          <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        ) : (
                          <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  {selectedFile.name} — <span className="text-slate-400 font-normal">{selectedFile.description}</span>
                </span>
                <button
                  onClick={handleCopyMultiFileCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? 'คัดลอกแล้ว!' : 'คัดลอกไฟล์นี้'}</span>
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950">
                <pre className="whitespace-pre">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              💡 แนะนำ: ใช้โค้ดจาก <b>แท็บ 1 หรือแท็บ 2 (Code.gs ไฟล์เดียว)</b> วางใน Apps Script แผ่นเดียวจบ ไม่ต้องสร้าง 13 ไฟล์
            </span>
          </div>
          <button
            onClick={() => window.open('https://sheets.google.com', '_blank')}
            className="flex items-center gap-1 text-emerald-400 hover:underline text-xs cursor-pointer"
          >
            เปิด Google Sheets <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
