/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    FileStack,
    Loader2,
    RefreshCw,
    ShieldAlert,
    Stamp,
    Download,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    generateResultCardBatch,
    getResultCardBatchStatus,
    generateSingleResultCard,
    type ResultCardJobStatus,
} from "@/service/resultCart/resultCart.service";

export interface ExamOption {
    id: number;
    name: string;
}

export interface ClassOption {
    id: number;
    name: string;
    sections: { id: number; name: string }[];
}

interface ResultCardStudioProps {
    exams: ExamOption[];
    classes: ClassOption[];
}

type GenerationState = "idle" | "queued" | "generating" | "done";

type FailedItem = {
    studentEnrollmentId: number;
    rollNumber: number | null;
    studentName: string | null;
    reason: string;
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60; // ~2 min

export function ResultCardStudio({ exams, classes }: ResultCardStudioProps) {
    const [examId, setExamId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [singleEnrollmentId, setSingleEnrollmentId] = useState("");

    const [state, setState] = useState<GenerationState>("idle");
    const [isRetrying, setIsRetrying] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState<FailedItem[]>([]);
    const [summary, setSummary] = useState<{ total: number; success: number } | null>(null);

    // Use timeout chain (not setInterval) so polls never overlap
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeJobIdRef = useRef<string | null>(null);
    const attemptsRef = useRef(0);
    const stoppedRef = useRef(false);

    const stopPolling = () => {
        stoppedRef.current = true;
        activeJobIdRef.current = null;
        attemptsRef.current = 0;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Always clear on unmount
    useEffect(() => {
        return () => stopPolling();
    }, []);

    const sectionsForClass = useMemo(
        () => classes.find((c) => c.id === classId)?.sections ?? [],
        [classes, classId]
    );

    const busy = state === "generating" || state === "queued";

    const canGenerate =
        Boolean(examId && classId && sectionId) && !busy;

    const canGenerateSingle =
        Boolean(examId && singleEnrollmentId.trim()) && !busy;

    const resetResult = () => {
        setFileUrl(null);
        setFailed([]);
        setSummary(null);
    };

    const applyResult = (data: {
        fileUrl?: string;
        blobUrl?: string;
        totalStudents?: number;
        successCount?: number;
        failed?: FailedItem[];
    }) => {
        setState("done");
        setFileUrl(data.fileUrl ?? data.blobUrl ?? null);
        setFailed(data.failed ?? []);
        setSummary({
            total: data.totalStudents ?? 0,
            success: data.successCount ?? 0,
        });

        if ((data.failed?.length ?? 0) > 0) {
            toast.warning(
                `${data.successCount}/${data.totalStudents} রেজাল্ট কার্ড তৈরি হয়েছে। কিছু শিক্ষার্থী বাকি আছে।`
            );
        } else {
            toast.success("সকল রেজাল্ট কার্ড সফলভাবে তৈরি হয়েছে।");
        }
    };

    /**
     * Sequential poll — schedules the next tick only after the current
     * request finishes. Stops immediately on completed / failed / max attempts.
     */
    const pollJob = (
        jobId: string,
        onDone: (data: ResultCardJobStatus["result"]) => void,
        onFail: (msg: string) => void
    ) => {
        stopPolling();
        stoppedRef.current = false;
        activeJobIdRef.current = jobId;
        attemptsRef.current = 0;

        const tick = async () => {
            if (stoppedRef.current || activeJobIdRef.current !== jobId) return;

            attemptsRef.current += 1;

            try {
                const res = await getResultCardBatchStatus(jobId);

                // Aborted while in-flight
                if (stoppedRef.current || activeJobIdRef.current !== jobId) return;

                if (!res?.success || !res.data) {
                    if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                        stopPolling();
                        onFail("জব স্ট্যাটাস পাওয়া যায়নি — সময় শেষ");
                    } else {
                        timeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
                    }
                    return;
                }

                // Support a few possible shapes from the API wrapper
                const payload = res.data as any;
                const jobState: string =
                    payload.state ??
                    payload.jobState ??
                    payload.status ??
                    "";

                const result =
                    payload.result ??
                    payload.returnvalue ??
                    payload.data ??
                    undefined;

                const failedReason: string | undefined =
                    payload.failedReason ?? payload.failed_reason ?? undefined;

                if (jobState === "completed") {
                    stopPolling();
                    onDone(result);
                    return;
                }

                if (jobState === "failed") {
                    stopPolling();
                    onFail(failedReason || "প্রক্রিয়াটি ব্যর্থ হয়েছে");
                    return;
                }

                // waiting | active | delayed | unknown
                if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                    stopPolling();
                    onFail(
                        "সময় শেষ — রেজাল্ট কার্ড তৈরি হতে বেশি সময় লাগছে। পরে আবার চেষ্টা করুন।"
                    );
                    return;
                }

                timeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
            } catch {
                if (stoppedRef.current || activeJobIdRef.current !== jobId) return;

                if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                    stopPolling();
                    onFail("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
                } else {
                    timeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
                }
            }
        };

        // First poll after a short delay (job may still be enqueueing)
        timeoutRef.current = setTimeout(tick, 800);
    };

    // ─── Batch ──────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!examId || !classId || !sectionId) return;
        stopPolling();
        resetResult();
        setState("generating");

        const response = await generateResultCardBatch({
            classId,
            sectionId,
            examId,
        });

        if (!response.success) {
            toast.error(response.message);
            setState("idle");
            return;
        }

        if (response.mode === "queued") {
            setState("queued");
            pollJob(
                String(response.jobId),
                (result) => {
                    applyResult({
                        fileUrl: result?.fileUrl,
                        totalStudents: result?.totalStudents,
                        successCount: result?.successCount,
                        failed: result?.failed,
                    });
                },
                (msg) => {
                    toast.error(msg);
                    setState("idle");
                }
            );
        } else {
            applyResult({
                blobUrl: response.blobUrl,
                totalStudents: 1,
                successCount: 1,
            });
        }
    };

    // ─── Retry failed ───────────────────────────────────────────────────
    const handleRetry = async () => {
        if (!examId || !classId || !sectionId || failed.length === 0) return;
        setIsRetrying(true);

        const onlyEnrollmentIds = failed.map((f) => f.studentEnrollmentId);

        const response = await generateResultCardBatch({
            classId,
            sectionId,
            examId,
            onlyEnrollmentIds,
        });

        if (!response.success) {
            toast.error(response.message);
            setIsRetrying(false);
            return;
        }

        const finish = (data: any) => {
            setIsRetrying(false);
            setFailed(data.failed ?? []);
            if (data.fileUrl || data.blobUrl) {
                setFileUrl(data.fileUrl ?? data.blobUrl);
            }
            setSummary((prev) =>
                prev
                    ? {
                        total: prev.total,
                        success: prev.total - (data.failed?.length ?? 0),
                    }
                    : {
                        total: data.totalStudents ?? 0,
                        success: data.successCount ?? 0,
                    }
            );

            toast.success(
                (data.failed?.length ?? 0) > 0
                    ? `আংশিক সফল — ${data.failed.length} জন এখনও বাকি`
                    : "সকল বাকি রেজাল্ট কার্ড তৈরি হয়েছে।"
            );
        };

        if (response.mode === "queued") {
            pollJob(
                String(response.jobId),
                (result) =>
                    finish({
                        fileUrl: result?.fileUrl,
                        totalStudents: result?.totalStudents,
                        successCount: result?.successCount,
                        failed: result?.failed,
                    }),
                (msg) => {
                    toast.error(msg);
                    setIsRetrying(false);
                }
            );
        } else {
            finish({
                blobUrl: response.blobUrl,
                successCount: onlyEnrollmentIds.length,
            });
        }
    };

    // ─── Single ─────────────────────────────────────────────────────────
    const handleSingleGenerate = async () => {
        if (!examId || !singleEnrollmentId.trim()) return;
        stopPolling();
        resetResult();
        setState("generating");

        const enrollmentId = Number(singleEnrollmentId.trim());
        if (isNaN(enrollmentId)) {
            toast.error("সঠিক Enrollment ID দিন");
            setState("idle");
            return;
        }

        const response = await generateSingleResultCard(enrollmentId, examId);

        if (!response.success) {
            toast.error(response.message);
            setState("idle");
            return;
        }

        applyResult({
            blobUrl: response.blobUrl,
            totalStudents: 1,
            successCount: 1,
        });
    };

    return (
        <div className="result-studio">
            <section className="request-card">
                <div className="request-card__eyebrow">নথি অনুরোধ</div>
                <h2 className="request-card__title">রেজাল্ট কার্ড ইস্যু করুন</h2>
                <p className="request-card__hint">
                    পরীক্ষা, শ্রেণি এবং শাখা নির্বাচন করুন — নির্বাচিত শাখার সকল
                    শিক্ষার্থীর জন্য একত্রে রেজাল্ট কার্ড তৈরি হবে। অথবা একক শিক্ষার্থীর
                    জন্যও তৈরি করতে পারবেন।
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
                                <SelectValue
                                    placeholder={
                                        classId
                                            ? "নির্বাচন করুন"
                                            : "আগে শ্রেণি নির্বাচন করুন"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionsForClass.map((section) => (
                                    <SelectItem
                                        key={section.id}
                                        value={String(section.id)}
                                    >
                                        {section.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <button
                    className="issue-button"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                >
                    {busy ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            {state === "queued"
                                ? "সারিতে যুক্ত হয়েছে..."
                                : "তৈরি হচ্ছে..."}
                        </>
                    ) : (
                        <>
                            <FileStack className="h-4 w-4" aria-hidden />
                            শাখার সকল রেজাল্ট কার্ড তৈরি করুন
                        </>
                    )}
                </button>

                <div className="single-divider">
                    <span>অথবা একক শিক্ষার্থী</span>
                </div>

                <div className="single-row">
                    <Field label="Enrollment ID">
                        <input
                            type="text"
                            className="single-input"
                            placeholder="যেমন: 1245"
                            value={singleEnrollmentId}
                            onChange={(e) => setSingleEnrollmentId(e.target.value)}
                        />
                    </Field>

                    <button
                        className="issue-button issue-button--outline"
                        onClick={handleSingleGenerate}
                        disabled={!canGenerateSingle}
                    >
                        {state === "generating" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <User className="h-4 w-4" />
                        )}
                        একক কার্ড তৈরি
                    </button>
                </div>
            </section>

            {summary && (
                <section className="ledger">
                    <div className="ledger__head">
                        <div className="ledger__head-left">
                            <span className="ledger__label">ফলাফল</span>
                            <h3 className="ledger__count">
                                <span className="mono">{summary.success}</span>
                                <span className="ledger__count-sep">/</span>
                                <span className="mono ledger__count-total">
                                    {summary.total}
                                </span>
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
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-link"
                        >
                            <Download className="h-4 w-4" aria-hidden />
                            সম্পূর্ণ PDF ডাউনলোড করুন
                        </a>
                    )}

                    {failed.length > 0 && (
                        <div className="failed-block">
                            <div className="failed-block__head">
                                <p className="failed-block__title">
                                    {failed.length} জন শিক্ষার্থীর রেজাল্ট কার্ড তৈরি
                                    হয়নি
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
                                            <td className="mono">
                                                {f.rollNumber ?? "—"}
                                            </td>
                                            <td>
                                                {f.studentName ??
                                                    `ID ${f.studentEnrollmentId}`}
                                            </td>
                                            <td className="failed-table__reason">
                                                {f.reason}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <style jsx>{`
                .result-studio {
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
                    font-family: "Hind Siliguri", "Noto Sans Bengali", ui-sans-serif,
                        system-ui, sans-serif;
                    color: var(--ink);
                }
                .mono {
                    font-family: "IBM Plex Mono", ui-monospace, monospace;
                    font-variant-numeric: tabular-nums;
                }
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
                    background: linear-gradient(
                        90deg,
                        var(--brass) 0%,
                        var(--brass) 40%,
                        transparent 40%
                    );
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
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }
                .issue-button:hover:not(:disabled) {
                    background: #0f151d;
                }
                .issue-button:disabled {
                    background: #b7bcc2;
                    cursor: not-allowed;
                }
                .issue-button--outline {
                    background: transparent;
                    color: var(--ink);
                    border: 1.5px solid var(--ink);
                }
                .issue-button--outline:hover:not(:disabled) {
                    background: var(--ink);
                    color: var(--paper);
                }
                .single-divider {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin: 28px 0 20px;
                    font-size: 12px;
                    color: var(--ink-soft);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .single-divider::before,
                .single-divider::after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background: var(--hairline);
                }
                .single-row {
                    display: flex;
                    gap: 16px;
                    align-items: flex-end;
                }
                .single-input {
                    width: 100%;
                    height: 40px;
                    padding: 0 12px;
                    border: 1px solid var(--hairline);
                    border-radius: 3px;
                    font-size: 14px;
                    background: white;
                    outline: none;
                }
                .single-input:focus {
                    border-color: var(--brass);
                    box-shadow: 0 0 0 2px rgba(176, 141, 87, 0.2);
                }
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
                    padding: 10px;
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
            `}</style>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
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