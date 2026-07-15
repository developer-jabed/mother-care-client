import { getAdminDashboardMeta } from "@/service/dashboard/dashboard.service";
import { DashboardHeader } from "@/components/modules/dashboard-meta/dashboardHeader";
import { SummaryCards } from "@/components/modules/dashboard-meta/SummaryCards";
import { EnrollmentChart } from "@/components/modules/dashboard-meta/EnrollmentChart";
import { GradeDistributionChart } from "@/components/modules/dashboard-meta/GradeDistributionChart";
import { StatusPanels } from "@/components/modules/dashboard-meta/StatusPanels";

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static

// Optional: You can still revalidate every 40 minutes (background)
export const revalidate = 2400;
// Server component — data fetching stays here
export default async function AdminDashboardPage() {
  const { success, data, message } = await getAdminDashboardMeta();

  if (!success || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-xl font-semibold text-rose-600">তথ্য লোড করা যায়নি</p>
        <p className="max-w-md text-slate-500">
          {message ?? "একটি সমস্যা হয়েছে। পৃষ্ঠাটি আবার লোড করুন।"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-rose-700 hover:shadow-xl active:scale-95"
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-6 lg:p-10">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[length:40px_40px] opacity-40" />

      <div className="mx-auto max-w-[1480px] space-y-10">
        <DashboardHeader academicYear={data.summary.currentAcademicYear} />

        <SummaryCards summary={data.summary} />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <EnrollmentChart data={data.enrollmentByClass} />
            <GradeDistributionChart data={data.gradeDistribution} />
          </div>

          <StatusPanels
            gender={data.genderDistribution}
            sms={data.smsStats}
            resultPublishStatus={data.resultPublishStatus}
            roleDistribution={data.userRoleDistribution}
          />
        </div>
      </div>
    </div>
  );
}