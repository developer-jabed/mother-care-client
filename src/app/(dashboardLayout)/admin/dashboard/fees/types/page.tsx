import { FeeTypeForm } from "@/components/modules/fee/type/fee-type-form";
import { FeeTypeList } from "@/components/modules/fee/type/fee-type-list";
import { getAllFeeTypes } from "@/service/fees/fee.service";

import { Tags } from "lucide-react";

export const dynamic = "force-dynamic";


export default async function FeeTypesPage() {
  const result = await getAllFeeTypes();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
          <Tags className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            ফি টাইপ
          </h1>
          <p className="text-sm text-slate-500">
            মাসিক বেতন, পরীক্ষা ফি, পরিবহন ফি ইত্যাদি
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FeeTypeForm />
        </div>
        <div className="lg:col-span-3">
          <FeeTypeList types={result.data || []} />
        </div>
      </div>
    </div>
  );
}