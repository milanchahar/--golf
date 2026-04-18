import PublicNavbar from '@/components/public/Navbar';
import { Target, Heart, Trophy } from 'lucide-react';

export const metadata = {
  title: 'About Us — Golf Heroes',
  description: 'Learn about our mission to merge the love of golf with meaningful charity donations.',
}

export default function AboutPage() {
  return (
    <div className="bg-[#0F172A] min-h-screen pt-24 text-slate-300">
       <PublicNavbar />
       
       <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Play. Win. Give.</h1>
            <p className="text-xl text-slate-400">Golf Heroes was founded on a simple premise: what if every round of golf you played could help change the world?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">The Engine</h3>
                <p className="text-slate-400 text-sm">We've built a robust, algorithmic engine that takes standard Stableford scores and converts them into competitive draw parameters.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">The Impact</h3>
                <p className="text-slate-400 text-sm">A minimum of 10% of every subscription flows directly to verified charities, automated dynamically through our integrations.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">The Reward</h3>
                <p className="text-slate-400 text-sm">Members compete for scalable Jackpots that accumulate organically and securely through our central Treasury block.</p>
             </div>
          </div>

          <div className="bg-gradient-to-br from-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
             <h2 className="text-3xl font-bold text-white mb-6">Join the Movement</h2>
             <p className="text-slate-400 mb-8 max-w-2xl leading-relaxed">Whether you play scratch golf or are just picking up a club, your scores matter here. Over €1,000,000 has been securely distributed to various organizational nodes since our inception. Ready to make your swings count?</p>
             <a href="/auth/signup" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-full transition shadow-lg shadow-blue-500/20">
               Start Your Journey
             </a>
          </div>
       </div>
    </div>
  );
}
