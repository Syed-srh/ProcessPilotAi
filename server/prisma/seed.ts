import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ProcessPilot AI mock dataset...');

  // Create demo operator user
  const passwordHash = await bcrypt.hash('Operator123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'operator@processpilot.ai' },
    update: {},
    create: {
      email: 'operator@processpilot.ai',
      name: 'Senior Ops Operator',
      passwordHash,
      role: 'OPERATOR',
      canApprove: true,
    },
  });

  console.log(`✅ Demo User created: ${user.email} (ID: ${user.id})`);

  // Create Demo Workflow: Customer Refund Automation
  const demoWorkflow = await prisma.workflow.upsert({
    where: { id: 'wf-demo-refund' },
    update: {},
    create: {
      id: 'wf-demo-refund',
      name: 'Customer Refund Automation',
      description: 'End-to-end SOP for verifying orders, applying policy checks, enforcing threshold approval, and issuing refunds.',
      sourceSopText: 'When customer requests refund below ₹5,000 auto approve, if above ₹5,000 require manager approval and send notification email.',
      status: 'ACTIVE',
      version: 1,
      ownerId: user.id,
      nodes: [
        { id: 'n-trigger', type: 'MANUAL_TRIGGER', position: { x: 250, y: 50 }, data: { label: 'Receive Refund Request' } },
        { id: 'n-schema', type: 'SCHEMA_VALIDATION', position: { x: 250, y: 170 }, data: { label: 'Validate Input Schema', config: { requiredFields: ['orderId', 'amount', 'customerEmail'] } } },
        { id: 'n-db', type: 'DATABASE_QUERY', position: { x: 250, y: 290 }, data: { label: 'Verify Order Record', config: { model: 'order', action: 'findUnique', isMocked: true } } },
        { id: 'n-ai', type: 'AI_DECISION', position: { x: 250, y: 410 }, data: { label: 'AI Eligibility & Policy Check', config: { prompt: 'Check refund policy compliance for customer request' } } },
        { id: 'n-cond', type: 'CONDITION', position: { x: 250, y: 530 }, data: { label: 'Check Amount <= ₹5,000', config: { conditionGroup: { logic: 'AND', rules: [{ field: 'amount', operator: 'lte', value: 5000 }] } } } },
        { id: 'n-http', type: 'HTTP_REQUEST', position: { x: 100, y: 670 }, data: { label: 'Issue Stripe Refund API', config: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true } } },
        { id: 'n-appr', type: 'HUMAN_APPROVAL', position: { x: 400, y: 670 }, data: { label: 'Manager Approval Queue', config: { approvalThreshold: 5000, riskLevel: 'HIGH' } } },
        { id: 'n-email', type: 'SEND_EMAIL', position: { x: 250, y: 800 }, data: { label: 'Send Confirmation Email', config: { to: '{{customerEmail}}', subject: 'Refund Request Update' } } },
      ],
      edges: [
        { id: 'e-1-2', source: 'n-trigger', target: 'n-schema' },
        { id: 'e-2-3', source: 'n-schema', target: 'n-db' },
        { id: 'e-3-4', source: 'n-db', target: 'n-ai' },
        { id: 'e-4-5', source: 'n-ai', target: 'n-cond' },
        { id: 'e-5-http', source: 'n-cond', target: 'n-http', sourceHandle: 'true', label: 'Auto Approve (<= ₹5k)' },
        { id: 'e-5-appr', source: 'n-cond', target: 'n-appr', sourceHandle: 'false', label: 'Requires Approval (> ₹5k)' },
        { id: 'e-http-email', source: 'n-http', target: 'n-email' },
        { id: 'e-appr-email', source: 'n-appr', target: 'n-email' },
      ],
      variables: {
        orderId: 'ORD-1029',
        amount: 7500,
        customerEmail: 'customer@example.com',
      },
      approvalRules: {
        minConfidenceThreshold: 0.85,
        approvalThreshold: 5000,
      },
      tags: ['Refunds', 'Demo', 'Finance'],
    },
  });

  console.log(`✅ Demo Workflow created: ${demoWorkflow.name} (ID: ${demoWorkflow.id})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
