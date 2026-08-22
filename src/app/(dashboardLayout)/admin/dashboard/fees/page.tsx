import {
  getFeeDashboard,
  getStudentFees,
  getAllFeeTypes,
} from "@/service/fees/fee.service";
import { FeeStatsCards } from "@/components/modules/fee/fee-stats-cards";
import { DashboardClassFilter } from "@/components/modules/fee/DashboardClassFilter";
import { Wallet } from "lucide-react";
import { getClasses } from "@/service/academic/createAcademicYear.service";

export const revalidate = 300;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function FeesDashboardPage({ searchParams }: Props) {
  const params = await searchParams;

  // Filters for the paginated table — respects search/status/etc from the UI
  const tableFilters = {
    searchTerm: params.searchTerm,
    classId: params.classId ? Number(params.classId) : undefined,
    feeTypeId: params.feeTypeId ? Number(params.feeTypeId) : undefined,
    status: params.status,
    month: params.month ? Number(params.month) : undefined,
    year: params.year ? Number(params.year) : undefined,
    page: params.page ? Number(params.page) : 1,
    limit: 20,
  };

  // Dashboard stats — independent scope, only responds to its own class filter
  const dashboardFilters = {
    classId: params.dashboardClassId
      ? Number(params.dashboardClassId)
      : undefined,
  };

  const [dashboard, feesResult, feeTypesResult, classes] = await Promise.all([
    getFeeDashboard(dashboardFilters),
    getStudentFees(tableFilters),
    getAllFeeTypes(),
    getClasses(),
  ]);

  const feeTypeOptions =
    feeTypesResult.data?.map((t) => ({
      value: String(t.id),
      label: t.displayName,
    })) || [];

  const classOptions = (classes || []).map(
    (c: { id: number; name: string }) => ({
      value: String(c.id),
      label: c.name,
    })
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              ফি ব্যবস্থাপনা
            </h1>
            <p className="text-sm text-slate-500">
              আদায়, বকেয়া ও পেমেন্ট ট্র্যাক করুন
            </p>
          </div>
        </div>

        {classOptions.length > 0 && (
          <DashboardClassFilter classes={classOptions} />
        )}
      </div>

      {/* Stats — scoped by dashboardClassId only, independent of table filters */}
      {dashboard.data ? (
        <FeeStatsCards data={dashboard.data} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
          {dashboard.message || "ড্যাশবোর্ড তথ্য পাওয়া যায়নি"}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          বিস্তারিত তালিকা
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>


 
    
    </div>
  );
}