"use client";

import { useRef, useState, useTransition } from "react";
import { CalendarPlus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createAcademicYear } from "@/service/academic/createAcademicYear.service";

type FieldErrors = Record<string, string[]>;

const CreateAcademicYearModal = () => {
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isCurrent, setIsCurrent] = useState(false);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (formData: FormData) => {
        setErrors({});
        formData.set("isCurrent", isCurrent ? "true" : "false");

        startTransition(async () => {
            const result = await createAcademicYear(null, formData);

            if (result.success) {
                toast.success(result.message);
                formRef.current?.reset();
                setIsCurrent(false);
                setOpen(false);
            } else {
                toast.error(result.message);
                setErrors(result.errors || {});
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-md shadow-rose-200 border-0"
            >
                <CalendarPlus className="h-4 w-4" />
                শিক্ষাবর্ষ তৈরি করুন
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>নতুন শিক্ষাবর্ষ তৈরি করুন</DialogTitle>
                    <DialogDescription>শিক্ষাবর্ষের তথ্য দিন</DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">শিক্ষাবর্ষের নাম *</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="যেমনঃ ২০২৬-২০২৭"
                            required
                            className={cn(
                                "h-11 rounded-xl",
                                errors?.title && "border-red-300 focus-visible:ring-red-500"
                            )}
                        />
                        {errors?.title && (
                            <p className="text-xs text-red-500">{errors.title[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="startDate">শুরুর তারিখ *</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                required
                                className={cn(
                                    "h-11 rounded-xl",
                                    errors?.startDate && "border-red-300 focus-visible:ring-red-500"
                                )}
                            />
                            {errors?.startDate && (
                                <p className="text-xs text-red-500">{errors.startDate[0]}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="endDate">শেষের তারিখ *</Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                required
                                className={cn(
                                    "h-11 rounded-xl",
                                    errors?.endDate && "border-red-300 focus-visible:ring-red-500"
                                )}
                            />
                            {errors?.endDate && (
                                <p className="text-xs text-red-500">{errors.endDate[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="isCurrent"
                            checked={isCurrent}
                            onCheckedChange={(checked) => setIsCurrent(checked === true)}
                        />
                        <Label htmlFor="isCurrent" className="text-sm font-normal cursor-pointer">
                            এটি বর্তমান শিক্ষাবর্ষ হিসেবে সেট করুন
                        </Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl"
                        >
                            বাতিল
                        </Button>
                        <Button
                            type="submit"
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
                                    তৈরি করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAcademicYearModal;