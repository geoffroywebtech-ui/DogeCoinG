"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDate, formatRelative, getReminderTypeColor, getReminderTypeLabel } from "@/lib/utils";
import type { Pet, HealthRecord, WeightLog, Reminder, PetMedia } from "@/types";
import { PetWeightChart } from "./weight-chart";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const healthTypeConfig: Record<string, { emoji: string; bgBorder: string; textColor: string }> = {
  vaccine: { emoji: "💉", bgBorder: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
  deworming: { emoji: "🪱", bgBorder: "bg-green-50 border-green-200", textColor: "text-green-700" },
  checkup: { emoji: "🩺", bgBorder: "bg-teal-50 border-teal-200", textColor: "text-teal-700" },
  surgery: { emoji: "🔪", bgBorder: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
  medication: { emoji: "💊", bgBorder: "bg-petoo-50 border-petoo-200", textColor: "text-petoo-600" },
  other: { emoji: "📋", bgBorder: "bg-gray-50 border-gray-200", textColor: "text-gray-700" },
};

const TABS = [
  { id: "health", label: "Santé", emoji: "🩺" },
  { id: "weight", label: "Poids", emoji: "⚖️" },
  { id: "photos", label: "Photos", emoji: "📸" },
  { id: "reminders", label: "Rappels", emoji: "🔔" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface PetTabsClientProps {
  pet: Pet;
  healthRecords: HealthRecord[];
  weightLogs: WeightLog[];
  upcomingReminders: Reminder[];
  completedReminders: Reminder[];
  media: PetMedia[];
  petId: string;
}

export function PetTabsClient({
  pet,
  healthRecords,
  weightLogs,
  upcomingReminders,
  completedReminders,
  media,
  petId,
}: PetTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("health");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [localReminders, setLocalReminders] = useState<Reminder[]>([
    ...upcomingReminders,
    ...completedReminders,
  ]);
  const router = useRouter();

  async function handleCompleteReminder(reminder: Reminder) {
    setCompletingId(reminder.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("reminders")
      .update({ is_completed: !reminder.is_completed })
      .eq("id", reminder.id);
    if (!error) {
      setLocalReminders((prev: Reminder[]) =>
        prev.map((r: Reminder) =>
          r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r
        )
      );
      router.refresh();
    }
    setCompletingId(null);
  }

  const activeReminders = localReminders.filter((r: Reminder) => !r.is_completed);
  const doneReminders = localReminders.filter((r: Reminder) => r.is_completed);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px flex-1 justify-center",
              activeTab === tab.id
                ? "border-petoo-500 text-petoo-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="p-6"
        >
          {/* ── Santé ── */}
          {activeTab === "health" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">
                  Dossier santé 🩺
                </h2>
                <Link
                  href={`/pets/${petId}/health/new`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-petoo-500 bg-petoo-50 hover:bg-petoo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </Link>
              </div>

              {healthRecords.length === 0 ? (
                <EmptyState
                  emoji="🩺"
                  title="Aucun soin enregistré"
                  desc="Ajoutez les vaccins, vermifuges et visites vétérinaires de votre animal."
                />
              ) : (
                <div className="space-y-3">
                  {healthRecords.map((record) => {
                    const cfg = healthTypeConfig[record.type] ?? healthTypeConfig.other;
                    return (
                      <div
                        key={record.id}
                        className={cn(
                          "flex gap-4 p-4 rounded-2xl border",
                          cfg.bgBorder
                        )}
                      >
                        <div className="text-2xl flex-shrink-0 mt-0.5">
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className={cn("font-semibold text-sm", cfg.textColor)}>
                                {record.title}
                              </p>
                              {record.vet_name && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Dr {record.vet_name}
                                  {record.clinic_name && ` · ${record.clinic_name}`}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {formatDate(record.date)}
                              </span>
                              {record.cost !== null && (
                                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                  {record.cost.toFixed(2)} €
                                </p>
                              )}
                            </div>
                          </div>
                          {record.description && (
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                              {record.description}
                            </p>
                          )}
                          {record.next_due_date && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-sunshine-100 px-2 py-1 rounded-lg w-fit">
                              <Clock className="w-3 h-3" />
                              Prochain : {formatDate(record.next_due_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Poids ── */}
          {activeTab === "weight" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">
                  Suivi du poids ⚖️
                </h2>
                <Link
                  href={`/pets/${petId}/weight/new`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-petoo-500 bg-petoo-50 hover:bg-petoo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Peser
                </Link>
              </div>
              <PetWeightChart
                weightLogs={weightLogs}
                currentWeight={pet.weight_kg}
              />
            </div>
          )}

          {/* ── Photos ── */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">
                  Galerie photos 📸
                </h2>
                <Link
                  href={`/pets/${petId}/media/new`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-petoo-500 bg-petoo-50 hover:bg-petoo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </Link>
              </div>

              {media.length === 0 ? (
                <EmptyState
                  emoji="📸"
                  title="Aucune photo encore"
                  desc="Capturez les plus beaux moments de votre compagnon !"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {item.type === "photo" ? (
                        <img
                          src={item.url}
                          alt={item.caption ?? pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <span className="text-4xl">▶️</span>
                        </div>
                      )}
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Rappels ── */}
          {activeTab === "reminders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">
                  Rappels 🔔
                </h2>
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-petoo-500 bg-petoo-50 hover:bg-petoo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Gérer
                </Link>
              </div>

              {activeReminders.length === 0 && doneReminders.length === 0 ? (
                <EmptyState
                  emoji="🔔"
                  title="Aucun rappel"
                  desc="Créez des rappels pour ne jamais oublier vaccins, médicaments ou visites vet."
                />
              ) : (
                <div className="space-y-3">
                  {/* Upcoming */}
                  {activeReminders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        À venir
                      </p>
                      <div className="space-y-2">
                        {activeReminders.map((reminder: Reminder) => (
                          <ReminderRow
                            key={reminder.id}
                            reminder={reminder}
                            onToggle={handleCompleteReminder}
                            completing={completingId === reminder.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Done */}
                  {doneReminders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                        Complétés
                      </p>
                      <div className="space-y-2 opacity-60">
                        {doneReminders.map((reminder: Reminder) => (
                          <ReminderRow
                            key={reminder.id}
                            reminder={reminder}
                            onToggle={handleCompleteReminder}
                            completing={completingId === reminder.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReminderRow({
  reminder,
  onToggle,
  completing,
}: {
  reminder: Reminder;
  onToggle: (r: Reminder) => Promise<void>;
  completing: boolean;
}) {
  const colorClass = getReminderTypeColor(reminder.type);
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        reminder.is_completed
          ? "bg-gray-50 border-gray-100"
          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
      )}
    >
      <button
        onClick={() => onToggle(reminder)}
        disabled={completing}
        className="flex-shrink-0 text-gray-400 hover:text-teal-500 transition-colors"
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        ) : reminder.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              colorClass
            )}
          >
            {getReminderTypeLabel(reminder.type)}
          </span>
          <p
            className={cn(
              "text-sm font-medium truncate",
              reminder.is_completed ? "line-through text-gray-400" : "text-gray-800"
            )}
          >
            {reminder.title}
          </p>
        </div>
        {reminder.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {reminder.description}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        <span className="text-xs text-gray-400">
          {formatRelative(reminder.due_date)}
        </span>
        {reminder.repeat_interval_days && (
          <p className="text-xs text-lavender-500 mt-0.5">
            🔄 /{reminder.repeat_interval_days}j
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="font-semibold text-gray-600">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{desc}</p>
    </div>
  );
}
