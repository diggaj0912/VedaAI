/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { getAllAssessments, getAssessmentById, saveAssessment, deleteAssessment } from './server/db';
import { registerSubscription, bullMQQueue } from './server/queue';
import { Assessment, AssignmentInput } from './src/types';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Parse JSON bodies up to 10mb for sourceText and document streams
  app.use(express.json({ limit: '10mb' }));

  // WebSocket Server setup
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected to live events gateway.');

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.type === 'SUBSCRIBE' && payload.assignmentId) {
          console.log(`[WebSocket] Subscribed client to: ${payload.assignmentId}`);
          registerSubscription(payload.assignmentId, ws);
        }
      } catch (err) {
        console.error('[WebSocket] Failed to process message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected.');
    });
  });

  // Bind WebSocket server to upgrade event
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // REST API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString() });
  });

  // Get all assessments (recent lists)
  app.get('/api/assessments', (req, res) => {
    try {
      const assessments = getAllAssessments();
      // Only send summarized info for list view to save bandwidth
      const summary = assessments.map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        grade: a.grade,
        dueDate: a.dueDate,
        status: a.status,
        progress: a.progress,
        sectionsCount: a.sections ? a.sections.length : 0,
        questionsCount: a.sections ? a.sections.reduce((sum, sec) => sum + (sec.questions ? sec.questions.length : 0), 0) : 0,
        createdAt: a.createdAt,
      }));
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch assessments' });
    }
  });

  // Get single assessment
  app.get('/api/assessments/:id', (req, res) => {
    try {
      const assessment = getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }
      res.json(assessment);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve assessment' });
    }
  });

  // Create new assessment
  app.post('/api/assessments', async (req, res) => {
    try {
      const input = req.body as AssignmentInput;
      if (!input.title || !input.subject || !input.grade) {
        return res.status(400).json({ error: 'Title, Subject, and Grade are required fields.' });
      }

      const assessmentId = `assess_${Date.now()}`;
      const newAssessment: Assessment = {
        id: assessmentId,
        title: input.title,
        subject: input.subject,
        grade: input.grade,
        dueDate: input.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: input.instructions || '',
        sections: [],
        status: 'idle',
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      // Save initial record in our database
      saveAssessment(newAssessment);

      // Add background generation job into queue (BullMQ simulation)
      await bullMQQueue.addJob(assessmentId, input);

      res.status(201).json(newAssessment);
    } catch (err: any) {
      console.error('API Error starting assessment generation:', err);
      res.status(500).json({ error: err.message || 'Failed to create assessment job' });
    }
  });

  // Delete an assessment
  app.delete('/api/assessments/:id', (req, res) => {
    try {
      deleteAssessment(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete assessment' });
    }
  });

  // Regenerate an assessment
  app.post('/api/assessments/:id/regenerate', async (req, res) => {
    try {
      const existing = getAssessmentById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const input = req.body as AssignmentInput;
      if (!input.title || !input.subject || !input.grade) {
        return res.status(400).json({ error: 'Required config fields missing for regeneration.' });
      }

      // Reset record state to idle/queued
      existing.title = input.title;
      existing.subject = input.subject;
      existing.grade = input.grade;
      existing.dueDate = input.dueDate;
      existing.instructions = input.instructions;
      existing.sections = [];
      existing.status = 'idle';
      existing.progress = 0;
      delete existing.error;
      saveAssessment(existing);

      // Add to background processing queue (BullMQ simulation)
      await bullMQQueue.addJob(existing.id, input);

      res.json(existing);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to regenerate assessment' });
    }
  });

  // Vite static assets and live compilation configurations
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[VedaAI Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
