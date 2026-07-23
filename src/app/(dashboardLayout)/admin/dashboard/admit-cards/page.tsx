/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExams } from "@/service/exam/exam.service";
import { getEnrollmentOptions } from "@/service/studentEnrolled/StudentEnrolled.service";
import { AdmitCardStudio, type ClassOption, type ExamOption } from "@/components/modules/admit-cards/admitCardClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "প্রবেশপত্র",
    description: "পরীক্ষার প্রবেশপত্র শাখাভিত্তিক তৈরি ও ইস্যু করুন",
};

export default async function AdmitCardsPage() {
    const [examsResult, enrollments] = await Promise.all([
        getExams({ limit: 100 }),
        getEnrollmentOptions({}), // adjust params to your actual signature (e.g. current academic year)
    ]);

    const classMap = new Map<number, ClassOption>();
    enrollments.forEach((e: any) => {
        if (!classMap.has(e.classId)) {
            classMap.set(e.classId, { id: e.classId, name: e.className, sections: [] });
        }
        const cls = classMap.get(e.classId)!;
        if (!cls.sections.some((s) => s.id === e.sectionId)) {
            cls.sections.push({ id: e.sectionId, name: e.sectionName });
        }
    });

    const exams: ExamOption[] = examsResult.data.map((e: any) => ({ id: e.id, name: e.name }));
    const classes: ClassOption[] = Array.from(classMap.values());

    return (
        <div className="p-6">
            <div className="mx-auto max-w-4xl">
                <AdmitCardStudio exams={exams} classes={classes} />
            </div>
        </div>
    );
}