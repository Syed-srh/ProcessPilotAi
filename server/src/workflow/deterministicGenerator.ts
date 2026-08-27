import { GeneratedWorkflowGraph } from '../utils/zodWorkflowSchemas';

export class DeterministicGenerator {
  /**
   * Parse SOP text using deterministic keyword matching and construct a valid runnable graph
   */
  public static generate(sopText: string): GeneratedWorkflowGraph {
    const textLower = sopText.toLowerCase();

    // Extract amount threshold e.g. "5,000", "5000", "10000"
    const amountMatch = sopText.match(/₹?\s?([\d,]+)/);
    let thresholdAmount = 5000;
    if (amountMatch) {
      const parsed = parseInt(amountMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) thresholdAmount = parsed;
    }

    const isRefund = textLower.includes('refund') || textLower.includes('order');
    const isOnboarding = textLower.includes('employee') || textLower.includes('onboard');
    const isInvoice = textLower.includes('invoice') || textLower.includes('payment');
    const hasDbCheck = textLower.includes('database') || textLower.includes('vendor') || textLower.includes('contract') || isRefund;
    const hasSchemaCheck = textLower.includes('schema') || textLower.includes('validate') || textLower.includes('receipt') || textLower.includes('purchase');

    const name = isRefund
      ? 'Customer Refund Automation'
      : isOnboarding
      ? 'Employee Onboarding Process'
      : isInvoice
      ? 'Invoice Approval Process'
      : 'Automated SOP Workflow';

    const description = `Compiled process from text: "${sopText.slice(0, 80)}..."`;

    // Dynamic node array reflecting detected SOP keywords
    const nodes: any[] = [
      {
        id: 'node-1',
        type: 'MANUAL_TRIGGER' as const,
        position: { x: 250, y: 50 },
        data: {
          label: 'Receive SOP Request',
          config: { isTrigger: true },
        },
      },
    ];

    let currentY = 170;
    let lastNodeId = 'node-1';

    if (hasSchemaCheck) {
      nodes.push({
        id: 'node-schema',
        type: 'SCHEMA_VALIDATION' as const,
        position: { x: 250, y: currentY },
        data: {
          label: 'Validate Input Fields & Schema',
          config: { requiredFields: ['id', 'amount', 'email'] },
        },
      });
      currentY += 120;
    }

    if (hasDbCheck) {
      nodes.push({
        id: 'node-db',
        type: 'DATABASE_QUERY' as const,
        position: { x: 250, y: currentY },
        data: {
          label: 'Verify Database Record',
          config: { model: 'order', action: 'findUnique', isMocked: true },
        },
      });
      currentY += 120;
    }

    // Condition Node
    const condNodeId = 'node-cond';
    nodes.push({
      id: condNodeId,
      type: 'CONDITION' as const,
      position: { x: 250, y: currentY },
      data: {
        label: `Check Amount <= ₹${thresholdAmount.toLocaleString()}`,
        config: {
          conditionGroup: {
            logic: 'AND',
            rules: [{ field: 'amount', operator: 'lte', value: thresholdAmount }],
          },
        },
      },
    });
    currentY += 140;

    // Action Nodes
    const httpNodeId = 'node-http';
    const approvalNodeId = 'node-approval';
    const emailNodeId = 'node-email';

    nodes.push(
      {
        id: httpNodeId,
        type: 'HTTP_REQUEST' as const,
        position: { x: 100, y: currentY },
        data: {
          label: 'Auto Approve & Process Action',
          config: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true },
        },
      },
      {
        id: approvalNodeId,
        type: 'HUMAN_APPROVAL' as const,
        position: { x: 400, y: currentY },
        data: {
          label: 'Manager Approval Queue',
          config: { approvalThreshold: thresholdAmount, riskLevel: 'HIGH' },
        },
      },
      {
        id: emailNodeId,
        type: 'SEND_EMAIL' as const,
        position: { x: 250, y: currentY + 130 },
        data: {
          label: 'Send Notification Email',
          config: { to: '{{customerEmail}}', subject: `${name} Update` },
        },
      }
    );

    // Edges construction
    const edges: any[] = [];
    let prevId = 'node-1';

    if (hasSchemaCheck) {
      edges.push({ id: `e-${prevId}-schema`, source: prevId, target: 'node-schema' });
      prevId = 'node-schema';
    }

    if (hasDbCheck) {
      edges.push({ id: `e-${prevId}-db`, source: prevId, target: 'node-db' });
      prevId = 'node-db';
    }

    edges.push(
      { id: `e-${prevId}-cond`, source: prevId, target: condNodeId },
      { id: `e-cond-http`, source: condNodeId, target: httpNodeId, sourceHandle: 'true', label: 'Auto Approve' },
      { id: `e-cond-appr`, source: condNodeId, target: approvalNodeId, sourceHandle: 'false', label: 'Requires Approval' },
      { id: `e-http-email`, source: httpNodeId, target: emailNodeId },
      { id: `e-appr-email`, source: approvalNodeId, target: emailNodeId }
    );

    return {
      name,
      description,
      nodes,
      edges,
      variables: { thresholdAmount, sopText },
      approvalRules: { minConfidenceThreshold: 0.85, approvalThreshold: thresholdAmount },
    };
  }
}
