export type V1NodeType =
  | 'MANUAL_TRIGGER'
  | 'AI_DECISION'
  | 'CONDITION'
  | 'HUMAN_APPROVAL'
  | 'HTTP_REQUEST'
  | 'SEND_EMAIL'
  | 'SCHEMA_VALIDATION'
  | 'DATABASE_QUERY';

export interface WorkflowNodeData {
  label: string;
  config: Record<string, any>;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: V1NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  sourceSopText?: string;
  ownerId: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  approvalRules?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NodeMeta {
  type: V1NodeType;
  label: string;
  description: string;
  category: 'Triggers' | 'AI' | 'Logic' | 'Actions';
  icon: string;
  color: string;
  defaultConfig: Record<string, any>;
}

export const V1_NODE_CATALOG: NodeMeta[] = [
  {
    type: 'MANUAL_TRIGGER',
    label: 'Manual Trigger',
    description: 'Start workflow execution on demand with custom payload inputs.',
    category: 'Triggers',
    icon: 'Play',
    color: 'emerald',
    defaultConfig: {},
  },
  {
    type: 'AI_DECISION',
    label: 'AI Decision',
    description: 'LLM-backed reasoning engine returning structured decision & confidence score.',
    category: 'AI',
    icon: 'Bot',
    color: 'indigo',
    defaultConfig: { prompt: 'Analyze request and decide eligibility', defaultDecision: 'APPROVED' },
  },
  {
    type: 'CONDITION',
    label: 'Condition',
    description: 'Deterministic branching logic (IF refund.amount > 5000 THEN true/false).',
    category: 'Logic',
    icon: 'GitBranch',
    color: 'amber',
    defaultConfig: {
      conditionGroup: {
        logic: 'AND',
        rules: [{ field: 'refund.amount', operator: 'lte', value: 5000 }],
      },
    },
  },
  {
    type: 'HUMAN_APPROVAL',
    label: 'Human Approval',
    description: 'Pauses workflow execution and creates an item in the Approval Queue.',
    category: 'Logic',
    icon: 'ShieldCheck',
    color: 'rose',
    defaultConfig: { approvalThreshold: 5000, riskLevel: 'HIGH' },
  },
  {
    type: 'HTTP_REQUEST',
    label: 'HTTP Request',
    description: 'Outbound REST API call to external webhooks or test endpoints.',
    category: 'Actions',
    icon: 'Globe',
    color: 'cyan',
    defaultConfig: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true },
  },
  {
    type: 'SEND_EMAIL',
    label: 'Send Email',
    description: 'Transactional email notification sent to customers or internal teams.',
    category: 'Actions',
    icon: 'Mail',
    color: 'sky',
    defaultConfig: { to: '{{customer.email}}', subject: 'Refund Request Update' },
  },
  {
    type: 'SCHEMA_VALIDATION',
    label: 'Schema Validation',
    description: 'Validates step output against expected fields before continuing.',
    category: 'Logic',
    icon: 'CheckCircle2',
    color: 'purple',
    defaultConfig: { requiredFields: ['orderId', 'amount'] },
  },
  {
    type: 'DATABASE_QUERY',
    label: 'Database Query / Update',
    description: 'Read or update database records in the mock order system.',
    category: 'Actions',
    icon: 'Database',
    color: 'teal',
    defaultConfig: { model: 'order', action: 'findUnique', isMocked: true },
  },
];
