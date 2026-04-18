import PublicNavbar from '@/components/public/Navbar';
import { Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us — Golf Heroes',
  description: 'Get in touch with the Golf Heroes support and administrative team.',
}

export default function ContactPage() {
  return (
    <div className="bg-[#0F172A] min-h-screen pt-24 text-slate-300">
       <PublicNavbar />
       
       <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contact Us</h1>
            <p className="text-lg text-slate-400">Have questions about your subscription, charities, or draws? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
             <div>
                <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
                <form className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                      <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                      <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="john@example.com" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                      <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32" placeholder="How can we help?" />
                   </div>
                   <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/20">
                      Send to Support
                   </button>
                </form>
             </div>
             
             <div className="space-y-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-8 md:pt-0 md:pl-12">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-blue-400" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold mb-1">Email Support</h4>
                      <p className="text-sm text-slate-400 mb-1">Our team replies within 24 hours.</p>
                      <a href="mailto:support@golfheroes.com" className="text-blue-400 font-medium">support@golfheroes.com</a>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-emerald-400" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold mb-1">Registered Office</h4>
                      <p className="text-sm text-slate-400">Golf Heroes Ltd.<br/>123 Fairway Drive,<br/>Dublin, Ireland</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
