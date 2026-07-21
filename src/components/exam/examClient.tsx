"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Settings2,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
    createExam,
    createExamType,
    deleteExam,
    deleteExamType,
    updateExam,
    updateExamType,
    type Exam,
    type ExamType,
} from "@/service/exam/exam.service";

export interface AcademicYearOption {
    id: number;
    title: string;
}

interface ActionState {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

const initialActionState: ActionState = { success: false, message: "" };

const EXAM_NAME_OPTIONS = [
    "Half Yearly -1",
    "Half Yearly -2",
    "Final",
];

interface ExamsClientProps {
    exams: Exam[];
    meta: { page: number; limit: number; total: number } | null;
    examTypes: ExamType[];
    academicYears: AcademicYearOption[];
    filters: {
        search: string;
        academicYearId: string;
        examTypeId: string;
        isPublished: string;
    };
}

function useDebouncedCallback<T extends (...args: string[]) => void>(callback: T, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    return (...args: Parameters<T>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(...args), delay);
    };
}

function formatDate(value: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ExamsClient({ exams, meta, examTypes, academicYears, filters }: ExamsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(filters.search);
    const [syncedSearch, setSyncedSearch] = useState(filters.search);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [typesDialogOpen, setTypesDialogOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();

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

    const debouncedSearch = useDebouncedCallback((value: string) => {
        updateParams({ search: value || undefined });
    }, 400);

    const hasActiveFilters =
        filters.search || filters.academicYearId || filters.examTypeId || filters.isPublished;

    const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
    const currentPage = meta?.page ?? 1;

    const examTypeName = (id: number) => examTypes.find((type) => type.id === id)?.name ?? "—";
    const academicYearLabel = (id: number) => academicYears.find((year) => year.id === id)?.title ?? "—";

    const handleDelete = () => {
        if (!deleteTarget) return;
        startDeleteTransition(async () => {
            const result = await deleteExam(deleteTarget.id);
            if (result.success) {
                toast.success(result.message);
                setDeleteTarget(null);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                    <div>
                        <CardTitle>Exams</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {meta ? `${meta.total} total exam${meta.total === 1 ? "" : "s"}` : "Loading exams"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setTypesDialogOpen(true)}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            Manage types
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingExam(null);
                                setFormDialogOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New exam
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exams..."
                                className="pl-8"
                                value={searchValue}
                                onChange={(event) => {
                                    setSearchValue(event.target.value);
                                    debouncedSearch(event.target.value);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.academicYearId || "all"}
                            onValueChange={(value) => updateParams({ academicYearId: value })}
                        >
                            <SelectTrigger className="sm:w-[160px]">
                                <SelectValue placeholder="Academic year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All years</SelectItem>
                                {academicYears.map((year) => (
                                    <SelectItem key={year.id} value={String(year.id)}>
                                        {year.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.examTypeId || "all"}
                            onValueChange={(value) => updateParams({ examTypeId: value })}
                        >
                            <SelectTrigger className="sm:w-[160px]">
                                <SelectValue placeholder="Exam type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {examTypes.map((type) => (
                                    <SelectItem key={type.id} value={String(type.id)}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.isPublished || "all"}
                            onValueChange={(value) => updateParams({ isPublished: value })}
                        >
                            <SelectTrigger className="sm:w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="true">Published</SelectItem>
                                <SelectItem value="false">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchValue("");
                                    router.push(pathname);
                                }}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Academic year</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Start date</TableHead>
                                    <TableHead>End date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[60px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No exams found. Adjust your filters or create a new exam.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">{exam.name}</TableCell>
                                            <TableCell>
                                                {exam.academicYear?.title ?? academicYearLabel(exam.academicYearId)}
                                            </TableCell>
                                            <TableCell>{exam.examType?.name ?? examTypeName(exam.examTypeId)}</TableCell>
                                            <TableCell>{formatDate(exam.startDate)}</TableCell>
                                            <TableCell>{formatDate(exam.endDate)}</TableCell>
                                            <TableCell>
                                                <Badge variant={exam.isPublished ? "default" : "secondary"}>
                                                    {exam.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingExam(exam);
                                                                setFormDialogOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteTarget(exam)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => updateParams({ page: String(currentPage - 1) })}
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => updateParams({ page: String(currentPage + 1) })}
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ExamFormDialog
                key={editingExam ? `edit-${editingExam.id}` : "create"}
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                exam={editingExam}
                examTypes={examTypes}
                academicYears={academicYears}
                onSuccess={() => router.refresh()}
            />

            <ExamTypesDialog
                open={typesDialogOpen}
                onOpenChange={setTypesDialogOpen}
                examTypes={examTypes}
                onChanged={() => router.refresh()}
            />

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{deleteTarget?.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

interface ExamFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
    examTypes: ExamType[];
    academicYears: AcademicYearOption[];
    onSuccess: () => void;
}

function ExamFormDialog({ open, onOpenChange, exam, examTypes, academicYears, onSuccess }: ExamFormDialogProps) {
    const isEditMode = Boolean(exam);
    const wasPublished = exam?.isPublished ?? false;
    const action = isEditMode && exam ? updateExam.bind(null, exam.id) : createExam;
    const [state, formAction, isPending] = useActionState(action, initialActionState);
    const [isPublished, setIsPublished] = useState(exam?.isPublished ?? false);

    const coreFieldsLocked = isEditMode && wasPublished && isPublished;

    useEffect(() => {
        if (state === initialActionState) return;
        if (state.success) {
            toast.success(state.message);
            onOpenChange(false);
            onSuccess();
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    const fieldError = (field: string) => state.errors?.[field]?.[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit exam" : "Create exam"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the exam details below."
                            : "Schedule a new exam and assign it to an academic year."}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-4">
                    {coreFieldsLocked && (
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                            This exam is published, so its core details are locked. Turn off &quot;Publish exam&quot;
                            below to unpublish it and make changes.
                        </div>
                    )}
                    <fieldset disabled={coreFieldsLocked} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Exam name</Label>
                            <Select name="name" defaultValue={exam?.name} disabled={coreFieldsLocked}>
                                <SelectTrigger id="name">
                                    <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXAM_NAME_OPTIONS.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="academicYearId">Academic year</Label>
                                <Select
                                    name="academicYearId"
                                    defaultValue={exam ? String(exam.academicYearId) : undefined}
                                    disabled={coreFieldsLocked}
                                >
                                    <SelectTrigger id="academicYearId">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.id} value={String(year.id)}>
                                                {year.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldError("academicYearId") && (
                                    <p className="text-sm text-destructive">{fieldError("academicYearId")}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="examTypeId">Exam type</Label>
                                <Select
                                    name="examTypeId"
                                    defaultValue={exam ? String(exam.examTypeId) : undefined}
                                    disabled={coreFieldsLocked}
                                >
                                    <SelectTrigger id="examTypeId">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {examTypes.map((type) => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldError("examTypeId") && (
                                    <p className="text-sm text-destructive">{fieldError("examTypeId")}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="startDate">Start date</Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    defaultValue={exam?.startDate?.slice(0, 10)}
                                />
                                {fieldError("startDate") && (
                                    <p className="text-sm text-destructive">{fieldError("startDate")}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="endDate">End date</Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    defaultValue={exam?.endDate?.slice(0, 10)}
                                />
                                {fieldError("endDate") && (
                                    <p className="text-sm text-destructive">{fieldError("endDate")}</p>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <p className="text-sm font-medium">Publish exam</p>
                            <p className="text-sm text-muted-foreground">
                                {isEditMode && wasPublished
                                    ? "Turn off to unpublish and unlock editing."
                                    : "Visible to teachers and students once published."}
                            </p>
                        </div>
                        <Switch checked={isPublished} onCheckedChange={setIsPublished} name="isPublishedToggle" />
                        <input type="hidden" name="isPublished" value={String(isPublished)} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save changes" : "Create exam"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ExamTypesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examTypes: ExamType[];
    onChanged: () => void;
}

function ExamTypesDialog({ open, onOpenChange, examTypes, onChanged }: ExamTypesDialogProps) {
    const [newTypeName, setNewTypeName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<ExamType | null>(null);
    const [isPending, startTransition] = useTransition();

    const resetAndClose = () => {
        setNewTypeName("");
        setEditingId(null);
        setEditingName("");
    };

    const handleCreate = () => {
        if (!newTypeName.trim()) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.set("name", newTypeName.trim());
            const result = await createExamType(initialActionState, formData);
            if (result.success) {
                toast.success(result.message);
                setNewTypeName("");
                onChanged();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleUpdate = (id: number) => {
        if (!editingName.trim()) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.set("name", editingName.trim());
            const result = await updateExamType(id, initialActionState, formData);
            if (result.success) {
                toast.success(result.message);
                setEditingId(null);
                onChanged();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        startTransition(async () => {
            const result = await deleteExamType(deleteTarget.id);
            if (result.success) {
                toast.success(result.message);
                setDeleteTarget(null);
                onChanged();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (!next) resetAndClose();
                    onOpenChange(next);
                }}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Manage exam types</DialogTitle>
                        <DialogDescription>Add, rename, or remove exam types used across the system.</DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. Final Examination"
                            value={newTypeName}
                            onChange={(event) => setNewTypeName(event.target.value)}
                            onKeyDown={(event) => event.key === "Enter" && handleCreate()}
                        />
                        <Button onClick={handleCreate} disabled={isPending || !newTypeName.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
                        {examTypes.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">No exam types yet.</p>
                        )}
                        {examTypes.map((type) => (
                            <div key={type.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                                {editingId === type.id ? (
                                    <>
                                        <Input
                                            className="h-8"
                                            value={editingName}
                                            onChange={(event) => setEditingName(event.target.value)}
                                            onKeyDown={(event) => event.key === "Enter" && handleUpdate(type.id)}
                                            autoFocus
                                        />
                                        <Button size="sm" variant="ghost" onClick={() => handleUpdate(type.id)} disabled={isPending}>
                                            Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm">{type.name}</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                setEditingId(type.id);
                                                setEditingName(type.name);
                                            }}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(type)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete exam type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deleting &quot;{deleteTarget?.name}&quot; may affect exams currently assigned to it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleDelete();
                            }}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}