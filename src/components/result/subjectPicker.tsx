"use client";

import { BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectForSection } from "@/service/subject/classSubject/classSubject.service";

interface SubjectPickerProps {
    subjects: SubjectForSection[];
    isLoading: boolean;
    selectedSubjectId: number | null;
    onSelect: (subjectId: number) => void;
}

export function SubjectPicker({ subjects, isLoading, selectedSubjectId, onSelect }: SubjectPickerProps) {
    return (
        <Card>
            <CardHeader className="space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">4</span>
                    বিষয় নির্বাচন করুন
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        বিষয় লোড হচ্ছে...
                    </div>
                ) : subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        এই শ্রেণি/শাখার জন্য কোনো বিষয় নির্ধারণ করা হয়নি। প্রথমে বিষয় নির্ধারণ করুন।
                    </p>
                ) : (
                    subjects.map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => onSelect(subject.id)}
                            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedSubjectId === subject.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-accent"
                                }`}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            {subject.name}
                            <span className={`text-xs ${selectedSubjectId === subject.id ? "opacity-80" : "opacity-60"}`}>
                                (পূর্ণমান {subject.fullMarks})
                            </span>
                        </button>
                    ))
                )}
            </CardContent>
        </Card>
    );
}