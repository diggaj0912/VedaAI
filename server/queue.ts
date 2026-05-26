/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebSocket } from 'ws';
import { Assessment, AssignmentInput } from '../src/types';
import { getAssessmentById, saveAssessment } from './db';
import { generateAssessmentWithAI } from './gemini';

// In-memory registry of websocket clients subscribed to specific assessment IDs
const subscriptions = new Map<string, Set<WebSocket>>();

export function registerSubscription(assessmentId: string, ws: WebSocket) {
  if (!subscriptions.has(assessmentId)) {
    subscriptions.set(assessmentId, new Set());
  }
  subscriptions.get(assessmentId)!.add(ws);

  // When connection closes, clean up subscription
  ws.on('close', () => {
    removeSubscription(assessmentId, ws);
  });
}

export function removeSubscription(assessmentId: string, ws: WebSocket) {
  const clients = subscriptions.get(assessmentId);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      subscriptions.delete(assessmentId);
    }
  }
}

function broadcastToSubscribers(assessmentId: string, message: any) {
  const clients = subscriptions.get(assessmentId);
  if (clients) {
    const payload = JSON.stringify(message);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

// Emulate BullMQ background queue processing
class BullMQLikeQueue {
  private queue: string[] = [];
  private isProcessing = false;

  async addJob(assessmentId: string, input: AssignmentInput) {
    this.queue.push(assessmentId);
    console.log(`[BullMQ] Added assessment job ${assessmentId} to queue. Current queue length: ${this.queue.length}`);
    
    // Notify clients that job is queued
    broadcastToSubscribers(assessmentId, {
      type: 'PROGRESS',
      assignmentId: assessmentId,
      progress: 5,
      status: 'queued'
    });

    // Start background processing loop asynchronously
    setImmediate(() => this.processNextJob(input));
  }

  private async processNextJob(input: AssignmentInput) {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const assessmentId = this.queue.shift()!;
    console.log(`[BullMQ Worker] Processing assessment job: ${assessmentId}`);

    try {
      const assessment = getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found in database`);
      }

      // Progress 15% - Worker Checked Out
      assessment.status = 'processing';
      assessment.progress = 15;
      saveAssessment(assessment);
      broadcastToSubscribers(assessmentId, {
        type: 'PROGRESS',
        assignmentId: assessmentId,
        progress: 15,
        status: 'Worker picked up job from Redis queue...'
      });

      // Progress 30% - Context Analyzed
      await delay(1200);
      assessment.progress = 30;
      saveAssessment(assessment);
      broadcastToSubscribers(assessmentId, {
        type: 'PROGRESS',
        assignmentId: assessmentId,
        progress: 30,
        status: input.sourceText 
          ? 'Analyzing source text document and instructions...' 
          : 'Creating direct assessment guidelines...'
      });

      // Progress 50% - Calling GenAI
      await delay(800);
      assessment.progress = 50;
      saveAssessment(assessment);
      broadcastToSubscribers(assessmentId, {
        type: 'PROGRESS',
        assignmentId: assessmentId,
        progress: 50,
        status: 'Invoking VedaAI engine to compose and format questions...'
      });

      // Fire the actual Gemini API call
      const generatedSections = await generateAssessmentWithAI(input);

      // Progress 85% - Rendering assessment structure
      assessment.sections = generatedSections;
      assessment.progress = 85;
      saveAssessment(assessment);
      broadcastToSubscribers(assessmentId, {
        type: 'PROGRESS',
        assignmentId: assessmentId,
        progress: 85,
        status: 'Validating academic rigor and formatting exam sheets...'
      });

      // Progress 100% - Finished
      await delay(1000);
      assessment.status = 'completed';
      assessment.progress = 100;
      saveAssessment(assessment);

      console.log(`[BullMQ Worker] Job ${assessmentId} completed successfully!`);
      broadcastToSubscribers(assessmentId, {
        type: 'COMPLETED',
        assignmentId: assessmentId,
        assessment: assessment
      });

    } catch (error: any) {
      console.error(`[BullMQ Worker] Job ${assessmentId} failed:`, error);
      const assessment = getAssessmentById(assessmentId);
      if (assessment) {
        assessment.status = 'failed';
        assessment.progress = 0;
        assessment.error = error.message || 'Unknown processing error';
        saveAssessment(assessment);
      }
      broadcastToSubscribers(assessmentId, {
        type: 'FAILED',
        assignmentId: assessmentId,
        error: error.message || 'Unknown processing error'
      });
    } finally {
      this.isProcessing = false;
      // Continue to check queue
      setImmediate(() => this.processNextJob(input));
    }
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const bullMQQueue = new BullMQLikeQueue();
