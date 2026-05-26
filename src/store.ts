/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Assessment, AssignmentInput, WebSocketMessage } from './types';

interface AssessmentSummary {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  sectionsCount: number;
  questionsCount: number;
  createdAt: string;
}

interface AppState {
  assessments: AssessmentSummary[];
  activeAssessment: Assessment | null;
  activeInput: AssignmentInput | null;
  loading: boolean;
  progress: number;
  workerStatus: string;
  currentView: 'dashboard' | 'create' | 'view';
  ws: WebSocket | null;

  // Actions
  fetchAssessments: () => Promise<void>;
  fetchAssessmentDetail: (id: string) => Promise<Assessment | null>;
  createAssessment: (input: AssignmentInput) => Promise<string | null>;
  regenerateAssessment: (id: string, input: AssignmentInput) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  setView: (view: 'dashboard' | 'create' | 'view') => void;
  setActiveAssessment: (assessment: Assessment | null) => void;
  setActiveInput: (input: AssignmentInput | null) => void;
  subscribeToUpdates: (assessmentId: string) => void;
  disconnectWebSocket: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  assessments: [],
  activeAssessment: null,
  activeInput: null,
  loading: false,
  progress: 0,
  workerStatus: '',
  currentView: 'dashboard',
  ws: null,

  setView: (view) => set({ currentView: view }),
  setActiveAssessment: (assessment) => set({ activeAssessment: assessment }),
  setActiveInput: (input) => set({ activeInput: input }),

  fetchAssessments: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/assessments');
      if (!response.ok) throw new Error('Failed to fetch assessments summaries');
      const data = await response.json();
      set({ assessments: data, loading: false });
    } catch (error) {
      console.error('Error fetching assessments:', error);
      set({ loading: false });
    }
  },

  fetchAssessmentDetail: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/assessments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch assessment detail');
      const data = (await response.json()) as Assessment;
      set({ activeAssessment: data, loading: false });
      return data;
    } catch (error) {
      console.error(`Error loading assessment detail for ${id}:`, error);
      set({ loading: false });
      return null;
    }
  },

  createAssessment: async (input) => {
    set({ loading: true, progress: 0, workerStatus: 'Queuing job in background queue...' });
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create assessment assignment');
      }

      const assignmentSummary = (await response.json()) as Assessment;
      set({
        activeAssessment: assignmentSummary,
        activeInput: input,
        loading: false,
        currentView: 'view',
      });

      // Subscribe to WebSocket updates for real-time progress
      get().subscribeToUpdates(assignmentSummary.id);
      return assignmentSummary.id;
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      set({ loading: false, workerStatus: `Generation Failed: ${error.message}` });
      return null;
    }
  },

  regenerateAssessment: async (id, input) => {
    set({ progress: 0, workerStatus: 'Adding job to Redis and BullMQ for regeneration...' });
    if (get().activeAssessment) {
      set({
        activeAssessment: {
          ...get().activeAssessment!,
          status: 'queued',
          progress: 0,
          sections: [],
          error: undefined,
        },
      });
    }

    try {
      const response = await fetch(`/api/assessments/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to regenerate assessment');
      }

      const resJson = await response.json();
      set({ activeInput: input });

      // Subscribe to updates
      get().subscribeToUpdates(id);
    } catch (error: any) {
      console.error('Error regenerating assessment:', error);
      set({
        activeAssessment: get().activeAssessment
          ? {
              ...get().activeAssessment!,
              status: 'failed',
              error: error.message || 'Regeneration failure',
            }
          : null,
      });
    }
  },

  deleteAssessment: async (id) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        get().fetchAssessments();
        if (get().activeAssessment?.id === id) {
          set({ activeAssessment: null, currentView: 'dashboard' });
        }
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
    }
  },

  subscribeToUpdates: (assessmentId: string) => {
    // If there is an existing websocket connection, reuse it or close it
    get().disconnectWebSocket();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log(`[WebSocket] Establishing connection to ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`[WebSocket] Connected. Subscribing to assessment ID: ${assessmentId}`);
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', assignmentId: assessmentId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        console.log('[WebSocket] Message received:', data);

        if (data.assignmentId !== assessmentId) return;

        if (data.type === 'PROGRESS') {
          set({
            progress: data.progress,
            workerStatus: data.status,
          });
          
          if (get().activeAssessment) {
            set({
              activeAssessment: {
                ...get().activeAssessment!,
                status: 'processing',
                progress: data.progress,
              },
            });
          }
        } else if (data.type === 'COMPLETED') {
          set({
            activeAssessment: data.assessment,
            progress: 100,
            workerStatus: 'Assessment questions composed successfully! Enjoy organizing.',
          });
          // Refresh list summaries in background
          get().fetchAssessments();
          // Clean up ws since it is completed
          get().disconnectWebSocket();
        } else if (data.type === 'FAILED') {
          set({
            progress: 0,
            workerStatus: `Generation Failed: ${data.error}`,
          });

          if (get().activeAssessment) {
            set({
              activeAssessment: {
                ...get().activeAssessment!,
                status: 'failed',
                error: data.error,
              },
            });
          }
          get().disconnectWebSocket();
        }
      } catch (err) {
        console.error('[WebSocket] Parsing message error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Client error:', err);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Connection closed.');
    };

    set({ ws });
  },

  disconnectWebSocket: () => {
    const ws = get().ws;
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        // Safe skip
      }
      set({ ws: null });
    }
  },
}));
