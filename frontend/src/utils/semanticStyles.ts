import type { SemanticTag, NodeStyle } from '../types';

export function getSemanticStyle(tag?: SemanticTag): NodeStyle {
  if (!tag) return {};

  switch (tag) {
    case 'interface':
      return { backgroundColor: '#f3e5f5', borderColor: '#7c3aed', borderStyle: 'dashed', color: '#7c3aed' };
    case 'abstract':
      return { backgroundColor: '#eff6ff', borderColor: '#2563eb', borderStyle: 'dashed', color: '#2563eb' };
    case 'class':
      return { backgroundColor: '#f0fdf4', borderColor: '#16a34a', borderStyle: 'solid', color: '#16a34a' };
    case 'enum':
      return { backgroundColor: '#fff7ed', borderColor: '#c2410c', borderStyle: 'solid', color: '#c2410c' };
    case 'object':
      return { backgroundColor: '#fef2f2', borderColor: '#dc2626', borderStyle: 'solid', color: '#dc2626' };
    case 'service':
      return { backgroundColor: '#0f172a', borderColor: '#38bdf8', borderStyle: 'solid', color: '#38bdf8' };
    case 'controller':
      return { backgroundColor: '#0f172a', borderColor: '#a78bfa', borderStyle: 'solid', color: '#a78bfa' };
    case 'repository':
      return { backgroundColor: '#1c1917', borderColor: '#f97316', borderStyle: 'solid', color: '#f97316' };
    case 'entity':
      return { backgroundColor: '#1e293b', borderColor: '#4ade80', borderStyle: 'solid', color: '#4ade80' };
    case 'client':
      return { backgroundColor: '#f8fafc', borderColor: '#64748b', borderStyle: 'solid', color: '#64748b' };
    case 'server':
      return { backgroundColor: '#1e293b', borderColor: '#94a3b8', borderStyle: 'solid', color: '#94a3b8' };
    case 'database':
      return { backgroundColor: '#1a1a2e', borderColor: '#a04e4e', borderStyle: 'solid', color: '#e3e3e3' };
    case 'queue':
      return { backgroundColor: '#1a1a2e', borderColor: '#f59e0b', borderStyle: 'solid', color: '#e3e3e3' };
    case 'cache':
      return { backgroundColor: '#1a1a2e', borderColor: '#06b6d4', borderStyle: 'solid', color: '#e3e3e3' };
    case 'gateway':
      return { backgroundColor: '#0c1445', borderColor: '#60a5fa', borderStyle: 'solid', color: '#e3e3e3' };
    case 'input':
      return { backgroundColor: '#f0fdf4', borderColor: '#22c55e', borderStyle: 'solid', color: '#22c55e' };
    case 'output':
      return { backgroundColor: '#eff6ff', borderColor: '#3b82f6', borderStyle: 'solid', color: '#3b82f6' };
    case 'decision':
      return { backgroundColor: '#2e2c24', borderColor: '#c69c3a', borderStyle: 'solid', color: '#c69c3a' };
    case 'start':
    case 'end':
      return { backgroundColor: '#1e1b4b', borderColor: '#818cf8', borderStyle: 'solid', color: '#818cf8' };
    default:
      return {};
  }
}
