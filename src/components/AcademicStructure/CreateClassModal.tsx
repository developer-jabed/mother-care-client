"use client";

import { useRef, useState, useTransition } from "react";
import { School, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClass } from "@/service/academic/createAcademicYear.service";

type FieldErrors = Record<string, string[]>;

const CreateClassModal = () => {
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (formData: FormData) => {
        setErrors({});

        startTransition(async () => {
            const result = await createClass(null, formData);

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
                className="gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-md shadow-amber-200 border-0"
            >
                <School className="h-4 w-4" />
                ক্লাস তৈরি করুন
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>নতুন ক্লাস তৈরি করুন</DialogTitle>
                    <DialogDescription>ক্লাসের তথ্য দিন</DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">ক্লাসের নাম *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="যেমনঃ প্রথম শ্রেণি"
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
                        <Label htmlFor="numericOrder">ক্রম নম্বর (ঐচ্ছিক)</Label>
                        <Input
                            id="numericOrder"
                            name="numericOrder"
                            type="number"
                            placeholder="যেমনঃ ১"
                            className={cn(
                                "h-11 rounded-xl",
                                errors?.numericOrder && "border-red-300 focus-visible:ring-red-500"
                            )}
                        />
                        {errors?.numericOrder && (
                            <p className="text-xs text-red-500">{errors.numericOrder[0]}</p>
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
                            className="flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white border-0"
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

export default CreateClassModal;