/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquareText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { FeeDashboardSummary } from "@/service/fees/fee.service";

interface Props {
  data: FeeDashboardSummary;
}

const monthNamesBn = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const formatMonth = (month: number, year: number) =>
  `${monthNamesBn[month - 1]} ${year}`;

const formatTk = (amount: number) =>
  `৳ ${amount.toLocaleString("en-BD")}`;

export function FeeStatsCards({ data }: Props) {
  const { current, previous, comparison, topDefaulters, smsHealth } = data;

  const isUp = comparison.collectedChange >= 0;

  const chartData = current.byFeeType.map((t) => ({
    name: t.feeTypeName,
    আদায়: t.collected,
    বকেয়া: Math.max(t.payable - t.collected, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Month label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700/70">
            চলতি মাসের সারসংক্ষেপ
          </p>
          <h2 className="text-lg font-bold text-slate-800">
            {formatMonth(current.month, current.year)}
          </h2>
        </div>
        <div className="text-right text-xs text-slate-400">
          পূর্ববর্তী: {formatMonth(previous.month, previous.year)}
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Collected */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isUp
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {comparison.collectedChangePercentage !== null
                ? `${Math.abs(comparison.collectedChangePercentage)}%`
                : "—"}
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">
            {formatTk(current.totalCollected)}
          </p>
          <p className="text-xs text-slate-500">এই মাসে আদায়কৃত</p>
          <p className="mt-1 text-[11px] text-slate-400">
            গত মাসে {formatTk(previous.totalCollected)}
          </p>
        </motion.div>

        {/* Total Due */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
              {current.collectionPercentage}% আদায়
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">
            {formatTk(current.totalDue)}
          </p>
          <p className="text-xs text-slate-500">মোট বকেয়া</p>
          <p className="mt-1 text-[11px] text-slate-400">
            প্রাপ্য {formatTk(current.totalPayable)}
          </p>
        </motion.div>

        {/* Paid Students */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                comparison.paidCountChange >= 0
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {comparison.paidCountChange >= 0 ? "+" : ""}
              {comparison.paidCountChange} জন
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">
            {current.paidCount}
            <span className="ml-1 text-sm font-normal text-slate-400">
              / {current.totalStudents}
            </span>
          </p>
          <p className="text-xs text-slate-500">সম্পূর্ণ পরিশোধ করেছেন</p>
          <p className="mt-1 text-[11px] text-slate-400">
            আংশিক {current.partialCount} জন
          </p>
        </motion.div>

        {/* Unpaid Students */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">
            {current.unpaidCount}
          </p>
          <p className="text-xs text-slate-500">এখনও পরিশোধ করেননি</p>
          <p className="mt-1 text-[11px] text-slate-400">
            গত মাসে {previous.unpaidCount} জন ছিল
          </p>
        </motion.div>
      </div>

      {/* Chart + Defaulters row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Bar chart — collected vs due by fee type */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-1 text-sm font-semibold text-slate-700">
            ফি টাইপ অনুযায়ী আদায় ও বকেয়া
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            {formatMonth(current.month, current.year)}
          </p>
          {chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              এই মাসে কোনো ফি রেকর্ড নেই
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => formatTk(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="আদায়" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="বকেয়া" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* SMS Health */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">
              SMS পাঠানোর অবস্থা (এই মাস)
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">
                পেমেন্ট SMS
              </p>
              <div className="flex gap-1.5">
                <SmsBadge
                  label="পৌঁছেছে"
                  count={
                    smsHealth.FEE_PAYMENT.SENT +
                    smsHealth.FEE_PAYMENT.DELIVERED
                  }
                  tone="success"
                />
                <SmsBadge
                  label="পেন্ডিং"
                  count={smsHealth.FEE_PAYMENT.PENDING}
                  tone="neutral"
                />
                <SmsBadge
                  label="ব্যর্থ"
                  count={smsHealth.FEE_PAYMENT.FAILED}
                  tone="danger"
                />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">
                বকেয়া রিমাইন্ডার SMS
              </p>
              <div className="flex gap-1.5">
                <SmsBadge
                  label="পৌঁছেছে"
                  count={
                    smsHealth.FEE_DUE.SENT + smsHealth.FEE_DUE.DELIVERED
                  }
                  tone="success"
                />
                <SmsBadge
                  label="পেন্ডিং"
                  count={smsHealth.FEE_DUE.PENDING}
                  tone="neutral"
                />
                <SmsBadge
                  label="ব্যর্থ"
                  count={smsHealth.FEE_DUE.FAILED}
                  tone="danger"
                />
              </div>
            </div>
            {(smsHealth.FEE_PAYMENT.FAILED > 0 ||
              smsHealth.FEE_DUE.FAILED > 0) && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-600">
                কিছু SMS পাঠাতে ব্যর্থ হয়েছে — SMS প্রোভাইডার সেটিংস পরীক্ষা করুন।
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Defaulters */}
      {topDefaulters.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-700">
              সবচেয়ে বেশি বকেয়া থাকা শিক্ষার্থী
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/60 text-xs text-slate-500">
                  <th className="px-5 py-2.5 font-medium">শিক্ষার্থী</th>
                  <th className="px-5 py-2.5 font-medium">ক্লাস</th>
                  <th className="px-5 py-2.5 font-medium">ফি টাইপ</th>
                  <th className="px-5 py-2.5 font-medium">বকেয়া</th>
                  <th className="px-5 py-2.5 font-medium">নির্ধারিত তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {topDefaulters.map((d) => (
                  <tr
                    key={d.studentFeeId}
                    className="border-b border-slate-50 last:border-0 hover:bg-rose-50/30"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">
                        {d.studentName}
                      </div>
                      <div className="text-xs text-slate-400">
                        রোল: {d.rollNumber}
                        {d.phone ? ` · ${d.phone}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {d.className} – {d.sectionName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {d.feeTypeName}
                      {d.month && d.year ? (
                        <span className="ml-1 text-xs text-slate-400">
                          ({d.month}/{d.year})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 font-semibold text-rose-600">
                      {formatTk(d.due)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {d.dueDate
                        ? new Date(d.dueDate).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SmsBadge({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "success" | "neutral" | "danger";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-100 text-slate-600",
    danger: "bg-rose-50 text-rose-600",
  }[tone];

  return (
    <div className={`flex-1 rounded-lg px-2.5 py-2 text-center ${styles}`}>
      <div className="text-sm font-bold">{count}</div>
      <div className="text-[10px] font-medium opacity-80">{label}</div>
    </div>
  );
}