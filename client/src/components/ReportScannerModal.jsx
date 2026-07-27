import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, Sparkles, AlertCircle, CheckCircle, FileCheck } from 'lucide-react';

const ReportScannerModal = ({ isOpen, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return alert('Please select a file first.');
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('reportImage', selectedFile);

    try {
      const response = await fetch(`${API_URL}/ai/scan-report`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setReportResult(data.data);
      } else {
        alert(data.message || 'Failed to scan report.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to OCR service.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Medical Report Analyzer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload lab reports for instant AI extraction & risk flagging</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Upload Area */}
            {!reportResult && (
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[var(--color-primary)] rounded-2xl p-8 text-center transition-colors bg-slate-950/40 cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden" 
                />
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  {selectedFile ? selectedFile.name : 'Click to Upload Blood Test or X-Ray Image'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Supports PNG, JPG</p>
                
                <button
                  disabled={analyzing || !selectedFile}
                  onClick={(e) => { e.stopPropagation(); handleScan(); }}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-slate-900 dark:text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg inline-flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> AI Analyzing Lab Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Extract Report Data
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Results */}
            {reportResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-300 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Report Detected</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{reportResult.reportType}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> AI Extracted
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Extracted Biomarkers</span>
                  {reportResult.findings.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.test}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Normal Range: {item.normal}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold block ${
                          item.status === 'High' || item.status === 'Elevated' ? 'text-amber-400' :
                          item.status === 'Low' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {item.value} ({item.status})
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.flag}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Interpretation */}
                <div className="p-4 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 rounded-xl">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4" /> AI Clinical Insights
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{reportResult.aiSummary}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
            {reportResult && (
              <button 
                onClick={() => { setReportResult(null); setSelectedFile(null); }} 
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:bg-slate-800"
              >
                Scan Another Report
              </button>
            )}
            <button onClick={onClose} className="bg-white dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-5 py-2 rounded-xl text-xs">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportScannerModal;
