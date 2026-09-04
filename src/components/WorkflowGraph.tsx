import { useEffect, useState } from 'react';

interface WorkflowGraphProps {
  stateCounts: Record<string, number>;
  lastDecisionPath?: string;
  animatingPath?: boolean;
}

const STATES = [
  { id: 'intake', label: '접수', x: 60, y: 120, color: '#fff', borderColor: '#000', textColor: '#000' },
  { id: 'pending', label: '대기', x: 160, y: 120, color: '#e5e7eb', borderColor: '#e5e7eb', textColor: '#1f2937' },
  { id: 'judge', label: '판정', x: 260, y: 120, color: '#fff', borderColor: '#000', textColor: '#000' },
  { id: 'confirmed_auto', label: '확정-자동', x: 380, y: 40, color: '#dcfce7', borderColor: '#dcfce7', textColor: '#166534' },
  { id: 'confirmed_human', label: '확정-수동', x: 380, y: 100, color: '#fff', borderColor: '#16a34a', textColor: '#16a34a' },
  { id: 'review', label: '검토', x: 380, y: 160, color: '#fef3c7', borderColor: '#fef3c7', textColor: '#92400e' },
  { id: 'rejected', label: '기각', x: 380, y: 220, color: '#fee2e2', borderColor: '#fee2e2', textColor: '#991b1b' },
  { id: 'asking', label: '질문', x: 380, y: 280, color: '#dbeafe', borderColor: '#dbeafe', textColor: '#1e40af' },
];

const TRANSITIONS = [
  { from: 'intake', to: 'pending', dashed: false },
  { from: 'pending', to: 'judge', dashed: false },
  { from: 'judge', to: 'confirmed_auto', dashed: false },
  { from: 'judge', to: 'confirmed_human', dashed: false },
  { from: 'judge', to: 'review', dashed: false },
  { from: 'judge', to: 'rejected', dashed: false },
  { from: 'judge', to: 'asking', dashed: false },
  { from: 'review', to: 'confirmed_human', dashed: false },
  { from: 'asking', to: 'pending', dashed: true },
  { from: 'confirmed_human', to: 'pending', dashed: true },
];

export function WorkflowGraph({ stateCounts, lastDecisionPath, animatingPath }: WorkflowGraphProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (animatingPath) {
      setFadeOut(false);
      const timer = setTimeout(() => setFadeOut(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [animatingPath, lastDecisionPath]);

  const getPath = (from: any, to: any, dashed: boolean) => {
    const dy = to.y - from.y;
    const nodeWidth = 90;

    const startX = from.x + nodeWidth / 2;
    const startY = from.y;
    const endX = to.x - nodeWidth / 2;
    const endY = to.y;

    if (dashed || Math.abs(dy) > 20) {
      const midX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2;
      return `M${startX},${startY}Q${midX},${controlY},${endX},${endY}`;
    }

    return `M${startX},${startY}L${endX},${endY}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">예약 워크플로</h2>
      <svg viewBox="0 0 500 340" style={{ minHeight: '320px' }} className="w-full border border-gray-200 rounded bg-gray-50">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#999" />
          </marker>
          <marker id="arrowhead-highlight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#000" />
          </marker>
        </defs>

        {TRANSITIONS.map((trans, idx) => {
          const fromState = STATES.find((s) => s.id === trans.from);
          const toState = STATES.find((s) => s.id === trans.to);
          if (!fromState || !toState) return null;

          const isHighlighted = animatingPath && lastDecisionPath === `${trans.from}-${trans.to}` && !fadeOut;

          return (
            <path
              key={idx}
              d={getPath(fromState, toState, trans.dashed)}
              stroke={isHighlighted ? '#000' : '#ccc'}
              strokeWidth={isHighlighted ? 3 : 1.5}
              fill="none"
              strokeDasharray={trans.dashed ? '4,4' : 'none'}
              markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
              opacity={isHighlighted ? 1 : 0.6}
            />
          );
        })}

        {STATES.map((state) => (
          <g key={state.id}>
            <rect
              x={state.x - 45}
              y={state.y - 25}
              width="90"
              height="50"
              rx="8"
              fill={state.color}
              stroke={state.borderColor}
              strokeWidth="2"
            />
            <text
              x={state.x}
              y={state.y - 8}
              textAnchor="middle"
              fill={state.textColor}
              fontSize="11"
              fontWeight="bold"
              pointerEvents="none"
            >
              {state.label}
            </text>
            <text
              x={state.x}
              y={state.y + 10}
              textAnchor="middle"
              fill={state.textColor}
              fontSize="14"
              fontWeight="bold"
              pointerEvents="none"
            >
              {stateCounts[state.id] || 0}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
