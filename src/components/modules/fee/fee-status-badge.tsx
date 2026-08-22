"use client";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "বকেয়া",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PARTIAL: {
    label: "আংশিক",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PAID: {
    label: "পরিশোধিত",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  WAIVED: {
    label: "মওকুফ",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  OVERDUE: {
    label: "মেয়াদোত্তীর্ণ",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function FeeStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all ${config.className}`}
    >
      {config.label}
    </span>
  );
}