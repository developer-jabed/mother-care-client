"use client";

import { useState, useTransition, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Layers,
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    Check,
    X,
    GraduationCap,
    BookOpen,
    Rows3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClassSubject, deleteClassSubject, updateClassSubject } from "@/service/subject/classSubject/classSubject.service";
import type { ClassSubject as ClassSubjectBase } from "@/service/subject/classSubject/classSubject.service";
interface SectionOption {
    id: number;
    name: string;
}

interface ClassOption {
    id: number;
    name: string;
    sections: SectionOption[];
}

interface SubjectOption {
    id: number;
    name: string;
    code: string;
}

// The API returns nested relations via Prisma `include: { class, section, subject }`.
// The nested `class`/`section` objects are lightweight (no `sections` array) —
// only the top-level `classes` prop (from getClasses) carries nested sections.
type ClassSubject = ClassSubjectBase & {
    class: { id: number; name: string };
    section: { id: number; name: string } | null;
    subject: SubjectOption;
};

interface ClassSubjectClientProps {
    initialClassSubjects: ClassSubject[];
    classes: ClassOption[];
    subjects: SubjectOption[];
}

const initialForm = {
    classId: "",
    sectionId: "",
    subjectId: "",
};

export default function ClassSubjectClient({
    initialClassSubjects,
    classes = [],
    subjects = [],
}: ClassSubjectClientProps) {
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>(
        initialClassSubjects ?? []
    );
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState<string>("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ClassSubject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClassSubject | null>(null);

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();

    // Sections are derived from the already-loaded classes list (no fetch needed)
    const sectionsForForm = useMemo(() => {
        if (!form.classId) return [];
        const selectedClass = classes.find((c) => String(c.id) === form.classId);
        return selectedClass?.sections ?? [];
    }, [form.classId, classes]);

    const filteredItems = useMemo(() => {
        let list = classSubjects;

        if (classFilter !== "all") {
            list = list.filter((cs) => String(cs.classId) === classFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((cs) => {
                const subjectName = cs.subject?.name?.toLowerCase() ?? "";
                const className = cs.class?.name?.toLowerCase() ?? "";
                return subjectName.includes(q) || className.includes(q);
            });
        }

        return list;
    }, [classSubjects, classFilter, search]);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm(initialForm);
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (item: ClassSubject) => {
        setEditingItem(item);
        setForm({
            classId: String(item.classId),
            sectionId: item.sectionId ? String(item.sectionId) : "",
            subjectId: String(item.subjectId),
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleModalChange = (nextOpen: boolean) => {
        setModalOpen(nextOpen);
        if (!nextOpen) {
            setForm(initialForm);
            setErrors({});
            setEditingItem(null);
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
        if (!form.classId) nextErrors.classId = "ক্লাস নির্বাচন করুন";
        if (!form.subjectId) nextErrors.subjectId = "বিষয় নির্বাচন করুন";

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("classId", form.classId);
            if (form.sectionId) formData.append("sectionId", form.sectionId);
            formData.append("subjectId", form.subjectId);

            const result = editingItem
                ? await updateClassSubject(editingItem.id, null, formData)
                : await createClassSubject(null, formData);

            if (result.success) {
                toast.success(result.message);
                handleModalChange(false);
            } else {
                toast.error(result.message);
                if (result.errors) setErrors(result.errors as Record<string, string>);
            }
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        startDeleteTransition(async () => {
            const result = await deleteClassSubject(deleteTarget.id);

            if (result.success) {
                toast.success(result.message);
                setClassSubjects((prev) => prev.filter((cs) => cs.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                toast.error(result.message);
                setDeleteTarget(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-6 py-8 sm:px-8">
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="class-subject-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#class-subject-dots)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Layers className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">ক্লাস-বিষয় নির্ধারণ</h1>
                        </div>
                        <p className="text-indigo-50/90 text-sm">
                            প্রতিটি ক্লাস ও শাখার জন্য বিষয় নির্ধারণ করুন
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="gap-2 bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg border-0 font-semibold"
                    >
                        <Plus className="h-4 w-4" />
                        নতুন নির্ধারণ যোগ করুন
                    </Button>
                </div>
            </div>

            {/* Search + filter + stats bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ক্লাস বা বিষয় খুঁজুন..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-11 rounded-xl border-gray-200"
                        />
                    </div>

                    <Select value={classFilter} onValueChange={setClassFilter}>
                        <SelectTrigger className="h-11 rounded-xl w-full sm:w-48">
                            <SelectValue placeholder="সকল ক্লাস" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">সকল ক্লাস</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Badge
                    variant="secondary"
                    className="w-fit gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                    <Layers className="h-3.5 w-3.5" />
                    মোট {filteredItems.length} টি নির্ধারণ
                </Badge>
            </div>

            {/* List */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Layers className="h-7 w-7 text-indigo-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">কোনো নির্ধারণ পাওয়া যায়নি</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {search || classFilter !== "all"
                            ? "অন্য কিছু খুঁজে দেখুন"
                            : "প্রথমে একটি ক্লাস-বিষয় নির্ধারণ যোগ করুন"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => {
                        if (!item) return null;
                        const className = item.class?.name ?? "অজানা ক্লাস";
                        const sectionName = item.section?.name ?? null;
                        const subject = item.subject ?? null;

                        return (
                            <div
                                key={item.id}
                                className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center justify-center border border-indigo-100">
                                            <BookOpen className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 leading-tight">
                                                {subject?.name ?? "অজানা বিষয়"}
                                            </h3>
                                            {subject?.code && (
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                    {subject.code}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(item)}
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                                        <GraduationCap className="h-3 w-3" />
                                        {className}
                                    </span>
                                    {sectionName ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                                            <Rows3 className="h-3 w-3" />
                                            শাখা: {sectionName}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                                            সকল শাখা
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={handleModalChange}>
                <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-600 to-sky-500 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                {editingItem ? "নির্ধারণ সম্পাদনা করুন" : "নতুন নির্ধারণ যোগ করুন"}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-50/90">
                                ক্লাস, শাখা ও বিষয় নির্বাচন করুন
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="classId" className="text-xs font-medium text-gray-600">
                                ক্লাস *
                            </Label>
                            <Select
                                value={form.classId}
                                onValueChange={(value) => handleChange("classId", value)}
                            >
                                <SelectTrigger
                                    id="classId"
                                    className={cn(
                                        "h-11 rounded-xl w-full",
                                        errors.classId && "border-red-300 focus-visible:ring-red-500"
                                    )}
                                >
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
                            {errors.classId && <p className="text-xs text-red-500">{errors.classId}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="sectionId" className="text-xs font-medium text-gray-600">
                                শাখা (ঐচ্ছিক)
                            </Label>
                            <Select
                                value={form.sectionId}
                                onValueChange={(value) => handleChange("sectionId", value)}
                                disabled={!form.classId}
                            >
                                <SelectTrigger id="sectionId" className="h-11 rounded-xl w-full">
                                    <SelectValue
                                        placeholder={!form.classId ? "প্রথমে ক্লাস নির্বাচন করুন" : "সকল শাখা"}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionsForForm.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                            এই ক্লাসে কোনো শাখা নেই
                                        </div>
                                    ) : (
                                        sectionsForForm.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-400">
                                শাখা নির্বাচন না করলে বিষয়টি ক্লাসের সকল শাখার জন্য প্রযোজ্য হবে
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="subjectId" className="text-xs font-medium text-gray-600">
                                বিষয় *
                            </Label>
                            <Select
                                value={form.subjectId}
                                onValueChange={(value) => handleChange("subjectId", value)}
                            >
                                <SelectTrigger
                                    id="subjectId"
                                    className={cn(
                                        "h-11 rounded-xl w-full",
                                        errors.subjectId && "border-red-300 focus-visible:ring-red-500"
                                    )}
                                >
                                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name} ({s.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.subjectId && (
                                <p className="text-xs text-red-500">{errors.subjectId}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="px-6 pb-6 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleModalChange(false)}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl"
                        >
                            <X className="h-4 w-4 mr-1" />
                            বাতিল
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white border-0"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    {editingItem ? "হালনাগাদ করুন" : "তৈরি করুন"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>নির্ধারণ মুছে ফেলুন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে{" "}
                            <strong>{deleteTarget?.subject?.name ?? ""}</strong>{" "}
                            বিষয়ের এই নির্ধারণটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            মুছে ফেলুন
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}