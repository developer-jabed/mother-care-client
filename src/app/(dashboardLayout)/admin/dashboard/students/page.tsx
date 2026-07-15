import { getAllStudents } from "@/service/student/student.service";
import EnrollStudentModal from "@/components/modules/student/EnrollStudentModal";
import StudentsFilterBar from "@/components/modules/student/StudentsFilterBar";
import StudentsTable from "@/components/modules/student/StudentsTable";

interface Props {
  searchParams: Promise<{
    search?: string;
    gender?: string;
    isActive?: string;
    page?: string;
    limit?: string;
  }>;
}

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

export default async function StudentsListPage({ searchParams }: Props) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const limit = Number(sp.limit) || 10;

  const studentsRes = await getAllStudents({
    search: sp.search,
    gender: sp.gender,
    isActive: sp.isActive === "true" ? true : sp.isActive === "false" ? false : undefined,
    page,
    limit,
  });

  const students = studentsRes.success ? studentsRes.data : [];
  const meta = studentsRes.success ? studentsRes.meta : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষার্থীগণ</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta ? `মোট ${meta.total} জন শিক্ষার্থী` : "সকল ভর্তিকৃত শিক্ষার্থীর তালিকা এখানে দেখা যাবে"}
          </p>
        </div>
        <EnrollStudentModal />
      </div>

      <StudentsFilterBar
        defaultSearch={sp.search}
        defaultGender={sp.gender}
        defaultIsActive={sp.isActive}
        defaultLimit={limit}
      />

      <StudentsTable students={students} meta={meta} currentPage={page} />
    </div>
  );
}