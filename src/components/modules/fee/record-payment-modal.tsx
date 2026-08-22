"use client";

import { useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Banknote, Loader2 } from "lucide-react";

import { toast } from "sonner"; // বা তোমার toast lib
import { recordFeePayment, StudentFee } from "@/service/fees/fee.service";

interface Props {
  fee: StudentFee | null;
  open: boolean;
  onClose: () => void;
}

export function RecordPaymentModal({ fee, open, onClose }: Props) {
  const [state, action, isPending] = useActionState(recordFeePayment, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onClose();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  if (!fee) return null;

  const remaining = fee.payableAmount - fee.paidAmount;

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
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <Banknote className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    পেমেন্ট রেকর্ড
                  </h3>
                  <p className="text-xs text-slate-500">
                    {fee.enrollment?.student.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form action={action} className="space-y-4 p-6">
              <input type="hidden" name="studentFeeId" value={fee.id} />

              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">ফি</span>
                  <span className="font-medium">
                    {fee.feeType?.displayName}
                    {fee.month ? ` (${fee.month}/${fee.year})` : ""}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-slate-500">বাকি</span>
                  <span className="font-bold text-rose-600">
                    ৳ {remaining.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  পরিমাণ (৳)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={remaining}
                  required
                  defaultValue={remaining}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  name="remarks"
                  type="text"
                  placeholder="ক্যাশ / অন্যান্য"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    প্রসেসিং...
                  </>
                ) : (
                  "পেমেন্ট নিশ্চিত করুন"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}