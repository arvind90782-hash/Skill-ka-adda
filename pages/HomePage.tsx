
import React from 'react';
import { SKILLS, TOOLS } from '../constants';
import Card from '../components/SkillCard';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto animate-fadeIn space-y-16">
      <div>
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
            Apna Potential Unlock Karein
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
            Freelancing ki duniya mein kadam rakhein. Ek skill chunein aur hum aapko har kadam par guide karenge.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILLS.map((skill, index) => (
            <div key={skill.id} className="animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
               <Card item={skill} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
            AI Magic Tools
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
            In AI tools se apni creativity aur productivity ko ek naya level dein.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, index) => (
            <div key={tool.id} className="animate-slideIn" style={{ animationDelay: `${(index + SKILLS.length) * 100}ms` }}>
               <Card item={tool} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
