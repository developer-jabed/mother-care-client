import ClassesSubjectsClient from "@/components/subject/subjectUI";
import ClassSubjectClient from "@/components/subject/ClassSubjectClient";
import { getSubjects } from "@/service/subject/subject.service";
import { getClasses } from "@/service/academic/createAcademicYear.service";
import { getClassSubjects } from "@/service/subject/classSubject/classSubject.service";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { BookOpen, Layers } from "lucide-react";

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

export default async function ClassesSubjectsPage() {
    const [subjectsResult, classesResult, classSubjectsResult] = await Promise.all([
        getSubjects(),
        getClasses(),
        getClassSubjects(),
    ]);

    const subjects = subjectsResult?.data ?? [];
    const classSubjects = classSubjectsResult?.data ?? [];


    console.log(classSubjects)

    // getClasses returns a plain array (confirmed by TS inference)
    const classes = classesResult ?? [];

    return (
        <div className="space-y-6">
            <Tabs defaultValue="subjects" className="w-full">
                <TabsList className="h-12 rounded-xl bg-gray-100 p-1">
                    <TabsTrigger
                        value="subjects"
                        className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <BookOpen className="h-4 w-4" />
                        বিষয়সমূহ
                    </TabsTrigger>
                    <TabsTrigger
                        value="class-subjects"
                        className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Layers className="h-4 w-4" />
                        ক্লাস-বিষয় নির্ধারণ
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="subjects" className="mt-6">
                    <ClassesSubjectsClient initialSubjects={subjects} classes={classes} />
                </TabsContent>

                <TabsContent value="class-subjects" className="mt-6">
                    <ClassSubjectClient
                        initialClassSubjects={classSubjects}
                        classes={classes}
                        subjects={subjects}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}