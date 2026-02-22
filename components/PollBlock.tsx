
import React, { useState } from 'react';
import type { PollBlock as PollBlockType } from '../types';

interface PollBlockProps {
  block: PollBlockType;
}

const PollBlock: React.FC<PollBlockProps> = ({ block }) => {
  const [voted, setVoted] = useState(false);
  // Simulate some initial random percentages for visual effect
  const [percentages] = useState(() => {
    let remaining = 100;
    const results = [];
    for (let i = 0; i < block.options.length - 1; i++) {
      const vote = Math.floor(Math.random() * (remaining / 2));
      results.push(vote);
      remaining -= vote;
    }
    results.push(remaining);
    return results.sort((a, b) => b - a); // Sort for visual appeal
  });

  return (
    <div className="bg-brand-secondary p-4 my-4 rounded-lg border-l-4 border-cyan-400">
      <p className="font-semibold text-cyan-300 mb-2">📊 Aapki Kya Raay Hai?</p>
      <p className="text-brand-text mb-4">{block.question}</p>
      <div className="space-y-2">
        {block.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setVoted(true)}
            disabled={voted}
            className="w-full text-left p-2 rounded-md bg-brand-primary transition-all duration-300 group overflow-hidden relative"
          >
            <div 
                className="absolute top-0 left-0 h-full bg-cyan-500/30 transition-all duration-500 ease-out"
                style={{ width: voted ? `${percentages[index]}%` : '0%' }}
            />
            <div className="relative flex justify-between">
                <span>{option}</span>
                {voted && <span className="font-bold">{percentages[index]}%</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PollBlock;
