"use client";

import { GraduationCap, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassOption {
    id: number;
    name: string;
}

interface SectionOption {
    id: number;
    name: string;
}

interface ClassSectionPickerProps {
    classes: ClassOption[];
    sectionsForSelectedClass: SectionOption[];
    selectedClassId: number | null;
    selectedSectionId: number | null;
    onSelectClass: (classId: number) => void;
    onSelectSection: (sectionId: number) => void;
}

export function ClassSectionPicker({
    classes,
    sectionsForSelectedClass,
    selectedClassId,
    selectedSectionId,
    onSelectClass,
    onSelectSection,
}: ClassSectionPickerProps) {
    return (
        <>
            {/* ── Step 2: Class ──────────────────────────────────── */}
            <Card>
                <CardHeader className="space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
                        শ্রেণি নির্বাচন করুন
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {classes.length === 0 && (
                        <p className="text-sm text-muted-foreground">এই পরীক্ষার জন্য কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
                    )}
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            onClick={() => onSelectClass(cls.id)}
                            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedClassId === cls.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-accent"
                                }`}
                        >
                            <GraduationCap className="h-3.5 w-3.5" />
                            {cls.name}
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* ── Step 3: Section ────────────────────────────────── */}
            {selectedClassId && (
                <Card>
                    <CardHeader className="space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">3</span>
                            শাখা নির্বাচন করুন
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {sectionsForSelectedClass.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => onSelectSection(section.id)}
                                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedSectionId === section.id
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background hover:bg-accent"
                                    }`}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                শাখা {section.name}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </>
    );
}