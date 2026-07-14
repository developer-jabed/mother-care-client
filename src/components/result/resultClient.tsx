"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Layers,
    Loader2,
    MoreHorizontal,
    Pencil,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    createResult,
    deleteResult,
    publishResult,
    calculatePositions,
    updateResult,
    type Result,
    type ResultDetailPayload,
} from "@/service/result/result.service";
import type { Exam } from "@/service/exam/exam.service";
import { getSubjectsForClassSection, SubjectForSection } from "@/service/subject/classSubject/classSubject.service";

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
    filters: {
        search: string;
        isPublished: string;
    };
}

function studentLabel(enrollments: EnrollmentOption[], studentEnrollmentId: number) {
    const match = enrollments.find((enrollment) => enrollment.id === studentEnrollmentId);
    if (!match) return `এনরোলমেন্ট #${studentEnrollmentId}`;
    return match.student.rollNumber
        ? `${match.student.name} (রোল ${match.student.rollNumber})`
        : match.student.name;
}

export function ResultsClient({
    exams,
    selectedExamId,
    results,
    meta,
    subjects,
    enrollments,
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

    // ── Class → Section → Subject selection for the mark-entry sheet ──
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [showAllResults, setShowAllResults] = useState(false);

    const markSheetRef = useRef<HTMLDivElement>(null);
    // ── Subjects scoped to the selected class + section ───────────────
    // ── Subjects scoped to the selected class + section ───────────────
    const [fetchedSubjects, setFetchedSubjects] = useState<SubjectForSection[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

    const sectionSubjects = selectedClassId && selectedSectionId ? fetchedSubjects : [];

    useEffect(() => {
        if (!selectedClassId || !selectedSectionId) {
            return;
        }

        let cancelled = false;

        getSubjectsForClassSection(selectedClassId, selectedSectionId)
            .then((data) => {
                if (!cancelled) {
                    setFetchedSubjects(data);
                    setIsLoadingSubjects(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFetchedSubjects([]);
                    setIsLoadingSubjects(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedClassId, selectedSectionId]);

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
    const hasActiveFilters = filters.search || filters.isPublished;

    // ── Group enrollments into Class → Section for step-through picking ────
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
            .sort((a, b) =>
                String(a.student.rollNumber ?? "").localeCompare(String(b.student.rollNumber ?? ""))
            );
    }, [enrollments, selectedSectionId]);

    const handleDelete = () => {
        if (!deleteTarget) return;
        startDeleteTransition(async () => {
            const result = await deleteResult(deleteTarget.id);
            if (result.success) {
                toast.success(result.message);
                setDeleteTarget(null);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleTogglePublish = (result: Result) => {
        setPublishingId(result.id);
        startPublishTransition(async () => {
            const response = await publishResult(result.id, !result.isPublished);
            if (response.success) {
                toast.success(response.message);
                router.refresh();
            } else {
                toast.error(response.message);
            }
            setPublishingId(null);
        });
    };

    const handleCalculatePositions = () => {
        if (!selectedExamId) return;
        startCalculateTransition(async () => {
            const response = await calculatePositions(selectedExamId);
            if (response.success) {
                toast.success(response.message);
                router.refresh();
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* ── Step 1: Exam ─────────────────────────────────────────── */}
            <Card>
                <CardHeader className="space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
                        পরীক্ষা নির্বাচন করুন
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedExamId ? String(selectedExamId) : undefined}
                        onValueChange={(value) => {
                            updateParams({ examId: value });
                            setSelectedClassId(null);
                            setSelectedSectionId(null);
                            setSelectedSubjectId(null);
                        }}
                    >
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

            {!selectedExamId ? (
                <Card>
                    <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                        ফলাফল দেখতে বা যোগ করতে উপরে থেকে একটি পরীক্ষা নির্বাচন করুন।
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* ── Step 2: Class ──────────────────────────────────── */}
                    <Card>
                        <CardHeader className="space-y-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
                                শ্রেণি নির্বাচন করুন
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {classes.length === 0 && (
                                <p className="text-sm text-muted-foreground">এই পরীক্ষার জন্য কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
                            )}
                            {classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => {
                                        setSelectedClassId(cls.id);
                                        setSelectedSectionId(null);
                                        setSelectedSubjectId(null);
                                    }}
                                    className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedClassId === cls.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input bg-background hover:bg-accent"
                                        }`}
                                >
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    {cls.name}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* ── Step 3: Section ────────────────────────────────── */}
                    {selectedClassId && (
                        <Card>
                            <CardHeader className="space-y-0">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">3</span>
                                    শাখা নির্বাচন করুন
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {sectionsForSelectedClass.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setSelectedSectionId(section.id);
                                            setSelectedSubjectId(null);
                                        }}
                                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedSectionId === section.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input bg-background hover:bg-accent"
                                            }`}
                                    >
                                        <Layers className="h-3.5 w-3.5" />
                                        শাখা {section.name}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Step 4: Subject (scoped to Class + Section) ────── */}
                    {selectedSectionId && (
                        <Card>
                            <CardHeader className="space-y-0">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">4</span>
                                    বিষয় নির্বাচন করুন
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {isLoadingSubjects ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        বিষয় লোড হচ্ছে...
                                    </div>
                                ) : sectionSubjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        এই শ্রেণি/শাখার জন্য কোনো বিষয় নির্ধারণ করা হয়নি। প্রথমে বিষয় নির্ধারণ করুন।
                                    </p>
                                ) : (
                                    sectionSubjects.map((subject) => (
                                        <button
                                            key={subject.id}
                                            onClick={() => {
                                                setSelectedSubjectId(subject.id);
                                                setTimeout(() => {
                                                    markSheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                }, 100);
                                            }}
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
                    )}

                    {/* ── Step 5: Mark entry sheet ───────────────────────── */}
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

                    {/* ── All results (management table) ─────────────────── */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                            <div>
                                <button
                                    onClick={() => setShowAllResults((v) => !v)}
                                    className="text-left"
                                >
                                    <CardTitle className="hover:underline">
                                        সকল ফলাফল {showAllResults ? "লুকান" : "দেখুন"}
                                    </CardTitle>
                                </button>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {meta ? `মোট ${meta.total}টি ফলাফল` : "লোড হচ্ছে"}
                                </p>
                            </div>
                            {showAllResults && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCalculatePositions}
                                    disabled={isCalculating || results.length === 0}
                                >
                                    {isCalculating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                    )}
                                    অবস্থান নির্ধারণ করুন
                                </Button>
                            )}
                        </CardHeader>
                        {showAllResults && (
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative flex-1 sm:max-w-xs">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="শিক্ষার্থী খুঁজুন..."
                                            className="pl-8"
                                            value={searchValue}
                                            onChange={(event) => handleSearchChange(event.target.value)}
                                        />
                                    </div>
                                    <Select
                                        value={filters.isPublished || "all"}
                                        onValueChange={(value) => updateParams({ isPublished: value })}
                                    >
                                        <SelectTrigger className="sm:w-[160px]">
                                            <SelectValue placeholder="অবস্থা" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">সকল অবস্থা</SelectItem>
                                            <SelectItem value="true">প্রকাশিত</SelectItem>
                                            <SelectItem value="false">অপ্রকাশিত</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSearchValue("");
                                                updateParams({ search: undefined, isPublished: undefined });
                                            }}
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            মুছুন
                                        </Button>
                                    )}
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>শিক্ষার্থী</TableHead>
                                                <TableHead>মোট নম্বর</TableHead>
                                                <TableHead>শতকরা</TableHead>
                                                <TableHead>গ্রেড</TableHead>
                                                <TableHead>অবস্থান</TableHead>
                                                <TableHead>অবস্থা</TableHead>
                                                <TableHead className="w-[60px]" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                        কোনো ফলাফল পাওয়া যায়নি।
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                results.map((result) => (
                                                    <TableRow key={result.id}>
                                                        <TableCell className="font-medium">
                                                            {studentLabel(enrollments, result.studentEnrollmentId)}
                                                        </TableCell>
                                                        <TableCell>{result.totalMarks}</TableCell>
                                                        <TableCell>{result.percentage.toFixed(2)}%</TableCell>
                                                        <TableCell>{result.grade}</TableCell>
                                                        <TableCell>{result.position ?? "—"}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={result.isPublished ? "default" : "secondary"}>
                                                                {result.isPublished ? "প্রকাশিত" : "অপ্রকাশিত"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        {isPublishing && publishingId === result.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        disabled={result.isPublished}
                                                                        onClick={() => {
                                                                            setEditingResult(result);
                                                                            setEditDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        বিস্তারিত সম্পাদনা
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleTogglePublish(result)}>
                                                                        {result.isPublished ? "অপ্রকাশিত করুন" : "প্রকাশ করুন"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        disabled={result.isPublished}
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => setDeleteTarget(result)}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        মুছে ফেলুন
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {meta && meta.total > 0 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            পৃষ্ঠা {currentPage} / {totalPages}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage <= 1}
                                                onClick={() => updateParams({ page: String(currentPage - 1) })}
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                পূর্ববর্তী
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => updateParams({ page: String(currentPage + 1) })}
                                            >
                                                পরবর্তী
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </>
            )}

            {editingResult && (
                <ResultDetailEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    result={editingResult}
                    subjects={subjects}
                    onSuccess={() => router.refresh()}
                />
            )}

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ফলাফল মুছে ফেলুন</AlertDialogTitle>
                        <AlertDialogDescription>
                            এই ফলাফলটি স্থায়ীভাবে মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            মুছে ফেলুন
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

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

function MarkEntrySheet({ examId, subject, students, results, onSaved }: MarkEntrySheetProps) {
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

function ResultDetailEditDialog({ open, onOpenChange, result, subjects, onSuccess }: ResultDetailEditDialogProps) {
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