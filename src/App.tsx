/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useAppStore } from './store';
import Dashboard from './components/Dashboard';
import CreateAssessmentForm from './components/CreateAssessmentForm';
import AssessmentViewer from './components/AssessmentViewer';
import { 
  Sparkles, 
  GraduationCap, 
  Home, 
  Users, 
  FileText, 
  Wrench, 
  Library, 
  Settings, 
  Bell, 
  ChevronDown,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { currentView, setView, activeAssessment, setActiveAssessment, fetchAssessments } = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'assignments' | 'toolkit' | 'library'>('assignments');

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Handle sidebar navigation Click
  const handleTabClick = (tab: 'home' | 'groups' | 'assignments' | 'toolkit' | 'library') => {
    setActiveTab(tab);
    if (tab === 'assignments') {
      setView('dashboard');
    } else {
      // Just visually toggle for simulation, staying inside the dashboard context
      setView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f6] text-slate-900 flex font-sans select-none print:bg-white print:text-black">
      
      {/* 1. FIGMA STYLE SIDEBAR (Hidden on print) */}
      <aside className="w-[260px] bg-white border-r border-[#e5e7eb] flex flex-col justify-between p-5 shrink-0 no-print">
        <div className="space-y-6">
          
          {/* VedaAI Brand Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#f4511e] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#f4511e]/20">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="3">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <div>
                <span className="font-heading font-extrabold text-[#111827] text-2xl tracking-tight leading-none">
                  Veda<span className="text-[#111827]/90 font-bold">AI</span>
                </span>
              </div>
            </div>

            {/* Lakshya Badge */}
            <div className="inline-flex items-center bg-[#51618a] text-white px-3.5 py-1 rounded-lg text-xs font-semibold tracking-wide">
              Lakshya
            </div>
          </div>

          {/* "+ Create Assignment" Premium Dark button defined in the image */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('create')}
            className="w-full flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#111827] text-white py-3 px-4 rounded-full border-2 border-[#f4511e] shadow-md transition duration-150 cursor-pointer font-sans font-semibold text-[13px]"
          >
            <Sparkles className="w-4 h-4 text-[#f4511e]" />
            {currentView === 'view' ? "AI Teacher's Toolkit" : "Create Assignment"}
          </motion.button>

          {/* Navigation Options matching exact Figma text labels */}
          <nav className="space-y-1.5 pt-3">
            
            <button
              onClick={() => handleTabClick('home')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                currentView === 'view' || activeTab === 'home'
                  ? 'bg-gray-100 text-slate-800 font-bold' 
                  : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
              }`}
            >
              <Home className={`w-4 h-4 ${(currentView === 'view' || activeTab === 'home') ? 'text-[#1f2937] font-bold' : 'text-gray-400'}`} />
              Home
            </button>

            <button
              onClick={() => handleTabClick('groups')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                activeTab === 'groups' && currentView !== 'view'
                  ? 'bg-gray-100 text-slate-800 font-bold' 
                  : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'groups' && currentView !== 'view' ? 'text-slate-800' : 'text-gray-400'}`} />
              My Groups
            </button>

            <button
              onClick={() => handleTabClick('assignments')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                activeTab === 'assignments' && currentView === 'dashboard'
                  ? 'bg-gray-105 text-[#1f2937] font-bold' 
                  : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 ${(activeTab === 'assignments' && currentView === 'dashboard') ? 'text-[#1f2937]' : 'text-gray-400'}`} />
                <span>Assignments</span>
              </div>
              <span className="bg-[#f4551e] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full leading-none shadow-sm">
                {currentView === 'view' ? '32' : '10'}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('toolkit')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                activeTab === 'toolkit' && currentView !== 'view'
                  ? 'bg-gray-100 text-slate-850 font-bold' 
                  : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
              }`}
            >
              <Wrench className={`w-4 h-4 ${activeTab === 'toolkit' && currentView !== 'view' ? 'text-indigo-600' : 'text-gray-400'}`} />
              AI Teacher's Toolkit
            </button>

            <button
              onClick={() => handleTabClick('library')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                activeTab === 'library' && currentView !== 'view'
                  ? 'bg-gray-100 text-slate-900' 
                  : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Library className={`w-4 h-4 ${activeTab === 'library' && currentView !== 'view' ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span>My Library</span>
              </div>
              {currentView === 'view' && (
                <span className="bg-[#f4551e] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full leading-none shadow-sm">
                  32
                </span>
              )}
            </button>
            
          </nav>

        </div>

        {/* Bottom Area: Settings + Delhi Public School Card with custom scholastic crest logo */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-500 hover:text-slate-800 transition cursor-pointer">
            <Settings className="w-4 h-4 text-gray-450" />
            Settings
          </button>

          {/* Delhi Public School metadata block matching screenshot circular school crest */}
          <div className="bg-[#f3f4f6]/95 border border-gray-200 p-3.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-[42px] h-[42px] rounded-full bg-white overflow-hidden border border-gray-100 flex items-center justify-center shrink-0 shadow-3xs p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-600" fill="currentColor">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="M50 20 L60 38 L80 38 L65 50 L70 70 L50 58 L30 70 L35 50 L20 38 L40 38 Z" fill="currentColor" opacity="0.95" />
                <path d="M42 22 Q50 35 42 48 M58 22 Q50 35 58 48" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M30 50 C32 60, 42 66, 50 66 C58 66, 68 60, 70 50" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-heading font-extrabold text-xs text-slate-900 leading-tight truncate">
                Delhi Public School
              </h4>
              <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">
                Bokaro Steel City
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* FIGMA STYLE TOP HEADER BAR (Hidden on print) */}
        <header className="h-[72px] bg-white border-b border-[#e5e7eb] px-8 flex items-center justify-between no-print shrink-0">
          
          {/* Left breadcrumb indicators */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentView !== 'dashboard') {
                  setView('dashboard');
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-[#f3f4f6] rounded-full transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-sm font-bold text-gray-550 hover:text-[#111827] transition cursor-pointer" onClick={() => setView('dashboard')}>
                {currentView === 'view' ? "Create New" : "Assignment"}
              </span>
            </div>
          </div>

          {/* Right notification bell dropdown plus avatar profiles */}
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-650 hover:bg-gray-50 rounded-full transition cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#f4511e] rounded-full" />
            </button>

            {/* John Doe User details matching mockup */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-150">
              <div className="w-9 h-9 rounded-full bg-pink-100 overflow-hidden border border-gray-150 flex items-center justify-center shadow-2xs">
                <span className="text-sm">👨‍🏫</span>
              </div>
              <div className="flex items-center gap-1 font-sans text-sm">
                <span className="font-extrabold text-[#111827]">John Doe</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

        </header>

        {/* Dynamic content rendering frame */}
        <div className="flex-1 overflow-y-auto relative p-6 sm:p-8">
          <div className="w-full max-w-5xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'create' && <CreateAssessmentForm />}
                {currentView === 'view' && <AssessmentViewer />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Clean minimal bottom bar details */}
        <footer className="bg-white border-t border-gray-150 py-3 text-center text-[10px] font-bold tracking-wider text-gray-400 uppercase no-print">
          VedaAI Platform • Sandboxed Evaluation Nodes Connected to Real-time WebSockets Port 3000
        </footer>

      </div>

    </div>
  );
}
