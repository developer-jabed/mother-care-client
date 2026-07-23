import Image from "next/image";
import { verifyAdmitCard } from "@/service/admitCard/admidCard.service";
import { CheckCircle2, XCircle } from "lucide-react";

interface PageProps {
    params: Promise<{ enrollmentId: string; examId: string }>;
}

export const metadata = {
    title: "প্রবেশপত্র যাচাই",
};

export default async function VerifyAdmitCardPage({ params }: PageProps) {
    const { enrollmentId, examId } = await params;

    const result = await verifyAdmitCard(Number(enrollmentId), Number(examId));
    const data = result.success ? result.data : undefined;
    const isValid = Boolean(data?.valid);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] p-6">
            <div className="w-full max-w-md rounded-lg border border-[#dcd6c8] bg-white p-8 text-center shadow-sm">
                {isValid ? (
                    <>
                        <CheckCircle2 className="mx-auto h-14 w-14 text-[#2f6844]" />
                        <h1 className="mt-4 text-xl font-bold text-[#1a2a44]">প্রবেশপত্র বৈধ</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            এই প্রবেশপত্রটি মাদার কেয়ার স্কুল অ্যান্ড কলেজ কর্তৃক ইস্যুকৃত।
                        </p>

                        {data?.photo && (
                            <div className="mx-auto mt-5 h-24 w-20 overflow-hidden rounded border-2 border-[#1a2a44]">
                                <Image
                                    src={data.photo}
                                    alt={data.studentName ?? "Student"}
                                    width={80}
                                    height={96}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <dl className="mt-6 space-y-3 text-left text-sm">
                            <Row label="শিক্ষার্থীর নাম" value={data?.studentName} />
                            <Row label="ভর্তি নম্বর" value={data?.admissionNumber} />
                            <Row label="শ্রেণি" value={`${data?.className ?? ""} • ${data?.sectionName ?? ""}`} />
                            <Row label="রোল নম্বর" value={data?.rollNumber?.toString()} />
                            <Row label="পরীক্ষা" value={data?.examName} />
                        </dl>
                    </>
                ) : (
                    <>
                        <XCircle className="mx-auto h-14 w-14 text-[#a6483c]" />
                        <h1 className="mt-4 text-xl font-bold text-[#1a2a44]">অবৈধ প্রবেশপত্র</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {result.message || "এই প্রবেশপত্রটি যাচাই করা যায়নি।"}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value?: string }) {
    return (
        <div className="flex justify-between border-b border-dashed border-[#dcd6c8] pb-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-[#1a2a44]">{value || "—"}</dd>
        </div>
    );
}