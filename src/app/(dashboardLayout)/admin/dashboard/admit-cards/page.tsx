/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExams } from "@/service/exam/exam.service";
import { getClasses } from "@/service/academic/createAcademicYear.service"; // ← adjust path if needed
import { AdmitCardStudio, type ClassOption, type ExamOption } from "@/components/modules/admit-cards/admitCardClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "প্রবেশপত্র",
    description: "পরীক্ষার প্রবেশপত্র শাখাভিত্তিক তৈরি ও ইস্যু করুন",
};

export default async function AdmitCardsPage() {
    const [examsResult, classesData] = await Promise.all([
        getExams({ limit: 100 }),
        getClasses(),
    ]);

    const exams: ExamOption[] = (examsResult.data ?? []).map((e: any) => ({
        id: e.id,
        name: e.name,
    }));

    const classes: ClassOption[] = classesData.map((cls) => ({
        id: cls.id,
        name: cls.name,
        sections: (cls.sections ?? []).map((s) => ({
            id: s.id,
            name: s.name,
        })),
    }));

    return (
        <div className="p-6">
            <div className="mx-auto max-w-4xl">
                <AdmitCardStudio exams={exams} classes={classes} />
            </div>
        </div>
    );
}