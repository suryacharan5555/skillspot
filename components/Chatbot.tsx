import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { NGOS } from '../constants';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// Icons
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


// Simplified data for the prompt to reduce token count
const simplifiedNgos = NGOS.map(ngo => ({
  id: ngo.id,
  name: ngo.name,
  description: ngo.description,
  location: ngo.location,
  type: ngo.type,
  courses: ngo.courses.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    seatsAvailable: c.seatsAvailable,
  }))
}));

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello! I'm your SkillSpot assistant. How can I help you find the perfect course today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const aiClientRef = useRef<any>(null);
    const initAttempted = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initializeChatbot = () => {
        if (initAttempted.current || aiClientRef.current) return;
        initAttempted.current = true;

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("Gemini API Key is missing.");
            setMessages(prev => [...prev, { sender: 'ai', text: "Configuration error: The AI assistant cannot be initialized." }]);
            return;
        }

        try {
            aiClientRef.current = new GoogleGenAI({ apiKey });
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI client", e);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, the AI assistant could not be initialized." }]);
        }
    };
    
    const handleToggleOpen = () => {
        if (!isOpen && !initAttempted.current) {
            initializeChatbot();
        }
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);
    
    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;

        if (!aiClientRef.current) {
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, the AI assistant is not ready. Please try again in a moment." }]);
            return;
        }

        const userMessage: ChatMessage = { sender: 'user', text: userInput };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const isFirstUserMessage = newMessages.filter(m => m.sender === 'user').length === 1;

            const conversationHistory = newMessages
                .filter(msg => msg.text !== "Hello! I'm your SkillSpot assistant. How can I help you find the perfect course today?")
                .map(msg => {
                    let text = msg.text;
                    if (msg.sender === 'user' && isFirstUserMessage) {
                        const systemInstruction = `You are a friendly and helpful AI assistant for SkillSpot 2.0. Your goal is to help users find suitable skill development courses from various NGOs. You should be encouraging and provide clear, concise information. Based on the user's query and the NGO data provided, recommend the most relevant options. Provide the NGO name and course name in your recommendation. If a course is full (seatsAvailable: 0), mention that the user can join a waitlist. If the user asks a general question, answer it politely. Do not make up information not present in the provided context.`;
                        const dataContext = `Here is the data for the available NGOs and courses on SkillSpot 2.0:\n${JSON.stringify(simplifiedNgos, null, 2)}`;
                        text = `${systemInstruction}\n\n${dataContext}\n\nMy question is: "${msg.text}"`;
                    }
                    return {
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: text }],
                    };
                });

            const response = await aiClientRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: conversationHistory,
            });

            const aiResponse = response.text;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={handleToggleOpen}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            <div className={`fixed bottom-24 right-6 w-80 md:w-96 h-[450px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <header className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="font-bold text-lg">AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} aria-label="Close Chatbot">
                        <CloseIcon />
                    </button>
                </header>
                <main className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>
                <footer className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about courses..."
                            className="w-full px-4 py-2 border rounded-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors">
                            <SendIcon />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Chatbot;