"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import EnrollmentForm from "./EnrollmentForm";

interface Props {
    studentId: number;
    studentName: string;
    initialAcademicYears: { id: number; title: string }[];
    initialClasses: { id: number; name: string; sections: { id: number; name: string }[] }[];
    currentYearId?: number;
    showInitialPrompt: boolean;
}

export default function EnrollNowPrompt({
    studentId,
    studentName,
    initialAcademicYears,
    initialClasses,
    currentYearId,
    showInitialPrompt,
}: Props) {
    const [askOpen, setAskOpen] = useState(showInitialPrompt);
    const [formOpen, setFormOpen] = useState(false);

    return (
        <>
            <Dialog open={askOpen} onOpenChange={setAskOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-rose-600" />
                            শিক্ষার্থী তৈরি হয়েছে
                        </DialogTitle>
                        <DialogDescription>
                            <strong>{studentName}</strong> সফলভাবে তৈরি হয়েছে। এখনই বর্তমান শিক্ষাবর্ষে ভর্তি
                            করতে চান?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setAskOpen(false)}>
                            পরে করব
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white border-0"
                            onClick={() => {
                                setAskOpen(false);
                                setFormOpen(true);
                            }}
                        >
                            হ্যাঁ, ভর্তি করুন
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>শিক্ষার্থী ভর্তি — {studentName}</DialogTitle>
                        <DialogDescription>বর্তমান শিক্ষাবর্ষে ভর্তির তথ্য দিন</DialogDescription>
                    </DialogHeader>

                    <EnrollmentForm
                        studentId={studentId}
                        initialAcademicYears={initialAcademicYears}
                        initialClasses={initialClasses}
                        defaultAcademicYearId={currentYearId}
                        onSuccess={() => setFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Button
                onClick={() => setFormOpen(true)}
                className="gap-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white border-0"
            >
                <UserPlus className="h-4 w-4" />
                শিক্ষার্থী ভর্তি করুন
            </Button>
        </>
    );
}