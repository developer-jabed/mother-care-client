"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateStudentEnrollment } from "@/service/studentEnrolled/StudentEnrolled.service"; // ← adjust path
import type { ClassWithSections } from "@/service/academic/createAcademicYear.service"; // ← adjust path

interface Enrollment {
    id: number;
    academicYearId: number;
    classId: number;
    sectionId: number;
    rollNumber: number | string;
    status?: string;
    academicYear?: { title: string };
    class?: { name: string };
    section?: { name: string };
}

interface Props {
    enrollment: Enrollment;
    classes: ClassWithSections[];
    academicYears: { id: number; title: string }[];
}

export default function EditEnrollmentModal({
    enrollment,
    classes,
    academicYears,
}: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [academicYearId, setAcademicYearId] = useState(String(enrollment.academicYearId));
    const [classId, setClassId] = useState(String(enrollment.classId));
    const [sectionId, setSectionId] = useState(String(enrollment.sectionId));
    const [rollNumber, setRollNumber] = useState(String(enrollment.rollNumber ?? ""));
    const [status, setStatus] = useState(enrollment.status ?? "ACTIVE");

    const sectionsForClass = useMemo(() => {
        const cls = classes.find((c) => c.id === Number(classId));
        return cls?.sections ?? [];
    }, [classes, classId]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("academicYearId", academicYearId);
        formData.set("classId", classId);
        formData.set("sectionId", sectionId);
        formData.set("rollNumber", rollNumber);
        formData.set("status", status);

        startTransition(async () => {
            const result = await updateStudentEnrollment(enrollment.id, null, formData);

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-8 gap-1.5 text-gray-600 hover:text-rose-600"
            >
                <Pencil className="h-3.5 w-3.5" />
                সম্পাদনা
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>এনরোলমেন্ট সম্পাদনা</DialogTitle>
                    <DialogDescription>
                        ক্লাস, শাখা, রোল নম্বর এবং স্ট্যাটাস আপডেট করুন
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Academic Year */}
                    <div className="space-y-1.5">
                        <Label>শিক্ষাবর্ষ</Label>
                        <Select value={academicYearId} onValueChange={setAcademicYearId}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((y) => (
                                    <SelectItem key={y.id} value={String(y.id)}>
                                        {y.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class */}
                    <div className="space-y-1.5">
                        <Label>ক্লাস</Label>
                        <Select
                            value={classId}
                            onValueChange={(v) => {
                                setClassId(v);
                                setSectionId(""); // reset section when class changes
                            }}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Section */}
                    <div className="space-y-1.5">
                        <Label>শাখা</Label>
                        <Select
                            value={sectionId}
                            onValueChange={setSectionId}
                            disabled={!classId}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue
                                    placeholder={classId ? "নির্বাচন করুন" : "আগে ক্লাস নির্বাচন করুন"}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionsForClass.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Roll Number */}
                    <div className="space-y-1.5">
                        <Label>রোল নম্বর</Label>
                        <Input
                            type="number"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className="h-11 rounded-xl"
                            required
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label>স্ট্যাটাস</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">সক্রিয়</SelectItem>
                                <SelectItem value="INACTIVE">নিষ্ক্রিয়</SelectItem>
                                <SelectItem value="TRANSFERRED">স্থানান্তরিত</SelectItem>
                                <SelectItem value="DROPPED">বাতিল</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl"
                        >
                            বাতিল
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !sectionId || !rollNumber}
                            className="flex-1 h-11 rounded-xl gap-2 bg-rose-600 hover:bg-rose-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    আপডেট করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}