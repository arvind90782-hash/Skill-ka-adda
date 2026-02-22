
import React from 'react';
import { Link } from 'react-router-dom';
import type { CardItem } from '../types';

interface CardProps {
  item: CardItem;
}

const Card: React.FC<CardProps> = ({ item }) => {
  const Icon = item.icon;
  return (
    <Link 
      to={item.path} 
      className={`
        group relative flex flex-col h-full p-6 rounded-2xl bg-brand-secondary 
        overflow-hidden transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-2xl hover:shadow-brand-accent/30
      `}
    >
      <div 
        className={`absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-gradient-to-r ${item.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
      />
      <div className="relative z-10 flex flex-col flex-grow">
        <div className={`mb-4 inline-block p-3 rounded-lg bg-gradient-to-br ${item.color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-brand-text">{item.name}</h3>
        <p className="mt-1 text-brand-text-secondary flex-grow">{item.description}</p>
      </div>
    </Link>
  );
};

export default Card;
