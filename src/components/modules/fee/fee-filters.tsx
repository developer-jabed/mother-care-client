"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useRef, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  classes?: FilterOption[];
  feeTypes?: FilterOption[];
  showStatus?: boolean;
  showMonthYear?: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "সব স্ট্যাটাস" },
  { value: "PENDING", label: "বকেয়া" },
  { value: "PARTIAL", label: "আংশিক" },
  { value: "PAID", label: "পরিশোধিত" },
  { value: "OVERDUE", label: "মেয়াদোত্তীর্ণ" },
  { value: "WAIVED", label: "মওকুফ" },
];

const MONTHS = [
  { value: "", label: "সব মাস" },
  { value: "1", label: "জানুয়ারি" },
  { value: "2", label: "ফেব্রুয়ারি" },
  { value: "3", label: "মার্চ" },
  { value: "4", label: "এপ্রিল" },
  { value: "5", label: "মে" },
  { value: "6", label: "জুন" },
  { value: "7", label: "জুলাই" },
  { value: "8", label: "আগস্ট" },
  { value: "9", label: "সেপ্টেম্বর" },
  { value: "10", label: "অক্টোবর" },
  { value: "11", label: "নভেম্বর" },
  { value: "12", label: "ডিসেম্বর" },
];

export function FeeFilters({
  classes = [],
  feeTypes = [],
  showStatus = true,
  showMonthYear = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const onSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam("searchTerm", value);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter className="h-4 w-4 text-indigo-500" />
        ফিল্টার
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 transition hover:bg-rose-50"
          >
            <X className="h-3.5 w-3.5" />
            মুছুন
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নাম / ভর্তি নং খুঁজুন..."
            defaultValue={searchParams.get("searchTerm") || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Class */}
        {classes.length > 0 && (
          <select
            value={searchParams.get("classId") || ""}
            onChange={(e) => updateParam("classId", e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">সব ক্লাস</option>
            {classes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        {/* Fee Type */}
        {feeTypes.length > 0 && (
          <select
            value={searchParams.get("feeTypeId") || ""}
            onChange={(e) => updateParam("feeTypeId", e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">সব ফি টাইপ</option>
            {feeTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        )}

        {/* Status */}
        {showStatus && (
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        {/* Month */}
        {showMonthYear && (
          <select
            value={searchParams.get("month") || ""}
            onChange={(e) => updateParam("month", e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}