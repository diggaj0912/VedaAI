/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store';
import { 
  ArrowLeft, 
  Printer, 
  RefreshCw, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileCheck,
  Server,
  Terminal,
  Download,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AssessmentViewer() {
  const { 
    activeAssessment, 
    activeInput, 
    progress, 
    workerStatus, 
    setView, 
    regenerateAssessment 
  } = useAppStore();

  const [showAnswerKey, setShowAnswerKey] = useState(true);

  if (!activeAssessment) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-heading font-bold text-gray-900">No Assessment Active</h2>
        <p className="text-gray-500 text-sm mt-2">
          Return to the home workspace dashboard and start composing a new evaluation sheet.
        </p>
        <button
          onClick={() => setView('dashboard')}
          className="mt-6 bg-[#1f2937] text-white text-sm font-semibold py-2 px-4 rounded-lg cursor-pointer hover:bg-black transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Active generating / loading state
  if (activeAssessment.status === 'queued' || activeAssessment.status === 'processing') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 font-sans">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#f4511e]/10 border-t-[#f4511e] animate-spin flex items-center justify-center" />
              <Terminal className="w-6 h-6 text-[#f4511e] absolute top-7 left-7 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-gray-900 tracking-tight">
              Generating Assignment Sheet
            </h2>
            <p className="text-sm text-gray-500">
              Your customized question papers are being aligned using Gemini 1.5 Flash...
            </p>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-400">
              <span>WORKER PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#f4511e] h-2 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="border border-gray-100 bg-gray-50 rounded-xl p-4 text-left max-w-lg mx-auto space-y-2 font-mono text-xs text-slate-650">
            <div className="flex items-center gap-2 border-b border-gray-150 pb-2 text-[10px] font-bold text-gray-400">
              <Server className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> CONNECTIVITY LOGS
            </div>
            <div className="space-y-1">
              <div>👨‍💻 [Event] Subscribing to VedaAI live streaming channels...</div>
              {progress >= 20 && <div>🤖 [Worker] Context payloads recognized from uploaded resources.</div>}
              {progress >= 50 && <div>✨ [Gemini] Translating sections to technical MCQ/subjective sets...</div>}
              <div className="font-semibold text-slate-800 flex items-start gap-1">
                <span className="text-[#f4511e] font-bold shrink-0">{`>`}</span>
                <span>{workerStatus || "Formatting evaluation layout rules..."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generation failures
  if (activeAssessment.status === 'failed') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 font-sans">
        <div className="bg-white rounded-2xl border border-gray-150 p-8 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-heading font-bold text-gray-900">AI Formulation Failed</h2>
            <p className="text-sm text-gray-500">
              The VedaAI workspace worker encountered an issue parsing structure.
            </p>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-left font-mono text-xs text-rose-800">
            {activeAssessment.error || 'The API Key may be misconfigured or quota temporary reached.'}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setView('dashboard')}
              className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Back to Workspace
            </button>
            {activeInput && (
              <button
                onClick={() => regenerateAssessment(activeAssessment.id, activeInput)}
                className="flex items-center gap-1.5 bg-[#f4511e] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#d84315] transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retry Composition
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMarks = activeAssessment.sections.reduce((sum, sec) => {
    return sum + sec.questions.reduce((qSum, q) => qSum + q.marks, 0);
  }, 0);

  const totalQuestionsList = activeAssessment.sections.flatMap(s => s.questions);

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = () => {
    if (activeInput) {
      regenerateAssessment(activeAssessment.id, activeInput);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 font-sans no-print select-none">
      
      {/* Interactive Toolbar controls (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4 no-print">
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition font-sans cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition duration-150 cursor-pointer border ${
              showAnswerKey 
                ? 'bg-orange-50 text-[#f4511e] border-orange-200' 
                : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
          </button>

          {activeInput && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-slate-700 py-1.5 px-3 rounded-full hover:bg-gray-50 text-xs font-bold cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate Paper
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#111827] text-white py-1.5 px-4.5 rounded-full hover:bg-black text-xs font-bold cursor-pointer transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* 
        MOCKUP FRAMEWORK: Generates the gorgeous slate-themed container holding 
        the customized white-paper sheet exactly matching screenshot output screen 
      */}
      <div className="bg-[#2c3038] rounded-[24px] p-6 sm:p-8 space-y-6">
        
        {/* TOP COMPRESS CHARCOAL INFO BANNER FRAME */}
        <div className="bg-[#1f2229] border border-slate-700/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-gray-200 font-bold text-sm sm:text-[14.5px] tracking-normal">
              Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Formulated via VedaAI expert alignment parameters
            </p>
          </div>
          
          <button 
            onClick={handlePrint}
            className="shrink-0 bg-white hover:bg-gray-100 text-slate-900 border border-gray-200 font-sans font-extrabold text-xs py-2.5 px-6 rounded-full inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
            Download as PDF
          </button>
        </div>

        {/* 
          MAIN HIGH-CONTRAST SCHOLASTIC SHEET
          Styles are optimized to print cleanly or display as a physical sheet inside the frame
        */}
        <div id="school-assessment-sheet" className="bg-white rounded-[20px] p-8 sm:p-14 md:p-16 text-[#000000] shadow-xl relative border border-slate-700/10 font-sans leading-relaxed">
          
          {/* Centered Crest school banner */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-normal text-slate-950 uppercase">
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <div className="text-[14px] sm:text-[16px] font-sans font-bold text-slate-800 space-y-0.5">
              <div>Subject: {activeAssessment.subject || 'English'}</div>
              <div>Class: {activeAssessment.grade ? activeAssessment.grade.replace(/Grade\s*/i, '') : '5th'}</div>
            </div>

            {/* Time / Mark layout line */}
            <div className="flex items-center justify-between text-[11.5px] sm:text-xs font-bold text-slate-900 pt-3 font-mono">
              <div>Time Allowed: 45 minutes</div>
              <div className="text-right">Maximum Marks: {totalMarks || 20}</div>
            </div>
          </div>

          {/* Core global compulsory message instruction */}
          <p className="text-center text-xs font-extrabold text-slate-800 tracking-normal pt-3.5 italic">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student Identifiers - stacked alignment exactly like the figma mockup */}
          <div className="space-y-2 mt-6 max-w-xs font-sans text-xs font-extrabold text-slate-800 border-b border-gray-100 pb-5">
            <div className="flex items-end gap-1">
              <span>Name:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-3.5" />
            </div>
            <div className="flex items-end gap-1">
              <span>Roll Number:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-3.5" />
            </div>
            <div className="flex items-end gap-1">
              <span>Class: {activeAssessment.grade ? activeAssessment.grade.replace(/Grade\s*/i, '') : '5th'} Section:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-3.5" />
            </div>
          </div>

          {/* Primary Assessment Header */}
          <div className="text-center mt-7">
            <h2 className="text-[15px] font-sans font-black tracking-widest text-[#111827] uppercase leading-none">
              Section A
            </h2>
          </div>

          {/* Section categories descriptor details */}
          <div className="mt-5 space-y-1">
            <h3 className="text-[13.5px] font-sans font-extrabold text-[#000000] leading-none uppercase">
              Short Answer Questions
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 italic font-semibold leading-relaxed">
              Attempt all questions. Each question carries 2 marks
            </p>
          </div>

          {/* Dynamic lists of high quality questions styled identically to screenshot */}
          <div className="mt-5 space-y-4">
            {totalQuestionsList.map((q, idx) => {
              // Extract original difficulty labels
              const originalDiff = q.difficulty || 'easy';
              const difficultyLabel = originalDiff.charAt(0).toUpperCase() + originalDiff.slice(1);
              
              return (
                <div key={q.id || idx} className="text-xs sm:text-[13px] text-slate-950 font-sans tracking-normal leading-relaxed">
                  <div className="flex items-start gap-1.5 align-top">
                    <span className="font-extrabold text-[#111827]">{idx + 1}.</span>
                    <div>
                      <span className="font-extrabold text-slate-900 mr-1.5">[{difficultyLabel}]</span>
                      <span className="font-medium text-slate-850 leading-relaxed font-sans">{q.text}</span>
                      <span className="font-extrabold text-slate-900 ml-1.5 shrink-0">[{q.marks} Marks]</span>
                      
                      {/* Render multiple choices if present */}
                      {q.questionType === 'mcq' && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-2">
                          {q.options.map((opt, oIdx) => {
                            const optChar = String.fromCharCode(65 + oIdx);
                            return (
                              <div key={oIdx} className="flex items-start gap-1.5 py-1 text-xs">
                                <span className="font-black text-slate-800">{optChar}.</span>
                                <span className="text-slate-700">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ending mark */}
          <div className="text-center py-10">
            <p className="text-xs font-black tracking-normal uppercase text-slate-950 border-t border-b border-slate-300 py-1.5 inline-block px-7 leading-none">
              End of Question Paper
            </p>
          </div>

          {/* Dynamic teacher Answer key displayed inside printable region matching image */}
          <AnimatePresence>
            {showAnswerKey && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 pt-5 border-t-2 border-dashed border-slate-350 space-y-5"
              >
                <div>
                  <h4 className="text-[13.5px] font-sans font-black tracking-normal text-slate-950 uppercase leading-none border-b border-slate-200 pb-2.5">
                    Answer Key
                  </h4>
                </div>

                <div className="space-y-3">
                  {totalQuestionsList.map((q, idx) => (
                    <div key={q.id || idx} className="text-[11.5px] sm:text-xs text-slate-850 leading-normal font-sans">
                      <div className="flex items-start gap-2">
                        <span className="font-extrabold text-[#111827]">{idx + 1}.</span>
                        <div className="space-y-1">
                          <p className="font-medium inline text-slate-800">
                            {q.correctAnswer || "Solution description depends upon uploaded criteria."}
                          </p>
                          {q.explanation && (
                            <p className="text-slate-400 italic font-semibold leading-relaxed mt-1 text-[10.5px]">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Underneath support help text block */}
      <div className="bg-white border border-gray-150 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 no-print font-sans">
        <div className="flex gap-3">
          <BookOpen className="w-5 h-5 text-[#f4511e] shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Classroom Output Generator</span>
            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
              This layout compiles directly with standard Delhi Public School physical evaluation test sheets. You can duplicate or dispatch this question block directly.
            </p>
          </div>
        </div>
        <button
          onClick={() => setView('create')}
          className="bg-slate-900 text-white font-extrabold text-xs py-2 px-5 rounded-full hover:bg-black cursor-pointer transition"
        >
          Formulate Another Paper
        </button>
      </div>

    </div>
  );
}
