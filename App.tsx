
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import Header from './components/Header';
import ImageAnalyzerPage from './pages/ImageAnalyzerPage';
import VideoAnalyzerPage from './pages/VideoAnalyzerPage';
import ImageAnimatorPage from './pages/ImageAnimatorPage';
import QnABotPage from './pages/QnABotPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import RocketWriterPage from './pages/RocketWriterPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-brand-primary font-sans text-brand-text">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/image-analyzer" element={<ImageAnalyzerPage />} />
            <Route path="/video-analyzer" element={<VideoAnalyzerPage />} />
            <Route path="/image-animator" element={<ImageAnimatorPage />} />
            <Route path="/qna-bot" element={<QnABotPage />} />
            <Route path="/image-generator" element={<ImageGeneratorPage />} />
            <Route path="/rocket-writer" element={<RocketWriterPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
