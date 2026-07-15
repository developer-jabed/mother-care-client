/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    ChevronDown,
    ShieldCheck,
    ShieldAlert,
    Clock,
} from "lucide-react";
import type { Student } from "@/service/student/student.service";

export default function StudentSummaryCard({ student }: { student: Student }) {
    const currentEnrollment = student.enrollments?.find((e) => e.isCurrent);
    const [openEnrollmentId, setOpenEnrollmentId] = useState<number | null>(
        currentEnrollment?.id ?? student.enrollments?.[0]?.id ?? null
    );

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow overflow-hidden">
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="h-28 bg-gradient-to-r from-rose-500 to-amber-500 relative">
                <div className="absolute -bottom-10 left-8">
                    <div className="h-20 w-20 rounded-2xl border-4 border-white overflow-hidden bg-white shadow">
                        {student.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={student.photo}
                                alt={student.fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <User className="h-10 w-10 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-14 pb-6 px-8">
                <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            ভর্তি নং: {student.admissionNumber}
                        </p>
                        {currentEnrollment && (
                            <p className="text-sm text-rose-600 font-medium mt-1">
                                {currentEnrollment.class?.name} — শাখা {currentEnrollment.section?.name} · রোল{" "}
                                {currentEnrollment.rollNumber} ({currentEnrollment.academicYear?.title})
                            </p>
                        )}
                    </div>
                    <span
                        className={
                            student.isActive
                                ? "inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                                : "inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                        }
                    >
                        {student.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                {/* ── Contact strip — compact, single row, no empty slots ── */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-5 border-t text-sm text-gray-600">
                    <InfoItem
                        icon={Calendar}
                        label={new Date(student.dateOfBirth).toLocaleDateString("bn-BD")}
                    />
                    <InfoItem
                        icon={User}
                        label={
                            student.gender === "MALE"
                                ? "পুরুষ"
                                : student.gender === "FEMALE"
                                    ? "মহিলা"
                                    : "অন্যান্য"
                        }
                    />
                    {student.user?.email && <InfoItem icon={Mail} label={student.user.email} />}
                    {student.phone && <InfoItem icon={Phone} label={student.phone} />}
                    {student.address && <InfoItem icon={MapPin} label={student.address} />}
                    {student.user && (
                        <InfoItem
                            icon={student.user.isEmailVerified ? ShieldCheck : ShieldAlert}
                            label={student.user.isEmailVerified ? "ইমেইল যাচাইকৃত" : "যাচাই বাকি"}
                            tone={student.user.isEmailVerified ? "ok" : "warn"}
                        />
                    )}
                    {student.user?.lastLogin && (
                        <InfoItem
                            icon={Clock}
                            label={`সর্বশেষ লগইন: ${new Date(student.user.lastLogin).toLocaleDateString(
                                "bn-BD"
                            )}`}
                        />
                    )}
                </div>

                {/* ── Enrollment history — accordion, one open at a time ── */}
                {student.enrollments && student.enrollments.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <GraduationCap className="h-4 w-4" /> ভর্তি ও ফলাফলের ইতিহাস
                        </h2>

                        <div className="space-y-2">
                            {student.enrollments.map((enroll) => {
                                const isOpen = openEnrollmentId === enroll.id;
                                return (
                                    <div
                                        key={enroll.id}
                                        className="rounded-xl border border-gray-100 overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenEnrollmentId(isOpen ? null : enroll.id)
                                            }
                                            className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {enroll.academicYear?.title} — {enroll.class?.name}{" "}
                                                    (শাখা {enroll.section?.name})
                                                    {enroll.isCurrent && (
                                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 align-middle">
                                                            বর্তমান
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    রোল {enroll.rollNumber} ·{" "}
                                                    <StatusBadge status={enroll.status} />
                                                    {enroll.promotedFrom && (
                                                        <> · উন্নীত হয়েছে {enroll.promotedFrom.academicYearId} থেকে</>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {enroll.results && enroll.results.length > 0 && (
                                                    <span className="text-[11px] text-gray-400">
                                                        {enroll.results.length} ফলাফল
                                                    </span>
                                                )}
                                                <ChevronDown
                                                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-4 pb-4">
                                                <EnrollmentDetail enroll={enroll} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Small presentational helpers ─────────────────────────────────── */

function InfoItem({
    icon: Icon,
    label,
    tone,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    tone?: "ok" | "warn";
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 ${tone === "ok" ? "text-green-600" : tone === "warn" ? "text-amber-600" : ""
                }`}
        >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const color =
        status === "ACTIVE"
            ? "text-green-600"
            : status === "PROMOTED"
                ? "text-blue-600"
                : status === "COMPLETED"
                    ? "text-gray-600"
                    : "text-red-600";
    return <span className={color}>{status}</span>;
}

function EnrollmentDetail({ enroll }: { enroll: NonNullable<Student["enrollments"]>[number] }) {
    const [tab, setTab] = useState<"results" | "sms">("results");
    const hasResults = enroll.results && enroll.results.length > 0;
    const hasSms = enroll.smsLogs && enroll.smsLogs.length > 0;

    if (!hasResults && !hasSms) {
        return <p className="text-xs text-gray-400">এই সেশনের জন্য কোনো তথ্য নেই</p>;
    }

    return (
        <div>
            {hasResults && hasSms && (
                <div className="flex gap-1 mb-3 border-b">
                    <TabButton active={tab === "results"} onClick={() => setTab("results")}>
                        ফলাফল ({enroll.results!.length})
                    </TabButton>
                    <TabButton active={tab === "sms"} onClick={() => setTab("sms")}>
                        এসএমএস লগ ({enroll.smsLogs!.length})
                    </TabButton>
                </div>
            )}

            {(tab === "results" || !hasSms) && hasResults && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b text-gray-500">
                                <th className="text-left py-1.5 font-medium">পরীক্ষা</th>
                                <th className="text-left py-1.5 font-medium">মোট নম্বর</th>
                                <th className="text-left py-1.5 font-medium">শতাংশ</th>
                                <th className="text-left py-1.5 font-medium">গ্রেড</th>
                                <th className="text-left py-1.5 font-medium">অবস্থান</th>
                                <th className="text-left py-1.5 font-medium">প্রকাশিত</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enroll.results!.map((result) => (
                                <ResultRow key={result.id} result={result} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(tab === "sms" || !hasResults) && hasSms && (
                <div className="space-y-1">
                    {enroll.smsLogs!.map((sms) => (
                        <div
                            key={sms.id}
                            className="flex items-center justify-between text-[11px] text-gray-600 py-1"
                        >
                            <span>
                                {sms.exam?.name} → {sms.phone}
                            </span>
                            <span
                                className={
                                    sms.status === "DELIVERED"
                                        ? "text-green-600"
                                        : sms.status === "SENT"
                                            ? "text-blue-600"
                                            : sms.status === "FAILED"
                                                ? "text-red-600"
                                                : "text-gray-400"
                                }
                            >
                                {sms.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
        >
            {children}
        </button>
    );
}

function ResultRow({ result }: { result: any }) {
    const [showSubjects, setShowSubjects] = useState(false);
    const hasDetails = result.details && result.details.length > 0;

    return (
        <>
            <tr
                className={`border-b last:border-0 ${hasDetails ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={() => hasDetails && setShowSubjects((s) => !s)}
            >
                <td className="py-1.5">
                    {result.exam?.name}
                    {result.exam?.examType?.name ? ` (${result.exam.examType.name})` : ""}
                    {hasDetails && (
                        <ChevronDown
                            className={`inline h-3 w-3 ml-1 text-gray-400 transition-transform ${showSubjects ? "rotate-180" : ""
                                }`}
                        />
                    )}
                </td>
                <td className="py-1.5">{result.totalMarks}</td>
                <td className="py-1.5">{result.percentage.toFixed(2)}%</td>
                <td className="py-1.5 font-medium">{result.grade}</td>
                <td className="py-1.5">{result.position ?? "—"}</td>
                <td className="py-1.5">
                    {result.isPublished ? (
                        <span className="text-green-600">হ্যাঁ</span>
                    ) : (
                        <span className="text-gray-400">না</span>
                    )}
                </td>
            </tr>
            {showSubjects && hasDetails && (
                <tr>
                    <td colSpan={6} className="pb-2">
                        <div className="flex flex-wrap gap-1.5 pl-2">
                            {result.details.map((d: any) => (
                                <span
                                    key={d.id}
                                    className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100"
                                >
                                    {d.subject?.name}: {d.totalMarks} ({d.grade})
                                </span>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}