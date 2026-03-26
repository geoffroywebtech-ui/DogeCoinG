import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-lg">Petoo Admin</span>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{profile.full_name}</span>
          <a href="/dashboard" className="hover:text-white transition-colors">← App</a>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
