"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BackButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
}

export default function BackButton({ label = "Back", className = "", onClick }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={handleBack} 
      className={`flex items-center gap-1.5 text-gray-500 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-pink-50 ${className}`}
    >
      <ArrowLeft size={20} className="shrink-0" />
      <span className="text-sm font-bold font-nunito">{label}</span>
    </motion.button>
  );
}
