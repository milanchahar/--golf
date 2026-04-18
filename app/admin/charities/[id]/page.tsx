import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminCharityDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: charity } = await supabase.from('charities').select('*').eq('id', params.id).single();
  
  if (!charity) notFound();

  const { data: events } = await supabase.from('charity_events').select('*').eq('charity_id', charity.id).order('event_date', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <Link href="/admin/charities" className="text-sm text-blue-400 hover:text-blue-300 inline-block mb-2">← Back to Charities</Link>
      <PageHeader title={charity.name} subtitle="Update details and track fundraising properties" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Identity Editor */}
         <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              Core Identity
              <button className="text-xs text-blue-400 font-normal">Save Changes</button>
            </h3>
            <div className="space-y-4 text-sm">
               <div>
                  <label className="text-slate-400 block mb-1">Name</label>
                  <input type="text" defaultValue={charity.name} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
               </div>
               <div>
                  <label className="text-slate-400 block mb-1">Slug</label>
                  <input type="text" defaultValue={charity.slug} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
               </div>
               <div>
                  <label className="text-slate-400 block mb-1">Website URL</label>
                  <input type="text" defaultValue={charity.website_url || ''} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
               </div>
               <div>
                  <label className="text-slate-400 block mb-1">Description</label>
                  <textarea defaultValue={charity.description || ''} className="w-full h-24 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
               </div>
               <div className="pt-2 flex gap-4">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer"><input type="checkbox" defaultChecked={charity.is_active} className="rounded border-slate-600 bg-slate-800" /> Active</label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer"><input type="checkbox" defaultChecked={charity.is_featured} className="rounded border-slate-600 border-amber-500/50 accent-amber-500 bg-slate-800" /> Featured</label>
               </div>
            </div>
         </div>

         {/* Visuals & Stats */}
         <div className="space-y-6">
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
               <h3 className="text-white font-semibold mb-4 border-b border-slate-800 pb-2">Visuals</h3>
               <div className="flex gap-4">
                  <div className="w-24">
                     <label className="text-xs text-slate-500 block mb-1">Logo</label>
                     <div className="w-24 h-24 bg-slate-800 border border-slate-700 rounded relative group overflow-hidden">
                       {charity.logo_url && <img src={charity.logo_url} className="w-full h-full object-cover"/>}
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <span className="text-xs text-white">Upload</span>
                       </div>
                     </div>
                  </div>
                  <div className="flex-1">
                     <label className="text-xs text-slate-500 block mb-1">Banner</label>
                     <div className="w-full h-24 bg-slate-800 border border-slate-700 rounded relative group overflow-hidden">
                       {charity.banner_image_url && <img src={charity.banner_image_url} className="w-full h-full object-cover"/>}
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <span className="text-xs text-white">Upload Banner</span>
                       </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#1E293B] border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
               <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Total Contributions Raised</h3>
               <p className="text-5xl font-extrabold text-white font-mono tracking-tight relative z-10">€{charity.total_raised}</p>
            </div>
         </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Hosted Events</h3>
            <button className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded transition">Add Event</button>
         </div>
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="border-b border-slate-800">
               <tr>
                 <th className="py-2">Date</th>
                 <th className="py-2">Title</th>
                 <th className="py-2">Location</th>
                 <th className="py-2 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {events?.map(e => (
                 <tr key={e.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                   <td className="py-3 text-white">{new Date(e.event_date).toLocaleDateString()}</td>
                   <td className="py-3 font-medium text-slate-300">{e.title}</td>
                   <td className="py-3">{e.location || '-'}</td>
                   <td className="py-3 text-right">
                     <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                     <button className="text-red-400 hover:text-red-300">Remove</button>
                   </td>
                 </tr>
               ))}
            </tbody>
         </table>
         {events?.length === 0 && <div className="text-center py-6 text-slate-500">No events deployed.</div>}
      </div>

    </div>
  );
}
