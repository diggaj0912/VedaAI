/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { SectionConfig, QuestionType } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Sparkles, 
  Upload, 
  FileText, 
  AlertCircle,
  Calendar,
  Mic,
  Minus,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Maps question labels to their technical QuestionType
const typeOptions = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Questions' },
  { value: 'subjective', label: 'Diagram/Graph-Based Questions' },
  { value: 'subjective_numerical', label: 'Numerical Problems' },
  { value: 'boolean', label: 'True / False' },
  { value: 'fill_blank', label: 'Fill in the Blanks' }
];

// Let's create default rows matching the screenshot which sum up to exactly 25 Questions and 60 Marks!
// MCQ: 5 questions * 1 mark = 5 marks
// Short Questions: 5 questions * 2 marks = 10 marks
// Diagram/Graph-Based: 5 questions * 5 marks = 25 marks
// Numerical Problems: 10 questions * 2 marks = 20 marks
// Sum: 25 questions, 60 marks.
const initialDefaultSections = [
  {
    id: 'sec-mcq',
    name: 'Section A: Multiple Choice Questions',
    questionType: 'mcq' as QuestionType,
    numberOfQuestions: 5,
    marksPerQuestion: 1,
    instruction: 'Answer all multiple choice questions.'
  },
  {
    id: 'sec-short',
    name: 'Section B: Short Questions',
    questionType: 'short_answer' as QuestionType,
    numberOfQuestions: 5,
    marksPerQuestion: 2,
    instruction: 'Answer in brief sentences.'
  },
  {
    id: 'sec-diagram',
    name: 'Section C: Diagram/Graph-Based Questions',
    questionType: 'subjective' as QuestionType,
    numberOfQuestions: 5,
    marksPerQuestion: 5,
    instruction: 'Illustrate or read diagrams clearly.'
  },
  {
    id: 'sec-numerical',
    name: 'Section D: Numerical Problems',
    questionType: 'subjective' as QuestionType,
    numberOfQuestions: 10,
    marksPerQuestion: 2,
    instruction: 'Show all calculations and round up to two decimals.'
  }
];

export default function CreateAssessmentForm() {
  const { createAssessment, setView } = useAppStore();

  // Core assessment info
  const [title, setTitle] = useState('Physics Assessment Sheet');
  const [subject, setSubject] = useState('Physics');
  const [grade, setGrade] = useState('Grade 10');
  const [dueDate, setDueDate] = useState('2025-06-21'); // matching Figma mock due date
  
  // Custom rows
  const [sections, setSections] = useState<SectionConfig[]>(initialDefaultSections);
  const [instructions, setInstructions] = useState('');
  
  // File upload and styling states
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [validationError, setValidationError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto calculate aggregates
  const totalQuestions = sections.reduce((sum, s) => sum + s.numberOfQuestions, 0);
  const totalMarks = sections.reduce((sum, s) => sum + (s.numberOfQuestions * s.marksPerQuestion), 0);

  // Drag & drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileParsing(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileParsing(e.target.files[0]);
    }
  };

  const handleFileParsing = (file: File) => {
    setFileName(file.name);
    setIsParsingFile(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSourceText(text || '');
      setIsParsingFile(false);
    };
    reader.onerror = () => {
      setValidationError('Failed to read context file data.');
      setIsParsingFile(false);
    };

    if (file.name.endsWith('.pdf')) {
      setTimeout(() => {
        setSourceText(`[Extracted from uploaded PDF: ${file.name}]\n\nTopics identified:\n- Electromagnetism and current electricity\n- Ohm's Law and resistance calculation\n- Schematic diagrams of circuit loops`);
        setIsParsingFile(false);
      }, 900);
    } else {
      reader.readAsText(file);
    }
  };

  // Keyboard and voice simulations
  const handleToggleMic = () => {
    if (isMicListening) {
      setIsMicListening(false);
    } else {
      setIsMicListening(true);
      // Simulate voice transcribing
      setTimeout(() => {
        setInstructions(prev => {
          const added = "Focus heavily on electricity physics equations and parallel circuits with 3 interactive diagram schemas.";
          return prev ? `${prev} ${added}` : added;
        });
        setIsMicListening(false);
      }, 2000);
    }
  };

  // Increment / Decrement handlers to offer the gorgeous +/- clickers
  const changeQuestionsCount = (id: string, delta: number) => {
    setSections(sections.map(s => {
      if (s.id === id) {
        const value = Math.max(1, s.numberOfQuestions + delta);
        return { ...s, numberOfQuestions: value };
      }
      return s;
    }));
  };

  const changeMarksCount = (id: string, delta: number) => {
    setSections(sections.map(s => {
      if (s.id === id) {
        const value = Math.max(1, s.marksPerQuestion + delta);
        return { ...s, marksPerQuestion: value };
      }
      return s;
    }));
  };

  const updateSectionType = (id: string, type: QuestionType) => {
    const label = typeOptions.find(o => o.value === type)?.label || 'Assessment Section';
    setSections(sections.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          questionType: type,
          name: `Section: ${label}`
        };
      }
      return s;
    }));
  };

  const removeRow = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addRow = () => {
    const newId = `sec-${Date.now()}`;
    const newRow: SectionConfig = {
      id: newId,
      name: 'Section: Multiple Choice Questions',
      questionType: 'mcq' as QuestionType,
      numberOfQuestions: 5,
      marksPerQuestion: 2,
      instruction: 'Answer carefully.'
    };
    setSections([...sections, newRow]);
  };

  // Triggers final server API / store generation
  const handleTriggerSubmission = async () => {
    setValidationError('');
    if (!title.trim()) {
      setValidationError('Please input an Assignment Title first.');
      return;
    }
    if (sections.length === 0) {
      setValidationError('Please specify at least one question row.');
      return;
    }

    const payload = {
      title,
      subject,
      grade,
      dueDate,
      instructions: instructions || 'Generate questions matching specifications',
      sections,
      sourceText: sourceText || undefined,
      fileName: fileName || undefined
    };

    const resultId = await createAssessment(payload);
    if (resultId) {
      // Switches automatically to processing list view
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 font-sans select-none pb-24">
      
      {/* 1. HEADER TITLE WITH FIGMA GREEN INDICATOR AND SPLIT PROGRESS BAR */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="mt-2 text-emerald-500 relative flex shrink-0">
          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full inline-block shadow-md leading-none" />
          <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
        </div>
        <div>
          <h1 className="text-[25px] font-heading font-extrabold text-[#111827] tracking-tight leading-none">
            Create Assignment
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-1.5">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      {/* Two-step progress visual tracking: Step 1 is active (dark slate), Step 2 is gray */}
      <div className="w-full flex gap-3 h-1.5 mb-10">
        <div className="flex-1 bg-slate-800 rounded-full" />
        <div className="flex-1 bg-[#e4e6ea] rounded-full" />
      </div>

      {/* 2. SPECIFICATION WHITE CARD CONTAINER */}
      <div className="bg-[#fcfdfd] border border-[#e4e7eb] rounded-3xl p-8 shadow-sm space-y-8">
        
        <div>
          <h2 className="text-[19px] font-heading font-extrabold text-[#111827] leading-none">
            Assignment Details
          </h2>
          <p className="text-gray-400 text-xs font-semibold mt-1.5">
            Basic information about your assignment
          </p>
        </div>

        {/* DRAG AND DROP ZONE */}
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed rounded-3xl p-8 py-10 text-center flex flex-col items-center justify-center transition-all duration-150 relative ${
              dragActive 
                ? 'border-[#f4511e] bg-[#f4511e]/5' 
                : 'border-slate-250 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Custom stylized upload tray icon matching Figma */}
            <div className="w-11 h-11 bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-center text-slate-800 shadow-3xs mb-4">
              <Upload className="w-5 h-5 text-slate-650" />
            </div>

            <p className="text-gray-900 font-extrabold text-[14px]">
              {fileName ? `File Selected: ${fileName}` : "Choose a file or drag & drop it here"}
            </p>
            
            <p className="text-gray-400 font-bold text-[11px] mt-1">
              {fileName ? "Ready for generating" : "JPEG, PNG, upto 10MB"}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-gray-50 hover:bg-gray-100 border border-gray-150 text-slate-900 text-xs font-extrabold px-5 py-2 rounded-lg transition"
            >
              Browse Files
            </button>
          </div>

          <p className="text-center text-gray-400 text-[11px] font-bold tracking-tight">
            Upload images of your preferred document/image
          </p>
        </div>

        {/* DUE DATE INPUT */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#111827]">
            Due Date
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="DD-MM-YYYY"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#fcfdfd] border border-gray-200 focus:border-gray-400 rounded-xl px-5 py-3 text-sm font-semibold text-slate-900 placeholder-gray-300 focus:outline-none transition-all duration-150"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 pointer-events-none" />
          </div>
        </div>

        {/* QUESTION TYPE SPECIFICATION SECTION */}
        <div className="space-y-4">
          
          {/* Row Column Headers */}
          <div className="grid grid-cols-12 gap-3 text-xs font-extrabold text-[#111827] pb-1 border-b border-gray-50">
            <div className="col-span-6 md:col-span-7">Question Type</div>
            <div className="col-span-3 md:col-span-2 text-center">No. of Questions</div>
            <div className="col-span-3 md:col-span-2 text-center">Marks</div>
            <div className="col-span-1" />
          </div>

          {/* Dynamic Row Configurations */}
          <div className="space-y-3.5">
            {sections.map((sec) => (
              <div key={sec.id} className="grid grid-cols-12 gap-3 items-center">
                
                {/* 1. Selector dropdown */}
                <div className="col-span-6 md:col-span-7 relative">
                  <select
                    value={sec.questionType}
                    onChange={(e) => updateSectionType(sec.id, e.target.value as QuestionType)}
                    className="w-full bg-white border border-[#e5e7eb] focus:border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#111827] appearance-none focus:outline-none transition cursor-pointer"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-gray-400">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Remove inline row X symbol */}
                <div className="hidden md:flex col-span-1 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeRow(sec.id)}
                    className="text-gray-300 hover:text-rose-500 p-1.5 transition cursor-pointer"
                    title="Remove item"
                  >
                    <span className="font-extrabold text-sm">✕</span>
                  </button>
                </div>

                {/* 2. No. of Questions Clicker +/- */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-between bg-white border border-[#e5e7eb] rounded-full px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => changeQuestionsCount(sec.id, -1)}
                    className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-slate-900 transition active:scale-90 cursor-pointer text-xs font-bold"
                  >
                    ー
                  </button>
                  <span className="font-extrabold text-xs text-slate-900">{sec.numberOfQuestions}</span>
                  <button
                    type="button"
                    onClick={() => changeQuestionsCount(sec.id, 1)}
                    className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-slate-900 transition active:scale-90 cursor-pointer text-xs font-bold"
                  >
                    ＋
                  </button>
                </div>

                {/* 3. Marks Clicker +/- */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-between bg-white border border-[#e5e7eb] rounded-full px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => changeMarksCount(sec.id, -1)}
                    className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-slate-900 transition active:scale-90 cursor-pointer text-xs font-bold"
                  >
                    ー
                  </button>
                  <span className="font-extrabold text-xs text-slate-900">{sec.marksPerQuestion}</span>
                  <button
                    type="button"
                    onClick={() => changeMarksCount(sec.id, 1)}
                    className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-slate-900 transition active:scale-90 cursor-pointer text-xs font-bold"
                  >
                    ＋
                  </button>
                </div>

                {/* Mobile remove block button */}
                <div className="col-span-12 md:hidden flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(sec.id)}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Remove Row
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Add Row Clicker */}
          <div className="pt-2">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 text-slate-900 text-xs font-extrabold hover:text-[#f4511e] transition cursor-pointer"
            >
              <div className="w-5 h-5 bg-[#111827] rounded-full flex items-center justify-center text-white scale-90">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Add Question Type</span>
            </button>
          </div>

          {/* Dynamic Aggregates matching precise totals in sample screenshot layout */}
          <div className="pt-4 flex flex-col items-end text-xs font-extrabold text-slate-900 border-t border-gray-50 space-y-1">
            <div>
              Total Questions : <span className="font-black text-sm text-[#111827] ml-1">{totalQuestions}</span>
            </div>
            <div>
              Total Marks : <span className="font-black text-sm text-[#111827] ml-1">{totalMarks}</span>
            </div>
          </div>

        </div>

        {/* ADDITIONAL INFORMATION FIELD WITH MICROPHONE INTEGRATION */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#111827]">
            Additional Information (For better output)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-white border border-gray-150 focus:border-gray-300 rounded-3xl p-5 pr-12 text-sm font-medium text-slate-900 placeholder-gray-400 focus:outline-none transition-all duration-150"
            />
            {/* Microphone helper trigger aligned inside box bottom-right */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`absolute right-4.5 bottom-5 p-2 rounded-full transition cursor-pointer ${
                isMicListening 
                  ? 'bg-rose-100 text-rose-600 animate-pulse' 
                  : 'hover:bg-slate-50 text-gray-400 hover:text-slate-900'
              }`}
              title="Speak / Transcribe constraints"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          {isMicListening && (
            <span className="text-[10px] text-rose-500 font-extrabold animate-pulse block">
              🎤 Listening and transcribing voice instructions...
            </span>
          )}
        </div>

      </div>

      {/* Validation banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-extrabold p-4 rounded-xl flex items-center gap-2 mt-4">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 3. FIXED BOTTOM NAVIGATION CAPULES */}
      <div className="flex items-center justify-between mt-8">
        
        {/* Previous button on left with elegant chevron layout */}
        <button
          type="button"
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1f2937] border border-gray-255 font-sans font-extrabold text-xs py-3 px-6 rounded-full shadow-xs transition duration-150 cursor-pointer"
        >
          <span className="text-[11px]">←</span> Previous
        </button>

        {/* Next button on right with premium black capsule container */}
        <button
          type="button"
          onClick={handleTriggerSubmission}
          className="flex items-center gap-3 bg-[#111827] hover:bg-black text-white font-sans font-extrabold text-xs py-3 px-7 rounded-full shadow-md shadow-black/10 cursor-pointer hover:shadow-lg transition duration-150"
        >
          Next <span className="text-[11px]">➔</span>
        </button>

      </div>

    </div>
  );
}
