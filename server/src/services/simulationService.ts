import { AgentOrchestrator, OrchestratorResult } from '../agents/agentOrchestrator';
import { WorkflowService } from './workflowService';

export class SimulationService {
  /**
   * Run structural simulation (dry-run mode, zero real side-effects)
   */
  public static async simulateWorkflow(
    workflowId: string,
    ownerId: string,
    inputs: Record<string, any> = {}
  ): Promise<OrchestratorResult> {
    const workflow = await WorkflowService.getWorkflowById(workflowId, ownerId);

    const simulationResult = await AgentOrchestrator.execute(
      workflow.nodes as any[],
      workflow.edges as any[],
      inputs,
      {
        workflowId: workflow.id,
        isSimulation: true,
      }
    );

    // Annotate simulation log events to explicitly show side-effects were skipped
    const annotatedLogs = simulationResult.logs.map((log) => ({
      ...log,
      message:
        log.agent === 'EXECUTION'
          ? `${log.message} (SIMULATION DRY-RUN — External side-effects SKIPPED)`
          : log.message,
    }));

    return {
      ...simulationResult,
      logs: annotatedLogs,
    };
  }
}
