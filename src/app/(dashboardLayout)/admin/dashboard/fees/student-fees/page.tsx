/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getStudentFees,
  getAllFeeTypes,
  getFeeDashboard,
} from "@/service/fees/fee.service";
import {
  getClasses,
  getCurrentAcademicYear,
} from "@/service/academic/createAcademicYear.service"; // path ঠিক রাখো
import { Wallet } from "lucide-react";
import { StudentFeesClient } from "@/components/modules/fee/student-fees/student-fees-client";


export const dynamic = "force-dynamic";


interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function StudentFeesPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = {
    searchTerm: params.searchTerm,
    classId: params.classId ? Number(params.classId) : undefined,
    sectionId: params.sectionId ? Number(params.sectionId) : undefined,
    feeTypeId: params.feeTypeId ? Number(params.feeTypeId) : undefined,
    status: params.status,
    month: params.month ? Number(params.month) : undefined,
    year: params.year ? Number(params.year) : undefined,
    page: params.page ? Number(params.page) : 1,
    limit: 20,
  };

  // Dashboard stats intentionally only take classId — search/status/month/year
  // from the table filters must never narrow the summary cards.
  const dashboardFilters = {
    classId: filters.classId,
  };

  const [feesResult, feeTypesResult, classes, dashboard, currentYearResult] =
    await Promise.all([
      getStudentFees(filters),
      getAllFeeTypes(),
      getClasses(),
      getFeeDashboard(dashboardFilters),
      getCurrentAcademicYear(),
    ]);

  const feeTypes = Array.isArray(feeTypesResult)
    ? feeTypesResult
    : feeTypesResult?.data ?? [];

  const classOptions = (classes || []).map((c: any) => ({
    value: String(c.id),
    label: c.name,
  }));

  const feeTypeOptions = feeTypes.map((t: any) => ({
    value: String(t.id),
    label: t.displayName,
  }));

  const currentAcademicYear = currentYearResult?.data ?? null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              স্টুডেন্ট ফি
            </h1>
            <p className="text-sm text-slate-500">
              ফি জেনারেট, পেমেন্ট ও বকেয়া ম্যানেজ করুন
              {currentAcademicYear?.title
                ? ` · ${currentAcademicYear.title}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      <StudentFeesClient
        fees={feesResult.data || []}
        meta={feesResult.meta}
        classOptions={classOptions}
        feeTypeOptions={feeTypeOptions}
        classes={classes || []}
        feeTypes={feeTypes}
        currentAcademicYear={currentAcademicYear}
      />
    </div>
  );
}