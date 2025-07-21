// File: src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import puzzleData from './assets/puzzles/puzzle_schema_example.json';

const CELL_SIZE = 108;
const EXPANDED_PANEL_SIZE = 200;
const Z_GRID     = 10;
const Z_BACKDROP = 40;
const Z_EXPANDED = 50;
const Z_MODAL    = 100;
const SHOW_ROW_LETTER_OVERLAY = false;

const PALETTE = {
  coral:  '#FF6F61',
  orange: '#FFB347',
  yellow: '#FFF176',
  teal:   '#66CDAA',
  blue:   '#6495ED'
};
const COLOR_ORDER = Object.values(PALETTE);

// ─────────────────────────────────────────────────────────
// 1. Utility & Shapes
function parseItem(id) {
  return { rowKey: id[0], colorIndex: Number(id.slice(1)) - 1 };
}

function Ring({ color, letter }) {
  return (
    <svg viewBox="0 0 72 72" className="shape">
      <circle cx={36} cy={36} r={32} fill={color} stroke="white" strokeWidth={2.5}/>
      <circle cx={36} cy={36} r={17} fill="none" stroke="white" strokeWidth={7}/>
      {SHOW_ROW_LETTER_OVERLAY && letter && (
        <text x={36} y={41} textAnchor="middle" fontSize="16" fill="#222" fontWeight="600">
          {letter}
        </text>
      )}
    </svg>
  );
}
function Hexagon({ color, letter }) {
  return (
    <svg viewBox="0 0 72 72" className="shape">
      <polygon
        points="36,5 64,21 64,51 36,67 8,51 8,21"
        fill={color} stroke="white" strokeWidth={2.5}
      />
      {SHOW_ROW_LETTER_OVERLAY && letter && (
        <text x={36} y={41} textAnchor="middle" fontSize="16" fill="#222" fontWeight="600">
          {letter}
        </text>
      )}
    </svg>
  );
}
function NotchedSquare({ color, letter }) {
  return (
    <svg viewBox="0 0 72 72" className="shape">
      <path
        d="M10 10 H54 L64 20 V62 H10 Z"
        fill={color} stroke="white" strokeWidth={2.5} strokeLinejoin="round"
      />
      {SHOW_ROW_LETTER_OVERLAY && letter && (
        <text x={32} y={44} textAnchor="middle" fontSize="16" fill="#222" fontWeight="600">
          {letter}
        </text>
      )}
    </svg>
  );
}
function Shield({ color, letter }) {
  return (
    <svg viewBox="0 0 72 72" className="shape">
      <path
        d="M36 7 L60 14 V34c0 17-10 27-24 32C22 61 12 51 12 34V14Z"
        fill={color} stroke="white" strokeWidth={2.5} strokeLinejoin="round"
      />
      {SHOW_ROW_LETTER_OVERLAY && letter && (
        <text x={36} y={41} textAnchor="middle" fontSize="16" fill="#222" fontWeight="600">
          {letter}
        </text>
      )}
    </svg>
  );
}
function WideTriangle({ color, letter }) {
  return (
    <svg viewBox="0 0 72 72" className="shape">
      <polygon
        points="36,8 68,64 4,64"
        fill={color} stroke="white" strokeWidth={2.5} strokeLinejoin="round"
      />
      {SHOW_ROW_LETTER_OVERLAY && letter && (
        <text x={36} y={48} textAnchor="middle" fontSize="16" fill="#222" fontWeight="600">
          {letter}
        </text>
      )}
    </svg>
  );
}

const SHAPES = { A: Ring, B: Hexagon, C: NotchedSquare, D: Shield, E: WideTriangle };

const Icon = ({ id }) => {
  const { rowKey, colorIndex } = parseItem(id);
  const Shape = SHAPES[rowKey];
  return <Shape color={COLOR_ORDER[colorIndex]} letter={SHOW_ROW_LETTER_OVERLAY ? rowKey : undefined} />;
};

// ─────────────────────────────────────────────────────────
// 2. GridCell + dynamic candidate layout
const GameCell = ({ rowIndex, colIndex, candidates, solved, onActivate }) => {
  const count = candidates.size;
  const cols  = count > 4 ? 3 : 2;
  const rows  = Math.ceil(count / cols);

  return (
    <button
      className="cell"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      onClick={e => { e.stopPropagation(); onActivate(e.currentTarget); }}
      onKeyDown={e => {
        if (e.key==='Enter' || e.key===' ') {
          e.preventDefault();
          onActivate(e.currentTarget);
        }
      }}
      aria-label={`Cell ${rowIndex+1}-${colIndex+1}`}
    >
      {solved
        ? <div className="cell-solved"><Icon id={solved}/></div>
        : <div
            className="cell-candidates"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows:    `repeat(${rows}, 1fr)`,
              gap: 4,
              width: '100%',
              height: '100%',
              padding: 4
            }}
          >
            {Array.from(candidates).map(id => (
              <div key={id} className="candidate"><Icon id={id}/></div>
            ))}
          </div>
      }
    </button>
  );
};

// ─────────────────────────────────────────────────────────
// 3. Expanded Panel & Warning Pill
const WarningPill = ({ anchorRect }) => {
  const style = {
    position: 'fixed',
    left: anchorRect ? anchorRect.left + anchorRect.width/2 - 110 : '50%',
    top: anchorRect ? Math.max(10, anchorRect.top - 48) : '20%',
    transform: anchorRect ? undefined : 'translate(-50%,0)',
    zIndex: Z_EXPANDED + 2,
    background: '#FF6F61',
    color: 'white',
    fontWeight: 700,
    borderRadius: 22,
    padding: '12px 24px',
    fontSize: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
    pointerEvents: 'none'
  };
  return (
    <div style={style}>
      I wouldn't do that if I were you...
    </div>
  );
};

const ExpandedPanel = ({
  row, col, candidates, onToggle, anchorRect, showWarn
}) => {
  const items = Array.from(candidates);
  const cols  = items.length > 4 ? 3 : 2;
  return (
    <div className="expanded-panel" style={{
      position: 'fixed',
      width:     EXPANDED_PANEL_SIZE,
      height:    EXPANDED_PANEL_SIZE,
      zIndex:    Z_EXPANDED,
      left:      anchorRect
        ? Math.min(
            Math.max(8, anchorRect.left + anchorRect.width/2 - EXPANDED_PANEL_SIZE/2),
            window.innerWidth - EXPANDED_PANEL_SIZE - 8
          )
        : '50%',
      top:       anchorRect
        ? Math.min(
            Math.max(8, anchorRect.top  + anchorRect.height/2 - EXPANDED_PANEL_SIZE/2),
            window.innerHeight - EXPANDED_PANEL_SIZE - 8
          )
        : '50%',
      transform: anchorRect ? undefined : 'translate(-50%,-50%)'
    }} role="dialog">
      {showWarn && <WarningPill anchorRect={anchorRect}/>}
      <div
        className="expanded-grid"
        style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}
      >
        {items.map(id => (
          <button
            key={id}
            className="expanded-option"
            onClick={() => onToggle(row, col, id)}
          >
            <Icon id={id}/>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 4. Clues & App
// ClueVisual.jsx (drop-in, full component)
const verticalTypes = ['SCP','SCT','DC','TTO'];

function ThreeDotDivider() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 36,
      minHeight: 32,
      gap: 4
    }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          display: "inline-block",
          width: 7, height: 7,
          borderRadius: "50%",
          background: "#86847eff"
        }}/>
      ))}
    </div>
  );
}

function RedStrike() {
  return (
    <svg width={36} height={36} style={{
      position: 'absolute', left: 0, top: 0, pointerEvents: 'none'
    }}>
      <line x1={6} y1={30} x2={30} y2={6} stroke="#ff1500ff" strokeWidth={4} />
    </svg>
  );
}

// Red divider: for vertical clues only
function RedDividerHorizontal({ yPct = 50 }) {
  return (
    <div style={{
      position: 'absolute',
      left: '0%', right: '0%',
      top: `${yPct}%`,
      height: 3.5,
      background: '#ff1500ff',
      borderRadius: 2,
      zIndex: 2,
      transform: 'translateY(-50%)',
    }} />
  );
}

// DC: two icons with a horizontal red line between
function DCVerticalClue({ items }) {
  return (
    <div style={{
      position: 'relative',
      width: 42, height: 80,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div className="clue-icon"><Icon id={items[0]} /></div>
      <div className="clue-icon"><Icon id={items[1]} /></div>
      <RedDividerHorizontal yPct={50} />
    </div>
  );
}

// TTO: three icons, with a red line between 2nd and 3rd
function TTOVerticalClue({ items }) {
  return (
    <div style={{
      position: 'relative',
      width: 40, height: 120,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div className="clue-icon"><Icon id={items[0]} /></div>
      <div className="clue-icon"><Icon id={items[1]} /></div>
      <div className="clue-icon"><Icon id={items[2]} /></div>
      <RedDividerHorizontal yPct={68} />
    </div>
  );
}

// MAIN CLUE VISUAL COMPONENT
const ClueVisual = ({ type_id, items }) => {
  // "LO" (Left Of): 2 shapes, 3-dot divider in the center
  if (type_id === "LO" && items.length === 2) {
    return (
      <div className="clue-line" style={{ minWidth: 95 }}>
        <div className="clue-icon"><Icon id={items[0]} /></div>
        <ThreeDotDivider />
        <div className="clue-icon"><Icon id={items[1]} /></div>
      </div>
    );
  }

  // "TTO": two together, one apart (vertical, with red line)
  if (type_id === "TTO" && items.length === 3) {
    return <TTOVerticalClue items={items} />;
  }

  // "DC": different columns, vertical, two shapes, red line between
  if (type_id === "DC" && items.length === 2) {
    return <DCVerticalClue items={items} />;
  }

  // "GT": gap trio, horizontal, middle one is "not"
  if (type_id === "GT" && items.length === 3) {
    return (
      <div className="clue-line">
        <div className="clue-icon"><Icon id={items[0]} /></div>
        <div className="clue-icon" style={{ position: 'relative' }}>
          <Icon id={items[1]} />
          <RedStrike />
        </div>
        <div className="clue-icon"><Icon id={items[2]} /></div>
      </div>
    );
  }

  // Default: just render shapes in row or column
  const isV = verticalTypes.includes(type_id);
  return (
    <div className={isV ? 'clue-line-vertical' : 'clue-line'}>
      {items.map(id => (
        <div key={id} className="clue-icon"><Icon id={id} /></div>
      ))}
    </div>
  );
};




function formatTimer(ms) {
  // Returns MM:SS
  const total = Math.floor(ms/1000);
  const m = Math.floor(total/60).toString().padStart(2,'0');
  const s = (total%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

export default function App() {
  const puzzle = puzzleData;
  const [tab, setTab] = useState('horizontal');
  const [cellCandidates, setCellCandidates] = useState({});
  const [activeCell, setActiveCell] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [showWarn, setShowWarn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const timerRef = useRef(null);
  const lastBtn  = useRef(null);

  const horizontalClues = puzzle.clues.filter(c => !verticalTypes.includes(c.type_id));
  const verticalClues   = puzzle.clues.filter(c =>  verticalTypes.includes(c.type_id));
  const activeClues     = tab === 'horizontal' ? horizontalClues : verticalClues;

  // ─ Load/init candidates ─
  useEffect(() => {
    const key = 'puzzle_progress:' + puzzle.signature;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const loaded = {};
      for (let k in parsed) loaded[k] = new Set(parsed[k]);
      setCellCandidates(loaded);
    } else {
      const init = {};
      for (let r=0; r<5; r++){
        const row = 'ABCDE'[r], all=[1,2,3,4,5].map(n=>`${row}${n}`);
        for (let c=0; c<5; c++) init[`${r}-${c}`] = new Set(all);
      }
      setCellCandidates(init);
    }
  }, [puzzle.signature]);

  // ─ Timer ─
  useEffect(() => {
    if (isSolved) return; // pause timer
    timerRef.current = setInterval(() => {
      setTimer(t => t+1000);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isSolved]);

  // ─ Recompute solved state, pause timer if so ─
  useEffect(() => {
    const solved = Object.values(cellCandidates).every(s=>s.size===1);
    setIsSolved(solved);
  }, [cellCandidates]);

  // ─ Auto‑save ─
  useEffect(() => {
    if (!Object.keys(cellCandidates).length) return;
    localStorage.setItem(
      'puzzle_progress:' + puzzle.signature,
      JSON.stringify(
        Object.fromEntries(
          Object.entries(cellCandidates).map(([k,s])=>[k,Array.from(s)])
        )
      )
    );
  }, [cellCandidates, puzzle.signature]);

  // ─ Toggle & propagate ─
  const toggleCandidate = useCallback((r, c, id) => {
    const solutionId = puzzle.grid[r][c];
    setCellCandidates(prev => {
      const key = `${r}-${c}`;
      const clone = {...prev};
      const st = new Set(clone[key]);

      if (st.has(id)) {
        if (id === solutionId) {
          setShowWarn(true);
          setTimeout(() => setShowWarn(false), 1700);
          return prev;
        }
        if (st.size === 1) return prev; // Can't remove last
        st.delete(id);
      } else {
        st.add(id);
      }
      clone[key] = st;

      // If reduced to just the correct shape, auto close expanded panel
      if (st.size === 1 && st.has(solutionId) && activeCell && activeCell.r === r && activeCell.c === c) {
        setTimeout(() => setActiveCell(null), 150);
      }

      if (st.size===1) {
        const val = [...st][0];
        for (let col=0; col<5; col++) {
          if (col === c) continue;
          const o = new Set(clone[`${r}-${col}`]);
          if (o.delete(val)) clone[`${r}-${col}`] = o;
        }
      }
      return clone;
    });
  }, [puzzle.grid, activeCell]);

  // ─ Open/close panel ─
  const openCell = (r, c, btn) => {
    const candidates = cellCandidates[`${r}-${c}`];
    const solutionId = puzzle.grid[r][c];
    if (candidates && candidates.size === 1 && candidates.has(solutionId)) {
      return;
    }
    setActiveCell({ r, c });
    setAnchorRect(btn.getBoundingClientRect());
    lastBtn.current = btn;
  };
  const closeCell = () => {
    setActiveCell(null);
    setAnchorRect(null);
    lastBtn.current?.focus();
  };
  useEffect(() => {
    const onEsc = e => e.key === 'Escape' && closeCell();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div className="app-root">
      <div className="app-shell">
        <main className="main-area">
          <div className="puzzle-container">
            {/* Top toolbar */}
            <div className="puzzle-toolbar">
              <span className="puzzle-label puzzle-label-main"> Daily Sherluuk Huzz</span>
              <div className="meta-pills">
                <span className="pill">{puzzle.date}</span>
                <span className="pill">{puzzle.difficulty}</span>
                <span className="pill">{formatTimer(timer)}</span>
              </div>
            </div>
            {/* Grid */}
            <section className="grid-wrapper" style={{zIndex:Z_GRID}}>
              <div className="grid-board" style={{ gridTemplateColumns:`repeat(5,${CELL_SIZE}px)` }}>
                {Array.from({length:5}).flatMap((_,r)=>
                  Array.from({length:5}).map((_,c)=> {
                    const key = `${r}-${c}`;
                    const cand = cellCandidates[key]||new Set();
                    const sol  = cand.size===1 ? [...cand][0] : null;
                    return (
                      <GameCell
                        key={key}
                        rowIndex={r}
                        colIndex={c}
                        candidates={cand}
                        solved={sol}
                        onActivate={btn=>openCell(r,c,btn)}
                      />
                    );
                  })
                )}
              </div>
              {activeCell && (
                <>
                  <div className="backdrop" style={{zIndex:Z_BACKDROP}} onClick={closeCell}/>
                  <ExpandedPanel
                    row={activeCell.r}
                    col={activeCell.c}
                    candidates={cellCandidates[`${activeCell.r}-${activeCell.c}`]}
                    onToggle={toggleCandidate}
                    anchorRect={anchorRect}
                    showWarn={showWarn}
                  />
                </>
              )}
            </section>
            {/* Bottom toolbar */}
            <div className="puzzle-toolbar">
              <span className="puzzle-label clues-label">Clues:</span>
              <div className="tab-pills">
                <button
                  className={`pill ${tab==='horizontal'?'active':''}`}
                  onClick={()=>setTab('horizontal')}
                >Row</button>
                <button
                  className={`pill ${tab==='vertical'?'active':''}`}
                  onClick={()=>setTab('vertical')}
                >Column</button>
              </div>
            </div>
            {/* Clues */}
            <div className={`clue-strip ${tab}`}>
              {activeClues.slice(0,9).map((clue,i)=>(
                <div key={i} className="clue-card">
                  <ClueVisual type_id={clue.type_id} items={clue.items}/>
                </div>
              ))}
            </div>
          </div>
          {/* Footer */}
          <footer className="footer">Hash: {puzzle.signature}</footer>
        </main>
      </div>
      {/* Solve modal */}
    {isSolved && (
      <div className="solve-modal" style={{zIndex:Z_MODAL}}>
        <div className="solve-modal-inner">
          <h2 className="solve-title">Puzzle Solved!</h2>
          <div className="solve-modal-stats">
            <div className="solve-modal-stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTimer(timer)}</span>
            </div>
            <div className="solve-modal-stat">
              <span className="stat-label">Difficulty:</span>
              <span className="stat-value">{puzzle.difficulty}</span>
            </div>
            <div className="solve-modal-stat">
              <span className="stat-label">Puzzle:</span>
              <span className="stat-value">{puzzle.date}</span>
            </div>
          </div>
          <button className="btn-primary" style={{marginTop: 18}}
            onClick={() => {
              localStorage.removeItem('puzzle_progress:' + puzzle.signature);
              setCellCandidates({});
              setActiveCell(null);
              setAnchorRect(null);
              setTimer(0);
              setIsSolved(false);
              window.location.reload();
            }}
          >
            Restart Puzzle
          </button>
        </div>
      </div>
    )}

    </div>
  );
}
