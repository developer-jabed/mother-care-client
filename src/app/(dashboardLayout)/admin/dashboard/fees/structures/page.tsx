import { FeeStructureForm } from "@/components/modules/fee/structure/fee-structure-form";
import {
  getAllAcademicYears,
  getClasses,
} from "@/service/academic/createAcademicYear.service";
import { getAllFeeTypes } from "@/service/fees/fee.service";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";


export default async function FeeStructuresPage() {
  const [feeTypesResult, yearsResult, classes] = await Promise.all([
    getAllFeeTypes(),
    getAllAcademicYears(),
    getClasses(), // ← সরাসরি array
  ]);

  // getAllFeeTypes / getAllAcademicYears যদি { data } রিটার্ন করে:
  const feeTypes = feeTypesResult?.data ?? feeTypesResult ?? [];
  const academicYears = yearsResult?.data ?? yearsResult ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-200">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            ফি স্ট্রাকচার
          </h1>
          <p className="text-sm text-slate-500">
            ক্লাস ও শিক্ষাবর্ষ অনুযায়ী ফির পরিমাণ নির্ধারণ
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg">
        <FeeStructureForm
          feeTypes={Array.isArray(feeTypes) ? feeTypes : []}
          academicYears={Array.isArray(academicYears) ? academicYears : []}
          classes={classes || []}   // ← .data লাগবে না
        />
      </div>
    </div>
  );
}