"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { WeightLog } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PetWeightChartProps {
  weightLogs: WeightLog[];
  currentWeight?: number | null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-lavender-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-bold text-lavender-600">{payload[0].value} kg</p>
    </div>
  );
}

export function PetWeightChart({ weightLogs, currentWeight }: PetWeightChartProps) {
  if (!weightLogs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <span className="text-5xl mb-4">⚖️</span>
        <p className="font-medium text-gray-500">Aucune pesée enregistrée</p>
        <p className="text-sm mt-1">Commencez à suivre le poids de votre animal</p>
      </div>
    );
  }

  const data = weightLogs.map((log) => ({
    date: format(new Date(log.recorded_at), "d MMM", { locale: fr }),
    weight: log.weight_kg,
    notes: log.notes,
  }));

  const weights = weightLogs.map((l) => l.weight_kg);
  const minW = Math.max(0, Math.min(...weights) - 1);
  const maxW = Math.max(...weights) + 1;

  const trend =
    data.length >= 2
      ? data[data.length - 1].weight - data[0].weight
      : null;

  return (
    <div className="space-y-4">
      {/* Trend indicator */}
      {trend !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Tendance :</span>
          <span
            className={
              trend > 0
                ? "text-petoo-500 font-semibold"
                : trend < 0
                ? "text-teal-500 font-semibold"
                : "text-gray-500"
            }
          >
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)} kg
            {trend > 0 ? " 📈" : trend < 0 ? " 📉" : " ➡️"}
          </span>
          <span className="text-gray-400 text-xs">sur toute la période</span>
        </div>
      )}

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minW, maxW]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            {currentWeight && (
              <ReferenceLine
                y={currentWeight}
                stroke="#a78bfa"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#7c3aed" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Log list */}
      <div className="divide-y divide-gray-50">
        {[...weightLogs]
          .sort(
            (a, b) =>
              new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          )
          .map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-sm font-bold text-lavender-600">
                  ⚖️
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    {log.weight_kg} kg
                  </span>
                  {log.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(log.recorded_at)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
