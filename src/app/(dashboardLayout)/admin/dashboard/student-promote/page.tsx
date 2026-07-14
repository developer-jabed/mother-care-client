
import PromoteStudentClient from "@/components/modules/PromoteStudentClient/PromoteStudentClient";
import { getAllAcademicYears, getClasses } from "@/service/academic/createAcademicYear.service";

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