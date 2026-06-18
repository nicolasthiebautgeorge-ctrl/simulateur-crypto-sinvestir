"use client";

import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "@/lib/simulation/types";
import { formatCurrency, formatDateLabel } from "@/lib/formatters";

interface PerformanceChartProps {
  data: TimelinePoint[];
  currency: string;
}

const AXIS_COLOR = "#9ca3af";

function compact(value: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function PerformanceChart({ data, currency }: PerformanceChartProps) {
  // Recharts mesure le conteneur côté client : on attend le montage pour éviter
  // les warnings de dimensions au rendu serveur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-72 w-full" aria-hidden />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0049c6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0049c6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(v) => compact(Number(v), currency)}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "#030c24",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#fff",
            }}
            labelFormatter={(label) => formatDateLabel(String(label))}
            formatter={(value, name) => [
              formatCurrency(Number(value), currency),
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
          <Area
            type="monotone"
            dataKey="value"
            name="Valeur du portefeuille"
            stroke="#0049c6"
            strokeWidth={2}
            fill="url(#valueFill)"
          />
          <Line
            type="monotone"
            dataKey="invested"
            name="Montant investi"
            stroke="#e4c031"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
