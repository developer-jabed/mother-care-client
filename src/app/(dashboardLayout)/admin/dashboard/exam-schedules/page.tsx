/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExamSchedules } from "@/service/examSchedule/examSchedule.service";
import { getExams } from "@/service/exam/exam.service";
import { getEnrollmentOptions } from "@/service/studentEnrolled/StudentEnrolled.service";
import {
  ExamScheduleStudio,
  type ExamOption,
  type ClassOption,
} from "@/components/modules/exam-schedules/examScheduleClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "পরীক্ষার সময়সূচী",
  description: "পরীক্ষার সময়সূচী তৈরি ও পরিচালনা করুন",
};

export default async function ExamSchedulesPage() {
  const [schedulesResult, examsResult, enrollments] = await Promise.all([
    getExamSchedules({}),
    getExams({ limit: 100 }),
    getEnrollmentOptions({}),
  ]);

  // ── Build class list ──────────────────────────────────────────────
  const classMap = new Map<number, ClassOption>();
  enrollments.forEach((e: any) => {
    if (!classMap.has(e.classId)) {
      classMap.set(e.classId, { id: e.classId, name: e.className });
    }
  });

  const exams: ExamOption[] = examsResult.data.map((e: any) => ({
    id: e.id,
    name: e.name,
  }));

  const classes: ClassOption[] = Array.from(classMap.values());

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <ExamScheduleStudio
          initialSchedules={schedulesResult.data}
          exams={exams}
          classes={classes}
        />
      </div>
    </div>
  );
}