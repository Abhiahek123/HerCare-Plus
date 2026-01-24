"use client";

import { useEffect, useState } from 'react';
import { Sparkles, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LotusIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
    <path d="M50 85C50 85 85 65 85 40C85 15 50 10 50 10C50 10 15 15 15 40C15 65 50 85 50 85Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
    <path d="M50 85C50 85 70 75 75 55C80 35 65 25 50 25C35 25 20 35 25 55C30 75 50 85 50 85Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
    <circle cx="50" cy="45" r="5" fill="currentColor"/>
    <path d="M35 75C25 70 20 60 20 50M65 75C75 70 80 60 80 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Show after 5 seconds to let the user settle in
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const installApp = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed the PWA');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };
  
  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[60]"
            onClick={() => setShowPrompt(false)}
          />
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-28 left-6 right-6 z-[70] max-w-[400px] mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_20px_50px_rgba(255,143,171,0.2)] border border-white relative overflow-hidden">
              {/* Decorative sparkle */}
              <div className="absolute top-2 right-6">
                <Sparkles size={16} className="text-pink-300 animate-pulse" />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-pink-50 rounded-full">
                  <LotusIcon />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 font-nunito">
                  Let’s keep HerCare⁺ close 💜
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Install HerCare⁺ as an app for a purely private, faster, and offline-ready experience. 
                  <span className="block mt-1 font-semibold text-pink-500">100% Secure & On-Device</span>
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={installApp}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <Heart size={18} fill="currentColor" />
                    Add to my phone
                  </button>
                  
                  <button 
                    onClick={() => setShowPrompt(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
                  >
                    Maybe later, friend
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
