
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileToBase64';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ImageAnalyzerPage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Is photo mein kya-kya hai? विस्तार से बताओ।');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult('');
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !prompt) {
      setError('Pehle ek photo upload karein aur sawal likhein.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const imageBase64 = await fileToBase64(imageFile);
      const analysisResult = await analyzeImage(prompt, imageBase64, imageFile.type);
      setResult(analysisResult);
    } catch (e: any) {
      setError(e.message || 'Analysis karte waqt kuch gadbad ho gayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl animate-fadeIn">
      <Link to="/" className="text-brand-accent hover:underline mb-4 inline-block">&larr; Sabhi tools par wapas</Link>
      <div className="bg-brand-secondary rounded-2xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text">Chitra Reporter</h1>
          <p className="text-brand-text-secondary mt-2">Photo upload karein aur AI se uske raaz jaanein.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-brand-text-secondary mb-2">Photo Upload Karein</label>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              className="block w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-white hover:file:bg-brand-accent-light"
            />
          </div>

          {imagePreview && (
            <div className="flex justify-center">
              <img src={imagePreview} alt="Uploaded preview" className="rounded-lg max-h-64 object-contain" />
            </div>
          )}

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-brand-text-secondary mb-2">Aapka Sawal</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Jaise: Is design ko aur behtar kaise banayein?"
              className="w-full bg-brand-primary border border-brand-secondary rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-accent outline-none transition"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !imageFile}
            className="w-full px-6 py-3 bg-brand-accent rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent-light transition-colors"
          >
            {loading ? 'Analysis ho raha hai...' : 'Analyze Karein'}
          </button>
        </div>
      </div>
      
      {loading && <Loading message="AI aapki photo ko samajh raha hai..." />}
      {error && <ErrorMessage message={error} onRetry={handleSubmit} />}
      {result && (
        <div className="mt-6 bg-brand-secondary rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">Analysis Ka Natija</h2>
          <p className="text-brand-text-secondary whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzerPage;
