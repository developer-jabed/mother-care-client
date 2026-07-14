"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { UserPlus, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { createStudentEnrollment } from "@/service/studentEnrolled/StudentEnrolled.service";
import type { Student } from "@/service/student/student.service";

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

interface StudentEnrollmentClientProps {
    initialStudents: Student[];
    initialAcademicYears: AcademicYearType[];
    initialClasses: ClassType[];
    currentAcademicYearId?: number; // used as default filter before a year is picked in the form
}

const initialForm = {
    studentId: "",
    academicYearId: "",
    classId: "",
    sectionId: "",
    rollNumber: "",
};

export default function StudentEnrollmentClient({
    initialStudents,
    initialAcademicYears,
    initialClasses,
    currentAcademicYearId,
}: StudentEnrollmentClientProps) {
    const [students] = useState<Student[]>(initialStudents);
    const [academicYears] = useState<AcademicYearType[]>(initialAcademicYears);
    const [classes] = useState<ClassType[]>(initialClasses);

    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState(initialForm);

    const sections = useMemo(() => {
        if (!form.classId) return [];
        const selectedClass = classes.find((c) => String(c.id) === form.classId);
        return selectedClass?.sections ?? [];
    }, [form.classId, classes]);

    // The year to filter against: whichever the user has picked in the form,
    // falling back to the current academic year before any selection is made.
    const activeYearId = form.academicYearId
        ? Number(form.academicYearId)
        : currentAcademicYearId;

    // Students not yet enrolled in the active/target academic year
    const unenrolledStudents = useMemo(() => {
        if (!activeYearId) return students; // no year context yet — show everyone
        return students.filter(
            (s) => !s.enrollments?.some((e) => e.academicYearId === activeYearId)
        );
    }, [students, activeYearId]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setForm(initialForm);
            setErrors({});
        }
    };

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "classId" ? { sectionId: "" } : {}),
        }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = () => {
        const nextErrors: Record<string, string> = {};
        if (!form.studentId) nextErrors.studentId = "শিক্ষার্থী নির্বাচন করুন";
        if (!form.academicYearId) nextErrors.academicYearId = "শিক্ষাবর্ষ নির্বাচন করুন";
        if (!form.classId) nextErrors.classId = "ক্লাস নির্বাচন করুন";
        if (!form.sectionId) nextErrors.sectionId = "শাখা নির্বাচন করুন";
        if (!form.rollNumber) nextErrors.rollNumber = "রোল নম্বর আবশ্যক";
        else if (!/^\d+$/.test(form.rollNumber) || Number(form.rollNumber) <= 0) {
            nextErrors.rollNumber = "সঠিক রোল নম্বর দিন";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));

            const result = await createStudentEnrollment(null, formData);

            if (result.success) {
                toast.success(result.message);
                handleOpenChange(false);
            } else {
                toast.error(result.message);
                if (result.errors) {
                    const fieldErrors: Record<string, string> = {};
                    result.errors.forEach((e) => (fieldErrors[String(e.field)] = e.message));
                    setErrors(fieldErrors);
                }
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">শিক্ষার্থী ভর্তি</h1>
                    <p className="text-base font-medium text-muted-foreground mt-1">
                        শিক্ষার্থীকে ক্লাস ও শাখায় নিয়োগ দিন
                    </p>
                </div>

                <Button size="lg" className="text-base font-bold" onClick={() => setOpen(true)}>
                    <UserPlus className="mr-2 h-5 w-5" />
                    শিক্ষার্থী ভর্তি করুন
                </Button>
            </div>

            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-lg font-bold">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        প্রথমে একজন শিক্ষার্থী যোগ করুন
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">নাম</TableHead>
                                <TableHead className="font-bold">ভর্তি নম্বর</TableHead>
                                <TableHead className="font-bold">বর্তমান ক্লাস</TableHead>
                                <TableHead className="font-bold">শাখা</TableHead>
                                <TableHead className="font-bold">রোল নম্বর</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((s) => {
                                const current = s.enrollments?.[0];
                                return (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-bold">{s.fullName}</TableCell>
                                        <TableCell className="font-medium">{s.admissionNumber}</TableCell>
                                        <TableCell className="font-medium">
                                            {current?.class?.name ?? "—"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {current?.section?.name ?? "—"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {current?.rollNumber ?? "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">শিক্ষার্থী ভর্তি করুন</DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            শিক্ষার্থীকে একটি শিক্ষাবর্ষ, ক্লাস ও শাখায় নিয়োগ দিন
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label className="text-sm font-bold">শিক্ষার্থী</Label>
                            <Select value={form.studentId} onValueChange={(v) => handleChange("studentId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unenrolledStudents.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                            সবাই ইতিমধ্যে ভর্তি হয়ে গেছে
                                        </div>
                                    ) : (
                                        unenrolledStudents.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.fullName} ({s.admissionNumber})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.studentId && (
                                <p className="text-sm font-medium text-destructive">{errors.studentId}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-bold">শিক্ষাবর্ষ</Label>
                            <Select
                                value={form.academicYearId}
                                onValueChange={(v) => handleChange("academicYearId", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((y) => (
                                        <SelectItem key={y.id} value={String(y.id)}>
                                            {y.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.academicYearId && (
                                <p className="text-sm font-medium text-destructive">{errors.academicYearId}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-bold">ক্লাস</Label>
                            <Select value={form.classId} onValueChange={(v) => handleChange("classId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.classId && (
                                <p className="text-sm font-medium text-destructive">{errors.classId}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-bold">শাখা</Label>
                            <Select
                                value={form.sectionId}
                                onValueChange={(v) => handleChange("sectionId", v)}
                                disabled={!form.classId}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={!form.classId ? "প্রথমে ক্লাস নির্বাচন করুন" : "শাখা নির্বাচন করুন"}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                            এই ক্লাসে কোনো শাখা নেই
                                        </div>
                                    ) : (
                                        sections.map((sec) => (
                                            <SelectItem key={sec.id} value={String(sec.id)}>
                                                {sec.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.sectionId && (
                                <p className="text-sm font-medium text-destructive">{errors.sectionId}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-bold">রোল নম্বর</Label>
                            <Input
                                type="number"
                                min={1}
                                placeholder="যেমনঃ ১"
                                value={form.rollNumber}
                                onChange={(e) => handleChange("rollNumber", e.target.value)}
                            />
                            {errors.rollNumber && (
                                <p className="text-sm font-medium text-destructive">{errors.rollNumber}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="font-bold"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}
                        >
                            বাতিল
                        </Button>
                        <Button className="font-bold" onClick={handleSubmit} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ভর্তি নিশ্চিত করুন
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}