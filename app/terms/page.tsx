import PublicNavbar from '@/components/public/Navbar';

export const metadata = {
  title: 'Terms of Service — Golf Heroes',
  description: 'Operating guidelines for the Golf Heroes platform.',
}

export default function TermsPage() {
  return (
    <div className="bg-[#0F172A] min-h-screen pt-24 text-slate-300">
       <PublicNavbar />
       
       <div className="max-w-3xl mx-auto px-6 py-12 text-slate-300 leading-relaxed space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 border-b border-slate-800 pb-8">Terms of Service</h1>
          
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">1. Introduction and Platform Scope</h2>
             <p>Welcome to Golf Heroes. By accessing our platform, participating in monthly draws, or subscribing to our services, you expressly agree to abide by the terms outlined below. The platform operates primarily as an automated validation and distribution engine for charitable contributions and reward mechanics.</p>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">2. Subscription and Eligibility</h2>
             <p>Users must maintain an active Stripe mandate to participate in monthly draws. The system processes up to 5 verified Golf Scores cumulatively to determine reward tier matrices. Users are legally forbidden from attempting to fabricate evidence to bypass validating protocols.</p>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">3. Draw Mechanisms and Rewards</h2>
             <p>Our algorithms securely generate arrays that target subsets of logged scores. If verified, funds are released according to internal Treasury reserves after passing administrator oversight. Golf Heroes reserves the right to withhold disbursement indefinitely if anomalies are mapped.</p>
          </section>
          
          <p className="pt-8 text-sm text-slate-500">Last Updated: October 2026</p>
       </div>
    </div>
  );
}
