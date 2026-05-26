/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Assessment } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize DB with empty assessments if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ assessments: [] }, null, 2));
  }
}

export function getAllAssessments(): Assessment[] {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.assessments || [];
  } catch (error) {
    console.error('Error reading database file, returning empty array', error);
    return [];
  }
}

export function saveAssessment(assessment: Assessment): void {
  initDB();
  try {
    const assessments = getAllAssessments();
    const index = assessments.findIndex((a) => a.id === assessment.id);
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify({ assessments }, null, 2));
  } catch (error) {
    console.error('Error saving assessment to database', error);
  }
}

export function getAssessmentById(id: string): Assessment | undefined {
  const assessments = getAllAssessments();
  return assessments.find((a) => a.id === id);
}

export function deleteAssessment(id: string): void {
  initDB();
  try {
    const assessments = getAllAssessments();
    const filtered = assessments.filter((a) => a.id !== id);
    fs.writeFileSync(DB_FILE, JSON.stringify({ assessments: filtered }, null, 2));
  } catch (error) {
    console.error('Error deleting assessment from database', error);
  }
}
