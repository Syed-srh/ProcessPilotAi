import React from 'react';
import { V1_NODE_CATALOG, V1NodeType, NodeMeta } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Play,
  Bot,
  GitBranch,
  ShieldCheck,
  Globe,
  Mail,
  CheckCircle2,
  Database,
  Plus,
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

export const NodePalette: React.FC = () => {
  const { addNode } = useWorkflowStore();

  const categories = ['Triggers', 'AI', 'Logic', 'Actions'] as const;

  return (
    <div className="w-72 border-r border-border bg-card/60 backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-sm">Node Palette</h3>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
            8 v1 Types
          </span>
        </div>

        <div className="space-y-5">
          {categories.map((category) => {
            const nodes = V1_NODE_CATALOG.filter((n) => n.category === category);
            return (
              <div key={category}>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-2.5 px-1">
                  {category}
                </div>
                <div className="space-y-2">
                  {nodes.map((node: NodeMeta) => {
                    const IconComponent = iconMap[node.icon] || Layers;
                    return (
                      <button
                        key={node.type}
                        onClick={() => addNode(node.type as V1NodeType)}
                        className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all group flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform mt-0.5">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                              {node.label}
                            </span>
                            <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2">
                            {node.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border text-[11px] text-slate-500 font-mono">
        Click node card to add to active canvas position.
      </div>
    </div>
  );
};
