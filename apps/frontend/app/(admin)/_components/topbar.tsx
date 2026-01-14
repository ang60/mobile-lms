 "use client";
 
 import { useRouter } from "next/navigation";
 import { Bell, LogOut, Search, Sun, User, Zap } from "lucide-react";
 
 export function Topbar() {
   const router = useRouter();
 
   const handleLogout = () => {
     if (typeof window !== "undefined") {
       localStorage.removeItem("token");
     }
     router.replace("/login");
   };
 
   return (
     <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white px-6 py-4 shadow-md z-20">
       <div className="flex items-center justify-between">
         {/* Logo Section */}
         <div className="flex items-center gap-3">
           <div className="text-2xl font-bold">CPA</div>
           <div className="hidden md:block">
             <div className="text-sm font-semibold">ADMIN</div>
             <div className="text-xs text-blue-200">Control Center</div>
           </div>
         </div>
 
         {/* Search Bar */}
         <div className="flex-1 max-w-md mx-8">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-300" />
             <input
               type="search"
               placeholder="Search anything..."
               className="w-full h-10 pl-10 pr-4 rounded-lg bg-blue-800/50 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             />
           </div>
         </div>
 
         {/* Right Icons */}
         <div className="flex items-center gap-4">
           <button className="relative p-2 hover:bg-blue-800 rounded-lg transition-colors">
             <Bell className="size-5" />
             <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
           </button>
           <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
             <Zap className="size-5" />
           </button>
           <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
             <Sun className="size-5" />
           </button>
           <div className="flex items-center gap-3 pl-2">
             <div className="relative size-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
               <span>AU</span>
             </div>
             <div className="hidden md:flex flex-col">
               <div className="text-xs text-blue-200 flex items-center gap-1">
                 <User className="size-3" />
                 admin
               </div>
               <button
                 type="button"
                 onClick={handleLogout}
                 className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-100 hover:text-white"
               >
                 <LogOut className="size-3" />
                 Sign out
               </button>
             </div>
           </div>
         </div>
       </div>
     </header>
   );
 }
 
