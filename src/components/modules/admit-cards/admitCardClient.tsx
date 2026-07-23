/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileStack, Loader2, RefreshCw, ShieldAlert, Stamp, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    generateSectionAdmitCards,
    retryFailedAdmitCards,
    getAdmitCardJobStatus,
    type FailedAdmitCard,
} from "@/service/admitCard/admidCard.service";

export interface ExamOption {
    id: number;
    name: string;
}

export interface ClassOption {
    id: number;
    name: string;
    sections: { id: number; name: string }[];
}

interface AdmitCardStudioProps {
    exams: ExamOption[];
    classes: ClassOption[];
}

type GenerationState = "idle" | "queued" | "generating" | "done";

export function AdmitCardStudio({ exams, classes }: AdmitCardStudioProps) {
    const [examId, setExamId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [state, setState] = useState<GenerationState>("idle");
    const [isRetrying, setIsRetrying] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState<FailedAdmitCard[]>([]);
    const [summary, setSummary] = useState<{ total: number; success: number } | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };
    useEffect(() => stopPolling, []);

    const sectionsForClass = useMemo(
        () => classes.find((c) => c.id === classId)?.sections ?? [],
        [classes, classId]
    );

    const canGenerate = Boolean(examId && classId && sectionId) && state !== "generating" && state !== "queued";

    const resetResult = () => {
        setFileUrl(null);
        setFailed([]);
        setSummary(null);
    };

    const applyResult = (data: {
        mode: "queued" | "direct";
        fileUrl?: string;
        totalStudents?: number;
        successCount?: number;
        failed?: FailedAdmitCard[];
    }) => {
        setState("done");
        setFileUrl(data.fileUrl ?? null);
        setFailed(data.failed ?? []);
        setSummary({ total: data.totalStudents ?? 0, success: data.successCount ?? 0 });

        if ((data.failed?.length ?? 0) > 0) {
            toast.warning(`${data.successCount}/${data.totalStudents} প্রবেশপত্র তৈরি হয়েছে। কিছু শিক্ষার্থী বাকি আছে।`);
        } else {
            toast.success("সকল প্রবেশপত্র সফলভাবে তৈরি হয়েছে।");
        }
    };

    const pollJob = (jobId: string, onDone: (data: any) => void, onFail: (msg: string) => void) => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            const res = await getAdmitCardJobStatus(jobId);
            if (!res?.success || !res.data) return;

            if (res.data.status === "completed") {
                stopPolling();
                onDone(res.data);
            } else if (res.data.status === "failed") {
                stopPolling();
                onFail(res.data.error || "প্রক্রিয়াটি ব্যর্থ হয়েছে");
            }
        }, 2000);
    };

    const handleGenerate = async () => {
        if (!examId || !classId || !sectionId) return;
        resetResult();
        setState("generating");

        const response = await generateSectionAdmitCards(examId, classId, sectionId);

        if (!response.success || !response.data) {
            toast.error(response.message);
            setState("idle");
            return;
        }

        if (response.data.mode === "queued" && response.data.jobId) {
            setState("queued");
            pollJob(
                response.data.jobId,
                (data) => applyResult(data),
                (msg) => {
                    toast.error(msg);
                    setState("idle");
                }
            );
        } else {
            applyResult(response.data);
        }
    };

    const handleRetry = async () => {
        if (!examId || !classId || !sectionId || failed.length === 0) return;
        setIsRetrying(true);

        const enrollmentIds = failed.map((f) => f.studentEnrollmentId);
        const response = await retryFailedAdmitCards(examId, classId, sectionId, enrollmentIds);

        if (!response.success || !response.data) {
            toast.error(response.message);
            setIsRetrying(false);
            return;
        }

        const finish = (data: any) => {
            setIsRetrying(false);
            setFailed(data.failed ?? []);
            if (data.fileUrl) setFileUrl(data.fileUrl);
            setSummary((prev) =>
                prev
                    ? { total: prev.total, success: prev.total - (data.failed?.length ?? 0) }
                    : { total: data.totalStudents ?? 0, success: data.successCount ?? 0 }
            );
            toast.success(
                (data.failed?.length ?? 0) > 0
                    ? `আংশিক সফল — ${data.failed.length} জন এখনও বাকি`
                    : "সকল বাকি প্রবেশপত্র তৈরি হয়েছে।"
            );
        };

        if (response.data.mode === "queued" && response.data.jobId) {
            pollJob(
                response.data.jobId,
                finish,
                (msg) => {
                    toast.error(msg);
                    setIsRetrying(false);
                }
            );
        } else {
            finish(response.data);
        }
    };

    return (
        <div className="admit-studio">
            {/* ---------- Request card ---------- */}
            <section className="request-card">
                <div className="request-card__eyebrow">নথি অনুরোধ</div>
                <h2 className="request-card__title">প্রবেশপত্র ইস্যু করুন</h2>
                <p className="request-card__hint">
                    পরীক্ষা, শ্রেণি এবং শাখা নির্বাচন করুন — নির্বাচিত শাখার সকল শিক্ষার্থীর জন্য একত্রে প্রবেশপত্র তৈরি হবে।
                </p>

                <div className="request-card__fields">
                    <Field label="পরীক্ষা">
                        <Select
                            value={examId ? String(examId) : undefined}
                            onValueChange={(v) => setExamId(Number(v))}
                        >
                            <SelectTrigger className="field-trigger">
                                <SelectValue placeholder="নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id} value={String(exam.id)}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="শ্রেণি">
                        <Select
                            value={classId ? String(classId) : undefined}
                            onValueChange={(v) => {
                                setClassId(Number(v));
                                setSectionId(null);
                            }}
                        >
                            <SelectTrigger className="field-trigger">
                                <SelectValue placeholder="নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={String(cls.id)}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="শাখা">
                        <Select
                            value={sectionId ? String(sectionId) : undefined}
                            onValueChange={(v) => setSectionId(Number(v))}
                            disabled={!classId}
                        >
                            <SelectTrigger className="field-trigger">
                                <SelectValue placeholder={classId ? "নির্বাচন করুন" : "আগে শ্রেণি নির্বাচন করুন"} />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionsForClass.map((section) => (
                                    <SelectItem key={section.id} value={String(section.id)}>
                                        {section.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <button className="issue-button" onClick={handleGenerate} disabled={!canGenerate}>
                    {state === "generating" || state === "queued" ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            {state === "queued" ? "সারিতে যুক্ত হয়েছে..." : "তৈরি হচ্ছে..."}
                        </>
                    ) : (
                        <>
                            <FileStack className="h-4 w-4" aria-hidden />
                            শাখার সকল প্রবেশপত্র তৈরি করুন
                        </>
                    )}
                </button>
            </section>

            {/* ---------- Result / register ---------- */}
            {summary && (
                <section className="ledger">
                    <div className="ledger__head">
                        <div className="ledger__head-left">
                            <span className="ledger__label">ফলাফল</span>
                            <h3 className="ledger__count">
                                <span className="mono">{summary.success}</span>
                                <span className="ledger__count-sep">/</span>
                                <span className="mono ledger__count-total">{summary.total}</span>
                                <span className="ledger__count-unit">জন ইস্যু সম্পন্ন</span>
                            </h3>
                        </div>

                        {failed.length === 0 ? (
                            <div className="seal seal--complete" aria-label="সম্পন্ন">
                                <Stamp className="h-5 w-5" aria-hidden />
                                <span>সম্পন্ন</span>
                            </div>
                        ) : (
                            <div className="seal seal--pending" aria-label="আংশিক">
                                <ShieldAlert className="h-5 w-5" aria-hidden />
                                <span>আংশিক</span>
                            </div>
                        )}
                    </div>

                    {fileUrl && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                            <Download className="h-4 w-4" aria-hidden />
                            সম্পূর্ণ PDF ডাউনলোড করুন
                        </a>
                    )}

                    {failed.length > 0 && (
                        <div className="failed-block">
                            <div className="failed-block__head">
                                <p className="failed-block__title">
                                    {failed.length} জন শিক্ষার্থীর প্রবেশপত্র তৈরি হয়নি
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="retry-button"
                                >
                                    {isRetrying ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    পুনরায় চেষ্টা করুন
                                </Button>
                            </div>

                            <table className="failed-table">
                                <thead>
                                    <tr>
                                        <th>রোল</th>
                                        <th>নাম</th>
                                        <th>কারণ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {failed.map((f) => (
                                        <tr key={f.studentEnrollmentId}>
                                            <td className="mono">{f.rollNumber ?? "—"}</td>
                                            <td>{f.studentName ?? `ID ${f.studentEnrollmentId}`}</td>
                                            <td className="failed-table__reason">{f.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <style jsx>{`
                .admit-studio {
                    --ink: #1b2430;
                    --ink-soft: #48505c;
                    --paper: #f7f5f0;
                    --paper-raised: #ffffff;
                    --hairline: #dcd6c8;
                    --brass: #b08d57;
                    --brass-deep: #8f7040;
                    --forest: #2f6844;
                    --forest-bg: #eaf1ec;
                    --brick: #a6483c;
                    --brick-bg: #f6ece9;

                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    font-family:
                        "Hind Siliguri", "Noto Sans Bengali", ui-sans-serif, system-ui, sans-serif;
                    color: var(--ink);
                }

                .mono {
                    font-family: "IBM Plex Mono", ui-monospace, monospace;
                    font-variant-numeric: tabular-nums;
                }

                /* ---------- Request card ---------- */
                .request-card {
                    position: relative;
                    background: var(--paper-raised);
                    border: 1px solid var(--hairline);
                    border-radius: 4px;
                    padding: 32px clamp(20px, 4vw, 40px);
                    overflow: hidden;
                }
                .request-card::before {
                    content: "";
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--brass) 0%, var(--brass) 40%, transparent 40%);
                    background-size: 24px 4px;
                }
                .request-card__eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--brass-deep);
                    font-weight: 600;
                }
                .request-card__title {
                    font-family: "Noto Serif Bengali", "Georgia", serif;
                    font-size: clamp(22px, 2.6vw, 28px);
                    font-weight: 600;
                    margin: 6px 0 8px;
                    color: var(--ink);
                }
                .request-card__hint {
                    font-size: 13.5px;
                    color: var(--ink-soft);
                    max-width: 56ch;
                    line-height: 1.7;
                    margin-bottom: 24px;
                }
                .request-card__fields {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                @media (max-width: 720px) {
                    .request-card__fields {
                        grid-template-columns: 1fr;
                    }
                }

                .issue-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--ink);
                    color: var(--paper);
                    border: none;
                    border-radius: 3px;
                    padding: 12px 22px;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    transition: background-color 0.15s ease, transform 0.15s ease;
                }
                .issue-button:hover:not(:disabled) {
                    background: #0f151d;
                }
                .issue-button:disabled {
                    background: #b7bcc2;
                    cursor: not-allowed;
                }
                .issue-button:focus-visible {
                    outline: 2px solid var(--brass);
                    outline-offset: 2px;
                }

                /* ---------- Ledger / result ---------- */
                .ledger {
                    background: var(--paper-raised);
                    border: 1px solid var(--hairline);
                    border-radius: 4px;
                    padding: 24px clamp(20px, 4vw, 36px);
                }
                .ledger__head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--hairline);
                    margin-bottom: 20px;
                }
                .ledger__label {
                    font-size: 11px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--ink-soft);
                    font-weight: 600;
                }
                .ledger__count {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    margin-top: 6px;
                    font-family: "Noto Serif Bengali", serif;
                }
                .ledger__count .mono {
                    font-size: 30px;
                    font-weight: 600;
                    color: var(--forest);
                }
                .ledger__count-sep {
                    color: var(--ink-soft);
                    font-size: 18px;
                }
                .ledger__count-total.mono {
                    font-size: 18px;
                    color: var(--ink-soft);
                    font-weight: 500;
                }
                .ledger__count-unit {
                    font-size: 13px;
                    color: var(--ink-soft);
                    margin-left: 4px;
                }

                /* signature element: rotated brass/rust seal */
                .seal {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 2px solid currentColor;
                    border-radius: 999px;
                    padding: 8px 16px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    transform: rotate(-4deg);
                    white-space: nowrap;
                }
                .seal--complete {
                    color: var(--forest);
                    background: var(--forest-bg);
                }
                .seal--pending {
                    color: var(--brick);
                    background: var(--brick-bg);
                }

                .download-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: var(--brass-deep);
                    text-decoration: none;
                    border-bottom: 1px solid transparent;
                    margin-bottom: 8px;
                }
                .download-link:hover {
                    border-bottom-color: var(--brass-deep);
                }
                .download-link:focus-visible {
                    outline: 2px solid var(--brass);
                    outline-offset: 3px;
                }

                .failed-block {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px dashed var(--hairline);
                }
                .failed-block__head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                }
                .failed-block__title {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: var(--brick);
                }

                .failed-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .failed-table th {
                    text-align: left;
                    font-size: 11px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--ink-soft);
                    font-weight: 600;
                    padding: 0 10px 8px;
                    border-bottom: 1px solid var(--hairline);
                }
                .failed-table td {
                    padding: 10px 10px;
                    border-bottom: 1px solid var(--hairline);
                    vertical-align: top;
                }
                .failed-table tr:last-child td {
                    border-bottom: none;
                }
                .failed-table__reason {
                    color: var(--ink-soft);
                    font-size: 12.5px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .issue-button {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="field">
            <span className="field__label">{label}</span>
            {children}
            <style jsx>{`
                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .field__label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--ink-soft, #48505c);
                    letter-spacing: 0.02em;
                }
            `}</style>
        </label>
    );
}