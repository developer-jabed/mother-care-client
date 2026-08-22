// components/modules/result-lookup/ResultLookUp.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, GraduationCap, AlertCircle, Award, ChevronDown } from "lucide-react";
import { Exam } from "@/service/exam/exam.service";
import {
  getResultsByRoll,
  ResultsByRollResponse,
  ResultByRollRow,
} from "@/service/result/result.service";
import { ClassWithSections } from "@/service/academic/createAcademicYear.service";
import { LottiePlayer } from "@/components/ui/lottie-player";

interface Props {
  classes: ClassWithSections[];
  exams: Exam[];
}

// Dev-only mock data for previewing the result UI without a live API response.
// Field shapes must match your real ResultsByRollResponse / ResultByRollRow types —
// adjust if your actual service.ts types differ.
const mockResult: ResultsByRollResponse = {
  student: {
    fullName: "রাফসান জামিল",
    admissionNumber: "2024-0157",
    fatherName: "মোঃ জামিল হোসেন",
    motherName: "সালমা বেগম",
    gender: "male",
    dateOfBirth: "2010-04-12",
    phone: null,
    address: null,
    photo: null,
    rollNumber: 12,
    className: "নবম শ্রেণি",
    sectionName: "ক",
  },
  results: [
    {
      id: 1,
      exam: { id: 1, name: "বার্ষিক পরীক্ষা ২০২৫" },
      totalMarks: 720,
      percentage: 96,
      position: 1,
      grade: "A+",
      gradePoint: 5,
      isPublished: true,
      details: [
        {
          subjectId: 1,
          subject: { id: 1, name: "বাংলা", fullMarks: 100 },
          writtenMarks: 70,
          mcqMarks: 25,
          practicalMarks: null,
          vivaMarks: null,
          totalMarks: 95,
          grade: "A+",
          gradePoint: 5,
        },
        {
          subjectId: 2,
          subject: { id: 2, name: "ইংরেজি", fullMarks: 100 },
          writtenMarks: 65,
          mcqMarks: 28,
          practicalMarks: null,
          vivaMarks: null,
          totalMarks: 93,
          grade: "A+",
          gradePoint: 5,
        },
        {
          subjectId: 3,
          subject: { id: 3, name: "গণিত", fullMarks: 100 },
          writtenMarks: 60,
          mcqMarks: 24,
          practicalMarks: null,
          vivaMarks: null,
          totalMarks: 84,
          grade: "A",
          gradePoint: 4,
        },
        {
          subjectId: 4,
          subject: { id: 4, name: "বিজ্ঞান", fullMarks: 100 },
          writtenMarks: 55,
          mcqMarks: 20,
          practicalMarks: 20,
          vivaMarks: null,
          totalMarks: 95,
          grade: "A+",
          gradePoint: 5,
        },
      ],
    },
  ],
};

function gradeAccent(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith("A+") || g === "A") return { ring: "#1F7A5C", soft: "#E9F5EF", text: "#1F7A5C" };
  if (g.startsWith("A-") || g === "B") return { ring: "#C9A227", soft: "#FBF3DC", text: "#9C7C10" };
  if (g === "C" || g === "D") return { ring: "#C9741F", soft: "#FCEEDD", text: "#B3611A" };
  return { ring: "#B3401F", soft: "#FBE7E1", text: "#B3401F" };
}

export function ResultLookupForm({ classes, exams }: Props) {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [roll, setRoll] = useState("");
  const [examId, setExamId] = useState("");
  const [activeExamIdx, setActiveExamIdx] = useState(0);

  const [result, setResult] = useState<ResultsByRollResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sections = useMemo(
    () => classes.find((c) => String(c.id) === classId)?.sections ?? [],
    [classes, classId]
  );

  const handleClassChange = (value: string) => {
    setClassId(value);
    setSectionId("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!classId || !sectionId || !roll) {
      setError("ক্লাস, শাখা এবং রোল নম্বর দিন");
      return;
    }

    startTransition(async () => {
      const res = await getResultsByRoll(
        Number(classId),
        Number(sectionId),
        Number(roll),
        examId ? Number(examId) : undefined
      );

      if (res.success) {
        setResult(res.data);
        setActiveExamIdx(0);
      } else {
        setError(res.message || "ফলাফল পাওয়া যায়নি");
      }
    });
  };

  const activeResult: ResultByRollRow | undefined = result?.results[activeExamIdx];
  const accent = activeResult ? gradeAccent(activeResult.grade) : gradeAccent("F");
  const isTopGrade =
    activeResult?.grade.toUpperCase() === "A+" || activeResult?.gradePoint === 5;

  return (
    <div
      className="rls-root flex min-h-screen justify-center px-4 py-10"
      style={
        {
          "--ink": "#0F2547",
          "--paper": "#FBF7EE",
          "--paper-edge": "#EFE6D3",
          "--gold": "#C9A227",
          "--gold-soft": "#FBF3DC",
          "--emerald": "#1F7A5C",
          "--rust": "#B3401F",
          "--slate": "#445066",
        } as React.CSSProperties
      }
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Hind+Siliguri:wght@400;500;600;700&display=swap");

        .rls-root {
          font-family: "Hind Siliguri", sans-serif;
        }
        .rls-display {
          font-family: "Tiro Bangla", serif;
        }
        .rls-paper {
          background: radial-gradient(circle at 100% 0%, rgba(201, 162, 39, 0.06), transparent 45%),
            var(--paper);
          border: 1px solid var(--paper-edge);
        }
        .rls-select {
          appearance: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .rls-motion-safe {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-3xl self-start pt-[10vh]">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--ink)" }}
          >
            <GraduationCap className="h-6 w-6" style={{ color: "var(--gold)" }} />
          </div>
          <h1 className="rls-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
            পরীক্ষার ফলাফল
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--slate)" }}>
            ক্লাস, শাখা ও রোল নম্বর নির্বাচন করে ফলাফল দেখুন
          </p>
          <div
            className="mx-auto mt-4 h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, var(--gold), transparent)" }}
          />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="rls-paper rounded-2xl p-6 shadow-[0_8px_30px_rgba(15,37,71,0.08)] sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              {
                label: "ক্লাস",
                value: classId,
                onChange: handleClassChange,
                options: classes.map((c) => ({ value: String(c.id), label: c.name })),
                placeholder: "নির্বাচন করুন",
              },
              {
                label: "শাখা",
                value: sectionId,
                onChange: setSectionId,
                options: sections.map((s) => ({ value: String(s.id), label: s.name })),
                placeholder: "নির্বাচন করুন",
                disabled: !classId,
              },
            ].map((field, i) => (
              <div key={i}>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--slate)" }}
                >
                  {field.label}
                </label>
                <div className="relative">
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                    disabled={field.disabled}
                    className="rls-select w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ color: "var(--ink)", borderColor: "var(--paper-edge)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--paper-edge)")}
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--slate)" }}
                  />
                </div>
              </div>
            ))}

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--slate)" }}
              >
                রোল নম্বর
              </label>
              <input
                type="number"
                min={1}
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                required
                placeholder="যেমন: ১২"
                className="w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium outline-none transition"
                style={{ color: "var(--ink)", borderColor: "var(--paper-edge)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--paper-edge)")}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--slate)" }}
              >
                পরীক্ষা <span className="font-normal normal-case">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="rls-select w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium outline-none transition"
                  style={{ color: "var(--ink)", borderColor: "var(--paper-edge)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--paper-edge)")}
                >
                  <option value="">সর্বশেষ পরীক্ষা</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--slate)" }}
                />
              </div>
            </div>
          </div>

          {/* Error / no-result state with Lottie illustration */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col items-center gap-1 overflow-hidden rounded-xl px-4 py-4 text-sm"
                style={{ background: "#FBE7E1", color: "var(--rust)" }}
              >
                <LottiePlayer
                  animationData="/lottie/not-found.json"
                  loop
                  className="h-20 w-20"
                />
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "var(--ink)" }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                খোঁজা হচ্ছে...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                ফলাফল দেখুন
              </>
            )}
          </motion.button>
        </motion.form>

        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              setResult(mockResult);
              setActiveExamIdx(0);
              setError(null);
            }}
            className="mt-3 text-xs underline"
            style={{ color: "var(--slate)" }}
          >
            Load mock result (dev only)
          </button>
        )}

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && activeResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="rls-paper relative mt-8 overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(15,37,71,0.12)]"
            >
              <div className="relative overflow-hidden px-6 py-6 sm:px-8" style={{ background: "var(--ink)" }}>
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
                  style={{ background: "var(--gold)" }}
                />
                <div className="relative flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
                      মার্কশিট
                    </p>
                    <h2 className="rls-display mt-1 text-2xl font-bold text-white sm:text-3xl">
                      {result.student.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      ভর্তি নং: {result.student.admissionNumber} · রোল: {result.student.rollNumber} ·{" "}
                      {result.student.className} – {result.student.sectionName}
                    </p>
                  </div>

                  <motion.div
                    key={activeResult.grade}
                    initial={{ scale: 0, rotate: -35, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                    className="rls-motion-safe relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${accent.ring}, ${accent.text})`,
                      boxShadow: `0 0 0 4px rgba(255,255,255,0.15), 0 8px 24px ${accent.ring}55`,
                    }}
                  >
                    {/* celebratory sparkle for top grades only (A+ or GPA 5) */}
                    {isTopGrade && (
                      <LottiePlayer
                        animationData="/lottie/sparkle.json"
                        loop={false}
                        className="pointer-events-none absolute -inset-6"
                      />
                    )}
                    <div className="flex flex-col items-center leading-none text-white">
                      <span className="rls-display text-2xl font-bold">{activeResult.grade}</span>
                      <span className="mt-0.5 text-[10px] font-medium opacity-80">
                        {activeResult.gradePoint.toFixed(2)}
                      </span>
                    </div>
                    <Award
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white p-1 shadow"
                      style={{ color: accent.ring }}
                    />
                  </motion.div>
                </div>
              </div>

              {result.results.length > 1 && (
                <div
                  className="flex gap-1 overflow-x-auto border-b px-4 pt-3 sm:px-8"
                  style={{ borderColor: "var(--paper-edge)" }}
                >
                  {result.results.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveExamIdx(idx)}
                      className="relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition"
                      style={{ color: idx === activeExamIdx ? "var(--ink)" : "var(--slate)" }}
                    >
                      {r.exam.name}
                      {idx === activeExamIdx && (
                        <motion.div
                          layoutId="rls-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ background: "var(--gold)" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 px-6 py-6 sm:px-8">
                {[
                  { label: "মোট নম্বর", value: activeResult.totalMarks, color: "var(--ink)" },
                  { label: "শতকরা", value: `${activeResult.percentage}%`, color: "var(--emerald)" },
                  {
                    label: "মেধাক্রম",
                    value: activeResult.position ?? "—",
                    color: "var(--gold)",
                    textColor: "#9C7C10",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(15,37,71,0.035)" }}
                  >
                    <div className="text-[11px] font-medium" style={{ color: "var(--slate)" }}>
                      {stat.label}
                    </div>
                    <div className="rls-display mt-1 text-2xl font-bold" style={{ color: stat.textColor ?? stat.color }}>
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {activeResult.details.length > 0 && (
                <div className="px-6 pb-8 sm:px-8">
                  <div
                    className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--slate)" }}
                  >
                    <div className="h-px flex-1" style={{ background: "var(--paper-edge)" }} />
                    বিষয়ভিত্তিক ফলাফল
                    <div className="h-px flex-1" style={{ background: "var(--paper-edge)" }} />
                  </div>

                  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--paper-edge)" }}>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr style={{ background: "var(--gold-soft)" }}>
                          <th className="px-4 py-3 font-semibold" style={{ color: "var(--ink)" }}>বিষয়</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>পূর্ণমান</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>লিখিত</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>MCQ</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>ব্যবহারিক</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>মৌখিক</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>মোট</th>
                          <th className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>গ্রেড</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeResult.details.map((d, i) => {
                          const rowAccent = gradeAccent(d.grade);
                          return (
                            <motion.tr
                              key={d.subjectId}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 + i * 0.04 }}
                              className="border-t bg-white"
                              style={{ borderColor: "var(--paper-edge)" }}
                            >
                              <td className="px-4 py-3 font-medium" style={{ color: "var(--ink)" }}>
                                {d.subject.name}
                              </td>
                              <td className="px-3 py-3 text-center" style={{ color: "var(--slate)" }}>
                                {d.subject.fullMarks}
                              </td>
                              <td className="px-3 py-3 text-center" style={{ color: "var(--slate)" }}>
                                {d.writtenMarks ?? "—"}
                              </td>
                              <td className="px-3 py-3 text-center" style={{ color: "var(--slate)" }}>
                                {d.mcqMarks ?? "—"}
                              </td>
                              <td className="px-3 py-3 text-center" style={{ color: "var(--slate)" }}>
                                {d.practicalMarks ?? "—"}
                              </td>
                              <td className="px-3 py-3 text-center" style={{ color: "var(--slate)" }}>
                                {d.vivaMarks ?? "—"}
                              </td>
                              <td className="px-3 py-3 text-center font-semibold" style={{ color: "var(--ink)" }}>
                                {d.totalMarks}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span
                                  className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full px-2 py-1 text-xs font-bold"
                                  style={{ background: rowAccent.soft, color: rowAccent.text }}
                                >
                                  {d.grade}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!activeResult.isPublished && (
                <div
                  className="mx-6 mb-6 rounded-xl px-4 py-3 text-center text-xs font-medium sm:mx-8"
                  style={{ background: "#FBE7E1", color: "var(--rust)" }}
                >
                  এই ফলাফলটি এখনও আনুষ্ঠানিকভাবে প্রকাশিত হয়নি
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}