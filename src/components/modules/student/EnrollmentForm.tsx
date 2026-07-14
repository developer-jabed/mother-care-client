"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createStudentEnrollment } from "@/service/studentEnrolled/StudentEnrolled.service";
import { useRouter } from "next/navigation";

interface ClassOption {
    id: number;
    name: string;
    sections: { id: number; name: string }[];
}

interface AcademicYearOption {
    id: number;
    title: string;
}

interface Props {
    studentId: number;
    initialAcademicYears: AcademicYearOption[];
    initialClasses: ClassOption[];
    defaultAcademicYearId?: number; // pre-select the current year
    onSuccess?: () => void;
}

const emptyForm = { academicYearId: "", classId: "", sectionId: "", rollNumber: "" };

export default function EnrollmentForm({
    studentId,
    initialAcademicYears,
    initialClasses,
    defaultAcademicYearId,
    onSuccess,
}: Props) {
    const router = useRouter();
    const [form, setForm] = useState({
        ...emptyForm,
        academicYearId: defaultAcademicYearId ? String(defaultAcademicYearId) : "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();

    const sections = useMemo(() => {
        if (!form.classId) return [];
        return initialClasses.find((c) => String(c.id) === form.classId)?.sections ?? [];
    }, [form.classId, initialClasses]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "classId" ? { sectionId: "" } : {}),
        }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const next: Record<string, string> = {};
        if (!form.academicYearId) next.academicYearId = "শিক্ষাবর্ষ নির্বাচন করুন";
        if (!form.classId) next.classId = "ক্লাস নির্বাচন করুন";
        if (!form.sectionId) next.sectionId = "শাখা নির্বাচন করুন";
        if (!form.rollNumber) next.rollNumber = "রোল নম্বর দিন";
        else if (!/^\d+$/.test(form.rollNumber) || Number(form.rollNumber) <= 0) {
            next.rollNumber = "সঠিক রোল নম্বর দিন";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        startTransition(async () => {
            const fd = new FormData();
            fd.append("studentId", String(studentId));
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));

            const res = await createStudentEnrollment(null, fd);

            if (res.success) {
                toast.success(res.message);
                onSuccess?.();
                router.refresh(); // re-fetches server data instead of a hard reload
            } else {
                toast.error(res.message);
                if (res.errors) {
                    const fieldErrors: Record<string, string> = {};
                    res.errors.forEach((e) => (fieldErrors[String(e.field)] = e.message));
                    setErrors(fieldErrors);
                }
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label>শিক্ষাবর্ষ *</Label>
                <Select value={form.academicYearId} onValueChange={(v) => handleChange("academicYearId", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                        {initialAcademicYears.map((year) => (
                            <SelectItem key={year.id} value={String(year.id)}>
                                {year.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.academicYearId && <p className="text-red-500 text-sm mt-1">{errors.academicYearId}</p>}
            </div>

            <div>
                <Label>ক্লাস *</Label>
                <Select value={form.classId} onValueChange={(v) => handleChange("classId", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                        {initialClasses.map((cls) => (
                            <SelectItem key={cls.id} value={String(cls.id)}>
                                {cls.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
            </div>

            <div>
                <Label>শাখা *</Label>
                <Select
                    value={form.sectionId}
                    onValueChange={(v) => handleChange("sectionId", v)}
                    disabled={!form.classId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={form.classId ? "শাখা নির্বাচন করুন" : "প্রথমে ক্লাস নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                        {sections.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">এই ক্লাসে কোনো শাখা নেই</div>
                        ) : (
                            sections.map((sec) => (
                                <SelectItem key={sec.id} value={String(sec.id)}>
                                    {sec.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {errors.sectionId && <p className="text-red-500 text-sm mt-1">{errors.sectionId}</p>}
            </div>

            <div>
                <Label>রোল নম্বর *</Label>
                <Input
                    type="number"
                    min={1}
                    value={form.rollNumber}
                    onChange={(e) => handleChange("rollNumber", e.target.value)}
                    placeholder="যেমন: ০১"
                />
                {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>}
            </div>

            <div className="md:col-span-2 pt-4">
                <Button onClick={handleSubmit} disabled={isPending} className="w-full h-12 text-base">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> প্রক্রিয়াধীন...
                        </>
                    ) : (
                        "ভর্তি সম্পন্ন করুন"
                    )}
                </Button>
            </div>
        </div>
    );
}