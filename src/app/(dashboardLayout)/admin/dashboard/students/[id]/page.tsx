import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentById } from "@/service/student/student.service";
import { getAllAcademicYears, getClasses, getCurrentAcademicYear } from "@/service/academic/createAcademicYear.service";
import { UserPlus } from "lucide-react";
import StudentSummaryCard from "@/components/modules/student/StudentSummaryCard";
import EnrollmentForm from "@/components/modules/student/EnrollmentForm";
import EditStudentModal from "@/components/modules/student/EditStudentModal";

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ justCreated?: string }>;
}

export default async function StudentDetailsPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { justCreated } = await searchParams;

    const studentId = parseInt(id);

    const [studentRes, academicYearsRes, classesRes, currentYearRes] = await Promise.all([
        getStudentById(studentId),
        getAllAcademicYears(),
        getClasses(),
        getCurrentAcademicYear(),
    ]);

    const student = studentRes?.success ? studentRes.data : null;
    const academicYears = academicYearsRes?.success ? academicYearsRes.data : [];
    const classes = classesRes || [];
    const currentYear = currentYearRes?.success ? currentYearRes.data : null;

    if (!student) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Student Not Found</h1>
                <Link
                    href="/admin/dashboard/students"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    ছাত্র তালিকায় ফিরে যান
                </Link>
            </div>
        );
    }

    const isEnrolledInCurrentYear = student.enrollments?.some(
        (enrollment) => enrollment.academicYearId === currentYear?.id
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Back button + Edit button */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/dashboard/students"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    শিক্ষার্থী তালিকায় ফিরে যান
                </Link>

                <EditStudentModal student={student} />
            </div>

            <StudentSummaryCard student={student} />

            {!isEnrolledInCurrentYear && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">শিক্ষার্থী ভর্তি</h2>
                            <p className="text-gray-600">বর্তমান শিক্ষাবর্ষে ভর্তি করুন</p>
                        </div>
                    </div>

                    <EnrollmentForm
                        studentId={student.id}
                        initialAcademicYears={academicYears}
                        initialClasses={classes}
                    />
                </div>
            )}

            {student.enrollments && student.enrollments.length > 0 && (
                <div className="bg-white rounded-2xl border p-6">
                    <h3 className="text-lg font-semibold mb-4">পূর্ববর্তী ভর্তি তথ্য</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3">শিক্ষাবর্ষ</th>
                                    <th className="text-left py-3">ক্লাস</th>
                                    <th className="text-left py-3">শাখা</th>
                                    <th className="text-left py-3">রোল নম্বর</th>
                                </tr>
                            </thead>
                            <tbody>
                                {student.enrollments.map((enroll) => (
                                    <tr key={enroll.id} className="border-b last:border-0">
                                        <td className="py-3">{enroll.academicYear?.title}</td>
                                        <td className="py-3">{enroll.class?.name}</td>
                                        <td className="py-3">{enroll.section?.name}</td>
                                        <td className="py-3 font-medium">{enroll.rollNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}