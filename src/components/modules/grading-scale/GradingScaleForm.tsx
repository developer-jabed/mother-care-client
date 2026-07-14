"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createGradingScale, updateGradingScale } from "@/service/gradingScale/gradingScale.service";
import type { GradingScale } from "@/service/gradingScale/gradingScale.service";

interface AcademicYearOption {
    id: number;
    title: string;
}

interface Props {
    academicYears: AcademicYearOption[];
    editingScale: GradingScale | null;
    onSuccess: () => void;
}

export default function GradingScaleForm({ academicYears, editingScale, onSuccess }: Props) {
    const isEditMode = !!editingScale;

    const [form, setForm] = useState({
        academicYearId: editingScale?.academicYearId ? String(editingScale.academicYearId) : "",
        grade: editingScale?.grade ?? "",
        minPercentage: editingScale?.minPercentage !== undefined ? String(editingScale.minPercentage) : "",
        maxPercentage: editingScale?.maxPercentage !== undefined ? String(editingScale.maxPercentage) : "",
        gradePoint: editingScale?.gradePoint !== undefined ? String(editingScale.gradePoint) : "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = () => {
        startTransition(async () => {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));

            const result = isEditMode
                ? await updateGradingScale(editingScale!.id, null, fd)
                : await createGradingScale(null, fd);

            if (result.success) {
                toast.success(result.message);
                onSuccess();
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
        <div className="space-y-4 pt-2">
            {!isEditMode && (
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">শিক্ষাবর্ষ *</Label>
                    <Select value={form.academicYearId} onValueChange={(v) => handleChange("academicYearId", v)}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-violet-500">
                            <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((year) => (
                                <SelectItem key={year.id} value={String(year.id)}>
                                    {year.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.academicYearId && <p className="text-xs text-red-500">{errors.academicYearId}</p>}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">গ্রেড *</Label>
                    <Input
                        value={form.grade}
                        onChange={(e) => handleChange("grade", e.target.value)}
                        placeholder="যেমন: A+"
                        className="h-11 rounded-xl border-gray-200 focus-visible:ring-violet-500"
                    />
                    {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">জিপিএ *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={5}
                        value={form.gradePoint}
                        onChange={(e) => handleChange("gradePoint", e.target.value)}
                        placeholder="৫.০০"
                        className="h-11 rounded-xl border-gray-200 focus-visible:ring-violet-500"
                    />
                    {errors.gradePoint && <p className="text-xs text-red-500">{errors.gradePoint}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">সর্বনিম্ন শতাংশ *</Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.minPercentage}
                        onChange={(e) => handleChange("minPercentage", e.target.value)}
                        placeholder="৮০"
                        className="h-11 rounded-xl border-gray-200 focus-visible:ring-violet-500"
                    />
                    {errors.minPercentage && <p className="text-xs text-red-500">{errors.minPercentage}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">সর্বোচ্চ শতাংশ *</Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.maxPercentage}
                        onChange={(e) => handleChange("maxPercentage", e.target.value)}
                        placeholder="১০০"
                        className="h-11 rounded-xl border-gray-200 focus-visible:ring-violet-500"
                    />
                    {errors.maxPercentage && <p className="text-xs text-red-500">{errors.maxPercentage}</p>}
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full h-11 rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
                    </>
                ) : (
                    <>
                        <Check className="h-4 w-4" /> {isEditMode ? "আপডেট করুন" : "গ্রেড তৈরি করুন"}
                    </>
                )}
            </Button>
        </div>
    );
}