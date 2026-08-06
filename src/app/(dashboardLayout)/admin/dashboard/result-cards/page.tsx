/* eslint-disable @typescript-eslint/no-explicit-any */
import { getExams } from "@/service/exam/exam.service";
import { getClasses } from "@/service/academic/createAcademicYear.service"; // ← adjust path if needed
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
                <ResultCardStudio exams={exams} classes={classes} />
            </div>
        </div>
    );
}