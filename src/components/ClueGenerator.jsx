// File: src/components/ClueGenerator.jsx
import React, { useEffect, useState } from 'react';
import puzzleData from '../assets/puzzles/puzzle_schema_example.json';

// MockIcon renders your colored circle + ID label
const colorMap = { A: '#FF6F61', B: '#FFB347', C: '#FFF176', D: '#66CDAA', E: '#6495ED' };
const MockIcon = ({ id }) => {
  const row = id[0];
  return (
    <div style={{
      width: 32,
      height: 32,
      background: colorMap[row],
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: '600',
      fontSize: '12px'
    }}>
      {id}
    </div>
  );
};

// These type_ids render vertically; all others render horizontally
const verticalTypes = ['SCP','SCT','DC','TTO'];

export default function ClueGenerator({ data }) {
  const [clues, setClues] = useState([]);

  useEffect(() => {
    const src = data?.clues || puzzleData.clues;
    setClues(src);
  }, [data]);

  return (
    <div className="clue-strip">
      {clues.map((clue, idx) => {
        const isVertical = verticalTypes.includes(clue.type_id);
        const lineClass = isVertical ? 'clue-line-vertical' : 'clue-line';
        return (
          <div key={idx} className="clue-card">
            <div className={lineClass}>
              {clue.items.map(id => (
                <div key={id} className="clue-icon">
                  <MockIcon id={id} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
