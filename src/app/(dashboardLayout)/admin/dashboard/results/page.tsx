import { getExams } from "@/service/exam/exam.service";
import { getSubjects } from "@/service/subject/subject.service";
import { getResults } from "@/service/result/result.service";
import { ResultsClient } from "@/components/result/resultClient";
import { getEnrollmentOptions } from "@/service/studentEnrolled/StudentEnrolled.service";
export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

interface ResultsPageProps {
    searchParams: Promise<{
        examId?: string;
        page?: string;
        limit?: string;
        search?: string;
        isPublished?: string;
    }>;
}

export const metadata = {
    title: "ফলাফল ব্যবস্থাপনা",
    description: "পরীক্ষার ফলাফল তৈরি, সম্পাদনা এবং প্রকাশ করুন",
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const examId = params.examId ? Number(params.examId) : undefined;

    const isPublished =
        params.isPublished === "true" ? true : params.isPublished === "false" ? false : undefined;

    const [examsResult, subjectsResult] = await Promise.all([
        getExams({ limit: 100 }),
        getSubjects({ limit: 200 }),
    ]);

    const selectedExam = examId ? examsResult.data.find((exam) => exam.id === examId) : undefined;

    const [resultsResult, enrollments] = await Promise.all([
        examId
            ? getResults({
                examId,
                page,
                limit,
                searchTerm: params.search,
                isPublished,
            })
            : Promise.resolve({ data: [], meta: null }),
        selectedExam
            ? getEnrollmentOptions({ academicYearId: selectedExam.academicYearId })
            : Promise.resolve([]),
    ]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">ফলাফল ব্যবস্থাপনা</h1>
                <p className="text-sm text-muted-foreground">
                    পরীক্ষা অনুযায়ী শিক্ষার্থীদের ফলাফল তৈরি, সম্পাদনা, প্রকাশ এবং অবস্থান নির্ধারণ করুন।
                </p>
            </div>

            <ResultsClient
                exams={examsResult.data}
                selectedExamId={examId}
                results={resultsResult.data}
                meta={resultsResult.meta}
                subjects={subjectsResult.data}
                enrollments={enrollments}
                filters={{
                    search: params.search ?? "",
                    isPublished: params.isPublished ?? "",
                }}
            />
        </div>
    );
}