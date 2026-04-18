'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0F172A]/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
       <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link href="/" className="font-extrabold text-white text-xl tracking-wide flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-black leading-none pb-0.5">G</span>
             </div>
             Golf Heroes
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
             <Link href="/about" className="text-slate-300 hover:text-white transition-colors">How It Works</Link>
             <Link href="/charities" className="text-slate-300 hover:text-white transition-colors">Charities</Link>
             <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
             <Link href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
             <Link href="/auth/signup" className="text-sm font-bold bg-white text-slate-900 px-5 py-2 rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
               Get Started
             </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
             {mobileOpen ? <X/> : <Menu/>}
          </button>
       </div>

       <AnimatePresence>
         {mobileOpen && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="md:hidden absolute top-full left-0 right-0 bg-[#0F172A] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
           >
             <Link href="/about" onClick={() => setMobileOpen(false)} className="text-slate-300 font-medium">How It Works</Link>
             <Link href="/charities" onClick={() => setMobileOpen(false)} className="text-slate-300 font-medium">Charities</Link>
             <Link href="/pricing" onClick={() => setMobileOpen(false)} className="text-slate-300 font-medium">Pricing</Link>
             <hr className="border-white/10 my-2" />
             <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-slate-300 font-medium">Log In</Link>
             <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="text-center font-bold bg-white text-slate-900 px-5 py-3 rounded-full">Get Started</Link>
           </motion.div>
         )}
       </AnimatePresence>
    </nav>
  );
}
