import axios from 'axios';
import { GeneratedWorkflowGraph, validateGeneratedWorkflow } from './zodWorkflowSchemas';
import { DeterministicGenerator } from '../workflow/deterministicGenerator';
import { SOP_COMPILER_SYSTEM_PROMPT } from '../workflow/sopCompilerPrompt';

export type AIProvider = 'GEMINI' | 'GROQ' | 'DETERMINISTIC';

export interface CompilationResult {
  workflow: GeneratedWorkflowGraph;
  providerUsed: AIProvider;
  fallbackReason?: string;
  executionTimeMs: number;
}

export class AIProviderRouter {
  /**
   * Main router entry point trying Gemini -> Groq -> Deterministic
   */
  public static async generateWorkflowFromSOP(sopText: string): Promise<CompilationResult> {
    const startTime = Date.now();

    // 1. Try Primary Provider: Google Gemini API
    const geminiResult = await this.callGemini(sopText);
    if (geminiResult.success && geminiResult.data) {
      const validation = validateGeneratedWorkflow(geminiResult.data);
      if (validation.success && validation.data) {
        return {
          workflow: validation.data,
          providerUsed: 'GEMINI',
          executionTimeMs: Date.now() - startTime,
        };
      }
    }

    const geminiReason = geminiResult.error || 'Gemini output failed Zod schema validation';
    console.warn(`[AIProviderRouter] Gemini failed (${geminiReason}). Falling back to Groq...`);

    // 2. Try Secondary Provider: Groq API
    const groqResult = await this.callGroq(sopText);
    if (groqResult.success && groqResult.data) {
      const validation = validateGeneratedWorkflow(groqResult.data);
      if (validation.success && validation.data) {
        return {
          workflow: validation.data,
          providerUsed: 'GROQ',
          fallbackReason: `Gemini unavailable: ${geminiReason}`,
          executionTimeMs: Date.now() - startTime,
        };
      }
    }

    const groqReason = groqResult.error || 'Groq output failed Zod schema validation';
    console.warn(`[AIProviderRouter] Groq failed (${groqReason}). Falling back to Deterministic Generator...`);

    // 3. Final Fallback: Deterministic Rule-Based Keyword Generator
    const deterministicGraph = DeterministicGenerator.generate(sopText);
    return {
      workflow: deterministicGraph,
      providerUsed: 'DETERMINISTIC',
      fallbackReason: `Gemini failed: (${geminiReason}); Groq failed: (${groqReason})`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Call Google Gemini API
   */
  private static async callGemini(sopText: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY environment variable is missing' };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await axios.post(
        endpoint,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: SOP_COMPILER_SYSTEM_PROMPT },
                { text: `SOP TEXT TO COMPILE:\n${sopText}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        },
        { timeout: 2500 }
      );

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return { success: false, error: 'Empty response from Gemini' };
      }

      const parsed = JSON.parse(this.cleanJsonString(rawText));
      return { success: true, data: parsed };
    } catch (err: any) {
      const statusCode = err.response?.status;
      const message = err.response?.data?.error?.message || err.message;
      return { success: false, error: `Gemini API Error [${statusCode || 500}]: ${message}` };
    }
  }

  /**
   * Call Groq API
   */
  private static async callGroq(sopText: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GROQ_API_KEY environment variable is missing' };
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const response = await axios.post(
        endpoint,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SOP_COMPILER_SYSTEM_PROMPT },
            { role: 'user', content: `SOP TEXT TO COMPILE:\n${sopText}` },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 2500,
        }
      );

      const rawContent = response.data?.choices?.[0]?.message?.content;
      if (!rawContent) {
        return { success: false, error: 'Empty response from Groq' };
      }

      const parsed = JSON.parse(this.cleanJsonString(rawContent));
      return { success: true, data: parsed };
    } catch (err: any) {
      const statusCode = err.response?.status;
      const message = err.response?.data?.error?.message || err.message;
      return { success: false, error: `Groq API Error [${statusCode || 500}]: ${message}` };
    }
  }

  /**
   * Helper to strip markdown fence blocks if present
   */
  private static cleanJsonString(str: string): string {
    return str
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  }
}
