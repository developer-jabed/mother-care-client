"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CreditCard, FileDown, Eye } from "lucide-react";
import { FeeStatusBadge } from "./fee-status-badge";
import { RecordPaymentModal } from "./record-payment-modal";
import { StudentFee } from "@/service/fees/fee.service";

interface Props {
  fees: StudentFee[];
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export function StudentFeeTable({ fees }: Props) {
  const [selected, setSelected] = useState<StudentFee | null>(null);
  const [open, setOpen] = useState(false);

  const handlePay = (fee: StudentFee) => {
    setSelected(fee);
    setOpen(true);
  };

  if (fees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
        <p className="text-slate-400">কোনো ফি পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 font-semibold text-slate-600">
                  শিক্ষার্থী
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  ক্লাস
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">ফি</th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  প্রাপ্য
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  পরিশোধিত
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  স্ট্যাটাস
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, i) => (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 transition hover:bg-indigo-50/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {fee.enrollment?.student.fullName}
                    </div>
                    <div className="text-xs text-slate-400">
                      রোল: {fee.enrollment?.rollNumber} ·{" "}
                      {fee.enrollment?.student.admissionNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {fee.enrollment?.class.name} –{" "}
                    {fee.enrollment?.section.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700">
                      {fee.feeType?.displayName}
                    </div>
                    {fee.month && (
                      <div className="text-xs text-slate-400">
                        {fee.month}/{fee.year}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    ৳ {fee.payableAmount.toLocaleString("en-BD")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    ৳ {fee.paidAmount.toLocaleString("en-BD")}
                  </td>
                  <td className="px-4 py-3">
                    <FeeStatusBadge status={fee.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {fee.enrollment?.id && (
                        <Link
                          href={`/admin/dashboard/fees/student-fees/${fee.enrollment.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          দেখুন
                        </Link>
                      )}
                      {fee.status !== "PAID" &&
                        fee.status !== "WAIVED" && (
                          <button
                            onClick={() => handlePay(fee)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            পেমেন্ট
                          </button>
                        )}
                      {fee.payments && fee.payments.length > 0 && API_URL && (
                        <a
                          href={`${API_URL}/fees/payment/${fee.payments[0].id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          <FileDown className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal
        fee={selected}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}