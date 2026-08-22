// app/admin/dashboard/fees/student-fees/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentEnrollmentById } from "@/service/studentEnrolled/StudentEnrolled.service";
import { FeeStatusBadge } from "@/components/modules/fee/fee-status-badge";



export const dynamic = "force-dynamic";


interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentFeeDetailPage({ params }: Props) {
  const { id } = await params;
  const enrollmentId = Number(id);

  if (!enrollmentId || isNaN(enrollmentId)) {
    notFound();
  }

  const { success, data: enrollment } = await getStudentEnrollmentById(
    enrollmentId
  );

  if (!success || !enrollment) {
    notFound();
  }

  const fees = enrollment.studentFees ?? [];

  const totalPayable = fees.reduce((sum, f) => sum + f.payableAmount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalDue = totalPayable - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard/fees/student-fees"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          ফিরে যান
        </Link>
      </div>

      {/* Student info card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {enrollment.student.fullName}
            </h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>ভর্তি নং: {enrollment.student.admissionNumber}</span>
              <span>রোল: {enrollment.rollNumber}</span>
              <span>
                ক্লাস: {enrollment.class.name} – {enrollment.section.name}
              </span>
              <span>শিক্ষাবর্ষ: {enrollment.academicYear.name}</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-medium text-slate-500">
              মোট প্রাপ্য
            </div>
            <div className="mt-1 text-xl font-bold text-slate-800">
              ৳ {totalPayable.toLocaleString("en-BD")}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="text-xs font-medium text-emerald-600">
              মোট পরিশোধিত
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-700">
              ৳ {totalPaid.toLocaleString("en-BD")}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 p-4">
            <div className="text-xs font-medium text-rose-600">
              মোট বকেয়া
            </div>
            <div className="mt-1 text-xl font-bold text-rose-700">
              ৳ {totalDue.toLocaleString("en-BD")}
            </div>
          </div>
        </div>
      </div>

      {/* Fees table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-800">ফি বিবরণ</h3>
        </div>

        {fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-slate-400">কোনো ফি পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    ফি ধরন
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    মাস/বছর
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    মূল পরিমাণ
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    ছাড়
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    জরিমানা
                  </th>
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
                    রশিদ
                  </th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="border-b border-slate-50 transition hover:bg-indigo-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {fee.feeType?.displayName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fee.month ? `${fee.month}/${fee.year}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ৳ {fee.amount.toLocaleString("en-BD")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ৳ {fee.discount.toLocaleString("en-BD")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ৳ {fee.fine.toLocaleString("en-BD")}
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
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}