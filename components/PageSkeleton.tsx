export default function PageSkeleton() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-pulse w-full">
       <div className="space-y-3">
         <div className="h-8 bg-slate-800 rounded-md w-1/3"></div>
         <div className="h-4 bg-slate-800 rounded-md w-1/4"></div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-800/50 rounded-xl h-28"></div>
         ))}
       </div>

       <div className="bg-slate-800/50 border border-slate-800/50 rounded-xl h-96 w-full"></div>
    </div>
  );
}
