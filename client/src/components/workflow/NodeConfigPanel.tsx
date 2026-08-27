import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { V1_NODE_CATALOG } from '../../types/workflow';
import { X, Trash2, Settings2, Sliders, Check } from 'lucide-react';

export const NodeConfigPanel: React.FC = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeConfig, deleteNode } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return null;
  }

  const meta = V1_NODE_CATALOG.find((n) => n.type === selectedNode.type);

  const handleConfigChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    updateNodeConfig(selectedNode.id, label, updated);
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    updateNodeConfig(selectedNode.id, newLabel, config);
  };

  return (
    <div className="w-80 border-l border-border bg-card/95 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl z-20">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Node Configuration</h3>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Metadata Badge */}
        <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400 font-mono">{meta?.label || selectedNode.type}</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {meta?.category}
          </span>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-mono font-bold uppercase mb-1.5">Node Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Node Type Specific Configurations */}
          {selectedNode.type === 'CONDITION' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="font-mono text-slate-300 font-bold uppercase text-[11px]">Rule Definition</div>
              <div>
                <label className="block text-slate-400 mb-1">Field Path</label>
                <input
                  type="text"
                  value={config.conditionGroup?.rules?.[0]?.field || 'refund.amount'}
                  onChange={(e) =>
                    handleConfigChange('conditionGroup', {
                      logic: 'AND',
                      rules: [
                        {
                          field: e.target.value,
                          operator: config.conditionGroup?.rules?.[0]?.operator || 'lte',
                          value: config.conditionGroup?.rules?.[0]?.value || 5000,
                        },
                      ],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                  placeholder="refund.amount"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operator</label>
                <select
                  value={config.conditionGroup?.rules?.[0]?.operator || 'lte'}
                  onChange={(e) =>
                    handleConfigChange('conditionGroup', {
                      logic: 'AND',
                      rules: [
                        {
                          field: config.conditionGroup?.rules?.[0]?.field || 'refund.amount',
                          operator: e.target.value,
                          value: config.conditionGroup?.rules?.[0]?.value || 5000,
                        },
                      ],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                >
                  <option value="equals">Equals (==)</option>
                  <option value="not_equals">Not Equals (!=)</option>
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="gte">Greater Than or Equal (&ge;)</option>
                  <option value="less_than">Less Than (&lt;)</option>
                  <option value="lte">Less Than or Equal (&le;)</option>
                  <option value="contains">Contains</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Threshold Value</label>
                <input
                  type="text"
                  value={config.conditionGroup?.rules?.[0]?.value ?? 5000}
                  onChange={(e) =>
                    handleConfigChange('conditionGroup', {
                      logic: 'AND',
                      rules: [
                        {
                          field: config.conditionGroup?.rules?.[0]?.field || 'refund.amount',
                          operator: config.conditionGroup?.rules?.[0]?.operator || 'lte',
                          value: e.target.value,
                        },
                      ],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'HTTP_REQUEST' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                <label className="block text-slate-400 mb-1">HTTP Method</label>
                <select
                  value={config.method || 'POST'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Endpoint URL</label>
                <input
                  type="text"
                  value={config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://api.example.com/refunds"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isMocked"
                  checked={config.isMocked ?? true}
                  onChange={(e) => handleConfigChange('isMocked', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500"
                />
                <label htmlFor="isMocked" className="text-slate-300">Mock execution mode (no real side effects)</label>
              </div>
            </div>
          )}

          {selectedNode.type === 'HUMAN_APPROVAL' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                <label className="block text-slate-400 mb-1">Approval Trigger Threshold (₹)</label>
                <input
                  type="number"
                  value={config.approvalThreshold ?? 5000}
                  onChange={(e) => handleConfigChange('approvalThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Risk Level</label>
                <select
                  value={config.riskLevel || 'HIGH'}
                  onChange={(e) => handleConfigChange('riskLevel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          )}

          {selectedNode.type === 'SEND_EMAIL' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                <label className="block text-slate-400 mb-1">Recipient</label>
                <input
                  type="text"
                  value={config.to || '{{customer.email}}'}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={config.subject || 'Refund Request Update'}
                  onChange={(e) => handleConfigChange('subject', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-border text-slate-100 font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Node Footer */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete Node
        </button>
      </div>
    </div>
  );
};
