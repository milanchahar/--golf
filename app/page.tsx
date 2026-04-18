'use client';
import { useRef, useState } from 'react';
import PublicNavbar from '@/components/public/Navbar';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { PenSquare, Target, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import JackpotCounter from '@/components/JackpotCounter';

const faqs = [
  { q: "How does the draw work?", a: "Our proprietary algorithm aggregates all logged Stableford scores across our active sub-base at the end of the month, mapping random coordinates against your performance to determine tiered winners equitably." },
  { q: "What is Stableford scoring?", a: "Stableford is a scoring system used in the sport of golf that involves scoring points based on the number of strokes taken at each hole. It allows players of different skill levels to compete on an even basis." },
  { q: "How are charities paid?", a: "We aggregate the total calculated minimum percentage (or your active overrides) securely and transmit them to the chosen charities on a 30-day trailing ledger." },
  { q: "Can I cancel anytime?", a: "Yes, entirely. Your Stripe integration ensures you can lapse your subscription at any point. You will retain dashboard access until your cycle concludes." },
  { q: "How do I claim my prize?", a: "Winners are notified via secure email payloads. You must log into your dashboard, upload photographic evidence of your scorecard, and await administrative disbursement." },
  { q: "Is my data secure?", a: "Absolutely. We secure all profiles natively on Supabase, processing all financial vectors strictly via Stripe. We do not hold CC numbers in state." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animation variants
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  return (
    <div className="bg-[#0F172A] min-h-screen font-sans text-slate-300">
       <PublicNavbar />

       {/* Hero Section */}
       <header className="relative w-full min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Animated mesh replacement (CSS gradient overlay) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0F172A] to-[#0F172A]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
             <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
                <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                  Play Golf. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Win Prizes.</span> <br/> Change Lives.
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Subscribe monthly, enter your scores, and compete in monthly automated prize draws — all while supporting a charity you deeply care about.
                </motion.p>
                <motion.div variants={fadeUp} className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-slate-900 font-bold px-8 py-4 rounded-full hover:bg-slate-200 transition shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                     Get Started Today
                   </Link>
                   <a href="#how-it-works" className="w-full sm:w-auto text-white font-medium px-8 py-4 rounded-full border border-slate-700 hover:bg-slate-800 transition">
                     How It Works
                   </a>
                </motion.div>
             </motion.div>

             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="mt-16 mx-auto max-w-md">
                <JackpotCounter amount={450.00} />
             </motion.div>
          </div>
       </header>

       {/* How It Works */}
       <section id="how-it-works" className="py-24 bg-slate-900 relative border-t border-slate-800">
          <div className="container mx-auto px-6 max-w-6xl">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Three simple steps</h2>
               <p className="text-slate-400 max-w-xl mx-auto">Our platform bridges your local golf course with our central rewards database effortlessly.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div whileInView="visible" initial="hidden" variants={fadeUp} viewport={{ once: true }} className="bg-[#0F172A] border border-slate-800 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <PenSquare className="w-8 h-8 text-blue-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">1. Enter Scores</h3>
                   <p className="text-slate-400 text-sm">Subscribe and log up to 5 Stableford scores per month from any recognized golf course.</p>
                </motion.div>

                <motion.div whileInView="visible" initial="hidden" variants={fadeUp} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#0F172A] border border-slate-800 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Target className="w-8 h-8 text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">2. Compete</h3>
                   <p className="text-slate-400 text-sm">Every end-of-month, our proprietary draw algorithm drops 5 target numbers. Match them to win.</p>
                </motion.div>

                <motion.div whileInView="visible" initial="hidden" variants={fadeUp} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#0F172A] border border-slate-800 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                   <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-amber-500" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">3. Support</h3>
                   <p className="text-slate-400 text-sm">Choose a charity. We ensure a baseline 10% of your operational subscription fee is instantly sent to them.</p>
                </motion.div>
             </div>
          </div>
       </section>

       {/* Impact Section */}
       <section className="py-24 bg-[#0F172A] relative">
          <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white">Every Subscription Creates Real Impact</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  We don't just host games; we funnel energy into meaningful change. By linking charitable giving directly to your participation, the Golf Heroes community is actively raising thousands across verified networks.
                </p>
                <div className="pt-4">
                   <Link href="/charities" className="text-emerald-400 font-bold hover:text-emerald-300 inline-flex items-center gap-2">
                     Explore Charities →
                   </Link>
                </div>
             </div>
             
             <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-slate-400 font-medium mb-2 relative z-10 text-center">Total Community Donations</h3>
                <div className="text-5xl md:text-7xl font-extrabold text-white text-center font-mono tracking-tighter relative z-10">€85,420</div>
             </div>
          </div>
       </section>

       {/* Prize Structure */}
       <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="container mx-auto px-6 max-w-5xl">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Prize Pool Structure</h2>
               <p className="text-slate-400 max-w-xl mx-auto">Your odds structured transparently. If the 5-match jackpot isn't hit, it rolls over.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                   <span className="text-emerald-400 font-bold mb-1 block">Jackpot</span>
                   <h3 className="text-3xl font-extrabold text-white mb-4">5-Match</h3>
                   <span className="text-2xl font-mono text-slate-300">40% of Pool</span>
                </div>
                <div className="bg-[#0F172A] border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                   <span className="text-blue-400 font-bold mb-1 block">Tier 2</span>
                   <h3 className="text-3xl font-extrabold text-white mb-4">4-Match</h3>
                   <span className="text-2xl font-mono text-slate-300">35% of Pool</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden">
                   <span className="text-slate-400 font-bold mb-1 block">Tier 3</span>
                   <h3 className="text-3xl font-extrabold text-white mb-4">3-Match</h3>
                   <span className="text-2xl font-mono text-slate-300">25% of Pool</span>
                </div>
             </div>
          </div>
       </section>

       {/* FAQ */}
       <section className="py-24 bg-[#0F172A]">
          <div className="container mx-auto px-6 max-w-4xl">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
             </div>
             <div className="space-y-4">
                {faqs.map((faq, index) => (
                   <motion.div layout key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                      <div className="p-6 flex justify-between items-center">
                         <h3 className="text-white font-bold">{faq.q}</h3>
                         {openFaq === index ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                      </div>
                      <AnimatePresence>
                         {openFaq === index && (
                           <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">
                              {faq.a}
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </motion.div>
                ))}
             </div>
          </div>
       </section>
       
       {/* Footer */}
       <footer className="bg-slate-950 border-t border-slate-800 py-12 text-sm text-slate-500">
          <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2 font-bold text-white text-lg">
                <span className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">G</span> Golf Heroes
             </div>
             <div className="flex gap-6">
                <Link href="/about" className="hover:text-white transition">About</Link>
                <Link href="/charities" className="hover:text-white transition">Charities</Link>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
                <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition">Terms</Link>
             </div>
             <div>© 2026 Golf Heroes. All rights reserved.</div>
          </div>
       </footer>

    </div>
  );
}
