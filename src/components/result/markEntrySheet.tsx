/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

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
import { EnrollmentOption } from "./resultClient";

interface MarkEntrySheetProps {
  examId: number;
  subject: SubjectForSection;
  students: EnrollmentOption[];
  results: Result[]; // all results for the current exam
  onSaved: () => void;
}

type MarkRow = {
  enrollmentId: number;
  name: string;
  roll: number | string;
  written: string;
  mcq: string;
  practical: string;
  viva: string;
  existingResultId: number | null;
  existingDetails: ResultDetailPayload[];
  hasThisSubject: boolean;
};

export function MarkEntrySheet({
  examId,
  subject,
  students,
  results,
  onSaved,
}: MarkEntrySheetProps) {
  const [isPending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<number | null>(null);

  // Build initial rows from students + existing results, sorted by roll number
  const initialRows = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) => {
      const rollA = a.student.rollNumber ?? Number.MAX_SAFE_INTEGER;
      const rollB = b.student.rollNumber ?? Number.MAX_SAFE_INTEGER;
      return rollA - rollB;
    });

    return sortedStudents.map((s) => {
      const existing = results.find((r) => r.studentEnrollmentId === s.id);
      const thisDetail = existing?.details.find((d) => d.subjectId === subject.id);

      return {
        enrollmentId: s.id,
        name: s.student.name,
        roll: s.student.rollNumber ?? "—",
        written: thisDetail?.writtenMarks?.toString() ?? "",
        mcq: thisDetail?.mcqMarks?.toString() ?? "",
        practical: thisDetail?.practicalMarks?.toString() ?? "",
        viva: thisDetail?.vivaMarks?.toString() ?? "",
        existingResultId: existing?.id ?? null,
        existingDetails:
          existing?.details.map((d) => ({
            subjectId: d.subjectId,
            writtenMarks: d.writtenMarks ?? undefined,
            mcqMarks: d.mcqMarks ?? undefined,
            practicalMarks: d.practicalMarks ?? undefined,
            vivaMarks: d.vivaMarks ?? undefined,
          })) ?? [],
        hasThisSubject: Boolean(thisDetail),
      } satisfies MarkRow;
    });
  }, [students, results, subject.id]);

  const [rows, setRows] = useState<MarkRow[]>(initialRows);

  // Keep rows in sync when results change (after save + refresh)
  useMemo(() => {
    setRows(initialRows);
  }, [initialRows]);

  const updateCell = (
    enrollmentId: number,
    field: "written" | "mcq" | "practical" | "viva",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.enrollmentId === enrollmentId ? { ...r, [field]: value } : r
      )
    );
  };

  const parseMark = (v: string): number | undefined => {
    if (v.trim() === "") return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const handleSaveOne = (row: MarkRow) => {
    const written = parseMark(row.written);
    const mcq = parseMark(row.mcq);
    const practical = parseMark(row.practical);
    const viva = parseMark(row.viva);

    // At least one mark should be present
    if (
      written === undefined &&
      mcq === undefined &&
      practical === undefined &&
      viva === undefined
    ) {
      toast.error("কমপক্ষে একটি মার্কস দিন");
      return;
    }

    const newDetail: ResultDetailPayload = {
      subjectId: subject.id,
      writtenMarks: written,
      mcqMarks: mcq,
      practicalMarks: practical,
      vivaMarks: viva,
    };

    setSavingId(row.enrollmentId);

    startTransition(async () => {
      try {
        if (row.existingResultId) {
          // Merge: keep other subjects, replace/add current subject
          const otherDetails = row.existingDetails.filter(
            (d) => d.subjectId !== subject.id
          );
          const fullDetails = [...otherDetails, newDetail];

          const res = await updateResult(row.existingResultId, {
            details: fullDetails,
          });

          if (res.success) {
            toast.success(`${row.name} — আপডেট হয়েছে`);
            onSaved();
          } else {
            toast.error(res.message);
          }
        } else {
          // First subject for this student → create
          const res = await createResult({
            studentEnrollmentId: row.enrollmentId,
            examId,
            details: [newDetail],
          });

          if (res.success) {
            toast.success(`${row.name} — তৈরি হয়েছে`);
            onSaved();
          } else {
            toast.error(res.message);
          }
        }
      } finally {
        setSavingId(null);
      }
    });
  };

  const handleSaveAll = () => {
    // Optional: sequential save of changed rows
    // For simplicity we keep per-row save buttons
    toast.info("প্রতিটি শিক্ষার্থীর পাশে সেভ বাটন ব্যবহার করুন");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              5
            </span>
            মার্কস এন্ট্রি — {subject.name}
            <span className="text-sm font-normal text-muted-foreground">
              (পূর্ণমান {subject.fullMarks})
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">রোল</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead className="w-24 text-center">লিখিত</TableHead>
                <TableHead className="w-24 text-center">MCQ</TableHead>
                <TableHead className="w-24 text-center">প্র্যাক্টিক্যাল</TableHead>
                <TableHead className="w-24 text-center">ভাইভা</TableHead>
                <TableHead className="w-28 text-center">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isSaving = savingId === row.enrollmentId;
                return (
                  <TableRow key={row.enrollmentId}>
                    <TableCell className="font-mono text-sm">{row.roll}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.name}
                        {row.hasThisSubject && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={row.written}
                        onChange={(e) =>
                          updateCell(row.enrollmentId, "written", e.target.value)
                        }
                        disabled={isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={row.mcq}
                        onChange={(e) =>
                          updateCell(row.enrollmentId, "mcq", e.target.value)
                        }
                        disabled={isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={row.practical}
                        onChange={(e) =>
                          updateCell(row.enrollmentId, "practical", e.target.value)
                        }
                        disabled={isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={row.viva}
                        onChange={(e) =>
                          updateCell(row.enrollmentId, "viva", e.target.value)
                        }
                        disabled={isPending}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant={row.hasThisSubject ? "outline" : "default"}
                        disabled={isPending}
                        onClick={() => handleSaveOne(row)}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                            {row.hasThisSubject ? "আপডেট" : "সেভ"}
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            এই শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি।
          </p>
        )}
      </CardContent>
    </Card>
  );
}