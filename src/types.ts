/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'mcq' | 'short_answer' | 'subjective' | 'boolean' | 'fill_blank';

export interface SectionConfig {
  id: string;
  name: string; // e.g. "Section A", "Section B"
  questionType: QuestionType;
  numberOfQuestions: number;
  marksPerQuestion: number;
  instruction: string; // e.g. "Answer all multiple choice questions"
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  instructions: string;
  sections: SectionConfig[];
  sourceText?: string;
  fileName?: string;
}

export interface Question {
  id: string;
  text: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  options?: string[]; // only for MCQ
  correctAnswer?: string; // answer key
  explanation?: string;
}

export interface Section {
  id: string;
  title: string; // e.g. "Section A: Multiple Choice"
  instruction: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  instructions: string;
  sections: Section[];
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
}

export type WebSocketMessage =
  | { type: 'SUBSCRIBE'; assignmentId: string }
  | { type: 'PROGRESS'; assignmentId: string; progress: number; status: string }
  | { type: 'COMPLETED'; assignmentId: string; assessment: Assessment }
  | { type: 'FAILED'; assignmentId: string; error: string };
