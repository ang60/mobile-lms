 "use client";
 
 import type { ReactNode } from "react";
 import { useEffect } from "react";
 import { useRouter } from "next/navigation";
 import { Sidebar } from "./_components/sidebar";
 import { Topbar } from "./_components/topbar";
 
 type AdminLayoutProps = {
   children: ReactNode;
 };
 
 export default function AdminLayout({ children }: AdminLayoutProps) {
   const router = useRouter();
 
   useEffect(() => {
     if (typeof window === "undefined") return;
     const token = localStorage.getItem("token");
     if (!token) {
       router.replace("/login");
     }
   }, [router]);
 
   return (
     <div className="min-h-screen bg-slate-50">
       <Topbar />
       <div className="flex relative pt-[73px]">
         <Sidebar />
         <main className="flex-1 ml-64 overflow-y-auto bg-slate-50 p-6 h-[calc(100vh-73px)]">
           {children}
         </main>
       </div>
     </div>
   );
 }

