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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    Check,
    Hash,
    Award,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSubject, deleteSubject, Subject, updateSubject } from "@/service/subject/subject.service";

interface ClassesSubjectsClientProps {
    initialSubjects: Subject[];
}

const initialForm = {
    code: "",
    name: "",
    fullMarks: "",
    passMarks: "",
    credit: "",
    isOptional: false,
};

export default function ClassesSubjectsClient({
    initialSubjects,
}: ClassesSubjectsClientProps) {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();

    const filteredSubjects = useMemo(() => {
        if (!search.trim()) return subjects;
        const q = search.toLowerCase();
        return subjects.filter(
            (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
        );
    }, [search, subjects]);

    const openCreateModal = () => {
        setEditingSubject(null);
        setForm(initialForm);
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setForm({
            code: subject.code,
            name: subject.name,
            fullMarks: String(subject.fullMarks),
            passMarks: String(subject.passMarks),
            credit: subject.credit != null ? String(subject.credit) : "",
            isOptional: subject.isOptional,
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleModalChange = (nextOpen: boolean) => {
        setModalOpen(nextOpen);
        if (!nextOpen) {
            setForm(initialForm);
            setErrors({});
            setEditingSubject(null);
        }
    };

    const handleChange = (field: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = () => {
        const nextErrors: Record<string, string> = {};
        if (!form.code.trim()) nextErrors.code = "বিষয় কোড আবশ্যক";
        if (!form.name.trim()) nextErrors.name = "বিষয়ের নাম আবশ্যক";
        if (!form.fullMarks) nextErrors.fullMarks = "পূর্ণ নম্বর আবশ্যক";
        if (!form.passMarks) nextErrors.passMarks = "পাস নম্বর আবশ্যক";
        if (
            form.fullMarks &&
            form.passMarks &&
            Number(form.passMarks) > Number(form.fullMarks)
        ) {
            nextErrors.passMarks = "পাস নম্বর পূর্ণ নম্বরের চেয়ে বেশি হতে পারবে না";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("code", form.code.trim());
            formData.append("name", form.name.trim());
            formData.append("fullMarks", form.fullMarks);
            formData.append("passMarks", form.passMarks);
            if (form.credit) formData.append("credit", form.credit);
            formData.append("isOptional", String(form.isOptional));

            const result = editingSubject
                ? await updateSubject(editingSubject.id, null, formData)
                : await createSubject(null, formData);

            if (result.success) {
                toast.success(result.message);

                if (editingSubject && result.data) {
                    // update existing subject in place
                    setSubjects((prev) =>
                        prev.map((s) => (s.id === editingSubject.id ? result.data : s))
                    );
                } else if (result.data) {
                    // prepend newly created subject
                    setSubjects((prev) => [result.data, ...prev]);
                }

                handleModalChange(false);
            } else {
                toast.error(result.message);
                if (result.errors) setErrors(result.errors);
            }
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        startDeleteTransition(async () => {
            const result = await deleteSubject(deleteTarget.id);

            if (result.success) {
                toast.success(result.message);
                setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 px-6 py-8 sm:px-8">
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="subjects-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#subjects-dots)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">ক্লাস ও বিষয়সমূহ</h1>
                        </div>
                        <p className="text-rose-50/90 text-sm">
                            প্রতিষ্ঠানের সকল বিষয় এখান থেকে পরিচালনা করুন
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="gap-2 bg-white text-rose-600 hover:bg-rose-50 shadow-lg border-0 font-semibold"
                    >
                        <Plus className="h-4 w-4" />
                        নতুন বিষয় যোগ করুন
                    </Button>
                </div>
            </div>

            {/* Search + stats bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="বিষয় খুঁজুন..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-11 rounded-xl border-gray-200"
                    />
                </div>

                <Badge
                    variant="secondary"
                    className="w-fit gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    মোট {filteredSubjects.length} টি বিষয়
                </Badge>
            </div>

            {/* Subjects grid */}
            {filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                        <BookOpen className="h-7 w-7 text-rose-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">কোনো বিষয় পাওয়া যায়নি</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {search ? "অন্য কিছু খুঁজে দেখুন" : "প্রথমে একটি বিষয় যোগ করুন"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSubjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center border border-rose-100">
                                        <BookOpen className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 leading-tight">
                                            {subject.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                            {subject.code}
                                        </p>
                                    </div>
                                </div>

                                {/* Action buttons — appear on hover */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(subject)}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(subject)}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                                    <Hash className="h-3 w-3" />
                                    পূর্ণ: {subject.fullMarks}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <Check className="h-3 w-3" />
                                    পাস: {subject.passMarks}
                                </span>
                                {subject.credit != null && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                                        <Award className="h-3 w-3" />
                                        ক্রেডিট: {subject.credit}
                                    </span>
                                )}
                                {subject.isOptional && (
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                        ঐচ্ছিক
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={handleModalChange}>
                <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-rose-600 to-amber-500 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {editingSubject ? "বিষয় সম্পাদনা করুন" : "নতুন বিষয় যোগ করুন"}
                            </DialogTitle>
                            <DialogDescription className="text-rose-50/90">
                                বিষয়ের তথ্য পূরণ করুন
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="code" className="text-xs font-medium text-gray-600">
                                    বিষয় কোড *
                                </Label>
                                <Input
                                    id="code"
                                    placeholder="যেমনঃ 101"
                                    value={form.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    className={cn(
                                        "h-11 rounded-xl",
                                        errors.code && "border-red-300 focus-visible:ring-red-500"
                                    )}
                                />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="credit" className="text-xs font-medium text-gray-600">
                                    ক্রেডিট (ঐচ্ছিক)
                                </Label>
                                <Input
                                    id="credit"
                                    type="number"
                                    step="0.1"
                                    placeholder="যেমনঃ ৩.০"
                                    value={form.credit}
                                    onChange={(e) => handleChange("credit", e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium text-gray-600">
                                বিষয়ের নাম *
                            </Label>
                            <Input
                                id="name"
                                placeholder="যেমনঃ পদার্থবিজ্ঞান"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={cn(
                                    "h-11 rounded-xl",
                                    errors.name && "border-red-300 focus-visible:ring-red-500"
                                )}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="fullMarks" className="text-xs font-medium text-gray-600">
                                    পূর্ণ নম্বর *
                                </Label>
                                <Input
                                    id="fullMarks"
                                    type="number"
                                    placeholder="১০০"
                                    value={form.fullMarks}
                                    onChange={(e) => handleChange("fullMarks", e.target.value)}
                                    className={cn(
                                        "h-11 rounded-xl",
                                        errors.fullMarks && "border-red-300 focus-visible:ring-red-500"
                                    )}
                                />
                                {errors.fullMarks && (
                                    <p className="text-xs text-red-500">{errors.fullMarks}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="passMarks" className="text-xs font-medium text-gray-600">
                                    পাস নম্বর *
                                </Label>
                                <Input
                                    id="passMarks"
                                    type="number"
                                    placeholder="৩৩"
                                    value={form.passMarks}
                                    onChange={(e) => handleChange("passMarks", e.target.value)}
                                    className={cn(
                                        "h-11 rounded-xl",
                                        errors.passMarks && "border-red-300 focus-visible:ring-red-500"
                                    )}
                                />
                                {errors.passMarks && (
                                    <p className="text-xs text-red-500">{errors.passMarks}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="isOptional"
                                checked={form.isOptional}
                                onCheckedChange={(checked) => handleChange("isOptional", checked === true)}
                            />
                            <Label htmlFor="isOptional" className="text-sm font-normal cursor-pointer">
                                এটি একটি ঐচ্ছিক বিষয়
                            </Label>
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
                            className="flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white border-0"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    {editingSubject ? "হালনাগাদ করুন" : "তৈরি করুন"}
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
                        <AlertDialogTitle>বিষয় মুছে ফেলুন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong> বিষয়টি মুছে ফেলতে চান?
                            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
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