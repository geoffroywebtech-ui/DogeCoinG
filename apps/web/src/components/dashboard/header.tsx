"use client";

import Link from "next/link";
import { Bell, Search, Menu } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types";
import { useState } from "react";

interface Props { profile: UserProfile | null }

export function DashboardHeader({ profile }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-lg">
          <span>🐾</span>
          <span className="gradient-text">Petoo</span>
        </Link>
      </div>

      {/* Search (desktop) */}
      <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-72">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un animal, un pro…"
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none flex-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Loyalty points badge */}
        {profile && (
          <Link
            href="/rewards"
            className="hidden sm:flex items-center gap-1.5 bg-sunshine-100 text-sunshine-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sunshine-200 transition-colors"
          >
            <span>⭐</span>
            <span>{profile.loyalty_points.toLocaleString("fr")} pts</span>
          </Link>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-petoo-500 rounded-full" />
        </button>

        {/* Avatar */}
        <Link href="/settings" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-petoo-200 to-lavender-200 flex items-center justify-center text-sm font-bold text-petoo-700 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              getInitials(profile?.full_name ?? profile?.email ?? "U")
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {profile?.full_name ?? "Mon compte"}
            </p>
            <p className="text-xs text-gray-500 capitalize leading-tight">{profile?.subscription_tier ?? "free"}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
