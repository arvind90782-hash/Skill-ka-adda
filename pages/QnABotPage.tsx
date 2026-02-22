
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface GroundingSource {
    uri: string;
    title: string;
}
interface Message {
    sender: 'user' | 'bot';
    text: string;
    sources?: GroundingSource[];
}

const QnABotPage: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const API_KEY = process.env.API_KEY;
            if (!API_KEY) {
                throw new Error("API_KEY environment variable not set.");
            }
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const chatSession = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: 'You are AI Dost, a friendly and helpful AI assistant for students learning freelancer skills. Your answers should be encouraging, clear, and in Hinglish. You have access to Google Search, so use it for recent or specific topics.',
                    tools: [{ googleSearch: {} }]
                },
            });
            setChat(chatSession);
            setMessages([{ sender: 'bot', text: 'Namaste! Main hoon AI Dost, ab Google Search ki shakti ke saath. Aapka koi bhi sawal ho, yahan pooch sakte hain.' }]);
        } catch (e: any) {
            setError(e.message || "Chat shuru karne mein dikkat aa rahi hai.");
        }
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat container when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const userMessage: Message = { sender: 'user', text: userInput };
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        setMessages(prev => [...prev, userMessage, { sender: 'bot', text: '' }]);

        try {
            const stream = await chat.sendMessageStream({ message: currentInput });
            
            for await (const chunk of stream) {
                const c = chunk as GenerateContentResponse;
                const chunkText = c.text;
                const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
                const sources: GroundingSource[] = groundingChunks
                    ?.map((gc: any) => gc.web)
                    .filter((web: any) => web && web.uri && web.title) || [];
                
                if (chunkText) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        lastMessage.text += chunkText;
                        if (sources.length > 0) {
                            lastMessage.sources = [...(lastMessage.sources || []), ...sources].filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i); // Add unique sources
                        }
                        return newMessages;
                    });
                }
            }

        } catch (e: any) {
            const errorMessage: Message = { sender: 'bot', text: "Sorry, kuch gadbad ho gayi. Thodi der baad try karein." };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace placeholder with error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl animate-fadeIn">
            <Link to="/" className="text-brand-accent hover:underline mb-4 inline-block">&larr; Sabhi tools par wapas</Link>
            <div className="bg-brand-secondary rounded-2xl shadow-lg flex flex-col h-[75vh]">
                <div className="p-4 border-b border-brand-primary text-center">
                    <h1 className="text-2xl font-bold text-brand-text">AI Dost</h1>
                    <p className="text-sm text-brand-text-secondary">Aapka personal AI helper (Google Search ke saath)</p>
                </div>
                
                {error && <div className="p-4 text-center text-red-400">{error}</div>}

                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col items-start ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 'bg-brand-primary text-brand-text rounded-bl-none'}`}>
                                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                {isLoading && msg.sender === 'bot' && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-brand-text animate-pulse ml-1"></span>}
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 text-xs w-full max-w-md">
                                    <p className="font-semibold text-brand-text-secondary mb-1">Sources:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, i) => (
                                            <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="bg-brand-primary px-2 py-1 rounded-md text-brand-accent hover:underline truncate">
                                                {new URL(source.uri).hostname}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-primary flex items-center">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Apna sawal yahan type karein..."
                        className="flex-grow bg-brand-primary border-none rounded-full py-2 px-4 text-brand-text focus:ring-2 focus:ring-brand-accent outline-none transition"
                        disabled={isLoading || !chat}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="ml-3 p-3 bg-brand-accent rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent-light transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QnABotPage;
