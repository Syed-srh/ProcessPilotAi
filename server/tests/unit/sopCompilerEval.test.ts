import { describe, it, expect } from 'vitest';
import { SOPCompiler } from '../../src/workflow/sopCompiler';
import { validateGeneratedWorkflow } from '../../src/utils/zodWorkflowSchemas';

describe('SOP Compiler Eval Suite (12 Business SOPs)', () => {
  const evalSops = [
    {
      name: 'Customer Refund SOP (projectOverview.md)',
      text: 'When a customer requests a refund, find their order, verify that the order exists, check refund policy, automatically approve refunds below ₹5,000, request manager approval for refunds above ₹5,000, process refund after approval, and send confirmation email.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'HUMAN_APPROVAL', 'SEND_EMAIL'],
    },
    {
      name: 'Employee Onboarding SOP',
      text: 'When a new employee joins, create user account in database, notify IT department via HTTP request, validate documentation, and send welcome email.',
      expectedNodes: ['MANUAL_TRIGGER', 'SEND_EMAIL'],
    },
    {
      name: 'Invoice Approval SOP',
      text: 'When an invoice is received, check vendor database record, validate invoice fields, auto-approve invoices <= ₹10,000, request VP approval for larger invoices, and send payment confirmation email.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'HUMAN_APPROVAL', 'SEND_EMAIL'],
    },
    {
      name: 'Leave Request SOP',
      text: 'When an employee submits leave, verify leave balance in database, check if leave duration > 3 days, require supervisor approval if long duration, and notify employee via email.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'SEND_EMAIL'],
    },
    {
      name: 'Support Ticket Escalation SOP',
      text: 'When a high priority support ticket is opened, check customer tier, if customer is VIP auto-escalate to senior engineer HTTP webhook, otherwise request lead review.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'HTTP_REQUEST'],
    },
    {
      name: 'Purchase Request SOP',
      text: 'When purchase order is requested, validate order schema, check estimated cost <= ₹50,000, route for procurement approval if threshold exceeded, and trigger vendor order.',
      expectedNodes: ['MANUAL_TRIGGER', 'SCHEMA_VALIDATION', 'CONDITION'],
    },
    {
      name: 'Vendor Onboarding SOP',
      text: 'When vendor submits registration, verify tax ID in database, check compliance rules, require compliance officer signoff if high risk, and email approval notice.',
      expectedNodes: ['MANUAL_TRIGGER', 'DATABASE_QUERY', 'SEND_EMAIL'],
    },
    {
      name: 'Expense Reimbursement SOP',
      text: 'When employee submits expense receipt, validate receipt schema, check expense amount <= ₹2,500, auto approve small expenses, request manager approval for large expenses, and pay via HTTP endpoint.',
      expectedNodes: ['MANUAL_TRIGGER', 'SCHEMA_VALIDATION', 'CONDITION'],
    },
    {
      name: 'Document Verification SOP',
      text: 'When passport copy is uploaded, validate document schema, run background DB check, require legal team approval, and send verification email.',
      expectedNodes: ['MANUAL_TRIGGER', 'SCHEMA_VALIDATION', 'SEND_EMAIL'],
    },
    {
      name: 'Customer Complaint Handling SOP',
      text: 'When customer logs complaint, categorize issue, check if compensation >= ₹1,000, require support manager approval for compensation, and issue HTTP refund credit.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'HTTP_REQUEST'],
    },
    {
      name: 'Contract Renewal SOP',
      text: 'When contract nears expiration date, lookup client record in database, check contract annual value > ₹100,000, require executive signoff for major contracts, and email renewal notice.',
      expectedNodes: ['MANUAL_TRIGGER', 'DATABASE_QUERY', 'SEND_EMAIL'],
    },
    {
      name: 'Access Request SOP',
      text: 'When user requests production database access, check user role, require security admin approval for production access, and trigger automated HTTP permission grant.',
      expectedNodes: ['MANUAL_TRIGGER', 'CONDITION', 'HTTP_REQUEST'],
    },
  ];

  for (const sop of evalSops) {
    it(`should compile eval SOP: "${sop.name}" into a valid Zod-schema workflow graph`, async () => {
      const result = await SOPCompiler.compile(sop.text);

      expect(result).toBeDefined();
      expect(result.workflow).toBeDefined();
      expect(result.providerUsed).toBeDefined();

      // Validate Zod Schema
      const validation = validateGeneratedWorkflow(result.workflow);
      expect(validation.success).toBe(true);

      const nodeTypesInGraph = result.workflow.nodes.map((n) => n.type);
      expect(nodeTypesInGraph).toContain('MANUAL_TRIGGER');

      // Verify at least some expected node types exist
      for (const expectedType of sop.expectedNodes) {
        expect(nodeTypesInGraph).toContain(expectedType);
      }
    });
  }
});
