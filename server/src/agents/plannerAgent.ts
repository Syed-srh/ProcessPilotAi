import { WorkflowNode, WorkflowEdge } from '../workflow/workflowEngine';

export interface ExecutionPlan {
  orderedNodeIds: string[];
  dependencyMap: Record<string, string[]>;
  hasCycles: boolean;
  confidenceScore: number;
  reasoning: string;
}

export class PlannerAgent {
  /**
   * Analyze workflow graph structure and generate a structured execution plan
   */
  public static plan(nodes: WorkflowNode[], edges: WorkflowEdge[]): ExecutionPlan {
    const dependencyMap: Record<string, string[]> = {};
    nodes.forEach((n) => (dependencyMap[n.id] = []));

    edges.forEach((e) => {
      if (dependencyMap[e.target]) {
        dependencyMap[e.target].push(e.source);
      }
    });

    // Topological sorting for sequential pathing
    const visited = new Set<string>();
    const tempVisited = new Set<string>();
    const orderedNodeIds: string[] = [];
    let hasCycles = false;

    function visit(nodeId: string) {
      if (tempVisited.has(nodeId)) {
        hasCycles = true;
        return;
      }
      if (!visited.has(nodeId)) {
        tempVisited.add(nodeId);
        const children = edges.filter((e) => e.source === nodeId).map((e) => e.target);
        children.forEach((childId) => visit(childId));
        tempVisited.delete(nodeId);
        visited.add(nodeId);
        orderedNodeIds.unshift(nodeId);
      }
    }

    const triggerNode = nodes.find((n) => n.type === 'MANUAL_TRIGGER') || nodes[0];
    if (triggerNode) {
      visit(triggerNode.id);
    }

    const confidenceScore = hasCycles ? 0.4 : nodes.length > 0 ? 0.95 : 0.0;
    const reasoning = hasCycles
      ? 'Workflow graph contains potential cyclic paths'
      : `Planned sequential order for ${nodes.length} nodes starting from ${triggerNode?.id || 'entry'}`;

    return {
      orderedNodeIds,
      dependencyMap,
      hasCycles,
      confidenceScore,
      reasoning,
    };
  }
}
