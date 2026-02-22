
import React, { useState } from 'react';
import type { QuizBlock as QuizBlockType } from '../types';

interface QuizBlockProps {
  block: QuizBlockType;
}

const QuizBlock: React.FC<QuizBlockProps> = ({ block }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-brand-primary hover:bg-brand-primary/80';
    }
    if (index === block.correctAnswerIndex) {
      return 'bg-green-500/80 ring-2 ring-green-400';
    }
    if (index === selectedOption) {
      return 'bg-red-500/80';
    }
    return 'bg-brand-primary opacity-60';
  };

  return (
    <div className="bg-brand-secondary p-4 my-4 rounded-lg border-l-4 border-purple-400">
      <p className="font-semibold text-purple-300 mb-2">🧠 Chalo, Dimaag Lagayein!</p>
      <p className="text-brand-text mb-4">{block.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {block.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`p-3 rounded-md text-left transition-all duration-200 ${getButtonClass(index)}`}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div className={`mt-4 p-3 rounded-md ${selectedOption === block.correctAnswerIndex ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <p className={`font-bold ${selectedOption === block.correctAnswerIndex ? 'text-green-300' : 'text-red-300'}`}>
            {selectedOption === block.correctAnswerIndex ? 'Bilkul Sahi!' : 'Thoda Galat Ho Gaya'}
          </p>
          <p className="text-brand-text-secondary text-sm mt-1">{block.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizBlock;
