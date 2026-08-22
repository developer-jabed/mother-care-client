"use client";

import { motion } from "framer-motion";
import type { FeeType } from "@/service/fees/fee.service";

const frequencyLabel: Record<string, string> = {
  MONTHLY: "মাসিক",
  YEARLY: "বার্ষিক",
  ONE_TIME: "এককালীন",
  PER_EXAM: "প্রতি পরীক্ষা",
};

export function FeeTypeList({ types }: { types: FeeType[] }) {
  if (types.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
        <p className="text-sm text-slate-400">কোনো ফি টাইপ নেই</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="px-4 py-3 font-semibold text-slate-600">#</th>
            <th className="px-4 py-3 font-semibold text-slate-600">কোড</th>
            <th className="px-4 py-3 font-semibold text-slate-600">
              প্রদর্শনী নাম
            </th>
            <th className="px-4 py-3 font-semibold text-slate-600">
              ফ্রিকোয়েন্সি
            </th>
            <th className="px-4 py-3 font-semibold text-slate-600">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t, i) => (
            <motion.tr
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="border-b border-slate-50 transition hover:bg-violet-50/40"
            >
              <td className="px-4 py-3 text-slate-400">{i + 1}</td>
              <td className="px-4 py-3">
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  {t.name}
                </code>
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {t.displayName}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {frequencyLabel[t.frequency] || t.frequency}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    t.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {t.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}