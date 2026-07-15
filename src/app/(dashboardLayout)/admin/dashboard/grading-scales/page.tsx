import { getAllGradingScales } from "@/service/gradingScale/gradingScale.service";
import { getAllAcademicYears } from "@/service/academic/createAcademicYear.service";
import GradingScaleClient from "@/components/modules/grading-scale/gradingScaleClient";

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

interface Props {
    searchParams: Promise<{
        academicYearId?: string;
        page?: string;
    }>;
}

export default async function GradingScalePage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;

    const [gradingScalesRes, academicYearsRes] = await Promise.all([
        getAllGradingScales({
            academicYearId: sp.academicYearId ? Number(sp.academicYearId) : undefined,
            page,
            limit: 20,
            sortBy: "minPercentage",
            sortOrder: "desc",
        }),
        getAllAcademicYears(),
    ]);

    return (
        <GradingScaleClient
            initialGradingScales={gradingScalesRes.success ? gradingScalesRes.data : []}
            initialMeta={gradingScalesRes.success ? gradingScalesRes.meta : null}
            initialAcademicYears={academicYearsRes.success ? academicYearsRes.data : []}
            currentPage={page}
            selectedAcademicYearId={sp.academicYearId}
        />
    );
}