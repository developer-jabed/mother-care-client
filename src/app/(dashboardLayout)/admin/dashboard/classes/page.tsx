import ClassesSubjectsClient from "@/components/subject/subjectUI";
import { getSubjects } from "@/service/subject/subject.service";
import { getClasses } from "@/service/academic/createAcademicYear.service";

export const dynamic = "force-dynamic";
export const revalidate = 1000;

export default async function ClassesSubjectsPage() {
  const [subjectsResult, classesResult] = await Promise.all([
    getSubjects({ limit: 500 }),
    getClasses(),
  ]);

  const subjects = subjectsResult?.data ?? [];
  const classes = classesResult ?? [];

  return (
    <div className="space-y-6">
      <ClassesSubjectsClient
        initialSubjects={subjects}
        classes={classes}
      />
    </div>
  );
}