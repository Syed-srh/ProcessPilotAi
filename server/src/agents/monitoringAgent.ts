import { prisma } from '../config/prisma';
import { AgentType, LogLevel } from '@prisma/client';

export interface LogEventParams {
  executionId: string;
  workflowId: string;
  nodeId?: string;
  agent: AgentType;
  level?: LogLevel;
  message: string;
  reasoningTrace?: string;
  confidenceScore?: number;
  metadata?: Record<string, any>;
}

export class MonitoringAgent {
  /**
   * Record structured ExecutionLog entry in database
   */
  public static async logEvent(params: LogEventParams) {
    const {
      executionId,
      workflowId,
      nodeId,
      agent,
      level = LogLevel.INFO,
      message,
      reasoningTrace,
      confidenceScore,
      metadata,
    } = params;

    try {
      if (process.env.NODE_ENV === 'test') {
        return { id: `log-${Date.now()}`, ...params, timestamp: new Date() };
      }

      return await prisma.executionLog.create({
        data: {
          executionId,
          workflowId,
          nodeId,
          agent,
          level,
          message,
          reasoningTrace,
          confidenceScore,
          metadata: metadata || {},
        },
      });
    } catch (err) {
      console.warn(`[MonitoringAgent] DB Log write fallback: ${message}`);
      return { id: `log-${Date.now()}`, ...params, timestamp: new Date() };
    }
  }
}
