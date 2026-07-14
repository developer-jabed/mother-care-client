import StudentEnrollmentClient from "@/components/studentEnrolled/student-enrollment-client";
import { getAllAcademicYears, getClasses, getCurrentAcademicYear } from "@/service/academic/createAcademicYear.service";
import { getAllStudents } from "@/service/student/student.service";

export default async function StudentEnrolledPage() {
    const [studentsRes, academicYearsRes, classesRes, currentYearRes] = await Promise.all([
        getAllStudents({ limit: 100 }),
        getAllAcademicYears(),
        getClasses(),
        getCurrentAcademicYear(),
    ]);

    return (
        <StudentEnrollmentClient
            initialStudents={studentsRes.success ? studentsRes.data : []}
            initialAcademicYears={academicYearsRes.success ? academicYearsRes.data : []}
            initialClasses={classesRes ? classesRes : []}
            currentAcademicYearId={currentYearRes.success ? currentYearRes.data?.id : undefined}
        />
    );
}