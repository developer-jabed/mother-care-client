/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CalendarPlus } from "lucide-react";
import { generateMonthlyFees } from "@/service/fees/fee.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  classes: { id: number; name: string }[];
  feeTypes: any[];
  currentAcademicYear: { id: number; title: string } | null;
}

const MONTH_OPTIONS = [
  { value: 1, label: "জানুয়ারি" },
  { value: 2, label: "ফেব্রুয়ারি" },
  { value: 3, label: "মার্চ" },
  { value: 4, label: "এপ্রিল" },
  { value: 5, label: "মে" },
  { value: 6, label: "জুন" },
  { value: 7, label: "জুলাই" },
  { value: 8, label: "আগস্ট" },
  { value: 9, label: "সেপ্টেম্বর" },
  { value: 10, label: "অক্টোবর" },
  { value: 11, label: "নভেম্বর" },
  { value: 12, label: "ডিসেম্বর" },
];

export function GenerateMonthlyDialog({
  open,
  onClose,
  classes,
  currentAcademicYear,
}: Props) {
  const [state, action, isPending] = useActionState(generateMonthlyFees, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "ফি জেনারেট হয়েছে");
      formRef.current?.reset();
      onClose();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <CalendarPlus className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    মাসিক ফি জেনারেট
                  </h3>
                  <p className="text-xs text-slate-500">
                    ক্লাসের সব সক্রিয় শিক্ষার্থীর জন্য
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={action} className="space-y-4 p-6">
              {/* Academic Year — auto from current */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  শিক্ষাবর্ষ
                </label>
                {currentAcademicYear ? (
                  <>
                    <input
                      type="hidden"
                      name="academicYearId"
                      value={currentAcademicYear.id}
                    />
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700">
                      {currentAcademicYear.title}
                    </div>
                  </>
                ) : (
                  <input
                    name="academicYearId"
                    type="number"
                    required
                    placeholder="Academic Year ID"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  ক্লাস
                </label>
                <select
                  name="classId"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">সিলেক্ট করুন</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    মাস
                  </label>
                  <select
                    name="month"
                    required
                    defaultValue={currentMonth}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    বছর
                  </label>
                  <input
                    name="year"
                    type="number"
                    required
                    defaultValue={currentYear}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  শেষ তারিখ (ঐচ্ছিক)
                </label>
                <input
                  name="dueDate"
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !currentAcademicYear}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    জেনারেট হচ্ছে...
                  </>
                ) : (
                  "ফি জেনারেট করুন"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}