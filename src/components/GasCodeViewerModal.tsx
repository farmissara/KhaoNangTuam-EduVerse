import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { GAS_FILES } from '../data/gasSourceCode';
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
  FileText
} from 'lucide-react';

interface GasCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCodeViewerModal: React.FC<GasCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const { playSound, triggerMascotTip } = useApp();
  const [selectedFile, setSelectedFile] = useState<GASFile>(GAS_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    playSound('click');
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    triggerMascotTip(`คัดลอกโค้ดไฟล์ ${selectedFile.name} ลงคลิปบอร์ดแล้วครับ! 📋`, 'cheering');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    playSound('click');
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerMascotTip(`ดาวน์โหลดไฟล์ ${selectedFile.name} สำเร็จแล้ว! 💾`, 'happy');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col h-[88vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                📁 โครงสร้างโปรเจกต์ Google Apps Script (GAS)
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  พร้อมใช้งาน 100%
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                รวมโค้ด Server-side .gs ทั้ง 13 ไฟล์ และ Index.html สำหรับนำไปติดตั้งบน Google Sheets / Apps Script
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area: Sidebar + Code Editor View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto flex-shrink-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
              ไฟล์ทั้งหมดในโปรเจกต์ ({GAS_FILES.length})
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
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.type === 'gs' ? (
                        <FileCode className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      ) : (
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-sans">✅</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Action Bar */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">— {selectedFile.description}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 selection:bg-indigo-600 selection:text-white">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Instruction Note */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              💡 วิธีใช้งานใน Google Sheet: ไปที่ <b>ส่วนขยาย (Extensions)</b> ➔ <b>Apps Script</b> ➔
              สร้างไฟล์ให้ตรงชื่อแล้ววางโค้ด
            </span>
          </div>
          <button
            onClick={() => {
              window.open('https://script.google.com', '_blank');
            }}
            className="flex items-center gap-1 text-indigo-400 hover:underline text-xs"
          >
            เปิด Google Apps Script <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
