import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { AIProviderRouter } from '../../src/utils/aiProviderRouter';

vi.mock('axios');

describe('AIProviderRouter Fallback Chain Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'mock-gemini-key',
      GROQ_API_KEY: 'mock-groq-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use Gemini primary provider when Gemini API call succeeds', async () => {
    const mockGeminiResponse = {
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    name: 'Gemini Compiled Refund Workflow',
                    description: 'Compiled via Gemini Flash',
                    nodes: [
                      { id: 'node-1', type: 'MANUAL_TRIGGER', position: { x: 0, y: 0 }, data: { label: 'Start' } },
                      { id: 'node-2', type: 'SEND_EMAIL', position: { x: 0, y: 100 }, data: { label: 'Email' } },
                    ],
                    edges: [{ id: 'e1', source: 'node-1', target: 'node-2' }],
                  }),
                },
              ],
            },
          },
        ],
      },
    };

    (axios.post as any).mockResolvedValueOnce(mockGeminiResponse);

    const result = await AIProviderRouter.generateWorkflowFromSOP('When refund requested send email');

    expect(result.providerUsed).toBe('GEMINI');
    expect(result.workflow.name).toBe('Gemini Compiled Refund Workflow');
    expect(result.fallbackReason).toBeUndefined();
  });

  it('should fallback to Groq when Gemini returns 429 rate limit error', async () => {
    // Gemini fails with 429
    (axios.post as any).mockRejectedValueOnce({
      response: { status: 429, data: { error: { message: 'Quota exceeded for Gemini API' } } },
    });

    // Groq succeeds
    const mockGroqResponse = {
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Groq Compiled Workflow',
                description: 'Compiled via Groq Llama 3.3',
                nodes: [
                  { id: 'node-1', type: 'MANUAL_TRIGGER', position: { x: 0, y: 0 }, data: { label: 'Start' } },
                  { id: 'node-2', type: 'HTTP_REQUEST', position: { x: 0, y: 100 }, data: { label: 'HTTP' } },
                ],
                edges: [{ id: 'e1', source: 'node-1', target: 'node-2' }],
              }),
            },
          },
        ],
      },
    };

    (axios.post as any).mockResolvedValueOnce(mockGroqResponse);

    const result = await AIProviderRouter.generateWorkflowFromSOP('When refund requested call payment API');

    expect(result.providerUsed).toBe('GROQ');
    expect(result.workflow.name).toBe('Groq Compiled Workflow');
    expect(result.fallbackReason).toContain('Gemini unavailable');
  });

  it('should fallback to Deterministic generator when both Gemini and Groq fail', async () => {
    // Gemini fails
    (axios.post as any).mockRejectedValueOnce({
      response: { status: 500, data: { error: { message: 'Gemini server error' } } },
    });

    // Groq fails
    (axios.post as any).mockRejectedValueOnce({
      response: { status: 429, data: { error: { message: 'Groq rate limit exceeded' } } },
    });

    const result = await AIProviderRouter.generateWorkflowFromSOP('When customer requests refund below ₹5,000 auto approve');

    expect(result.providerUsed).toBe('DETERMINISTIC');
    expect(result.workflow.name).toBe('Customer Refund Automation');
    expect(result.workflow.nodes.length).toBeGreaterThanOrEqual(4);
    expect(result.fallbackReason).toContain('Gemini failed');
    expect(result.fallbackReason).toContain('Groq failed');
  });
});
