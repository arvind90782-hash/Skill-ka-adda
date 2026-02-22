
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-accent to-brand-accent-light text-transparent bg-clip-text">
            Skills Ka Adda
          </Link>
          <div className="text-sm font-medium text-brand-text-secondary">
            Aapka Freelance Safar Yahan Se Shuru
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
