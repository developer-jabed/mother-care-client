
import CreateAcademicYearModal from "@/components/AcademicStructure/CreateAcademicYearModal";
import CreateClassModal from "@/components/AcademicStructure/CreateClassModal";
import CreateSectionModal from "@/components/AcademicStructure/CreateSectionModal";
import { getClasses } from "@/service/academic/createAcademicYear.service";

export default async function AcademicStructurePage() {
    const classes = await getClasses();

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

            {/* Classes list — showing what getAllClasses returns */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                            <span className="text-xs font-medium text-gray-400">
                                {cls._count.enrollments} জন শিক্ষার্থী
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {cls.sections.length === 0 ? (
                                <span className="text-xs text-gray-400">কোনো শাখা নেই</span>
                            ) : (
                                cls.sections.map((section) => (
                                    <span
                                        key={section.id}
                                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100"
                                    >
                                        {section.name}
                                        {section.capacity ? ` (${section.capacity})` : ""}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}