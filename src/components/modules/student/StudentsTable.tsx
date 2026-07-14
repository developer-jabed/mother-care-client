"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student, StudentMeta } from "@/service/student/student.service";

interface Props {
    students: Student[];
    meta: StudentMeta | null;
    currentPage: number;
}

export default function StudentsTable({ students, meta, currentPage }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.push(`${pathname}?${params.toString()}`);
    };

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-white">
                <Users className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-base font-semibold text-gray-700">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                <p className="text-sm text-gray-500 mt-1">ফিল্টার পরিবর্তন করুন অথবা নতুন শিক্ষার্থী যোগ করুন</p>
            </div>
        );
    }

    const totalPages = meta?.totalPages ?? 1;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">নাম</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">ভর্তি নম্বর</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">লিঙ্গ</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">ইমেইল</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">অবস্থা</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-600">কার্যক্রম</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-900">{student.fullName}</td>
                                <td className="py-3 px-4 text-gray-600">{student.admissionNumber}</td>
                                <td className="py-3 px-4 text-gray-600">
                                    {student.gender === "MALE" ? "পুরুষ" : student.gender === "FEMALE" ? "মহিলা" : "অন্যান্য"}
                                </td>
                                <td className="py-3 px-4 text-gray-600">{student.user?.email ?? "—"}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={
                                            student.isActive
                                                ? "inline-block px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                                                : "inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                                        }
                                    >
                                        {student.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <Link href={`/admin/dashboard/students/${student.id}`}>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-rose-600">
                                            <Eye className="h-3.5 w-3.5" />
                                            বিস্তারিত
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-500">
                        পৃষ্ঠা {meta.page} / {totalPages} — মোট {meta.total} জন
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
        </div>
    );
}