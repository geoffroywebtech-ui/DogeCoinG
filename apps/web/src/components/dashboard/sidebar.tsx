"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Dog, Calendar, Scissors, Stethoscope,
  Gift, Settings, LogOut, Shield, MessageCircle, ChevronLeft
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";
import { useState } from "react";

const navItems = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Tableau de bord",   color: "text-petoo-500" },
  { href: "/pets",       icon: Dog,             label: "Mes animaux",        color: "text-coral-500" },
  { href: "/calendar",   icon: Calendar,        label: "Calendrier santé",   color: "text-teal-500" },
  { href: "/grooming",   icon: Scissors,        label: "Toilettage",         color: "text-lavender-500" },
  { href: "/services",   icon: Stethoscope,     label: "Services",           color: "text-mint-500" },
  { href: "/rewards",    icon: Gift,            label: "Récompenses",        color: "text-sunshine-500" },
  { href: "/messages",   icon: MessageCircle,   label: "Messages",           color: "text-blue-500" },
];

interface Props { profile: UserProfile | null }

export function DashboardSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("p-4 border-b border-gray-100 flex items-center", collapsed ? "justify-center" : "gap-2 justify-between")}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🐾</span>
            <span className="gradient-text">Petoo</span>
          </Link>
        )}
        {collapsed && <span className="text-2xl">🐾</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-petoo-50 text-petoo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-petoo-500" : color)} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Admin link */}
        {profile?.is_admin && (
          <Link
            href="/admin"
            title={collapsed ? "Admin" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all",
              collapsed && "justify-center px-2"
            )}
          >
            <Shield className="w-5 h-5 flex-shrink-0 text-purple-500" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          href="/settings"
          title={collapsed ? "Paramètres" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-gray-400" />
          {!collapsed && <span>Paramètres</span>}
        </Link>

        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-petoo-200 to-lavender-200 flex items-center justify-center text-sm font-bold text-petoo-700 flex-shrink-0">
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                : getInitials(profile.full_name ?? profile.email)
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.full_name ?? "Mon compte"}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{profile.subscription_tier}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
