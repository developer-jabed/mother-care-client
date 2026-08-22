/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { FeeFilters } from "@/components/modules/fee/fee-filters";
import { StudentFeeTable } from "@/components/modules/fee/student-fee-table";
import { Pagination } from "@/components/shared/Pagination";
import { Plus } from "lucide-react";
import type {
  StudentFee,
  FeeType,
} from "@/service/fees/fee.service";
import { GenerateMonthlyDialog } from "./generate-monthly-dialog";

interface Props {
  fees: StudentFee[];
  meta: any;

  classOptions: { value: string; label: string }[];
  feeTypeOptions: { value: string; label: string }[];
  classes: any[];
  feeTypes: FeeType[];
  currentAcademicYear: { id: number; title: string } | null;
}

export function StudentFeesClient({
  fees,
  meta,

  classOptions,
  feeTypeOptions,
  classes,
  feeTypes,
  currentAcademicYear,
}: Props) {
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            মাসিক ফি জেনারেট
          </button>
        </div>

        <FeeFilters
          classes={classOptions}
          feeTypes={feeTypeOptions}
          showStatus
          showMonthYear
        />
      </div>

      <StudentFeeTable fees={fees} />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
        />
      )}

      <GenerateMonthlyDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        classes={classes}
        feeTypes={feeTypes}
        currentAcademicYear={currentAcademicYear}
      />
    </>
  );
}