import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';

export default async function AdminUsersPage({ searchParams }: { searchParams: { search?: string, status?: string } }) {
  const supabase = createClient();
  const searchStr = searchParams.search || '';
  const status = searchParams.status || '';

  let query = supabase.from('profiles').select('*, golf_scores(count)').order('created_at', { ascending: false });

  if (searchStr) {
    query = query.or(`full_name.ilike.%${searchStr}%,email.ilike.%${searchStr}%`);
  }
  if (status) {
    query = query.eq('subscription_status', status);
  }

  const { data: users } = await query.limit(50);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <PageHeader title="User Management" subtitle="View and manage all registered members" />

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
         <form className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              name="search" 
              defaultValue={searchStr}
              placeholder="Search by name or email..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" 
            />
         </form>

         <div className="flex gap-2 w-full md:w-auto">
            <Link href="/admin/users" className={`px-4 py-2 rounded-lg text-sm font-medium ${!status ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>All</Link>
            <Link href="/admin/users?status=active" className={`px-4 py-2 rounded-lg text-sm font-medium ${status === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Active Subs</Link>
            <Link href="/admin/users?status=inactive" className={`px-4 py-2 rounded-lg text-sm font-medium ${status === 'inactive' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Inactive</Link>
         </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-x-auto">
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Scores</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                           {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="text-white font-medium block">{u.full_name}</span>
                          <span className="text-xs">{u.email}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{u.subscription_plan || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    {u.golf_scores[0]?.count || 0}/5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors font-medium">
                      <Eye className="w-3.5 h-3.5"/> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
         {users?.length === 0 && (
           <div className="p-12 text-center text-slate-500">
             No users found.
           </div>
         )}
      </div>
    </div>
  );
}
