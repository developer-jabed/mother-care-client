import { ResultLookupForm } from "@/components/modules/result-lookup/ResultLookUp";
import { getClasses } from "@/service/academic/createAcademicYear.service";
import { getExams } from "@/service/exam/exam.service";

export const dynamic = "force-dynamic";

// app/(public)/results/page.tsx
export default async function ResultsPage() {
  const [classes, examsRes] = await Promise.all([
    getClasses(),
    getExams({ isPublished: true, limit: 100 }),
  ]);

  return <ResultLookupForm classes={classes} exams={examsRes.data} />;
}