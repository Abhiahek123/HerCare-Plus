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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-16 pb-24">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-pink-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Heart size={28} className="text-pink-500" fill="currentColor" />
            Find Care for You, {nickname}
          </h1>
          <p className="text-sm text-gray-600">
            {age && age < 18 
              ? "Safe & supportive clinics for young women's health."
              : age && age > 45
              ? "Specialized care for every stage of your wellness journey."
              : "Verified clinics with caring, professional doctors."}
          </p>
        </div>
      </div>

      {/* City Selector */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Select City</label>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedCity("jamshedpur")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                selectedCity === "jamshedpur"
                  ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MapPin size={16} className="inline mr-1" />
              Jamshedpur
            </button>
            <button
              onClick={() => setSelectedCity("bhagalpur")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                selectedCity === "bhagalpur"
                  ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MapPin size={16} className="inline mr-1" />
              Bhagalpur
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <label className="text-xs font-bold text-gray- uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Filter size={14} />
            Filter By
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All Clinics" },
              { value: "affordable", label: "Affordable (₹≤400)" },
              { value: "emergency", label: "24/7 Emergency" },
              { value: "womenOnly", label: "Women-Only" }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as typeof filterType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === filter.value
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-purple-200 hover:border-purple-400"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-6 py-3 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600">
          <strong>{filteredClinics.length}</strong> women-friendly {filteredClinics.length === 1 ? "clinic" : "clinics"} found in <strong>{selectedCity === "jamshedpur" ? "Jamshedpur" : "Bhagalpur"}</strong>
        </p>
      </div>

      {/* Clinic List */}
      <div className="px-6 py-4 max-w-4xl mx-auto space-y-4">
        {filteredClinics.map((clinic, index) => (
          <motion.div
            key={clinic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{clinic.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{clinic.type}</p>
                </div>
                {clinic.womenFriendly && (
                  <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Heart size={12} fill="currentColor" />
                    Women-Friendly
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center bg-green-100 px-2 py-1 rounded-lg">
                  <Star size={14} className="text-green-600 mr-1" fill="currentColor" />
                  <span className="text-sm font-bold text-green-800">{clinic.rating}</span>
                </div>
                <span className="text-xs text-gray-500">({clinic.reviews} reviews)</span>
                {clinic.emergency && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">24/7 Emergency</span>
                )}
                {clinic.affordable && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Affordable</span>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{clinic.address}</p>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {clinic.specialties.map((specialty, idx) => (
                    <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-gray-600">Consultation Fee:</p>
                <p className="text-lg font-bold text-pink-600">
                  {clinic.fees === 0 ? "FREE" : `₹${clinic.fees}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleCall(clinic.phone)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                >
                  <Phone size={18} />
                  Call Now
                </button>
                <button
                  onClick={() => handleNavigate(clinic.location.lat, clinic.location.lng, clinic.name)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  <Navigation size={18} />
                  Navigate
                </button>
              </div>

              {/* Timings */}
              {clinic.timings && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  <strong>Timings:</strong> {clinic.timings}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredClinics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No clinics match your filters</p>
          <button
            onClick={() => setFilterType("all")}
            className="text-purple-600 font-medium underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Emergency Banner */}
      <div className="px-6 py-4 max-w-4xl mx-auto mt-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100">
          <h3 className="font-bold text-red-800 mb-2">Medical Emergency?</h3>
          <p className="text-sm text-red-700 mb-3">If you need immediate help, call:</p>
          <a href="tel:108" className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all">
            Call 108 - Free Ambulance
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
