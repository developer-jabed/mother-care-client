
import PromoteStudentClient from "@/components/modules/PromoteStudentClient/PromoteStudentClient";
import { getAllAcademicYears, getClasses } from "@/service/academic/createAcademicYear.service";
export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

export default async function PromoteStudentPage() {
    const [academicYearsRes, classes] = await Promise.all([
        getAllAcademicYears(),
        getClasses(),
    ]);

    return (
        <PromoteStudentClient
            academicYears={academicYearsRes.success ? academicYearsRes.data : []}
            classes={classes ?? []}
        />
    );
}