import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, Search, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default async function CharitiesDirectory({ searchParams }: { searchParams: { search?: string } }) {
  const supabase = createClient();
  const searchStr = searchParams.search || '';

  let query = supabase.from('charities').select('*').eq('is_active', true).order('total_raised', { ascending: false });
  
  if (searchStr) {
    query = query.ilike('name', `%${searchStr}%`);
  }

  const { data: charities } = await query;
  
  const spotlight = charities?.find(c => c.is_featured) || charities?.[0];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">
      
      {spotlight && !searchStr && (
        <section className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
          <div className="md:w-1/2 p-10 flex flex-col justify-center relative z-10">
             <div className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-xs tracking-wider uppercase mb-4 py-1 px-3 bg-emerald-500/10 w-fit rounded-full">
                <Star className="w-3.5 h-3.5 fill-current"/> Spotlight
             </div>
             <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">{spotlight.name}</h2>
             <p className="text-slate-400 text-lg mb-8 line-clamp-3">{spotlight.description}</p>
             <Link href={`/charities/${spotlight.slug}`}>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors w-fit shadow-lg shadow-emerald-500/20">
                  Support This Charity
                </button>
             </Link>
          </div>
          <div className="md:w-1/2 h-64 md:h-auto relative bg-slate-800">
             {spotlight.banner_image_url ? (
               <img src={spotlight.banner_image_url} className="w-full h-full object-cover" alt="Banner"/>
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-700">
                 <Heart className="w-24 h-24" />
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] to-transparent w-full md:w-1/2 left-0" />
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
           <PageHeader title="Charity Directory" subtitle="Explore causes supported by the Golf Heroes community" />
           <form className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 mt-0.5 -translate-y-1/2" />
              <input 
                type="text" 
                name="search"
                defaultValue={searchStr}
                placeholder="Search charities..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
           </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities?.map(charity => (
            <Link key={charity.id} href={`/charities/${charity.slug}`} className="group block">
              <div className="bg-[#1E293B] border border-slate-800 group-hover:border-slate-600 overflow-hidden rounded-xl transition-all h-full flex flex-col">
                 <div className="h-32 bg-slate-800 relative">
                   {charity.banner_image_url && <img src={charity.banner_image_url} className="w-full h-full object-cover opacity-60" />}
                   <div className="absolute -bottom-6 left-6 w-14 h-14 bg-slate-900 rounded-xl border-2 border-[#1E293B] flex items-center justify-center overflow-hidden z-10 shadow-lg">
                      {charity.logo_url ? <img src={charity.logo_url} className="w-full h-full object-cover"/> : <Heart className="w-6 h-6 text-emerald-500"/>}
                   </div>
                 </div>
                 <div className="p-6 pt-10 flex flex-col flex-grow">
                   <h3 className="text-lg font-bold text-white mb-2">{charity.name}</h3>
                   <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">{charity.description}</p>
                   
                   <div className="flex items-end justify-between pt-4 border-t border-slate-800/50">
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Total Raised</span>
                        <span className="text-emerald-400 font-bold tracking-tight">€{charity.total_raised}</span>
                      </div>
                      <span className="text-slate-400 text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Learn More <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                   </div>
                 </div>
              </div>
            </Link>
          ))}
          {charities?.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
               No charities found matching your criteria.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
