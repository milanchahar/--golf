import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Calendar, MapPin, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default async function CharityProfile({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!charity) notFound();

  const today = new Date().toISOString().split('T')[0];
  const { data: events } = await supabase
    .from('charity_events')
    .select('*')
    .eq('charity_id', charity.id)
    .gte('event_date', today)
    .order('event_date', { ascending: true });

  const { count: supportsCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('selected_charity_id', charity.id);

  return (
    <div className="pb-20">
      <div className="h-64 md:h-96 w-full relative bg-slate-900 border-b border-slate-800">
        {charity.banner_image_url && <img src={charity.banner_image_url} alt="Cover" className="w-full h-full object-cover opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-24 relative z-10">
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden -mt-20 md:-mt-24 shadow-xl">
               {charity.logo_url ? <img src={charity.logo_url} className="w-full h-full object-cover" /> : null}
            </div>
            
            <div className="flex-grow space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{charity.name}</h1>
                  {charity.website_url && (
                    <a href={charity.website_url} target="_blank" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm">
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <Link href={`/auth/signup?charity=${charity.id}`}>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shadow-lg shadow-emerald-500/20">
                    Choose This Charity
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-800 mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <span className="text-2xl font-bold text-emerald-400 leading-none">€{charity.total_raised}</span>
                  </div>
                  <span className="text-slate-400 text-sm leading-tight">Total raised by<br/>Golf Heroes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-sm leading-tight text-white font-medium">{supportsCount || 0} members<br/><span className="text-slate-500 font-normal">currently supporting</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-slate-300 leading-relaxed max-w-3xl">
            <h3 className="text-white font-bold text-xl mb-4">About {charity.name}</h3>
            <p>{charity.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <PageHeader title="Upcoming Events" subtitle={`Support ${charity.name} at these specific events`} />
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(event => (
                <div key={event.id} className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden flex h-full">
                   {event.image_url && <div className="w-1/3 bg-slate-800"><img src={event.image_url} className="w-full h-full object-cover" /></div>}
                   <div className={`p-6 flex flex-col justify-center ${event.image_url ? 'w-2/3' : 'w-full'}`}>
                      <h4 className="text-lg font-bold text-white mb-3">{event.title}</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1E293B] border border-slate-800 p-8 text-center rounded-xl text-slate-500">
              No upcoming events scheduled at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
