
import { useCollaboration } from '@/context/CollaborationContext';
import { useDiagram } from '@/context/DiagramContext';

export function RemoteCursors() {
  const { remoteCursors } = useCollaboration();
  const { zoom } = useDiagram();

  return (
    <>
      {Object.entries(remoteCursors).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'all 0.1s linear' // smooth interpolation between 50ms ticks
          }}
        >
          {/* Custom Cursor SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            <path
              d="M5.65376 21.2373L2.31682 2.38139C2.10091 1.16091 3.33405 0.203658 4.45332 0.722511L21.7208 8.72477C22.8809 9.26262 22.9238 10.9168 21.7924 11.5177L15.3904 14.9177C15.0134 15.1179 14.7176 15.4285 14.5369 15.811L11.4552 22.3364C10.9113 23.4883 9.20815 23.4566 8.70617 22.2847L5.65376 21.2373Z"
              fill="#0c8ce9"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Name Tag */}
          <div
            className="mt-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
            style={{
              backgroundColor: '#0c8ce9',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginLeft: '12px'
            }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
}
