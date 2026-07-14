"use client";

import { useRef, useState, useTransition } from "react";
import { Layers, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSection } from "@/service/academic/createAcademicYear.service";

type FieldErrors = Record<string, string[]>;

interface ClassOption {
    id: number;
    name: string;
}

interface CreateSectionModalProps {
    classes: ClassOption[];
}

const CreateSectionModal = ({ classes }: CreateSectionModalProps) => {
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (formData: FormData) => {
        setErrors({});

        startTransition(async () => {
            const result = await createSection(null, formData);

            if (result.success) {
                toast.success(result.message);
                formRef.current?.reset();
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
                className="gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-200 border-0"
            >
                <Layers className="h-4 w-4" />
                শাখা তৈরি করুন
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>নতুন শাখা তৈরি করুন</DialogTitle>
                    <DialogDescription>শাখার তথ্য দিন</DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="classId">ক্লাস নির্বাচন করুন *</Label>
                        <Select name="classId" required>
                            <SelectTrigger
                                id="classId"
                                className={cn(
                                    "h-11 rounded-xl",
                                    errors?.classId && "border-red-300"
                                )}
                            >
                                <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-400">
                                        কোনো ক্লাস পাওয়া যায়নি
                                    </div>
                                ) : (
                                    classes.map((cls) => (
                                        <SelectItem key={cls.id} value={String(cls.id)}>
                                            {cls.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors?.classId && (
                            <p className="text-xs text-red-500">{errors.classId[0]}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="name">শাখার নাম *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="যেমনঃ A"
                            required
                            className={cn(
                                "h-11 rounded-xl",
                                errors?.name && "border-red-300 focus-visible:ring-red-500"
                            )}
                        />
                        {errors?.name && (
                            <p className="text-xs text-red-500">{errors.name[0]}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="capacity">ধারণক্ষমতা (ঐচ্ছিক)</Label>
                        <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            placeholder="যেমনঃ ৪০"
                            className={cn(
                                "h-11 rounded-xl",
                                errors?.capacity && "border-red-300 focus-visible:ring-red-500"
                            )}
                        />
                        {errors?.capacity && (
                            <p className="text-xs text-red-500">{errors.capacity[0]}</p>
                        )}
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
                            className="flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-0"
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

export default CreateSectionModal;