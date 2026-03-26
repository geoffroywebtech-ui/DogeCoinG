"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Settings,
  Scissors,
  BarChart3,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency, formatDate, getSpeciesEmoji } from "@/lib/utils";
import type { Booking, ServiceProvider } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  bookingsThisMonth: number;
  revenueThisMonth: number;
  newClients: number;
  avgRating: number;
  ratingCount: number;
  pendingBookings: number;
}

interface ChartDataPoint {
  label: string;
  revenue: number;
  bookings: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10", gradient)} />
      <div className="relative z-10">
        <div className={cn("inline-flex p-2.5 rounded-2xl mb-3", gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold mt-2",
              trend.positive ? "text-teal-500" : "text-red-400"
            )}
          >
            <TrendingUp
              className={cn("w-3.5 h-3.5", !trend.positive && "rotate-180")}
            />
            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}% vs mois dernier
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Booking Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Booking["status"] }) {
  const config = {
    pending: {
      label: "En attente",
      className: "bg-yellow-100 text-yellow-700",
      icon: "⏳",
    },
    confirmed: {
      label: "Confirmé",
      className: "bg-teal-100 text-teal-700",
      icon: "✅",
    },
    in_progress: {
      label: "En cours",
      className: "bg-blue-100 text-blue-700",
      icon: "🔄",
    },
    completed: {
      label: "Terminé",
      className: "bg-green-100 text-green-700",
      icon: "✔️",
    },
    cancelled: {
      label: "Annulé",
      className: "bg-red-100 text-red-700",
      icon: "❌",
    },
  };
  const c = config[status] ?? config.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
        c.className
      )}
    >
      {c.icon} {c.label}
    </span>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────

function BookingRow({
  booking,
  onConfirm,
  onCancel,
  loading,
}: {
  booking: Booking;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-petoo-100 hover:shadow-sm transition-all">
      {/* Pet avatar */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-petoo-50 to-lavender-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
        {booking.pet?.avatar_url ? (
          <img
            src={booking.pet.avatar_url}
            alt={booking.pet.name ?? ""}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : booking.pet?.species ? (
          getSpeciesEmoji(booking.pet.species)
        ) : (
          "🐾"
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-gray-900 text-sm">
            {booking.pet?.name ?? "Animal"}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {booking.service?.name ?? "Prestation"}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(booking.scheduled_at, "d MMM à HH:mm")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {booking.duration_minutes} min
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="font-extrabold text-gray-900">
          {formatCurrency(booking.price_total)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {booking.payment_status === "paid" ? "✅ Payé" : "⏳ En attente"}
        </p>
      </div>

      {/* Actions */}
      {booking.status === "pending" && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onConfirm(booking.id)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 text-white rounded-xl text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmer
          </button>
          <button
            onClick={() => onCancel(booking.id)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Refuser
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">📈 Revenus & Réservations</h3>
          <p className="text-sm text-gray-500 mt-0.5">Évolution sur les 6 derniers mois</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-petoo-500" />
            Revenus
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-400" />
            Réservations
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) =>
              name === "revenue" ? [formatCurrency(value), "Revenus"] : [value, "Réservations"]
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BookingsBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-6">📊 Réservations par mois</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              fontSize: "13px",
            }}
            formatter={(value: number) => [value, "Réservations"]}
          />
          <Bar
            dataKey="bookings"
            fill="#14b8a6"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Quick Links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    href: "/grooming/pro-dashboard/services",
    icon: Scissors,
    label: "Gérer mes services",
    description: "Tarifs, durées, descriptions",
    color: "bg-petoo-50 text-petoo-500",
  },
  {
    href: "/grooming/pro-dashboard/availability",
    icon: CalendarDays,
    label: "Mes disponibilités",
    description: "Horaires et jours d'ouverture",
    color: "bg-teal-50 text-teal-500",
  },
  {
    href: "/grooming/pro-dashboard/portfolio",
    icon: ImageIcon,
    label: "Mon portfolio",
    description: "Photos avant/après",
    color: "bg-lavender-50 text-lavender-500",
  },
  {
    href: "/grooming/pro-dashboard/settings",
    icon: Settings,
    label: "Paramètres",
    description: "Profil, paiements, notifications",
    color: "bg-gray-100 text-gray-600",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get provider profile
    const { data: providerData } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!providerData) {
      setLoading(false);
      return;
    }

    setProvider(providerData as unknown as ServiceProvider);

    // Get bookings with pet and service info
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*, pet:pets(*), service:provider_services(*)")
      .eq("provider_id", providerData.id)
      .order("scheduled_at", { ascending: false })
      .limit(50);

    const allBookings = (bookingsData ?? []) as unknown as Booking[];
    setBookings(allBookings);

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const thisMonthBookings = allBookings.filter(
      (b) => b.created_at >= startOfMonth && b.status !== "cancelled"
    );
    const thisMonthRevenue = thisMonthBookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + b.price_total, 0);

    const uniqueClients = new Set(allBookings.map((b) => b.client_id)).size;
    const pendingCount = allBookings.filter((b) => b.status === "pending").length;

    setStats({
      bookingsThisMonth: thisMonthBookings.length,
      revenueThisMonth: thisMonthRevenue,
      newClients: uniqueClients,
      avgRating: providerData.rating_avg ?? 0,
      ratingCount: providerData.rating_count ?? 0,
      pendingBookings: pendingCount,
    });

    // Build chart data (last 6 months)
    const chart: ChartDataPoint[] = [];
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthBookings = allBookings.filter(
        (b) =>
          b.created_at >= d.toISOString() &&
          b.created_at < nextD.toISOString() &&
          b.status !== "cancelled"
      );
      chart.push({
        label: months[d.getMonth()],
        revenue: monthBookings
          .filter((b) => b.payment_status === "paid")
          .reduce((sum, b) => sum + b.price_total, 0),
        bookings: monthBookings.length,
      });
    }
    setChartData(chart);
    setLoading(false);
  }

  async function handleConfirm(bookingId: string) {
    setActionLoading(true);
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b))
    );
    setActionLoading(false);
  }

  async function handleCancel(bookingId: string) {
    setActionLoading(true);
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
    setActionLoading(false);
  }

  const displayedBookings =
    activeTab === "pending"
      ? bookings.filter((b) => b.status === "pending")
      : bookings;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-36 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
          ))}
        </div>
        <div className="h-72 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-5">
        <span className="text-6xl">✂️</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Espace professionnel
        </h2>
        <p className="text-gray-500">
          Vous n&apos;avez pas encore de profil professionnel sur Petoo.
          Créez votre fiche gratuitement pour commencer à recevoir des réservations.
        </p>
        <Link
          href="/grooming/pro-dashboard/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-petoo-500 text-white rounded-2xl font-bold hover:bg-petoo-600 transition-colors"
        >
          <Scissors className="w-5 h-5" />
          Créer mon profil pro
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-petoo-500 via-lavender-500 to-teal-500 p-7 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-8 top-4 text-8xl">✂️</div>
          <div className="absolute bottom-4 right-28 text-5xl">🐩</div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Espace pro · Toiletteur</p>
            <h1 className="text-3xl font-extrabold mt-1">{provider.business_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-white/80 text-sm">
              {provider.is_verified && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Vérifié Petoo
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                {provider.rating_avg.toFixed(1)} ({provider.rating_count} avis)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats && stats.pendingBookings > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
                <p className="text-3xl font-extrabold">{stats.pendingBookings}</p>
                <p className="text-white/80 text-xs mt-0.5">demandes en attente</p>
              </div>
            )}
            <button
              onClick={loadData}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Réservations ce mois"
            value={stats.bookingsThisMonth}
            sub="réservations confirmées"
            gradient="bg-petoo-500"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            icon={TrendingUp}
            label="Revenus ce mois"
            value={formatCurrency(stats.revenueThisMonth)}
            sub="après commission Petoo"
            gradient="bg-teal-500"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            icon={Users}
            label="Clients totaux"
            value={stats.newClients}
            sub="clients uniques"
            gradient="bg-lavender-500"
          />
          <StatCard
            icon={Star}
            label="Note moyenne"
            value={`${stats.avgRating.toFixed(1)} ⭐`}
            sub={`${stats.ratingCount} avis`}
            gradient="bg-sunshine-400"
          />
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <BookingsBarChart data={chartData} />
        </div>
      )}

      {/* Booking requests */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📋 Réservations</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Gérez vos demandes et réservations
            </p>
          </div>
          {/* Tab switcher */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            {[
              { id: "pending" as const, label: "En attente" },
              { id: "all" as const, label: "Toutes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
                {tab.id === "pending" && stats && stats.pendingBookings > 0 && (
                  <span className="ml-1.5 bg-petoo-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {displayedBookings.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📭</span>
              <p className="mt-3 text-gray-500 font-medium">
                {activeTab === "pending"
                  ? "Aucune demande en attente"
                  : "Aucune réservation"}
              </p>
            </div>
          ) : (
            displayedBookings.slice(0, 10).map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                loading={actionLoading}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Accès rapides</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-petoo-200 hover:shadow-md transition-all"
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", link.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{link.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {link.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-petoo-400 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pro tip */}
      <div className="bg-gradient-to-r from-sunshine-100 to-orange-50 rounded-3xl border border-yellow-200 p-5 flex items-start gap-4">
        <span className="text-3xl shrink-0">💡</span>
        <div>
          <p className="font-bold text-gray-900">Conseil pro</p>
          <p className="text-sm text-gray-600 mt-1">
            Les toiletteurs avec des photos de portfolio reçoivent{" "}
            <span className="font-semibold text-petoo-500">3x plus de réservations</span>.
            Ajoutez vos meilleures photos avant/après pour attirer plus de clients !
          </p>
          <Link
            href="/grooming/pro-dashboard/portfolio"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-petoo-500 hover:text-petoo-600 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Mettre à jour mon portfolio
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
