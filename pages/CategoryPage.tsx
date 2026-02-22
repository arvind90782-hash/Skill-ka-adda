
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SKILLS } from '../constants';
import type { GeneratedContent, ContentBlock, SubPage, QuizBlock as QuizBlockType, AiChallengeBlock as AiChallengeBlockType, PollBlock as PollBlockType, QAndABlock as QAndABlockType, ExpertSaysBlock as ExpertSaysBlockType, MythBusterBlock as MythBusterBlockType, DoAndDontBlock as DoAndDontBlockType, ShockingFactBlock as ShockingFactBlockType, IdeaCornerBlock as IdeaCornerBlockType } from '../types';
import { generateSkillContent, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import CopyButton from '../components/CopyButton';
import QuizBlock from '../components/QuizBlock';
import AiChallengeBlock from '../components/AiChallengeBlock';
import PollBlock from '../components/PollBlock';
import QAndABlock from '../components/QAndABlock';
import ExpertSaysBlock from '../components/ExpertSaysBlock';
import MythBusterBlock from '../components/MythBusterBlock';
import DoAndDontBlock from '../components/DoAndDontBlock';
import ShockingFactBlock from '../components/ShockingFactBlock';
import IdeaCornerBlock from '../components/IdeaCornerBlock';
import { AudioIcon } from '../components/icons/AudioIcon';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<{ context: AudioContext; source: AudioBufferSourceNode } | null>(null);
  const [playingBlock, setPlayingBlock] = useState<string | null>(null);

  const skill = useMemo(() => SKILLS.find(s => s.id === categoryId), [categoryId]);

  const fetchContent = useCallback(async () => {
    if (!skill) {
        setError("Invalid skill category.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const generatedData = await generateSkillContent(skill.name);
      if (generatedData) {
        setContent(generatedData);
      } else {
        throw new Error("Content generate nahi ho paaya. AI guru shayad busy hain.");
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  useEffect(() => {
    fetchContent();
    setCurrentPage(0); // Reset to first page on new category
  }, [fetchContent]);

  const handleNext = () => {
    if (content && currentPage < content.subPages.length - 1) {
      setCurrentPage(currentPage + 1);
      stopAudio();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      stopAudio();
    }
  };
  
  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.source.stop();
      audioPlayer.context.close();
      setAudioPlayer(null);
      setPlayingBlock(null);
    }
  };

  const handlePlayAudio = async (text: string, blockId: string) => {
    if (playingBlock === blockId) {
        stopAudio();
        return;
    }
    
    stopAudio();
    setPlayingBlock('loading-' + blockId);

    try {
        const base64Audio = await generateSpeech(text);
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
        setPlayingBlock(blockId);
        setAudioPlayer({ context: outputAudioContext, source });
        source.onended = () => {
            setPlayingBlock(null);
            setAudioPlayer(null);
        };
    } catch (e) {
        console.error("Audio playback error:", e);
        setPlayingBlock(null);
    }
  };

  if (!skill) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400">Skill nahi mili!</h2>
            <Link to="/" className="text-brand-accent hover:underline mt-4 inline-block">Home par wapas jaayein</Link>
        </div>
    );
  }

  if (loading) {
    return <Loading message={`Aapka ${skill.name} course ban raha hai...`} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchContent} />;
  }
  
  if (!content || !content.subPages || content.subPages.length === 0) {
    return <ErrorMessage message="Iss skill ke liye koi content nahi mila." onRetry={fetchContent} />;
  }
  
  const currentSubPage: SubPage = content.subPages[currentPage];
  const progressPercentage = ((currentPage + 1) / content.subPages.length) * 100;

  const renderContentBlock = (block: ContentBlock, index: number) => {
    const blockId = `${currentPage}-${index}`;
    const isPlaying = playingBlock === blockId;
    const isLoadingAudio = playingBlock === 'loading-' + blockId;

    const renderTextWithAudio = (text: string, className: string, blockType: string) => (
        <div className="relative group">
             <p className={className}>{text}</p>
             <button onClick={() => handlePlayAudio(text, blockId)} className="absolute -top-2 -right-2 p-1.5 bg-brand-primary/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                {isLoadingAudio ? <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div> : <AudioIcon className={`w-5 h-5 ${isPlaying ? 'text-brand-accent animate-pulse' : 'text-brand-text-secondary'}`} />}
             </button>
        </div>
    );

    switch (block.type) {
      case 'heading':
        return <div key={index} className="relative group"><h2 className="text-2xl font-bold text-brand-text mt-6 mb-3">{block.text}</h2><button onClick={() => handlePlayAudio(block.text, blockId)} className="absolute top-0 right-0 p-1.5 bg-brand-primary/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">{isLoadingAudio ? <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div> : <AudioIcon className={`w-5 h-5 ${isPlaying ? 'text-brand-accent animate-pulse' : 'text-brand-text-secondary'}`} />}</button></div>;
      case 'paragraph':
        return <div key={index}>{renderTextWithAudio(block.text, "text-brand-text-secondary leading-relaxed mb-4", block.type)}</div>;
      case 'tip':
        return (
          <div key={index} className="relative group bg-brand-secondary p-4 rounded-lg border-l-4 border-amber-400 my-4">
            <p className="font-semibold text-amber-300 mb-1">💡 Expert Salah</p>
            {renderTextWithAudio(block.text, "text-brand-text-secondary", block.type)}
          </div>
        );
      case 'template':
        return (
          <div key={index} className="relative bg-brand-primary p-4 rounded-lg my-4 border border-brand-secondary">
            <p className="font-semibold text-cyan-300 mb-2">📋 Template</p>
            <pre className="text-sm text-brand-text whitespace-pre-wrap font-mono">{block.text}</pre>
            <CopyButton textToCopy={block.text} />
          </div>
        );
      case 'benefits':
        return (
          <div key={index} className="relative group bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-lg border-l-4 border-emerald-400 my-4">
              <p className="font-semibold text-emerald-300 mb-1">🚀 Aapka Inaam</p>
              {renderTextWithAudio(block.text, "text-brand-text-secondary", block.type)}
          </div>
        );
      case 'infographic':
        return (
          <div key={index} className="relative group bg-sky-500/10 p-4 rounded-lg border-l-4 border-sky-400 my-4">
              <p className="font-semibold text-sky-300 mb-1">📊 Infographic Idea</p>
              {renderTextWithAudio(block.text, "text-brand-text-secondary italic", block.type)}
          </div>
        );
      case 'funFact':
        return (
          <div key={index} className="relative group bg-rose-500/10 p-4 rounded-lg border-l-4 border-rose-400 my-4">
              <p className="font-semibold text-rose-300 mb-1">🤯 Kya Aap Jaante Hain?</p>
              {renderTextWithAudio(block.text, "text-brand-text-secondary", block.type)}
          </div>
        );
      case 'quiz':
          return <QuizBlock key={index} block={block as QuizBlockType} />;
      case 'aiChallenge':
          return <AiChallengeBlock key={index} block={block as AiChallengeBlockType} />;
      case 'poll':
          return <PollBlock key={index} block={block as PollBlockType} />;
      case 'qAndA':
          return <QAndABlock key={index} block={block as QAndABlockType} />;
      case 'expertSays':
          return <ExpertSaysBlock key={index} block={block as ExpertSaysBlockType} />;
      case 'mythBuster':
          return <MythBusterBlock key={index} block={block as MythBusterBlockType} />;
      case 'doAndDont':
          return <DoAndDontBlock key={index} block={block as DoAndDontBlockType} />;
      case 'shockingFact':
          return <ShockingFactBlock key={index} block={block as ShockingFactBlockType} />;
      case 'ideaCorner':
          return <IdeaCornerBlock key={index} block={block as IdeaCornerBlockType} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl animate-fadeIn">
        <Link to="/" className="text-brand-accent hover:underline mb-4 inline-block">&larr; Sabhi skills par wapas</Link>
      <div className="bg-brand-secondary rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
            <div className="w-full bg-brand-primary rounded-full h-2.5 mb-6">
                <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>

            <div key={currentPage} className="animate-fadeIn">
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-2">{currentSubPage.title}</h1>
                <p className="text-brand-text-secondary text-sm mb-4 italic">Motion ka idea: {currentSubPage.motionStoryboard}</p>
                <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(currentSubPage.imageSuggestion)}/800/400`} 
                    alt={currentSubPage.imageSuggestion}
                    className="w-full h-48 object-cover rounded-lg mb-6"
                />

                {currentSubPage.content.map(renderContentBlock)}
            </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 0}
          className="px-6 py-3 bg-brand-secondary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-secondary/80 transition-colors"
        >
          Pichla
        </button>
        <span className="text-brand-text-secondary font-medium">Page {currentPage + 1} / {content.subPages.length}</span>
        <button 
          onClick={handleNext} 
          disabled={currentPage === content.subPages.length - 1}
          className="px-6 py-3 bg-brand-accent rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent-light transition-colors"
        >
          Agla
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
