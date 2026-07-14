"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Camera, User, Calendar, Phone, MapPin, X, Check, Users as GenderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateStudent } from "@/service/student/student.service";
import type { Student } from "@/service/student/student.service";

type FieldErrors = Record<string, string[]>;

interface Props {
    student: Student;
}

export default function EditStudentModal({ student }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo ?? null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPhotoPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (formData: FormData) => {
        setErrors({});
        formData.set("id", String(student.id));

        startTransition(async () => {
            const result = await updateStudent(null, formData);

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                router.refresh();
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
                variant="outline"
                className="gap-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
            >
                <Pencil className="h-4 w-4" />
                সম্পাদনা করুন
            </Button>

            <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto p-0 gap-0">
                <div className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 px-6 pt-6 pb-14 rounded-t-lg overflow-hidden">
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                            <Pencil className="h-5 w-5" />
                            শিক্ষার্থীর তথ্য সম্পাদনা
                        </DialogTitle>
                        <DialogDescription className="text-rose-50/90">
                            {student.fullName}-এর তথ্য পরিবর্তন করুন
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form ref={formRef} action={handleSubmit} className="px-6 pb-6 -mt-10 relative z-10 space-y-5">
                    {/* Avatar upload */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-1 ring-gray-200">
                                {photoPreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-gray-400" />
                                )}
                            </div>
                            <label
                                htmlFor="edit-photo-upload"
                                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center cursor-pointer transition-all"
                            >
                                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </label>
                            <input
                                ref={fileInputRef}
                                id="edit-photo-upload"
                                type="file"
                                name="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                            {photoPreview && (
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-red-50"
                                >
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-1">
                            <div className="h-7 w-7 rounded-lg bg-rose-50 flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-rose-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">ব্যক্তিগত তথ্য</h3>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-xs font-medium text-gray-600">পূর্ণ নাম</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={student.fullName}
                                className={cn(
                                    "h-11 rounded-xl border-gray-200 focus-visible:ring-rose-500 focus-visible:border-rose-500",
                                    errors?.fullName && "border-red-300 focus-visible:ring-red-500"
                                )}
                            />
                            {errors?.fullName && <p className="text-xs text-red-500">{errors.fullName[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                    <GenderIcon className="h-3 w-3" /> লিঙ্গ
                                </Label>
                                <Select name="gender" defaultValue={student.gender}>
                                    <SelectTrigger id="gender" className="h-11 rounded-xl border-gray-200 focus:ring-rose-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">পুরুষ</SelectItem>
                                        <SelectItem value="FEMALE">মহিলা</SelectItem>
                                        <SelectItem value="OTHER">অন্যান্য</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors?.gender && <p className="text-xs text-red-500">{errors.gender[0]}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="dateOfBirth" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> জন্ম তারিখ
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    defaultValue={student.dateOfBirth?.slice(0, 10)}
                                    className="h-11 rounded-xl border-gray-200 focus-visible:ring-rose-500 focus-visible:border-rose-500"
                                />
                                {errors?.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth[0]}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-1">
                            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Phone className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">যোগাযোগের তথ্য</h3>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> মোবাইল নম্বর
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={student.phone ?? ""}
                                placeholder="01XXXXXXXXX"
                                className="h-11 rounded-xl border-gray-200 focus-visible:ring-amber-500 focus-visible:border-amber-500"
                            />
                            {errors?.phone && <p className="text-xs text-red-500">{errors.phone[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> ঠিকানা
                            </Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={student.address ?? ""}
                                rows={2}
                                className="rounded-xl border-gray-200 focus-visible:ring-amber-500 resize-none"
                            />
                            {errors?.address && <p className="text-xs text-red-500">{errors.address[0]}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            বাতিল
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-md shadow-rose-200 border-0"
                        >
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...</>
                            ) : (
                                <><Check className="h-4 w-4" /> আপডেট করুন</>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}