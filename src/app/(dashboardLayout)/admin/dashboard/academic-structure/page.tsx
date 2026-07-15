import CreateAcademicYearModal from "@/components/AcademicStructure/CreateAcademicYearModal";
import CreateClassModal from "@/components/AcademicStructure/CreateClassModal";
import CreateSectionModal from "@/components/AcademicStructure/CreateSectionModal";
import AcademicStructureClient from "@/components/modules/academic-structure-client/academic-structure-client";
import { getClasses, getAllAcademicYears } from "@/service/academic/createAcademicYear.service";
export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)

export default async function AcademicStructurePage() {
    const [classes, academicYearsRes] = await Promise.all([
        getClasses(),
        getAllAcademicYears(),
    ]);

    const allYears = academicYearsRes.success ? academicYearsRes.data : [];
    const currentYear = allYears.find((y) => y.isCurrent) ?? allYears[0] ?? null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    শিক্ষাবর্ষ, ক্লাস ও শাখা ব্যবস্থাপনা
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    প্রতিষ্ঠানের একাডেমিক কাঠামো এখান থেকে পরিচালনা করুন
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <CreateAcademicYearModal />
                <CreateClassModal />
                <CreateSectionModal classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
            </div>

            <AcademicStructureClient
                classes={classes}
                currentYear={currentYear}
            />
        </div>
    );
}