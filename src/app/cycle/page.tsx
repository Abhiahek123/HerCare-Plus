"use client";

import BottomNav from "@/components/BottomNav";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  Droplets, 
  Heart, 
  AlertCircle, 
  Sparkles,
  Calendar as CalendarIcon,
  Info,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { storage } from "@/lib/storage";

type FlowType = "light" | "medium" | "heavy";
type CycleEntry = {
  date: string;
  flow: FlowType;
  symptoms: string[];
};

const SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Mood swings", 
  "Fatigue", "Tender breasts", "Acne", "Back pain"
];

const PHASE_COLORS = {
  Follicular: "from-blue-400 to-cyan-400",
  Ovulation: "from-purple-400 to-pink-400",
  Luteal: "from-orange-400 to-red-400",
  Menstrual: "from-rose-500 to-pink-600",
  Unknown: "from-gray-400 to-gray-500"
};

export default function CyclePage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowType | "">("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nickname, setNickname] = useState("friend");
  const [age, setAge] = useState<number | null>(null);
  
  // Load data from IndexedDB and LocalStorage
  useEffect(() => {
    storage.getCycleEntries().then((data) => setEntries(data || []));
    const savedName = localStorage.getItem("hercare_nickname");
    const savedAge = localStorage.getItem("hercare_age");
    if (savedName) setNickname(savedName);
    if (savedAge) setAge(parseInt(savedAge));
  }, []);

  const handleSaveLog = async () => {
    if (!selectedFlow) return;
    
    const newEntry: CycleEntry = {
      date: new Date().toISOString().split('T')[0],
      flow: selectedFlow,
      symptoms: selectedSymptoms
    };

    await storage.addCycleEntry(newEntry);
    const updated = await storage.getCycleEntries();
    setEntries(updated || []);
    setShowLogModal(false);
    setSelectedFlow("");
    setSelectedSymptoms([]);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Calculate predictions
  const stats = useMemo(() => {
    if (entries.length === 0) return { daysUntilPeriod: null, currentPhase: "Unknown", nextDate: null };
    
    const lastEntry = entries[entries.length - 1];
    const lastDate = new Date(lastEntry.date);
    const avgCycleLength = 28;
    
    const nextDate = new Date(lastDate.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = nextDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let phase = "Follicular";
    if (daysUntil <= 0) phase = "Menstrual";
    else if (daysUntil <= 7) phase = "Luteal";
    else if (daysUntil <= 14) phase = "Ovulation";
    
    return { 
      daysUntilPeriod: Math.max(0, daysUntil), 
      currentPhase: phase,
      nextDate: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }, [entries]);

  const { daysUntilPeriod, currentPhase, nextDate } = stats;

  // Calendar logic
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFE] pt-16 pb-24 font-nunito">
      {/* Header - Premium Glassmorphism */}
      <div className="px-6 py-8 relative overflow-hidden bg-gradient-to-br from-[#FFF5F7] to-[#F3F0FF] border-b border-white/50 shadow-sm">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-2 block">Personal Wellness</span>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
             {nickname !== "friend" ? `${nickname}'s Cycle` : "Your Cycle"}
          </h1>
          <div className="flex items-center gap-2 mt-3 bg-white/40 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-white/60">
            <Clock size={12} className="text-purple-500" />
            <p className="text-[10px] font-bold text-gray-500">
              {entries.length > 0 ? `Tracking for ${entries.length} days` : "Just started tracking"}
            </p>
          </div>
        </motion.div>
      </div>

      <main className="flex-1 p-6 space-y-8">
        {/* Simplified Status Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-purple-900/5 border border-white relative overflow-hidden"
        >
           <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${PHASE_COLORS[currentPhase as keyof typeof PHASE_COLORS]} opacity-5 rounded-bl-full`}></div>
           
           <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${PHASE_COLORS[currentPhase as keyof typeof PHASE_COLORS]}`}>
                  {currentPhase} Phase
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Prediction</p>
                <p className="text-sm font-bold text-gray-600">{nextDate || "Need data"}</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-gradient-to-br ${PHASE_COLORS[currentPhase as keyof typeof PHASE_COLORS]} shadow-lg shadow-pink-200/50`}>
                  <span className="text-3xl font-black text-white">
                    {daysUntilPeriod !== null ? daysUntilPeriod : "--"}
                  </span>
                </div>
                {/* Micro animation ring */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-[-8px] rounded-full border border-pink-100 opacity-50"
                ></motion.div>
              </div>
              <div>
                 <h2 className="text-xl font-black text-gray-800">Days to go</h2>
                 <p className="text-sm font-medium text-gray-500 leading-tight">until your next cycle begins</p>
              </div>
           </div>
        </motion.div>

        {/* Action Buttons - Easy for users */}
        <div className="grid grid-cols-2 gap-4">
           <button 
            onClick={() => setShowLogModal(true)}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-purple-900/5 flex flex-col items-center gap-3 transition-transform active:scale-95"
           >
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                <Plus size={24} />
              </div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Log Period</span>
           </button>
           <button 
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-purple-900/5 flex flex-col items-center gap-3 transition-transform active:scale-95"
           >
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Analytics</span>
           </button>
        </div>

        {/* Insight Card - Conversational Tone */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-purple-300 relative overflow-hidden"
        >
          <div className="absolute right-[-5%] top-[-10%] opacity-10">
            <Sparkles size={100} />
          </div>
          
          <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
               <Info size={20} />
             </div>
             <div>
                <h3 className="font-black text-sm uppercase tracking-widest mb-2 opacity-80">
                  {age && age < 18 ? "Teen Health Tip" : age && age > 45 ? "Perimenopause Insight" : "Daily Insight"}
                </h3>
                <p className="text-sm font-medium leading-relaxed">
                  {entries.length === 0 
                    ? age && age < 18 
                      ? "Tracking your cycle helps you understand your body as it changes. It's perfectly okay for it to be irregular right now! 🌸"
                      : "Logging your period helps predict your next cycle and understand your moods better. 💜"
                    : daysUntilPeriod && daysUntilPeriod < 7 
                    ? age && age < 18
                      ? "Your period is starting soon. Make sure you have your supplies ready for school! 🎒🌸"
                      : "Your period is approaching. Self-care time! Stock up on pads, dark chocolate, and cozy vibes. 🍫✨"
                    : "You're in your productive phase! Great time for big tasks and social activities. 🚀"}
                </p>
             </div>
          </div>
        </motion.div>

        {/* Calendar - Clean & Modern */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-purple-900/5 border border-gray-50">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-black text-gray-800">{monthName}</h3>
            <div className="flex gap-2">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const entry = entries.find(e => e.date === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div key={day} className="flex flex-col items-center justify-center h-12 relative group cursor-pointer">
                  <div 
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold transition-all
                      ${entry ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 scale-105' : ''}
                      ${isToday && !entry ? 'bg-purple-100 text-purple-600' : ''}
                      ${!entry && !isToday ? 'text-gray-600 hover:bg-gray-50' : ''}
                    `}
                  >
                    {day}
                  </div>
                  {entry && entry.flow && (
                    <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 p-4 bg-gray-50/50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-200"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
            </div>
          </div>
        </div>

        {/* Quick Tips - For easy understanding */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-800 px-2 tracking-tight">Quick Self-Care</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-3">
                <Droplets size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hydration</p>
              <p className="text-[11px] font-bold text-gray-600 leading-tight">Drink extra water to reduce bloating.</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-3">
                <Sparkles size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deep Rest</p>
              <p className="text-[11px] font-bold text-gray-600 leading-tight">Aim for 8h sleep during luteal phase.</p>
            </div>
          </div>
        </div>

        {/* Recent Symptoms - If any */}
        {entries.some(e => e.symptoms?.length > 0) && (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-lg font-black text-gray-800 tracking-tight text-center">Recent Insights</h3>
             </div>
             <div className="space-y-3">
                {entries.filter(e => e.symptoms?.length > 0).slice(-2).reverse().map((entry, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400">
                      <CalendarIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.symptoms.map((s, i) => (
                          <span key={i} className="text-[10px] bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Log Modal - Premium Feel */}
      <AnimatePresence>
        {showLogModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50"
              onClick={() => setShowLogModal(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 z-50 max-w-md mx-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              
              <h3 className="text-3xl font-black text-gray-800 mb-2">How's your flow?</h3>
              <p className="text-sm font-medium text-gray-400 mb-8 flex items-center gap-2">
                <CalendarIcon size={14} />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="space-y-8">
                {/* Flow Level */}
                <div>
                  <div className="flex gap-4">
                    {(['light', 'medium', 'heavy'] as FlowType[]).map((flow) => (
                      <button
                        key={flow}
                        onClick={() => setSelectedFlow(flow)}
                        className={`
                          flex-1 py-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2
                          ${selectedFlow === flow 
                            ? 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-500 text-white shadow-xl shadow-pink-200' 
                            : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Droplets size={24} fill={selectedFlow === flow ? "white" : "none"} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{flow}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Any Symptoms?</h4>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`
                          px-5 py-2.5 rounded-full text-xs font-bold transition-all border-2
                          ${selectedSymptoms.includes(symptom)
                            ? 'bg-purple-100 text-purple-600 border-purple-200 shadow-sm'
                            : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                          }
                        `}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <button 
                  onClick={handleSaveLog}
                  disabled={!selectedFlow}
                  className="w-full bg-gradient-to-r from-pink-500 via-[#FF75A0] to-purple-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-pink-200 disabled:opacity-30 transition-all active:scale-95"
                >
                  Confirm Log
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
