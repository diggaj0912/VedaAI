/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AssignmentInput, Section } from "../src/types";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined!");
      throw new Error("GEMINI_API_KEY is required but not configured. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/**
 * Generates structured sections and questions based on prompt instructions and section definitions.
 */
export async function generateAssessmentWithAI(input: AssignmentInput): Promise<Section[]> {
  const ai = getGeminiClient();

  const formattedSectionsConfig = input.sections.map((sec, i) => {
    return `- Section ${i + 1}: ${sec.name}
  Question Type: ${sec.questionType}
  Number of Questions: ${sec.numberOfQuestions}
  Marks per Question: ${sec.marksPerQuestion}
  Section Instruction: ${sec.instruction || "Attempt all questions."}
`;
  }).join("\n");

  const prompt = `You are an elite educational assessment builder (VedaAI).
Create a highly professional academic assessment / exam paper based on the following specifications:

Title: ${input.title}
Subject: ${input.subject}
Grade Level: ${input.grade}
Special Instructions/Guidelines: ${input.instructions || "None"}

${input.sourceText ? `### SOURCE CONTENT / CONTEXT:
The questions MUST be constructed strictly or heavily aligned with the following source content:
"""
${input.sourceText}
"""` : "### SOURCE CONTENT: No specific source provided. Generate high-quality curriculum-appropriate questions."}

### REQUIRED EXAM SECTIONS CONFIGURATION:
${formattedSectionsConfig}

Ensure you generate exactly the requested number of questions for each section.
Align difficulty levels across the sections. Each section's questions should include a balanced mix of "easy", "moderate", and "hard" items appropriate for ${input.grade} level.

For multiple choice questions (mcq), you MUST provide exactly 4 options in the options array.
For other types of questions (short_answer, subjective, boolean, fill_blank), the options array can be empty or omitted.
Provide a clear correctAnswer (or sample solution) and a concise metadata explanation for each question to enrich the sheet for teachers.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are VedaAI, an intellectual assistant that generates beautifully structured, academically rigorous school assessments. You always respond in perfectly valid JSON conforming to the requested schema. Ensure the options field is only populated for multiple choice questions, and it contains exactly 4 options. All questions must carry correct marks.`,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              description: "Array of exam sections matching the configuration",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Section name and label, (e.g. 'Section A: Multiple Choice Questions')"
                  },
                  instruction: {
                    type: Type.STRING,
                    description: "Instruction block for the section (e.g. 'Read each question carefully. Select the best response.')"
                  },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: {
                          type: Type.STRING,
                          description: "The full academic question text. Keep it rigorous and beautifully formatted."
                        },
                        questionType: {
                          type: Type.STRING,
                          description: "The type of question.",
                          enum: ["mcq", "short_answer", "subjective", "boolean", "fill_blank"]
                        },
                        difficulty: {
                          type: Type.STRING,
                          description: "Difficulty classification of the question.",
                          enum: ["easy", "moderate", "hard"]
                        },
                        marks: {
                          type: Type.INTEGER,
                          description: "The marks allocated for this specific question as per configuration."
                        },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "For MCQ questions, exactly 4 multi-choice choices are required. Leave undefined for others."
                        },
                        correctAnswer: {
                          type: Type.STRING,
                          description: "The exact correct response string or brief key guide for grading."
                        },
                        explanation: {
                          type: Type.STRING,
                          description: "Teachers grading guide explanation as to why this answer is correct."
                        }
                      },
                      required: ["text", "questionType", "difficulty", "marks", "correctAnswer"]
                    }
                  }
                },
                required: ["title", "instruction", "questions"]
              }
            }
          },
          required: ["sections"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No output text received from Gemini.");
    }

    const parsedJson = JSON.parse(textOutput);
    
    // Process sections to inject unique IDs
    if (!parsedJson.sections || !Array.isArray(parsedJson.sections)) {
      throw new Error("Invalid output format: sections is not an array");
    }

    return parsedJson.sections.map((sec: any, sIdx: number) => ({
      id: `sec_${sIdx}_${Date.now()}`,
      title: sec.title || `Section ${String.fromCharCode(65 + sIdx)}`,
      instruction: sec.instruction || "Attempt all questions.",
      questions: (sec.questions || []).map((q: any, qIdx: number) => ({
        id: `q_${sIdx}_${qIdx}_${Date.now()}`,
        text: q.text || "",
        questionType: q.questionType || "short_answer",
        difficulty: q.difficulty || "moderate",
        marks: q.marks || 1,
        options: q.options || undefined,
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || ""
      }))
    }));

  } catch (error: any) {
    console.error("Error generating assessment with Gemini API:", error);
    throw error;
  }
}
