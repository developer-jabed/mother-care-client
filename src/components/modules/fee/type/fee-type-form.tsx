"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { createFeeType } from "@/service/fees/fee.service";
import { toast } from "sonner";

export function FeeTypeForm() {
  const [state, action, isPending] = useActionState(createFeeType, null);
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
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Plus className="h-4 w-4 text-violet-500" />
        নতুন ফি টাইপ
      </h2>

      <form ref={formRef} action={action} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            কোড নাম (English)
          </label>
          <input
            name="name"
            required
            placeholder="TUITION"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            প্রদর্শনী নাম
          </label>
          <input
            name="displayName"
            required
            placeholder="মাসিক বেতন"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            ফ্রিকোয়েন্সি
          </label>
          <select
            name="frequency"
            defaultValue="MONTHLY"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          >
            <option value="MONTHLY">মাসিক</option>
            <option value="YEARLY">বার্ষিক</option>
            <option value="ONE_TIME">এককালীন</option>
            <option value="PER_EXAM">প্রতি পরীক্ষা</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-purple-700 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              যোগ করুন
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}