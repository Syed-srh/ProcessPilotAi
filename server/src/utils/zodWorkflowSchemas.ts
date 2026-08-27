import { z } from 'zod';

export const v1NodeTypesEnum = z.enum([
  'MANUAL_TRIGGER',
  'AI_DECISION',
  'CONDITION',
  'HUMAN_APPROVAL',
  'HTTP_REQUEST',
  'SEND_EMAIL',
  'SCHEMA_VALIDATION',
  'DATABASE_QUERY',
]);

export const generatedNodeSchema = z.object({
  id: z.string(),
  type: v1NodeTypesEnum,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    config: z.record(z.any()).default({}),
  }),
});

export const generatedEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().optional(),
});

export const generatedWorkflowSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default('AI-generated business process workflow'),
  nodes: z.array(generatedNodeSchema).min(1),
  edges: z.array(generatedEdgeSchema),
  variables: z.record(z.any()).optional().default({}),
  approvalRules: z.record(z.any()).optional().default({}),
});

export type GeneratedWorkflowGraph = z.infer<typeof generatedWorkflowSchema>;

export function validateGeneratedWorkflow(data: unknown): { success: boolean; data?: GeneratedWorkflowGraph; error?: string } {
  try {
    const validated = generatedWorkflowSchema.parse(data);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
