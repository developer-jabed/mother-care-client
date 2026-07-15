"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Users, ArrowLeft, Loader2, Eye } from "lucide-react";
import { getStudentsBySection } from "@/service/academic/createAcademicYear.service";

interface SectionType {
    id: number;
    name: string;
    capacity?: number | null;
}

interface ClassType {
    id: number;
    name: string;
    sections: SectionType[];
    _count: { enrollments: number };
}

interface AcademicYearType {
    id: number;
    title: string;
    isCurrent?: boolean;
}

interface EnrolledStudentRow {
    id: number;
    rollNumber: number;
    student: { id: number; fullName: string; admissionNumber: string };
}

type ViewState =
    | { level: "classes" }
    | { level: "sections"; classId: number; className: string }
    | { level: "students"; classId: number; className: string; sectionId: number; sectionName: string };

interface Props {
    classes: ClassType[];
    currentYear: AcademicYearType | null;
}

export default function AcademicStructureClient({ classes, currentYear }: Props) {
    const [view, setView] = useState<ViewState>({ level: "classes" });
    const [students, setStudents] = useState<EnrolledStudentRow[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loadError, setLoadError] = useState<string | null>(null);

    const activeClass = useMemo(() => {
        if (view.level === "classes") return null;
        return classes.find((c) => c.id === view.classId) ?? null;
    }, [view, classes]);

    const loadStudentsForSection = (classId: number, sectionId: number) => {
        if (!currentYear) return;

        setLoadError(null);

        startTransition(async () => {
            const result = await getStudentsBySection({
                academicYearId: currentYear.id,
                classId,
                sectionId,
            });

            if (!result.success) {
                setLoadError(result.message || "শিক্ষার্থী তালিকা লোড করতে ব্যর্থ হয়েছে");
                setStudents([]);
            } else {
                setStudents(result.data);
            }
        });
    };

    const handleSelectClass = (cls: ClassType) => {
        setView({ level: "sections", classId: cls.id, className: cls.name });
    };

    const handleSelectSection = (section: SectionType) => {
        if (view.level === "classes") return;
        const { classId, className } = view;

        setView({ level: "students", classId, className, sectionId: section.id, sectionName: section.name });
        loadStudentsForSection(classId, section.id);
    };

    const goBackToClasses = () => setView({ level: "classes" });
    const goBackToSections = () => {
        if (view.level !== "students") return;
        setView({ level: "sections", classId: view.classId, className: view.className });
    };

    return (
        <div className="space-y-5">
            {/* Current academic year display (read-only) */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">শিক্ষাবর্ষ:</span>
                {currentYear ? (
                    <span className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                        {currentYear.title}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">কোনো বর্তমান শিক্ষাবর্ষ পাওয়া যায়নি</span>
                )}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <button
                    onClick={goBackToClasses}
                    className={view.level === "classes" ? "text-gray-900 font-bold" : "hover:text-gray-700"}
                >
                    ক্লাস সমূহ
                </button>
                {view.level !== "classes" && (
                    <>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <button
                            onClick={goBackToSections}
                            className={view.level === "sections" ? "text-gray-900 font-bold" : "hover:text-gray-700"}
                        >
                            {view.className}
                        </button>
                    </>
                )}
                {view.level === "students" && (
                    <>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-gray-900 font-bold">{view.sectionName}</span>
                    </>
                )}
            </div>

            {!currentYear && (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
                    <p className="text-base font-bold text-gray-700">প্রথমে একটি বর্তমান শিক্ষাবর্ষ নির্ধারণ করুন</p>
                </div>
            )}

            {currentYear && (
                <>
                    {/* Level 1: Classes grid */}
                    {view.level === "classes" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleSelectClass(cls)}
                                    className="text-left rounded-2xl border border-gray-100 bg-white shadow-sm p-5 hover:border-rose-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                                        <span className="text-xs font-medium text-gray-400">
                                            {cls._count.enrollments} জন (সর্বমোট)
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

                                    <div className="flex items-center gap-1 text-xs font-medium text-rose-600 mt-3">
                                        শাখা দেখুন <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Level 2: Sections grid for the selected class */}
                    {view.level === "sections" && activeClass && (
                        <div>
                            <button
                                onClick={goBackToClasses}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                            >
                                <ArrowLeft className="h-4 w-4" /> সব ক্লাসে ফিরে যান
                            </button>

                            {activeClass.sections.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
                                    <p className="text-base font-bold text-gray-700">এই ক্লাসে কোনো শাখা নেই</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {activeClass.sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSelectSection(section)}
                                            className="text-left rounded-2xl border border-gray-100 bg-white shadow-sm p-5 hover:border-rose-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">শাখা: {section.name}</h3>
                                                {section.capacity ? (
                                                    <span className="text-xs font-medium text-gray-400">
                                                        ধারণক্ষমতা {section.capacity}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium text-rose-600 mt-3">
                                                শিক্ষার্থী দেখুন <ChevronRight className="h-3.5 w-3.5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Level 3: Students table for the selected section, scoped to currentYear */}
                    {view.level === "students" && (
                        <div>
                            <button
                                onClick={goBackToSections}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                            >
                                <ArrowLeft className="h-4 w-4" /> শাখা তালিকায় ফিরে যান
                            </button>

                            {isPending ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : loadError ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
                                    <p className="text-base font-bold text-destructive">{loadError}</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
                                    <Users className="h-10 w-10 text-gray-300 mb-3" />
                                    <p className="text-base font-bold text-gray-700">এই শাখায় এই শিক্ষাবর্ষে কোনো শিক্ষার্থী নেই</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 text-left border-b">
                                                <th className="px-4 py-3 font-semibold text-gray-700">রোল</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">নাম</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">ভর্তি নম্বর</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 text-right">অ্যাকশন</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students
                                                .slice()
                                                .sort((a, b) => a.rollNumber - b.rollNumber)
                                                .map((s) => (
                                                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{s.rollNumber}</td>
                                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                                            {s.student?.fullName ?? "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {s.student?.admissionNumber ?? "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {s.student?.id && (
                                                                <Link
                                                                    href={`/admin/dashboard/students/${s.student.id}`}
                                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition-colors"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    শিক্ষার্থী দেখুন
                                                                </Link>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}