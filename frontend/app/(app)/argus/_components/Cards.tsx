"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type VerdictCardData = { label: string; value: string; detail?: string };
export type TableCardData = { title: string; columns: string[]; rows: string[][] };
export type ChartCardData = { title: string; points: { label: string; value: number }[] };

export type ArgusCardModel =
  | { type: "verdict"; data: VerdictCardData }
  | { type: "table"; data: TableCardData }
  | { type: "chart"; data: ChartCardData };

export function ArgusCard({ card }: { card: ArgusCardModel }) {
  if (card.type === "verdict") return <VerdictCard data={card.data} />;
  if (card.type === "table") return <TableCard data={card.data} />;
  return <ChartCard data={card.data} />;
}

function VerdictCard({ data }: { data: VerdictCardData }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{data.label}</p>
      <p className="text-2xl font-bold text-white">{data.value}</p>
      {data.detail && <p className="text-xs text-gray-500 mt-1.5">{data.detail}</p>}
    </div>
  );
}

function TableCard({ data }: { data: TableCardData }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <p className="text-xs text-gray-500 uppercase tracking-wider px-5 pt-4 pb-2">
        {data.title}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-gray-800">
            {data.columns.map((col) => (
              <th
                key={col}
                className="text-left text-xs font-medium text-gray-500 px-5 py-2"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-gray-800/60">
              {row.map((cell, ci) => (
                <td key={ci} className="px-5 py-2 text-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartCard({ data }: { data: ChartCardData }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{data.title}</p>
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data.points}>
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill="rgb(255, 103, 0)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
