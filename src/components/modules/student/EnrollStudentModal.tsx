"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus, Loader2, Camera, User, Hash,
    Users as GenderIcon, Calendar, Mail, Lock, X, Check,
    Phone, MapPin, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createStudent } from "@/service/student/student.service";

type FieldErrors = Record<string, string[]>;

export default function EnrollStudentModal() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);

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

        startTransition(async () => {
            const result = await createStudent(null, formData);

            if (result.success) {
                toast.success(result.message || "শিক্ষার্থী সফলভাবে ভর্তি হয়েছে");
                formRef.current?.reset();
                setPhotoPreview(null);
                setShowPassword(false);
                setOpen(false);

                if (result.studentId) {
                    router.push(`students/${result.studentId}?justCreated=1`);
                }
            } else {
                toast.error(result.message || "ভর্তি করতে ব্যর্থ হয়েছে");
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
                <UserPlus className="h-4 w-4" />
                শিক্ষার্থী ভর্তি করুন
            </Button>

            <DialogContent className="sm:max-w-[680px] max-h-[95vh] overflow-y-auto p-0 gap-0">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 px-8 pt-8 pb-16 rounded-t-2xl">
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-white text-2xl font-bold flex items-center gap-3">
                            <UserPlus className="h-6 w-6" />
                            নতুন শিক্ষার্থী ভর্তি
                        </DialogTitle>
                        <DialogDescription className="text-rose-100 text-base">
                            শিক্ষার্থীর সম্পূর্ণ তথ্য পূরণ করে ভর্তি প্রক্রিয়া সম্পন্ন করুন
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form ref={formRef} action={handleSubmit} className="px-8 pb-8 -mt-8 relative z-10 space-y-6">
                    {/* Photo Upload */}
                    <div className="flex justify-center -mt-4">
                        <div className="relative group">
                            <div className="h-28 w-28 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <User className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <Camera className="h-4 w-4 text-gray-700" />
                            </label>
                            <input
                                ref={fileInputRef}
                                id="photo-upload"
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
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center">
                                <User className="h-4 w-4 text-rose-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">ব্যক্তিগত তথ্য</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullName">পূর্ণ নাম *</Label>
                                <Input id="fullName" name="fullName" placeholder="মোঃ রহিম উদ্দিন" required />
                                {errors?.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName[0]}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* <div>
                                    <Label htmlFor="admissionNumber">ভর্তি নম্বর *</Label>
                                    <Input
                                        id="admissionNumber"
                                        name="admissionNumber"
                                        placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
                                        readOnly
                                        className="bg-gray-50 text-gray-600 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        পরবর্তী ভর্তি নম্বর স্বয়ংক্রিয়ভাবে নির্ধারিত হবে
                                    </p>
                                    {errors?.admissionNumber && <p className="text-xs text-red-500 mt-1">{errors.admissionNumber[0]}</p>}
                                </div> */}

                                <div>
                                    <Label htmlFor="gender">লিঙ্গ *</Label>
                                    <Select name="gender" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">পুরুষ</SelectItem>
                                            <SelectItem value="FEMALE">মহিলা</SelectItem>
                                            <SelectItem value="OTHER">অন্যান্য</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="dateOfBirth">জন্ম তারিখ *</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl border p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">যোগাযোগের তথ্য</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="phone">ফোন নম্বর</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="01XXXXXXXXX" />
                            </div>

                            <div>
                                <Label htmlFor="address">ঠিকানা</Label>
                                <Input id="address" name="address" placeholder="গ্রাম, থানা, জেলা" />
                            </div>
                        </div>
                    </div>

                    {/* Login Information */}
                    <div className="bg-white rounded-2xl border p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Lock className="h-4 w-4 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">লগইন তথ্য</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">ইমেইল *</Label>
                                <Input id="email" name="email" type="email" placeholder="student@example.com" required />
                                {errors?.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password">পাসওয়ার্ড *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="ন্যূনতম ৬ অক্ষর"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors?.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="flex-1 h-12"
                        >
                            বাতিল
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 h-12 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    ভর্তি সম্পন্ন করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}