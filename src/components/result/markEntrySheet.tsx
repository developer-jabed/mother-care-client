"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    createResult,
    updateResult,
    type Result,
    type ResultDetailPayload,
} from "@/service/result/result.service";
import type { SubjectForSection } from "@/service/subject/classSubject/classSubject.service";
import type { EnrollmentOption } from "./resultClient";

// ═══════════════════════════════════════════════════════════════════════
// Mark Entry Sheet — the core UX improvement.
// One subject, one section, every student as a row, inline editable cells,
// single "সব সংরক্ষণ করুন" (Save All) button.
// ═══════════════════════════════════════════════════════════════════════

interface MarkEntrySheetProps {
    examId: number;
    subject: SubjectForSection;
    students: EnrollmentOption[];
    results: Result[];
    onSaved: () => void;
}

interface RowState {
    writtenMarks: string;
    mcqMarks: string;
    practicalMarks: string;
    vivaMarks: string;
    status: "idle" | "saving" | "saved" | "error";
}

export function MarkEntrySheet({ examId, subject, students, results, onSaved }: MarkEntrySheetProps) {
    const buildInitialState = () => {
        const state: Record<number, RowState> = {};
        students.forEach((s) => {
            const existingResult = results.find((r) => r.studentEnrollmentId === s.id);
            const existingDetail = existingResult?.details.find((d) => d.subjectId === subject.id);
            state[s.id] = {
                writtenMarks: existingDetail?.writtenMarks?.toString() ?? "",
                mcqMarks: existingDetail?.mcqMarks?.toString() ?? "",
                practicalMarks: existingDetail?.practicalMarks?.toString() ?? "",
                vivaMarks: existingDetail?.vivaMarks?.toString() ?? "",
                status: "idle",
            };
        });
        return state;
    };

    const [rows, setRows] = useState<Record<number, RowState>>(buildInitialState);
    const [isSavingAll, startSaveAllTransition] = useTransition();

    const sheetKey = `${subject.id}-${students.map((s) => s.id).join(",")}`;
    const [lastKey, setLastKey] = useState(sheetKey);
    if (sheetKey !== lastKey) {
        setLastKey(sheetKey);
        setRows(buildInitialState());
    }

    const updateCell = (enrollmentId: number, field: keyof Omit<RowState, "status">, value: string) => {
        setRows((current) => ({
            ...current,
            [enrollmentId]: { ...current[enrollmentId], [field]: value, status: "idle" },
        }));
    };

    const rowTotal = (row: RowState) => {
        const n = (v: string) => (v === "" ? 0 : Number(v));
        return n(row.writtenMarks) + n(row.mcqMarks) + n(row.practicalMarks) + n(row.vivaMarks);
    };

    const saveRow = async (enrollment: EnrollmentOption): Promise<boolean> => {
        const row = rows[enrollment.id];
        const hasAnyMark =
            row.writtenMarks !== "" || row.mcqMarks !== "" || row.practicalMarks !== "" || row.vivaMarks !== "";
        if (!hasAnyMark) return true;

        setRows((current) => ({ ...current, [enrollment.id]: { ...current[enrollment.id], status: "saving" } }));

        const existingResult = results.find((r) => r.studentEnrollmentId === enrollment.id);

        const newDetail: ResultDetailPayload = {
            subjectId: subject.id,
            writtenMarks: row.writtenMarks === "" ? undefined : Number(row.writtenMarks),
            mcqMarks: row.mcqMarks === "" ? undefined : Number(row.mcqMarks),
            practicalMarks: row.practicalMarks === "" ? undefined : Number(row.practicalMarks),
            vivaMarks: row.vivaMarks === "" ? undefined : Number(row.vivaMarks),
        };

        const mergedDetails: ResultDetailPayload[] = existingResult
            ? [
                ...existingResult.details
                    .filter((d) => d.subjectId !== subject.id)
                    .map((d) => ({
                        subjectId: d.subjectId,
                        writtenMarks: d.writtenMarks ?? undefined,
                        mcqMarks: d.mcqMarks ?? undefined,
                        practicalMarks: d.practicalMarks ?? undefined,
                        vivaMarks: d.vivaMarks ?? undefined,
                    })),
                newDetail,
            ]
            : [newDetail];

        const response = existingResult
            ? await updateResult(existingResult.id, { details: mergedDetails })
            : await createResult({ examId, studentEnrollmentId: enrollment.id, details: mergedDetails });

        setRows((current) => ({
            ...current,
            [enrollment.id]: { ...current[enrollment.id], status: response.success ? "saved" : "error" },
        }));

        return response.success;
    };

    const handleSaveAll = () => {
        startSaveAllTransition(async () => {
            const outcomes = await Promise.all(students.map((s) => saveRow(s)));
            const failCount = outcomes.filter((ok) => !ok).length;

            if (failCount === 0) {
                toast.success(`${subject.name} বিষয়ের সকল নম্বর সংরক্ষিত হয়েছে`);
            } else {
                toast.error(`${failCount} জন শিক্ষার্থীর নম্বর সংরক্ষণে সমস্যা হয়েছে`);
            }
            onSaved();
        });
    };

    return (
        <Card className="border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">5</span>
                        {subject.name} — নম্বর প্রদান করুন
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {students.length} জন শিক্ষার্থী · পূর্ণমান {subject.fullMarks}
                    </p>
                </div>
                <Button onClick={handleSaveAll} disabled={isSavingAll || students.length === 0}>
                    {isSavingAll ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    সব সংরক্ষণ করুন
                </Button>
            </CardHeader>
            <CardContent>
                {students.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">এই শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14">রোল</TableHead>
                                    <TableHead>নাম</TableHead>
                                    <TableHead className="w-24">লিখিত</TableHead>
                                    <TableHead className="w-24">MCQ</TableHead>
                                    <TableHead className="w-24">ব্যবহারিক</TableHead>
                                    <TableHead className="w-24">মৌখিক</TableHead>
                                    <TableHead className="w-20">মোট</TableHead>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((enrollment) => {
                                    const row = rows[enrollment.id];
                                    if (!row) return null;
                                    return (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="text-muted-foreground">
                                                {enrollment.student.rollNumber ?? "—"}
                                            </TableCell>
                                            <TableCell className="font-medium">{enrollment.student.name}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-20"
                                                    value={row.writtenMarks}
                                                    onChange={(e) => updateCell(enrollment.id, "writtenMarks", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-20"
                                                    value={row.mcqMarks}
                                                    onChange={(e) => updateCell(enrollment.id, "mcqMarks", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-20"
                                                    value={row.practicalMarks}
                                                    onChange={(e) => updateCell(enrollment.id, "practicalMarks", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8 w-20"
                                                    value={row.vivaMarks}
                                                    onChange={(e) => updateCell(enrollment.id, "vivaMarks", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{rowTotal(row)}</TableCell>
                                            <TableCell>
                                                {row.status === "saving" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                {row.status === "saved" && <span className="text-xs text-green-600">✓</span>}
                                                {row.status === "error" && <span className="text-xs text-destructive">!</span>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}