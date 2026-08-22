"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LayoutGrid } from "lucide-react";

interface Props {
  classes: { value: string; label: string }[];
}

export function DashboardClassFilter({ classes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentClassId = searchParams.get("dashboardClassId") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("dashboardClassId", value);
    } else {
      params.delete("dashboardClassId");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <LayoutGrid className="h-4 w-4 text-slate-400" />
      <select
        value={currentClassId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
      >
        <option value="">সব ক্লাস (সম্পূর্ণ স্কুল)</option>
        {classes.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}