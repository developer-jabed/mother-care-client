/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExamSchedules } from "@/service/examSchedule/examSchedule.service";
import { getExams } from "@/service/exam/exam.service";
import { getEnrollmentOptions } from "@/service/studentEnrolled/StudentEnrolled.service";
import { ExamScheduleStudio, type ExamOption, type ClassOption, type SubjectOption } from "@/components/modules/exam-schedules/examScheduleClient";
import { getSubjects } from "@/service/subject/subject.service";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "পরীক্ষার সময়সূচী",
    description: "পরীক্ষার সময়সূচী তৈরি ও পরিচালনা করুন",
};

export default async function ExamSchedulesPage() {
    const [schedulesResult, examsResult, subjectsResult, enrollments] = await Promise.all([
        getExamSchedules({}),
        getExams({ limit: 100 }),
        getSubjects({ limit: 200 }),
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

    // ── Subjects with class relation ─────────────────────────────────
    // Adjust this according to your actual subject response structure.
    // Common patterns:
    // 1. subject.classId
    // 2. subject.classes = [{ id, name }]
    // 3. subject.classSubjects = [{ classId }]
    const subjects: SubjectOption[] = subjectsResult.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        // support different possible shapes
        classIds: s.classId
            ? [s.classId]
            : s.classes?.map((c: any) => c.id) ??
              s.classSubjects?.map((cs: any) => cs.classId) ??
              [],
    }));

    const classes: ClassOption[] = Array.from(classMap.values());

    return (
        <div className="p-6">
            <div className="mx-auto max-w-6xl">
                <ExamScheduleStudio
                    initialSchedules={schedulesResult.data}
                    exams={exams}
                    subjects={subjects}
                    classes={classes}
                />
            </div>
        </div>
    );
}