"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  Bell,
  CalendarDays,
  List,
  LayoutGrid,
} from "lucide-react";
import {
  cn,
  formatDate,
  formatRelative,
  getReminderTypeColor,
  getReminderTypeLabel,
  getSpeciesEmoji,
} from "@/lib/utils";
import type { Reminder, Pet } from "@/types";
import { AddReminderForm } from "@/components/pets/add-reminder-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  format,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_DOT_COLOR: Record<string, string> = {
  vaccine: "bg-blue-500",
  deworming: "bg-green-500",
  grooming: "bg-purple-500",
  medication: "bg-red-500",
  vet: "bg-orange-500",
  other: "bg-gray-400",
};

const TYPE_BADGE: Record<string, string> = {
  vaccine: "bg-blue-100 text-blue-700 border-blue-200",
  deworming: "bg-green-100 text-green-700 border-green-200",
  grooming: "bg-purple-100 text-purple-700 border-purple-200",
  medication: "bg-red-100 text-red-700 border-red-200",
  vet: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const TYPE_EMOJI: Record<string, string> = {
  vaccine: "💉",
  deworming: "🪱",
  grooming: "✂️",
  medication: "💊",
  vet: "🏥",
  other: "📋",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface CalendarClientProps {
  reminders: Reminder[];
  pets: Pet[];
}

export function CalendarClient({
  reminders: initialReminders,
  pets,
}: CalendarClientProps) {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Map date string → reminders
  const remindersByDate = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    reminders.forEach((r: Reminder) => {
      const key = r.due_date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [reminders]);

  // Upcoming sorted, with optional filter
  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((r: Reminder) => {
        if (filterType !== "all" && r.type !== filterType) return false;
        return true;
      })
      .sort(
        (a: Reminder, b: Reminder) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
  }, [reminders, filterType]);

  const pendingCount = reminders.filter((r: Reminder) => !r.is_completed).length;

  async function handleToggle(reminder: Reminder) {
    setCompletingId(reminder.id);
    const supabase = createClient();
    const newVal = !reminder.is_completed;
    const { error } = await supabase
      .from("reminders")
      .update({ is_completed: newVal })
      .eq("id", reminder.id);
    if (!error) {
      setReminders((prev: Reminder[]) =>
        prev.map((r: Reminder) =>
          r.id === reminder.id ? { ...r, is_completed: newVal } : r
        )
      );
      router.refresh();
    }
    setCompletingId(null);
  }

  function handleDayClick(day: Date) {
    setSelectedDay((prev: Date | null) => (prev && isSameDay(prev, day) ? null : day));
  }

  const selectedDayReminders = selectedDay
    ? remindersByDate.get(format(selectedDay, "yyyy-MM-dd")) ?? []
    : [];

  const petMap = useMemo(() => {
    const m = new Map<string, Pet>();
    pets.forEach((p) => m.set(p.id, p));
    return m;
  }, [pets]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>📅</span> Calendrier & Rappels
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pendingCount > 0
              ? `${pendingCount} rappel${pendingCount > 1 ? "s" : ""} en attente`
              : "Tous vos rappels sont à jour ✨"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === "calendar"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === "list"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Ajouter un rappel
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total rappels", value: reminders.length, emoji: "🔔", bg: "bg-petoo-50 border-petoo-100", text: "text-petoo-600" },
          { label: "En attente", value: reminders.filter((r: Reminder) => !r.is_completed).length, emoji: "⏳", bg: "bg-sunshine-100 border-sunshine-200", text: "text-amber-700" },
          { label: "Complétés", value: reminders.filter((r: Reminder) => r.is_completed).length, emoji: "✅", bg: "bg-mint-100 border-mint-200", text: "text-teal-700" },
          { label: "Ce mois", value: reminders.filter((r: Reminder) => r.due_date.startsWith(format(currentMonth, "yyyy-MM"))).length, emoji: "📆", bg: "bg-lavender-50 border-lavender-100", text: "text-lavender-600" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl border p-4 flex items-center gap-3", s.bg)}>
            <span className="text-2xl">{s.emoji}</span>
            <div>
              <p className={cn("text-xl font-bold", s.text)}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "calendar" ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Calendar grid */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => setCurrentMonth((m: Date) => subMonths(m, 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h2 className="text-lg font-bold text-gray-800 capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </h2>
                <button
                  onClick={() => setCurrentMonth((m: Date) => addMonths(m, 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-gray-400 py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day: Date) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayReminders = remindersByDate.get(key) ?? [];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const selected =
                    selectedDay !== null && isSameDay(day, selectedDay);
                  const pending = dayReminders.filter((r: Reminder) => !r.is_completed);
                  const done = dayReminders.filter((r: Reminder) => r.is_completed);

                  return (
                    <button
                      key={key}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "relative min-h-[52px] p-1 rounded-xl text-xs transition-all",
                        !isCurrentMonth && "opacity-30",
                        today &&
                          !selected &&
                          "bg-petoo-50 border border-petoo-200",
                        selected &&
                          "bg-petoo-500 text-white shadow-md",
                        !today &&
                          !selected &&
                          isCurrentMonth &&
                          "hover:bg-gray-50",
                        dayReminders.length > 0 && !selected && "ring-1 ring-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "block font-semibold mb-1",
                          today && !selected
                            ? "text-petoo-600"
                            : selected
                            ? "text-white"
                            : "text-gray-700"
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Dots */}
                      {dayReminders.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {pending.slice(0, 3).map((r: Reminder) => (
                            <span
                              key={r.id}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                selected
                                  ? "bg-white/80"
                                  : TYPE_DOT_COLOR[r.type] ?? "bg-gray-400"
                              )}
                            />
                          ))}
                          {done.length > 0 && (
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                selected ? "bg-white/40" : "bg-gray-300"
                              )}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                {Object.entries(TYPE_DOT_COLOR).map(([type, dotClass]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", dotClass)} />
                    <span className="text-xs text-gray-500">
                      {getReminderTypeLabel(type)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side panel: selected day or upcoming */}
            <div className="space-y-4">
              {selectedDay ? (
                <motion.div
                  key={format(selectedDay, "yyyy-MM-dd")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
                >
                  <h3 className="font-bold text-gray-800 mb-4 capitalize">
                    {format(selectedDay, "EEEE d MMMM", { locale: fr })}
                    {isToday(selectedDay) && (
                      <span className="ml-2 text-xs font-semibold text-petoo-500 bg-petoo-50 px-2 py-0.5 rounded-full">
                        Aujourd'hui
                      </span>
                    )}
                  </h3>

                  {selectedDayReminders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <span className="text-4xl block mb-2">🎉</span>
                      <p className="text-sm">Aucun rappel ce jour</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayReminders.map((r: Reminder) => (
                        <DayReminderCard
                          key={r.id}
                          reminder={r}
                          pet={petMap.get(r.pet_id)}
                          onToggle={handleToggle}
                          completing={completingId === r.id}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-gradient-to-br from-petoo-50 to-teal-50 rounded-3xl border border-petoo-100 p-5 text-center">
                  <span className="text-4xl block mb-2">👆</span>
                  <p className="text-sm font-medium text-gray-600">
                    Cliquez sur un jour pour voir ses rappels
                  </p>
                </div>
              )}

              {/* Upcoming reminders */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-petoo-500" />
                  Prochains rappels
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {reminders
                    .filter((r: Reminder) => !r.is_completed)
                    .sort(
                      (a: Reminder, b: Reminder) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                    )
                    .slice(0, 8)
                    .map((r: Reminder) => (
                      <MiniReminderCard
                        key={r.id}
                        reminder={r}
                        pet={petMap.get(r.pet_id)}
                        onToggle={handleToggle}
                        completing={completingId === r.id}
                      />
                    ))}
                  {reminders.filter((r: Reminder) => !r.is_completed).length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <span className="text-3xl block mb-2">✅</span>
                      <p className="text-sm">Tout est à jour !</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── List view ── */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Filter bar */}
            <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
              <FilterButton
                active={filterType === "all"}
                onClick={() => setFilterType("all")}
                emoji="🔔"
                label="Tous"
              />
              {(["vaccine", "deworming", "grooming", "medication", "vet", "other"] as const).map(
                (t) => (
                  <FilterButton
                    key={t}
                    active={filterType === t}
                    onClick={() => setFilterType(t)}
                    emoji={TYPE_EMOJI[t]}
                    label={getReminderTypeLabel(t)}
                  />
                )
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50">
              {upcomingReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-6xl mb-4">🎉</span>
                  <p className="text-lg font-semibold text-gray-700">
                    Aucun rappel
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ajoutez des rappels pour ne rien oublier !
                  </p>
                </div>
              ) : (
                upcomingReminders.map((reminder: Reminder, idx: number) => {
                  const pet = petMap.get(reminder.pet_id);
                  const prevReminder = upcomingReminders[idx - 1];
                  const showDateHeader =
                    idx === 0 ||
                    reminder.due_date.slice(0, 7) !==
                      prevReminder?.due_date.slice(0, 7);

                  return (
                    <div key={reminder.id}>
                      {showDateHeader && (
                        <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider capitalize">
                            {format(
                              parseISO(reminder.due_date),
                              "MMMM yyyy",
                              { locale: fr }
                            )}
                          </p>
                        </div>
                      )}
                      <FullReminderRow
                        reminder={reminder}
                        pet={pet}
                        onToggle={handleToggle}
                        completing={completingId === reminder.id}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add reminder form */}
      <AddReminderForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          setShowAddForm(false);
          router.refresh();
        }}
        pets={pets}
      />
    </div>
  );
}

/* ── Sub-components ── */

function FilterButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
        active
          ? "bg-petoo-500 text-white border-petoo-500 shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      )}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

function DayReminderCard({
  reminder,
  pet,
  onToggle,
  completing,
}: {
  reminder: Reminder;
  pet?: Pet;
  onToggle: (r: Reminder) => Promise<void>;
  completing: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        reminder.is_completed
          ? "bg-gray-50 border-gray-100 opacity-60"
          : "bg-white border-gray-100 hover:shadow-sm"
      )}
    >
      <button
        onClick={() => onToggle(reminder)}
        disabled={completing}
        className="flex-shrink-0"
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        ) : reminder.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 hover:text-teal-400" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-base">{TYPE_EMOJI[reminder.type] ?? "📋"}</span>
          <p
            className={cn(
              "text-sm font-semibold truncate",
              reminder.is_completed ? "line-through text-gray-400" : "text-gray-800"
            )}
          >
            {reminder.title}
          </p>
        </div>
        {pet && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>{getSpeciesEmoji(pet.species)}</span>
            {pet.name}
          </p>
        )}
      </div>
      <span
        className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-full border",
          TYPE_BADGE[reminder.type]
        )}
      >
        {getReminderTypeLabel(reminder.type)}
      </span>
    </div>
  );
}

function MiniReminderCard({
  reminder,
  pet,
  onToggle,
  completing,
}: {
  reminder: Reminder;
  pet?: Pet;
  onToggle: (r: Reminder) => Promise<void>;
  completing: boolean;
}) {
  const isOverdue =
    !reminder.is_completed && isPast(parseISO(reminder.due_date));

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all",
        isOverdue
          ? "bg-red-50 border-red-100"
          : "bg-gray-50 border-gray-100 hover:border-gray-200"
      )}
    >
      <button
        onClick={() => onToggle(reminder)}
        disabled={completing}
        className="flex-shrink-0"
      >
        {completing ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300 hover:text-teal-400" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate flex items-center gap-1">
          <span>{TYPE_EMOJI[reminder.type] ?? "📋"}</span>
          {reminder.title}
        </p>
        {pet && (
          <p className="text-gray-400">
            {getSpeciesEmoji(pet.species)} {pet.name}
          </p>
        )}
      </div>
      <p
        className={cn(
          "font-medium whitespace-nowrap",
          isOverdue ? "text-red-500" : "text-gray-400"
        )}
      >
        {formatRelative(reminder.due_date)}
      </p>
    </div>
  );
}

function FullReminderRow({
  reminder,
  pet,
  onToggle,
  completing,
}: {
  reminder: Reminder;
  pet?: Pet;
  onToggle: (r: Reminder) => Promise<void>;
  completing: boolean;
}) {
  const isOverdue =
    !reminder.is_completed && isPast(parseISO(reminder.due_date));

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-6 py-4 transition-all hover:bg-gray-50/50",
        reminder.is_completed && "opacity-60"
      )}
    >
      {/* Toggle */}
      <button
        onClick={() => onToggle(reminder)}
        disabled={completing}
        className="flex-shrink-0"
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        ) : reminder.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 hover:text-teal-400 transition-colors" />
        )}
      </button>

      {/* Type icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border",
          TYPE_BADGE[reminder.type]
        )}
      >
        {TYPE_EMOJI[reminder.type] ?? "📋"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              "font-semibold text-sm",
              reminder.is_completed
                ? "line-through text-gray-400"
                : "text-gray-800"
            )}
          >
            {reminder.title}
          </p>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full border",
              TYPE_BADGE[reminder.type]
            )}
          >
            {getReminderTypeLabel(reminder.type)}
          </span>
          {isOverdue && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              ⚠️ En retard
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          {pet && (
            <span className="flex items-center gap-1">
              {getSpeciesEmoji(pet.species)} {pet.name}
            </span>
          )}
          {reminder.description && (
            <span className="truncate max-w-xs">{reminder.description}</span>
          )}
          {reminder.repeat_interval_days && (
            <span className="text-lavender-500">
              🔄 Répète tous les {reminder.repeat_interval_days}j
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="flex-shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold",
            isOverdue ? "text-red-500" : "text-gray-700"
          )}
        >
          {formatDate(reminder.due_date)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatRelative(reminder.due_date)}
        </p>
      </div>
    </div>
  );
}
