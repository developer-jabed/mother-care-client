"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exam } from "@/service/exam/exam.service";

interface ExamSelectorProps {
    exams: Exam[];
    selectedExamId: number | undefined;
    onSelect: (examId: string) => void;
}

export function ExamSelector({ exams, selectedExamId, onSelect }: ExamSelectorProps) {
    return (
        <Card>
            <CardHeader className="space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
                    পরীক্ষা নির্বাচন করুন
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={selectedExamId ? String(selectedExamId) : undefined} onValueChange={onSelect}>
                    <SelectTrigger className="sm:w-[320px]">
                        <SelectValue placeholder="একটি পরীক্ষা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                        {exams.map((exam) => (
                            <SelectItem key={exam.id} value={String(exam.id)}>
                                {exam.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}