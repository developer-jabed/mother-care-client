"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { updateResult, type Result, type ResultDetailPayload } from "@/service/result/result.service";
import type { Subject } from "./resultClient";

// ═══════════════════════════════════════════════════════════════════════
// Fallback detail dialog — for fixing a single result across all subjects,
// or adding remarks.
// ═══════════════════════════════════════════════════════════════════════

interface ResultDetailEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: Result;
    subjects: Subject[];
    onSuccess: () => void;
}

export function ResultDetailEditDialog({ open, onOpenChange, result, subjects, onSuccess }: ResultDetailEditDialogProps) {
    const [remarks, setRemarks] = useState(result.remarks ?? "");
    const [rows, setRows] = useState(() =>
        subjects.map((subject) => {
            const existing = result.details.find((d) => d.subjectId === subject.id);
            return {
                subjectId: subject.id,
                writtenMarks: existing?.writtenMarks?.toString() ?? "",
                mcqMarks: existing?.mcqMarks?.toString() ?? "",
                practicalMarks: existing?.practicalMarks?.toString() ?? "",
                vivaMarks: existing?.vivaMarks?.toString() ?? "",
            };
        })
    );
    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);

    const updateRow = (subjectId: number, field: string, value: string) => {
        setRows((current) => current.map((r) => (r.subjectId === subjectId ? { ...r, [field]: value } : r)));
    };

    const handleSubmit = () => {
        setFormError(null);
        const details: ResultDetailPayload[] = rows
            .filter((r) => r.writtenMarks !== "" || r.mcqMarks !== "" || r.practicalMarks !== "" || r.vivaMarks !== "")
            .map((r) => ({
                subjectId: r.subjectId,
                writtenMarks: r.writtenMarks === "" ? undefined : Number(r.writtenMarks),
                mcqMarks: r.mcqMarks === "" ? undefined : Number(r.mcqMarks),
                practicalMarks: r.practicalMarks === "" ? undefined : Number(r.practicalMarks),
                vivaMarks: r.vivaMarks === "" ? undefined : Number(r.vivaMarks),
            }));

        if (details.length === 0) {
            setFormError("অন্তত একটি বিষয়ে নম্বর দিন।");
            return;
        }

        startTransition(async () => {
            const response = await updateResult(result.id, { remarks: remarks || undefined, details });
            if (response.success) {
                toast.success(response.message);
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error(response.message);
                if (response.errors) {
                    const firstError = Object.values(response.errors)[0]?.[0];
                    if (firstError) setFormError(firstError);
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>ফলাফল বিস্তারিত সম্পাদনা</DialogTitle>
                    <DialogDescription>সব বিষয়ের নম্বর একসাথে সংশোধন করুন অথবা মন্তব্য যোগ করুন।</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>বিষয়</TableHead>
                                    <TableHead>লিখিত</TableHead>
                                    <TableHead>MCQ</TableHead>
                                    <TableHead>ব্যবহারিক</TableHead>
                                    <TableHead>মৌখিক</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.map((subject) => {
                                    const row = rows.find((r) => r.subjectId === subject.id);
                                    if (!row) return null;
                                    return (
                                        <TableRow key={subject.id}>
                                            <TableCell className="font-medium">
                                                {subject.name}
                                                <span className="ml-1 text-xs text-muted-foreground">(পূর্ণমান {subject.fullMarks})</span>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 w-20" value={row.writtenMarks} onChange={(e) => updateRow(subject.id, "writtenMarks", e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 w-20" value={row.mcqMarks} onChange={(e) => updateRow(subject.id, "mcqMarks", e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 w-20" value={row.practicalMarks} onChange={(e) => updateRow(subject.id, "practicalMarks", e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 w-20" value={row.vivaMarks} onChange={(e) => updateRow(subject.id, "vivaMarks", e.target.value)} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="remarks">মন্তব্য (ঐচ্ছিক)</Label>
                        <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="শিক্ষকের মন্তব্য লিখুন..." rows={2} />
                    </div>

                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        বাতিল
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        সংরক্ষণ করুন
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}