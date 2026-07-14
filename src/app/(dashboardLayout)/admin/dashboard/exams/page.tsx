import { serverFetch } from "@/lib/server-fetch";
import { getExams, getExamTypes } from "@/service/exam/exam.service";
import { ExamsClient, type AcademicYearOption } from "@/components/exam/examClient";

interface ExamPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        academicYearId?: string;
        examTypeId?: string;
        isPublished?: string;
    }>;
}

async function getAcademicYears(): Promise<AcademicYearOption[]> {
    try {
        const response = await serverFetch.get("/academic-years", {
            next: { tags: ["academic-years-list"] },
        });
        const result = await response.json();

        if (!result.success) {
            console.error("getAcademicYears failed:", result.message);
            return [];
        }

        return result.data as AcademicYearOption[];
    } catch (error) {
        console.error("Get academic years error:", error);
        return [];
    }
}

export const metadata = {
    title: "Exam Management",
    description: "Create, schedule, and publish exams across academic years",
};

export default async function ExamPage({ searchParams }: ExamPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const isPublished =
        params.isPublished === "true" ? true : params.isPublished === "false" ? false : undefined;

    const [examsResult, examTypesResult, academicYears] = await Promise.all([
        getExams({
            page,
            limit,
            searchTerm: params.search,
            academicYearId: params.academicYearId ? Number(params.academicYearId) : undefined,
            examTypeId: params.examTypeId ? Number(params.examTypeId) : undefined,
            isPublished,
        }),
        getExamTypes({ limit: 100 }),
        getAcademicYears(),
    ]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Exam Management</h1>
                <p className="text-sm text-muted-foreground">
                    Schedule exams, assign them to academic years, and control publication status.
                </p>
            </div>

            <ExamsClient
                exams={examsResult.data}
                meta={examsResult.meta}
                examTypes={examTypesResult.data}
                academicYears={academicYears}
                filters={{
                    search: params.search ?? "",
                    academicYearId: params.academicYearId ?? "",
                    examTypeId: params.examTypeId ?? "",
                    isPublished: params.isPublished ?? "",
                }}
            />
        </div>
    );
}