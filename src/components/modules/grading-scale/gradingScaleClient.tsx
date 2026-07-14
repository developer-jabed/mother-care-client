"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Plus,
    Pencil,
    Trash2,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    Award,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import GradingScaleForm from "./GradingScaleForm";
import { deleteGradingScale } from "@/service/gradingScale/gradingScale.service";
import type { GradingScale } from "@/service/gradingScale/gradingScale.service";

interface AcademicYearOption {
    id: number;
    title: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Props {
    initialGradingScales: GradingScale[];
    initialMeta: PaginationMeta | null;
    initialAcademicYears: AcademicYearOption[];
    currentPage: number;
    selectedAcademicYearId?: string;
}

const ALL = "__all__";

const gradeColorClasses = [
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-slate-100 text-slate-700 border-slate-200",
];

export default function GradingScaleClient({
    initialGradingScales,
    initialMeta,
    initialAcademicYears,
    currentPage,
    selectedAcademicYearId,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [formOpen, setFormOpen] = useState(false);
    const [editingScale, setEditingScale] = useState<GradingScale | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GradingScale | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();

    const updateYearFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === ALL) {
            params.delete("academicYearId");
        } else {
            params.set("academicYearId", value);
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.push(`${pathname}?${params.toString()}`);
    };

    const openCreateForm = () => {
        setEditingScale(null);
        setFormOpen(true);
    };

    const openEditForm = (scale: GradingScale) => {
        setEditingScale(scale);
        setFormOpen(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        startDeleteTransition(async () => {
            const result = await deleteGradingScale(deleteTarget.id);
            if (result.success) {
                toast.success(result.message);
                setDeleteTarget(null);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const totalPages = initialMeta?.totalPages ?? 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                        <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">গ্রেডিং স্কেল</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {initialMeta ? `মোট ${initialMeta.total}টি গ্রেড রেঞ্জ` : "শিক্ষাবর্ষ অনুযায়ী গ্রেডিং সিস্টেম পরিচালনা করুন"}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={openCreateForm}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-200 border-0"
                >
                    <Plus className="h-4 w-4" />
                    নতুন গ্রেড যোগ করুন
                </Button>
            </div>

            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">শিক্ষাবর্ষ:</span>
                    <Select value={selectedAcademicYearId || ALL} onValueChange={updateYearFilter}>
                        <SelectTrigger className="w-full sm:w-64 h-10 rounded-xl border-gray-200">
                            <SelectValue placeholder="সকল শিক্ষাবর্ষ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>সকল শিক্ষাবর্ষ</SelectItem>
                            {initialAcademicYears.map((year) => (
                                <SelectItem key={year.id} value={String(year.id)}>
                                    {year.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {initialGradingScales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-white">
                    <div className="h-16 w-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-violet-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-700">কোনো গ্রেডিং স্কেল পাওয়া যায়নি</p>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                        এই শিক্ষাবর্ষের জন্য প্রথম গ্রেড রেঞ্জ তৈরি করুন
                    </p>
                    <Button onClick={openCreateForm} variant="outline" className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" />
                        গ্রেড যোগ করুন
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {initialGradingScales.map((scale, idx) => (
                            <div
                                key={scale.id}
                                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span
                                        className={`inline-flex items-center justify-center h-12 w-12 rounded-xl border text-lg font-bold ${gradeColorClasses[idx % gradeColorClasses.length]}`}
                                    >
                                        {scale.grade}
                                    </span>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-500 hover:text-violet-600 hover:bg-violet-50"
                                            onClick={() => openEditForm(scale)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteTarget(scale)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-gray-500">শতাংশ পরিসীমা</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {scale.minPercentage}% – {scale.maxPercentage}%
                                        </span>
                                    </div>

                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-gray-500">জিপিএ</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {scale.gradePoint.toFixed(2)}
                                        </span>
                                    </div>

                                    {scale.academicYear?.title && (
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs text-gray-500">শিক্ষাবর্ষ</span>
                                            <span className="text-xs font-medium text-gray-600">
                                                {scale.academicYear.title}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${gradeColorClasses[idx % gradeColorClasses.length].split(" ")[0]}`}
                                        style={{
                                            marginLeft: `${scale.minPercentage}%`,
                                            width: `${scale.maxPercentage - scale.minPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
                            <p className="text-xs text-gray-500">
                                পৃষ্ঠা {currentPage} / {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                    className="h-8 gap-1 rounded-lg"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    পূর্ববর্তী
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                    className="h-8 gap-1 rounded-lg"
                                >
                                    পরবর্তী
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit form dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-violet-600" />
                            {editingScale ? "গ্রেড সম্পাদনা করুন" : "নতুন গ্রেড যোগ করুন"}
                        </DialogTitle>
                        <DialogDescription>
                            শতাংশের পরিসীমা অনুযায়ী গ্রেড ও জিপিএ নির্ধারণ করুন
                        </DialogDescription>
                    </DialogHeader>

                    <GradingScaleForm
                        academicYears={initialAcademicYears}
                        editingScale={editingScale}
                        onSuccess={() => {
                            setFormOpen(false);
                            router.refresh();
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>গ্রেড মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget && (
                                <>
                                    <strong>{deleteTarget.grade}</strong> গ্রেডটি ({deleteTarget.minPercentage}%–
                                    {deleteTarget.maxPercentage}%) স্থায়ীভাবে মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                </>
                            )}
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
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> মুছছে...
                                </>
                            ) : (
                                "মুছে ফেলুন"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}