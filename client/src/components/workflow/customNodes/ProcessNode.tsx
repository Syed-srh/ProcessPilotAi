import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { V1_NODE_CATALOG } from '../../../types/workflow';
import {
  Play,
  Bot,
  GitBranch,
  ShieldCheck,
  Globe,
  Mail,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Play,
  Bot,
  GitBranch,
  ShieldCheck,
  Globe,
  Mail,
  CheckCircle2,
  Database,
};

export const ProcessNode = memo(({ id, data, type, selected }: NodeProps) => {
  const meta = V1_NODE_CATALOG.find((n) => n.type === type);
  const IconComponent = meta ? iconMap[meta.icon] || Layers : Layers;

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400';
      case 'indigo':
        return 'border-indigo-500/50 bg-indigo-950/40 text-indigo-400';
      case 'amber':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-400';
      case 'rose':
        return 'border-rose-500/50 bg-rose-950/40 text-rose-400';
      case 'cyan':
        return 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400';
      case 'sky':
        return 'border-sky-500/50 bg-sky-950/40 text-sky-400';
      case 'purple':
        return 'border-purple-500/50 bg-purple-950/40 text-purple-400';
      case 'teal':
        return 'border-teal-500/50 bg-teal-950/40 text-teal-400';
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-300';
    }
  };

  const isConditionNode = type === 'CONDITION';
  const isTriggerNode = type === 'MANUAL_TRIGGER';
  const nodeData = data as any;

  return (
    <div
      className={`w-64 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${
        selected ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-800'
      } bg-card/90`}
    >
      {/* Input Handle (if not trigger) */}
      {!isTriggerNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-indigo-500 border-2 border-slate-900"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2.5 rounded-xl border ${getColorClasses(meta?.color)}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
            {meta?.category || 'Node'}
          </div>
          <h4 className="text-sm font-bold text-slate-100 truncate">
            {String(nodeData.label || meta?.label || type)}
          </h4>
        </div>
      </div>

      {/* Configuration Summary Badge */}
      <div className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 font-mono truncate">
        {type === 'MANUAL_TRIGGER' && 'Manual execution payload trigger'}
        {type === 'CONDITION' &&
          `IF ${nodeData.config?.conditionGroup?.rules?.[0]?.field || 'field'} ${
            nodeData.config?.conditionGroup?.rules?.[0]?.operator || '=='
          } ${nodeData.config?.conditionGroup?.rules?.[0]?.value || 'val'}`}
        {type === 'HTTP_REQUEST' && `${nodeData.config?.method || 'GET'} ${nodeData.config?.url || 'URL'}`}
        {type === 'SEND_EMAIL' && `To: ${nodeData.config?.to || 'recipient'}`}
        {type === 'DATABASE_QUERY' && `${nodeData.config?.action || 'query'} on ${nodeData.config?.model || 'db'}`}
        {type === 'AI_DECISION' && `Decision: ${nodeData.config?.defaultDecision || 'APPROVED'}`}
        {type === 'HUMAN_APPROVAL' && `Approval Threshold: ≥ ${nodeData.config?.approvalThreshold || 5000}`}
        {type === 'SCHEMA_VALIDATION' && `Validate fields: ${nodeData.config?.requiredFields?.join(', ') || 'required'}`}
      </div>

      {/* Output Handles */}
      {isConditionNode ? (
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">TRUE</span>
          <span className="text-rose-400 font-bold">FALSE</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '25%' }}
            className="w-3 h-3 !bg-emerald-500 border-2 border-slate-900"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '75%' }}
            className="w-3 h-3 !bg-rose-500 border-2 border-slate-900"
          />
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-indigo-500 border-2 border-slate-900"
        />
      )}
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';
