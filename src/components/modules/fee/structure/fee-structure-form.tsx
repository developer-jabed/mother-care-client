"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { createFeeStructure } from "@/service/fees/fee.service";
import type { FeeType } from "@/service/fees/fee.service";
import { toast } from "sonner";

interface Option {
  id: number;
  title?: string;
  name?: string;
}

interface Props {
  feeTypes: FeeType[];
  academicYears: Option[];
  classes: Option[];
}

export function FeeStructureForm({
  feeTypes,
  academicYears,
  classes,
}: Props) {
  const [state, action, isPending] = useActionState(createFeeStructure, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Plus className="h-4 w-4 text-teal-500" />
        নতুন ফি স্ট্রাকচার
      </h2>

      <form ref={formRef} action={action} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            ফি টাইপ
          </label>
          <select
            name="feeTypeId"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
          >
            <option value="">সিলেক্ট করুন</option>
            {feeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName} ({t.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            শিক্ষাবর্ষ
          </label>
          <select
            name="academicYearId"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
          >
            <option value="">সিলেক্ট করুন</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            ক্লাস
          </label>
          <select
            name="classId"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
          >
            <option value="">সিলেক্ট করুন</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            পরিমাণ (৳)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="1500"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              স্ট্রাকচার যোগ করুন
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}