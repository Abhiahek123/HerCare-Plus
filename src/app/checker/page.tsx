"use client";

import BottomNav from "@/components/BottomNav";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Mic, Send, X, Heart, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr';

const LANGUAGES: Record<Language, { name: string; label: string; greeting: string }> = {
  en: { name: 'English', label: 'English', greeting: "What's been bothering you lately?" },
  hi: { name: 'Hindi', label: 'हिंदी', greeting: 'बताइए क्या तकलीफ है?' },
  ta: { name: 'Tamil', label: 'தமிழ்', greeting: 'என்ன பிரச்சனை?' },
  te: { name: 'Telugu', label: 'తెలుగు', greeting: 'ఏమి సమస్య?' },
  bn: { name: 'Bengali', label: 'বাংলা', greeting: 'কী समस्या?' },
  mr: { name: 'Marathi', label: 'मराठी', greeting: 'काय त्रास आहे?' },
};

const WARM_INITIAL_MESSAGES = [
  "You're safe here. Share only what you're comfortable with.",
  "I'm here with you. No judgment. No rush.",
  "This is your space. Take all the time you need.",
];

const SYMPTOM_SUGGESTIONS_YOUNG = [
  "💭 First period questions",
  "💭 Period pain",
  "💭 Changing body",
];

const SYMPTOM_SUGGESTIONS_ADULT = [
  "💭 Irregular periods",
  "💭 Pain or cramps",
  "💭 Pregnancy questions",
];

const SYMPTOM_SUGGESTIONS_MATURE = [
  "💭 Menopause symptoms",
  "💭 Heavy bleeding",
  "💭 Bone health",
];

type AnalysisResult = {
  conversation: string;
  show_doctor_choice: boolean;
  reasoning?: any;
};

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  analysis?: AnalysisResult;
};

export default function SymptomChecker() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("friend");
  const [age, setAge] = useState<string>("25");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isFindingDoctor, setIsFindingDoctor] = useState(false);
  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("hercare_nickname");
    const savedAge = localStorage.getItem("hercare_age");
    if (savedName) setNickname(savedName);
    if (savedAge) setAge(savedAge);

    // Initial message personalization
    const ageNum = savedAge ? parseInt(savedAge) : 25;
    let welcomeText = WARM_INITIAL_MESSAGES[Math.floor(Math.random() * WARM_INITIAL_MESSAGES.length)];
    
    if (ageNum < 18) {
      welcomeText = `Hey ${savedName || 'friend'} 🌸, you're safe here. I can help you understand what's happening with your body. What's on your mind?`;
    } else if (ageNum > 45) {
      welcomeText = `Hello ${savedName || 'there'} 🌸. Health at every stage is important. How can I support your wellbeing today?`;
    } else {
      welcomeText = `Hi ${savedName || 'friend'} 💜. This is your private space. Tell me what's been on your mind lately?`;
    }

    setMessages([{
      id: '1',
      sender: 'ai',
      text: welcomeText,
    }]);
  }, []);

  const getSuggestions = () => {
    const ageNum = parseInt(age);
    if (ageNum < 18) return SYMPTOM_SUGGESTIONS_YOUNG;
    if (ageNum > 45) return SYMPTOM_SUGGESTIONS_MATURE;
    return SYMPTOM_SUGGESTIONS_ADULT;
  };

  useEffect(() => {
    if (transcript) {
      setInputText((prev) => prev ? prev + " " + transcript : transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageToSend = typeof text === 'string' ? text : inputText;
    if (!messageToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: age,
          symptoms: userMsg.text,
          language: LANGUAGES[selectedLang].name,
          nickname
        })
      });

      if (!response.ok) throw new Error("AI Failed");

      const data: AnalysisResult = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        analysis: data
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I am having trouble connecting right now. But you are not alone - please try again in a moment, or reach out to a trusted doctor."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-white pt-16 pb-24">
      <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-pink-50 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Private Chat</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs text-green-600 font-medium">Listening with care</p>
          </div>
        </div>
        
        <select 
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value as Language)}
          className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 text-gray-700 text-sm rounded-full px-3 py-2 outline-none focus:border-pink-300 font-medium"
        >
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <option key={code} value={code}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.text ? (
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 border border-pink-50 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              ) : msg.analysis ? (
                <div className="max-w-[95%] w-full bg-white rounded-3xl rounded-bl-md border border-pink-100 shadow-md overflow-hidden">
                  <div className="p-6">
                    <p className="text-gray-800 text-sm leading-7 whitespace-pre-wrap">
                      <Heart size={16} className="inline mr-2 text-pink-500 mb-0.5" fill="currentColor" />
                      {msg.analysis.conversation}
                    </p>

                    {msg.analysis.show_doctor_choice && (
                      <div className="mt-6 pt-4 border-t border-gray-50 animate-fade-in">
                        <p className="text-xs text-center text-gray-500 mb-3">Would you like me to help you find a women's health doctor nearby?</p>
                        <div className="flex gap-3 justify-center">
                          <button 
                            onClick={() => setIsFindingDoctor(true)}
                            className="bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-pink-600 transition-all"
                          >
                            Yes, please
                          </button>
                          <button 
                            className="bg-gray-100 text-gray-600 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
                          >
                            Not right now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-pink-100 p-4 rounded-3xl rounded-bl-md flex items-center gap-3 shadow-sm">
               <Loader2 className="animate-spin text-pink-400" size={20} />
               <span className="text-sm text-gray-600">Reading your message...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showSuggestions && messages.length === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-2 flex flex-wrap gap-2 justify-center"
          >
            {getSuggestions().map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion.replace("💭 ", ""))}
                className="bg-white/80 backdrop-blur-sm border border-pink-100 text-pink-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-pink-50 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isFindingDoctor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFindingDoctor(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 shadow-2xl max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Find a doctor perfect for you</h3>
                <button onClick={() => setIsFindingDoctor(false)} className="p-2 bg-gray-50 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Are you looking for:</p>
              
              <div className="space-y-3">
                <Link href="/care?filter=women" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-xl">👩‍⚕️</div>
                    <div>
                      <h4 className="font-bold text-pink-900">Women's Health Specialist</h4>
                      <p className="text-xs text-pink-700">Gynecologists & OB-GYNs</p>
                    </div>
                  </div>
                </Link>

                <Link href="/care?filter=general" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-xl">🩺</div>
                    <div>
                      <h4 className="font-bold text-purple-900">General Doctor</h4>
                      <p className="text-xs text-purple-700">For fever, flu, general checkups</p>
                    </div>
                  </div>
                </Link>

                <Link href="/care?filter=free" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xl">🏥</div>
                    <div>
                      <h4 className="font-bold text-green-900">Free / Low-Cost Clinic</h4>
                      <p className="text-xs text-green-700">NGOs and government hospitals</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="p-4 bg-white border-t border-gray-50 pb-28">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-1 rounded-full shadow-md">
          <div className="flex items-center gap-2 bg-white p-2 rounded-full">
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none outline-none px-4 text-gray-700 placeholder-gray-400"
              placeholder={isListening ? "I am listening..." : LANGUAGES[selectedLang].greeting}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            
            <button 
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                  : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 hover:from-pink-200 hover:to-purple-200'
              }`}
            >
              {isListening ? <X size={20} /> : <Mic size={20} />}
            </button>

            <button 
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-full hover:from-pink-600 hover:to-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Everything you say here is private 🔒
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
