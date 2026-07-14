"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRightCircle, Users } from "lucide-react";
import { toast } from "sonner";
import {
    getPerformanceRanking,
    bulkPromoteStudents,
    type RankedStudent,
} from "@/service/studentEnrolled/StudentEnrolled.service";

interface SectionType {
    id: number;
    name: string;
}

interface ClassType {
    id: number;
    name: string;
    sections: SectionType[];
}

interface AcademicYearType {
    id: number;
    title: string;
}

interface Props {
    academicYears: AcademicYearType[];
    classes: ClassType[];
}

export default function PromoteStudentClient({ academicYears, classes }: Props) {
    // Source selection
    const [sourceYearId, setSourceYearId] = useState("");
    const [sourceClassId, setSourceClassId] = useState("");
    const [sourceSectionId, setSourceSectionId] = useState("");

    // Target selection
    const [targetYearId, setTargetYearId] = useState("");
    const [targetClassId, setTargetClassId] = useState("");
    const [targetSectionId, setTargetSectionId] = useState("");

    const [students, setStudents] = useState<RankedStudent[]>([]);
    const [excluded, setExcluded] = useState<Set<number>>(new Set());
    const [loadError, setLoadError] = useState<string | null>(null);

    const [isPending, startTransition] = useTransition();

    // Sections derived directly from the nested classes prop — no fetch needed
    const sourceSections = useMemo(() => {
        if (!sourceClassId) return [];
        return classes.find((c) => String(c.id) === sourceClassId)?.sections ?? [];
    }, [sourceClassId, classes]);

    const targetSections = useMemo(() => {
        if (!targetClassId) return [];
        return classes.find((c) => String(c.id) === targetClassId)?.sections ?? [];
    }, [targetClassId, classes]);

    const includedStudents = useMemo(
        () => students.filter((s) => !excluded.has(s.studentId)),
        [students, excluded]
    );

    const finalRollMap = useMemo(() => {
        const map = new Map<number, number>();
        let seq = 1;
        for (const s of students) {
            if (!excluded.has(s.studentId)) {
                map.set(s.studentId, seq++);
            }
        }
        return map;
    }, [students, excluded]);

    const handleSourceClassChange = (value: string) => {
        setSourceClassId(value);
        setSourceSectionId("");
    };

    const handleTargetClassChange = (value: string) => {
        setTargetClassId(value);
        setTargetSectionId("");
    };

    const handleLoadStudents = () => {
        if (!sourceYearId || !sourceClassId || !sourceSectionId) return;

        setLoadError(null);

        startTransition(async () => {
            const result = await getPerformanceRanking({
                academicYearId: Number(sourceYearId),
                classId: Number(sourceClassId),
                sectionId: Number(sourceSectionId),
            });

            if (!result.success) {
                setLoadError(result.message || "শিক্ষার্থী তালিকা লোড করতে ব্যর্থ হয়েছে");
                setStudents([]);
            } else if (result.data.length === 0) {
                setLoadError("এই শ্রেণীতে কোনো শিক্ষার্থী পাওয়া যায়নি");
                setStudents([]);
            } else {
                setStudents(result.data);
                setExcluded(new Set());
            }
        });
    };

    const toggleExclude = (studentId: number) => {
        setExcluded((prev) => {
            const next = new Set(prev);
            next.has(studentId) ? next.delete(studentId) : next.add(studentId);
            return next;
        });
    };

    const handleSubmit = () => {
        if (includedStudents.length === 0) {
            toast.error("অন্তত একজন শিক্ষার্থী নির্বাচন করুন");
            return;
        }
        if (!targetYearId || !targetClassId || !targetSectionId) {
            toast.error("নতুন শিক্ষাবর্ষ, শ্রেণী ও শাখা নির্বাচন করুন");
            return;
        }
        if (
            targetYearId === sourceYearId &&
            targetClassId === sourceClassId &&
            targetSectionId === sourceSectionId
        ) {
            toast.error("উৎস এবং লক্ষ্য শ্রেণী একই হতে পারবে না");
            return;
        }

        const payload = {
            sourceAcademicYearId: Number(sourceYearId),
            sourceClassId: Number(sourceClassId),
            sourceSectionId: Number(sourceSectionId),
            targetAcademicYearId: Number(targetYearId),
            targetClassId: Number(targetClassId),
            targetSectionId: Number(targetSectionId),
            promotions: includedStudents.map((s) => ({
                studentId: s.studentId,
                newRollNumber: finalRollMap.get(s.studentId)!,
            })),
        };

        startTransition(async () => {
            const formData = new FormData();
            formData.set("payload", JSON.stringify(payload));
            const result = await bulkPromoteStudents(null, formData);

            if (result.success) {
                toast.success(result.message);
                setStudents([]);
                setExcluded(new Set());
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">শিক্ষার্থী উত্তীর্ণ করুন</h1>
                <p className="text-base font-medium text-muted-foreground mt-1">
                    ফলাফলের ভিত্তিতে মেধাক্রম অনুযায়ী শিক্ষার্থীদের নতুন শিক্ষাবর্ষে পরবর্তী শ্রেণীতে উত্তীর্ণ করুন
                </p>
            </div>

            {/* Step 1: Source */}
            <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-bold text-base">১. বর্তমান শ্রেণী নির্বাচন করুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select value={sourceYearId} onValueChange={setSourceYearId}>
                        <SelectTrigger>
                            <SelectValue placeholder="শিক্ষাবর্ষ" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((y) => (
                                <SelectItem key={y.id} value={String(y.id)}>
                                    {y.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sourceClassId} onValueChange={handleSourceClassChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="শ্রেণী" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={sourceSectionId}
                        onValueChange={setSourceSectionId}
                        disabled={!sourceClassId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={!sourceClassId ? "প্রথমে শ্রেণী নির্বাচন করুন" : "শাখা"} />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceSections.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                    এই শ্রেণীতে কোনো শাখা নেই
                                </div>
                            ) : (
                                sourceSections.map((sec) => (
                                    <SelectItem key={sec.id} value={String(sec.id)}>
                                        {sec.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleLoadStudents}
                    disabled={isPending || !sourceYearId || !sourceClassId || !sourceSectionId}
                    className="font-bold"
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    শিক্ষার্থী তালিকা আনুন
                </Button>

                {loadError && <p className="text-sm font-medium text-destructive">{loadError}</p>}
            </div>

            {/* Step 2: Student list */}
            {students.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                        <h3 className="font-bold text-base">
                            ২. মেধাক্রম অনুযায়ী তালিকা ({students.length} জন)
                        </h3>
                        <span className="text-sm font-medium text-muted-foreground">
                            নির্বাচিত: {includedStudents.length} জন
                        </span>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">উত্তীর্ণ হবে</TableHead>
                                <TableHead className="font-bold">মেধাক্রম</TableHead>
                                <TableHead className="font-bold">নাম</TableHead>
                                <TableHead className="font-bold">বর্তমান রোল</TableHead>
                                <TableHead className="font-bold">গড় ফলাফল</TableHead>
                                <TableHead className="font-bold">নতুন রোল</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((s, idx) => {
                                const isExcluded = excluded.has(s.studentId);
                                return (
                                    <TableRow key={s.studentId} className={isExcluded ? "opacity-40" : ""}>
                                        <TableCell>
                                            <Checkbox
                                                checked={!isExcluded}
                                                onCheckedChange={() => toggleExclude(s.studentId)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{idx + 1}</TableCell>
                                        <TableCell className="font-bold">{s.name}</TableCell>
                                        <TableCell className="font-medium">{s.currentRoll}</TableCell>
                                        <TableCell className="font-medium">
                                            {s.percentage !== null ? (
                                                <span
                                                    className={
                                                        s.percentage >= 60
                                                            ? "text-green-700"
                                                            : s.percentage >= 33
                                                                ? "text-amber-700"
                                                                : "text-red-700"
                                                    }
                                                >
                                                    {s.percentage.toFixed(2)}%
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">ফলাফল নেই</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {isExcluded ? "—" : finalRollMap.get(s.studentId)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <p className="text-xs font-medium text-muted-foreground p-4 border-t">
                        আনচেক করা শিক্ষার্থীরা বর্তমান শ্রেণীতেই থাকবে (হোল্ড ব্যাক)। রোল নম্বর ফলাফলের ভিত্তিতে স্বয়ংক্রিয়ভাবে নির্ধারিত হয়েছে।
                    </p>
                </div>
            )}

            {/* Step 3: Target + submit */}
            {students.length > 0 && (
                <div className="border rounded-lg p-5 space-y-4">
                    <h3 className="font-bold text-base">৩. নতুন শ্রেণী নির্বাচন করুন</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select value={targetYearId} onValueChange={setTargetYearId}>
                            <SelectTrigger>
                                <SelectValue placeholder="শিক্ষাবর্ষ" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((y) => (
                                    <SelectItem key={y.id} value={String(y.id)}>
                                        {y.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={targetClassId} onValueChange={handleTargetClassChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="শ্রেণী" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={targetSectionId}
                            onValueChange={setTargetSectionId}
                            disabled={!targetClassId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={!targetClassId ? "প্রথমে শ্রেণী নির্বাচন করুন" : "শাখা"} />
                            </SelectTrigger>
                            <SelectContent>
                                {targetSections.length === 0 ? (
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                        এই শ্রেণীতে কোনো শাখা নেই
                                    </div>
                                ) : (
                                    targetSections.map((sec) => (
                                        <SelectItem key={sec.id} value={String(sec.id)}>
                                            {sec.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || includedStudents.length === 0}
                        className="w-full font-bold"
                        size="lg"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <ArrowRightCircle className="mr-2 h-4 w-4" />
                        {includedStudents.length} জন শিক্ষার্থী উত্তীর্ণ করুন
                    </Button>
                </div>
            )}

            {students.length === 0 && !isPending && (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-lg font-bold">শিক্ষার্থী তালিকা দেখতে উপরে থেকে শ্রেণী নির্বাচন করুন</p>
                </div>
            )}
        </div>
    );
}