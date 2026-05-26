/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Eye, 
  AlertCircle, 
  Sparkles,
  Search,
  CheckCircle,
  MoreVertical,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssignmentCard {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  assignedDate: string;
  isCustom?: boolean;
}

export default function Dashboard() {
  const { assessments, fetchAssessments, fetchAssessmentDetail, setView, deleteAssessment } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Click outside menu closer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewDetails = async (id: string) => {
    setOpenMenuId(null);
    const detail = await fetchAssessmentDetail(id);
    if (detail) {
      setView('view');
    }
  };

  const handleDeleteItem = async (id: string, isCustom?: boolean) => {
    setOpenMenuId(null);
    if (isCustom) {
      // For persistent custom ones, call deleteAssessment
      await deleteAssessment(id);
    } else {
      // Logically remove/ignore or handle locally
      alert("Demo assignment removed from view.");
    }
  };

  // Convert real database assessments into our clean assignments card schema
  const realAssignments: AssignmentCard[] = assessments.map((item) => ({
    id: item.id,
    title: item.title || 'Quiz on Electricity',
    subject: item.subject || 'Physics',
    grade: item.grade || 'Grade 10',
    dueDate: item.dueDate || '21-06-2025',
    assignedDate: '20-06-2025', // aligned with mockup
    isCustom: true
  }));

  // Mock initial template items matching the Figma screenshot's duplicates of "Quiz on Electricity"
  const defaultAssignments: AssignmentCard[] = [
    { id: 'def-1', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-2', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-3', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-4', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-5', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-6', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-7', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
    { id: 'def-8', title: 'Quiz on Electricity', subject: 'Physics', grade: 'Grade 10', dueDate: '21-06-2025', assignedDate: '20-06-2025' },
  ];

  // Merge so custom created items appear first, followed by pre-seeded layout templates
  const allAssignments = [...realAssignments, ...defaultAssignments];

  // Filter and search logic
  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterSubject === 'All') {
      return matchesSearch;
    }
    return matchesSearch && assignment.subject.toLowerCase() === filterSubject.toLowerCase();
  });

  return (
    <div className="w-full relative pb-28 font-sans">
      
      {/* 1. ASSIGNMENTS TITLE HEADER WITH GREEN DOT INDICATOR */}
      <div className="flex items-start gap-4 mb-6">
        <div className="mt-2.5 flex shrink-0 relative">
          <span className="w-4 h-4 bg-emerald-500 rounded-full inline-block shadow-sm shadow-emerald-500/30 animate-pulse" />
          <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
        </div>
        <div>
          <h1 className="text-[28px] font-heading font-extrabold text-[#111827] tracking-tight leading-none">
            Assignments
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* 2. FILTER BY AND SEARCH BAR - STYLED IDENTICAL TO MOCKUP */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-2xs">
        
        {/* Left Side: Filter Dropdown */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-405" />
          <span className="text-sm font-semibold text-gray-400">Filter By</span>
          <div className="relative">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="appearance-none bg-[#f3f4f6] text-slate-800 font-bold text-xs px-4 py-2 pr-8 rounded-lg border border-gray-150 focus:outline-none transition cursor-pointer"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Maths">Mathematics</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Search input mimicking placeholder layout */}
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 focus:border-gray-400 rounded-full pl-10 pr-4 py-2 text-sm font-medium text-slate-900 placeholder-gray-400 focus:outline-none transition-all duration-150"
          />
        </div>

      </div>

      {/* 3. ASSIGNMENT CARDS GRID */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h4 className="font-heading font-extrabold text-lg text-slate-800">No results found</h4>
          <p className="text-xs text-gray-400 mt-1">Try refining your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((assignment, index) => {
            const isMenuOpen = openMenuId === assignment.id;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.4) }}
                className="bg-white border border-[#e5e7eb] hover:border-gray-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 relative flex flex-col justify-between"
              >
                
                {/* Header row with Title and custom three-dot kebab menu */}
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-extrabold text-xl text-[#111827] tracking-tight hover:text-[#f4511e] transition duration-155 cursor-pointer leading-tight">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                        {assignment.subject}
                      </span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400 font-semibold font-sans">
                        {assignment.grade}
                      </span>
                    </div>
                  </div>

                  {/* kebab option button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : assignment.id);
                      }}
                      className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-slate-900 transition cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* FIGMA PRECISE DROPDOWN MENU POPOVER */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-9 bg-white border border-gray-150 rounded-xl shadow-xl py-1.5 w-[145px] z-20 origin-top-right font-sans border-t-2 border-t-slate-800"
                        >
                          <button
                            onClick={() => handleViewDetails(assignment.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-extrabold text-[#1f2937] flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            View Assignment
                          </button>
                          
                          <div className="h-px bg-gray-100 my-1" />

                          <button
                            onClick={() => handleDeleteItem(assignment.id, assignment.isCustom)}
                            className="w-full text-left px-4 py-2 hover:bg-rose-50 text-xs font-extrabold text-[#ef4444] flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>

                {/* Footer details row for Assigned Date & Target Due Date */}
                <div className="flex items-center justify-between text-xs font-sans border-t border-gray-50 pt-4 mt-auto">
                  <div className="text-gray-400 font-medium">
                    Assigned on: <span className="font-bold text-slate-705 ml-0.5">{assignment.assignedDate}</span>
                  </div>
                  <div className="text-gray-400 font-medium">
                    Due: <span className="font-extrabold text-[#111827] ml-0.5">{assignment.dueDate}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. FIGMA SPECIFIC FLOATING "+ Create Assignment" BOTTOM BAR */}
      <div className="absolute bottom-1 right-0 left-0 flex items-center justify-center no-print pt-10 pointer-events-none">
        
        {/* Transparent background blur block to give the 'fading cards below' feel shown in photo */}
        <div className="absolute bottom-[-10px] w-full h-24 bg-gradient-to-t from-[#f4f5f6] via-[#f4f5f6]/80 to-transparent pointer-events-none z-10" />

        {/* Capsule buttons wrapper */}
        <div className="relative z-20 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-[#111827] hover:bg-black text-white font-sans font-extrabold text-sm px-6 py-3 rounded-full shadow-lg shadow-black/15 cursor-pointer border-2 border-slate-800"
          >
            <Plus className="w-4 h-4 text-white stroke-[3.2]" />
            Create Assignment
          </motion.button>
        </div>

      </div>

    </div>
  );
}
