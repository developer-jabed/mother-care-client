/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExams } from "@/service/exam/exam.service";
import { getEnrollmentOptions } from "@/service/studentEnrolled/StudentEnrolled.service";
import {
    ResultCardStudio,
    type ClassOption,
    type ExamOption,
} from "@/components/modules/resultCart/resultCartClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "রেজাল্ট কার্ড",
    description: "পরীক্ষার রেজাল্ট কার্ড শাখাভিত্তিক তৈরি ও ডাউনলোড করুন",
};

export default async function ResultCardsPage() {
    const [examsResult, enrollments] = await Promise.all([
        getExams({ limit: 100 }),
        getEnrollmentOptions({}), // adjust params if needed
    ]);

    const classMap = new Map<number, ClassOption>();

    enrollments.forEach((e: any) => {
        if (!classMap.has(e.classId)) {
            classMap.set(e.classId, {
                id: e.classId,
                name: e.className,
                sections: [],
            });
        }
        const cls = classMap.get(e.classId)!;
        if (!cls.sections.some((s) => s.id === e.sectionId)) {
            cls.sections.push({ id: e.sectionId, name: e.sectionName });
        }
    });

    const exams: ExamOption[] = examsResult.data.map((e: any) => ({
        id: e.id,
        name: e.name,
    }));

    const classes: ClassOption[] = Array.from(classMap.values());

    return (
        <div className="p-6">
            <div className="mx-auto max-w-4xl">
                <ResultCardStudio exams={exams} classes={classes} />
            </div>
        </div>
    );
}