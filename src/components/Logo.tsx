"use client";

import Link from "next/link";

const LotusSymbol = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-12 transition-transform duration-500">
    {/* Center petal */}
    <path d="M50 85C50 85 65 60 65 40C65 20 50 15 50 15C50 15 35 20 35 40C35 60 50 85 50 85Z" fill="#FF5FA2" fillOpacity="0.6"/>
    {/* Left petals */}
    <path d="M45 80C45 80 20 65 20 45C20 30 35 25 35 25C35 25 35 45 45 65" fill="#FF5FA2" fillOpacity="0.3"/>
    <path d="M40 75C40 75 10 55 10 40C10 25 25 20 25 20C25 20 30 40 40 60" fill="#FF5FA2" fillOpacity="0.2"/>
    {/* Right petals */}
    <path d="M55 80C55 80 80 65 80 45C80 30 65 25 65 25C65 25 65 45 55 65" fill="#FF5FA2" fillOpacity="0.3"/>
    <path d="M60 75C60 75 90 55 90 40C90 25 75 20 75 20C75 20 70 40 60 60" fill="#FF5FA2" fillOpacity="0.2"/>
    {/* Central core */}
    <circle cx="50" cy="40" r="4" fill="#FF5FA2"/>
  </svg>
);

export default function Logo() {
  return (
    <Link href="/" className="relative group cursor-pointer inline-block">
      <div className="flex items-center gap-2">
        {/* Lotus Icon - Pure and Peaceful */}
        <div className="relative flex items-center justify-center p-1.5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-sm border border-pink-100 group-hover:scale-110 transition-transform">
          <LotusSymbol />
        </div>

        {/* Text Logo */}
        <div className="flex items-center gap-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <span 
            className="font-bold tracking-tight"
            style={{ 
              fontSize: '22px',
              background: 'linear-gradient(135deg, #FF5FA2 0%, #FF8CB8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.8px'
            }}
          >
            Her
          </span>
          <span 
            className="font-bold tracking-tight"
            style={{ 
              fontSize: '22px',
              background: 'linear-gradient(135deg, #7B61FF 0%, #9B8AFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.8px'
            }}
          >
            Care
          </span>
          <span 
            className="font-black"
            style={{ 
              fontSize: '22px',
              color: '#7B61FF',
              fontWeight: '900',
              marginLeft: '1px',
              lineHeight: '1'
            }}
          >
            ⁺
          </span>
        </div>
      </div>

      {/* Premium Glow on hover */}
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  );
}
