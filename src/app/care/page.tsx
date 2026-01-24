"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { MapPin, Phone, Star, Heart, Navigation, Filter } from "lucide-react";
import { CLINICS_DATA, Clinic } from "@/lib/clinics-data";
import { motion } from "framer-motion";

export default function FindCare() {
  const [selectedCity, setSelectedCity] = useState<"jamshedpur" | "bhagalpur">("jamshedpur");
  const [filterType, setFilterType] = useState<"all" | "affordable" | "emergency" | "womenOnly">("all");
  const [nickname, setNickname] = useState("friend");
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("hercare_nickname");
    const savedAge = localStorage.getItem("hercare_age");
    if (savedName) setNickname(savedName);
    if (savedAge) setAge(parseInt(savedAge));
  }, []);

  const clinics = CLINICS_DATA[selectedCity];

  const filteredClinics = clinics.filter(clinic => {
    if (filterType === "affordable") return clinic.affordable || clinic.fees <= 400;
    if (filterType === "emergency") return clinic.emergency;
    if (filterType === "womenOnly") return clinic.womenOnly;
    return true;
  });

  const handleCall = (phone: string) => {
    if (phone.includes("via")) {
      alert("Please visit Justdial.com to get the contact number for this clinic.");
    } else {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleNavigate = (lat: number, lng: number, name: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FFF5F7] font-nunito overflow-hidden">
      {/* 🟢 STICKY HEADER GROUP */}
      <div className="flex-none z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-100/50">
        
        {/* Top Bar */}
        <div className="px-6 py-5">
           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Heart size={24} className="text-pink-500 fill-pink-500" />
             Find Care
           </h1>
           <p className="text-xs text-gray-500 mt-1 pl-8">
             {age && age < 18 ? "Trusted clinics for young women" : "Verified healthcare partners"}
           </p>
        </div>

        {/* Controls Row */}
        <div className="px-6 pb-4 flex flex-col gap-3">
          {/* City Toggle */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl">
             <button onClick={() => setSelectedCity("jamshedpur")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedCity === "jamshedpur" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
               Jamshedpur
             </button>
             <button onClick={() => setSelectedCity("bhagalpur")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedCity === "bhagalpur" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
               Bhagalpur
             </button>
          </div>

          {/* Filter Pills - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient">
             {[
               { value: "all", label: "All" },
               { value: "affordable", label: "Affordable (₹≤400)" },
               { value: "emergency", label: "Emergency 24/7" },
               { value: "womenOnly", label: "Women Only" }
             ].map(f => (
               <button
                 key={f.value}
                 onClick={() => setFilterType(f.value as any)}
                 className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                   filterType === f.value 
                   ? "bg-pink-500 border-pink-500 text-white" 
                   : "bg-white border-gray-200 text-gray-600"
                 }`}
               >
                 {f.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* 🟢 SCROLLABLE LIST AREA */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 scroll-smooth">
         
         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
           {filteredClinics.length} Results Near You
         </p>

         <div className="space-y-4">
           {filteredClinics.map((clinic, index) => (
             <motion.div
               key={clinic.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               className="bg-white rounded-[1.5rem] border border-pink-50 shadow-sm p-5 relative overflow-hidden group"
             >
               {/* Badges */}
               <div className="flex gap-2 mb-3">
                 {clinic.womenFriendly && (
                   <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                     Women Friendly
                   </span>
                 )}
                 {clinic.affordable && (
                   <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                     Affordable
                   </span>
                 )}
               </div>

               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{clinic.name}</h3>
                   <p className="text-xs text-gray-500 flex items-center gap-1">
                     <MapPin size={12} />
                     {clinic.address}
                   </p>
                 </div>
                 <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold text-sm flex items-center gap-1">
                   {clinic.rating} <Star size={10} fill="currentColor" />
                 </div>
               </div>

               {/* Tags */}
               <div className="flex flex-wrap gap-1.5 mb-4">
                  {clinic.specialties.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{s}</span>
                  ))}
               </div>

               <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Consultation</span>
                    <span className="text-lg font-black text-pink-500">
                      {clinic.fees === 0 ? "FREE" : `₹${clinic.fees}`}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCall(clinic.phone)}
                      className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                    >
                      <Phone size={18} />
                    </button>
                    <button 
                      onClick={() => handleNavigate(clinic.location.lat, clinic.location.lng, clinic.name)}
                      className="h-10 px-5 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-black transition-colors"
                    >
                      Navigate
                      <Navigation size={14} />
                    </button>
                  </div>
               </div>
             </motion.div>
           ))}

           {filteredClinics.length === 0 && (
              <div className="text-center py-20 opacity-50">
                 <p>No clinics found.</p>
                 <button onClick={() => setFilterType("all")} className="text-pink-500 underline text-sm">Clear filters</button>
              </div>
           )}

           {/* Emergency Card */}
           <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mt-8 mb-4">
              <h4 className="font-bold text-red-800 text-sm mb-1">Emergency Warning</h4>
              <p className="text-xs text-red-600 mb-3">If you have severe pain or bleeding, do not wait.</p>
              <a href="tel:108" className="block w-full text-center bg-red-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-red-200">
                 Call 108 Ambulance
              </a>
           </div>
         </div>
      </div>

      <BottomNav />
    </div>
  );
}
