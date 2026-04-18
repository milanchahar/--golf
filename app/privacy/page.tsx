import PublicNavbar from '@/components/public/Navbar';

export const metadata = {
  title: 'Privacy Policy — Golf Heroes',
  description: 'How we process and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#0F172A] min-h-screen pt-24 text-slate-300">
       <PublicNavbar />
       
       <div className="max-w-3xl mx-auto px-6 py-12 text-slate-300 leading-relaxed space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 border-b border-slate-800 pb-8">Privacy Policy</h1>
          
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
             <p>When you register for Golf Heroes, we collect basic profile information including your name, email address, and explicit consent for your charity preferences. Golf scores submitted are tied dynamically to your identity to process monthly validated draws securely.</p>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">2. Payment Processing</h2>
             <p>All subscription data is handled securely via Stripe. Golf Heroes does not store credit card numbers on our isolated databases. Contributions are processed directly against active Stripe mandates.</p>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">3. Public Data and Privacy</h2>
             <p>If you emerge as a winner during the monthly draw, your aggregated identity (First Name, Initial) may be displayed on standard verified ledgers. Detailed validations processed via the Admin back-office are completely confidential.</p>
          </section>
          
          <p className="pt-8 text-sm text-slate-500">Last Updated: October 2026</p>
       </div>
    </div>
  );
}
