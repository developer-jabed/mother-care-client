"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
    deleteResult,
    publishResult,
    calculatePositions,
    getCombinedRanking,
    type Result,
    type SectionResultResponse,
    type CombinedRankingResponse,
} from "@/service/result/result.service";
import type { Exam } from "@/service/exam/exam.service";
import { getSubjectsForClassSection, type SubjectForSection } from "@/service/subject/classSubject/classSubject.service";

import { ExamSelector } from "./examSelector";
import { ClassSectionPicker } from "./classSectionPicker";
import { SubjectPicker } from "./subjectPicker";
import { MarkEntrySheet } from "./markEntrySheet";
import { SectionRankingTable } from "./sectionRankingTable";
import { ResultDetailEditDialog } from "./resultDetailEditDialog";
import { DeleteResultDialog } from "./deleteResultDialog";
import { CombinedRankingTable } from "./combinedRankingTable";

export interface Subject {
    id: number;
    name: string;
    fullMarks: number;
}

export interface EnrollmentOption {
    id: number;
    classId: number;
    className: string;
    sectionId: number;
    sectionName: string;
    student: {
        id: number;
        name: string;
        rollNumber?: string;
    };
}

interface ResultsClientProps {
    exams: Exam[];
    selectedExamId: number | undefined;
    results: Result[];
    meta: { page: number; limit: number; total: number } | null;
    subjects: Subject[];
    enrollments: EnrollmentOption[];
    sectionResults: SectionResultResponse | null;
    filters: {
        classId: string;
        sectionId: string;
        search: string;
        isPublished: string;
    };
}

export function ResultsClient({
    exams,
    selectedExamId,
    results,
    meta,
    subjects,
    enrollments,
    sectionResults,
    filters,
}: ResultsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(filters.search);
    const [syncedSearch, setSyncedSearch] = useState(filters.search);
    const [editingResult, setEditingResult] = useState<Result | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Result | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isCalculating, startCalculateTransition] = useTransition();
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [isPublishing, startPublishTransition] = useTransition();

    const selectedClassId = filters.classId ? Number(filters.classId) : null;
    const selectedSectionId = filters.sectionId ? Number(filters.sectionId) : null;
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [showAllResults, setShowAllResults] = useState(false);

    const markSheetRef = useRef<HTMLDivElement>(null);

    const [fetchedSubjects, setFetchedSubjects] = useState<SubjectForSection[]>([]);
    const [loadedSubjectsKey, setLoadedSubjectsKey] = useState<string | null>(null);

    const subjectsKey = selectedClassId && selectedSectionId ? `${selectedClassId}-${selectedSectionId}` : null;
    const isLoadingSubjects = subjectsKey !== null && subjectsKey !== loadedSubjectsKey;
    const sectionSubjects = selectedClassId && selectedSectionId ? fetchedSubjects : [];

    // Combined (all-exam) ranking state
    const [combinedRanking, setCombinedRanking] = useState<CombinedRankingResponse | null>(null);
    const [isLoadingCombinedRanking, setIsLoadingCombinedRanking] = useState(false);
    const [combinedRankingRefreshKey, setCombinedRankingRefreshKey] = useState(0);

    useEffect(() => {
        if (!selectedClassId || !selectedSectionId) return;

        let cancelled = false;
        const key = `${selectedClassId}-${selectedSectionId}`;

        getSubjectsForClassSection(selectedClassId, selectedSectionId)
            .then((data) => {
                if (!cancelled) {
                    setFetchedSubjects(data);
                    setLoadedSubjectsKey(key);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFetchedSubjects([]);
                    setLoadedSubjectsKey(key);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedClassId, selectedSectionId]);

    useEffect(() => {
        let cancelled = false;

        async function loadCombinedRanking() {
            if (!selectedClassId || !selectedSectionId) {
                setCombinedRanking(null);
                return;
            }

            setIsLoadingCombinedRanking(true);
            try {
                const res = await getCombinedRanking({ classId: selectedClassId, sectionId: selectedSectionId });
                if (!cancelled) setCombinedRanking(res.data);
            } catch {
                if (!cancelled) setCombinedRanking(null);
            } finally {
                if (!cancelled) setIsLoadingCombinedRanking(false);
            }
        }

        loadCombinedRanking();

        return () => {
            cancelled = true;
        };
    }, [selectedClassId, selectedSectionId, combinedRankingRefreshKey]);

    if (filters.search !== syncedSearch) {
        setSyncedSearch(filters.search);
        setSearchValue(filters.search);
    }

    const updateParams = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        if (!("page" in updates)) params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => updateParams({ search: value || undefined }), 400);
    };

    const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
    const currentPage = meta?.page ?? 1;
    const hasActiveFilters = Boolean(filters.search || filters.isPublished);

    const classes = useMemo(() => {
        const map = new Map<number, { id: number; name: string; sections: Map<number, { id: number; name: string }> }>();
        enrollments.forEach((e) => {
            if (!map.has(e.classId)) {
                map.set(e.classId, { id: e.classId, name: e.className, sections: new Map() });
            }
            map.get(e.classId)!.sections.set(e.sectionId, { id: e.sectionId, name: e.sectionName });
        });
        return Array.from(map.values());
    }, [enrollments]);

    const sectionsForSelectedClass = useMemo(() => {
        const cls = classes.find((c) => c.id === selectedClassId);
        return cls ? Array.from(cls.sections.values()) : [];
    }, [classes, selectedClassId]);

    const studentsInSection = useMemo(() => {
        if (!selectedSectionId) return [];
        return enrollments
            .filter((e) => e.sectionId === selectedSectionId)
            .sort((a, b) => String(a.student.rollNumber ?? "").localeCompare(String(b.student.rollNumber ?? "")));
    }, [enrollments, selectedSectionId]);

    const handleDelete = () => {
        if (!deleteTarget) return;
        startDeleteTransition(async () => {
            const result = await deleteResult(deleteTarget.id);
            if (result.success) {
                toast.success(result.message);
                setDeleteTarget(null);
                router.refresh();
                setCombinedRankingRefreshKey((k) => k + 1);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleTogglePublish = (resultId: number, isPublished: boolean) => {
        setPublishingId(resultId);
        startPublishTransition(async () => {
            const response = await publishResult(resultId, !isPublished);
            if (response.success) {
                toast.success(response.message);
                router.refresh();
                setCombinedRankingRefreshKey((k) => k + 1);
            } else {
                toast.error(response.message);
            }
            setPublishingId(null);
        });
    };

    const handleCalculatePositions = () => {
        if (!selectedExamId || !selectedClassId || !selectedSectionId) return;
        startCalculateTransition(async () => {
            const response = await calculatePositions(selectedExamId, selectedClassId, selectedSectionId);
            if (response.success) {
                toast.success(response.message);
                router.refresh();
                setCombinedRankingRefreshKey((k) => k + 1);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <ExamSelector
                exams={exams}
                selectedExamId={selectedExamId}
                onSelect={(value) => {
                    updateParams({ examId: value, classId: undefined, sectionId: undefined, page: undefined });
                    setSelectedSubjectId(null);
                }}
            />

            {!selectedExamId ? (
                <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
                    ফলাফল দেখতে বা যোগ করতে উপরে থেকে একটি পরীক্ষা নির্বাচন করুন।
                </div>
            ) : (
                <>
                    <ClassSectionPicker
                        classes={classes}
                        sectionsForSelectedClass={sectionsForSelectedClass}
                        selectedClassId={selectedClassId}
                        selectedSectionId={selectedSectionId}
                        onSelectClass={(classId) => {
                            updateParams({ classId: String(classId), sectionId: undefined, page: undefined });
                            setSelectedSubjectId(null);
                        }}
                        onSelectSection={(sectionId) => {
                            updateParams({ sectionId: String(sectionId), page: undefined });
                            setSelectedSubjectId(null);
                        }}
                    />

                    {selectedSectionId && (
                        <SubjectPicker
                            subjects={sectionSubjects}
                            isLoading={isLoadingSubjects}
                            selectedSubjectId={selectedSubjectId}
                            onSelect={(subjectId) => {
                                setSelectedSubjectId(subjectId);
                                setTimeout(() => {
                                    markSheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 100);
                            }}
                        />
                    )}

                    {selectedSectionId && selectedSubjectId && (
                        <div ref={markSheetRef}>
                            <MarkEntrySheet
                                examId={selectedExamId}
                                subject={sectionSubjects.find((s) => s.id === selectedSubjectId)!}
                                students={studentsInSection}
                                results={results}
                                onSaved={() => router.refresh()}
                            />
                        </div>
                    )}

                    {selectedSectionId && (
                        <SectionRankingTable
                            sectionResults={sectionResults}
                            combinedRanking={combinedRanking}
                            results={results}
                            isCalculating={isCalculating}
                            isPublishing={isPublishing}
                            publishingId={publishingId}
                            onCalculatePositions={handleCalculatePositions}
                            onEdit={(result) => {
                                setEditingResult(result);
                                setEditDialogOpen(true);
                            }}
                            onTogglePublish={handleTogglePublish}
                            onDelete={(result) => setDeleteTarget(result)}
                        />
                    )}

                    {selectedSectionId && (
                        <CombinedRankingTable
                            ranking={combinedRanking}
                            isLoading={isLoadingCombinedRanking}
                        />
                    )}
                </>
            )}

            {editingResult && (
                <ResultDetailEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    result={editingResult}
                    subjects={subjects}
                    onSuccess={() => {
                        router.refresh();
                        setCombinedRankingRefreshKey((k) => k + 1);
                    }}
                />
            )}

            <DeleteResultDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
            />
        </div>
    );
}