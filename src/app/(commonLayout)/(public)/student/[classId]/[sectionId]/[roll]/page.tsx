import { getResultsByRoll } from "@/service/result/result.service";
import { Award, GraduationCap, TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ classId: string; sectionId: string; roll: string }>;
}

export const metadata = { title: "ফলাফল" };

export const dynamic = "force-dynamic"; // Important: Do NOT use force-static
export const revalidate = 1000; // Revalidate every 1000 seconds (about 16.67 minutes)


function gradeColor(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith("A+")) return { bg: "#eaf6ee", text: "#1f7a43", ring: "#bfe6cc" };
  if (g.startsWith("A")) return { bg: "#eef3fb", text: "#2255a4", ring: "#c6d9f2" };
  if (g === "F") return { bg: "#fbeceb", text: "#a6483c", ring: "#f0c9c5" };
  return { bg: "#fdf6e8", text: "#8f6c1f", ring: "#f0dfb0" };
}

function genderLabel(gender: string) {
  if (gender === "MALE") return "পুরুষ";
  if (gender === "FEMALE") return "মহিলা";
  return "অন্যান্য";
}

export default async function StudentResultPage({ params }: PageProps) {
  const { classId, sectionId, roll } = await params;
  const response = await getResultsByRoll(Number(classId), Number(sectionId), Number(roll));

  if (!response.success || !response.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-6 pt-24 pb-10">
        <div className="w-full max-w-sm rounded-2xl border border-[#e4ddc9] bg-white p-8 text-center shadow-[0_8px_30px_rgba(26,42,68,0.06)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fbeceb]">
            <span className="text-2xl text-[#a6483c]">!</span>
          </div>
          <h1 className="text-lg font-bold text-[#a6483c]">ফলাফল পাওয়া যায়নি</h1>
          <p className="mt-2 text-sm text-[#6b7280]">{response.message}</p>
        </div>
      </div>
    );
  }

  const { student, results } = response.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f1ea] to-[#eee8d9] px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ---------- Student header ---------- */}
        <header className="relative overflow-hidden rounded-3xl border border-[#e4ddc9] bg-[#1a2a44] p-8 text-center shadow-[0_20px_50px_rgba(26,42,68,0.25)] sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #d4af37 0%, transparent 35%), radial-gradient(circle at 80% 80%, #d4af37 0%, transparent 35%)",
            }}
          />
          <div className="relative">
            {student.photo ? (
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-[#d4af37]/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={student.photo} alt={student.fullName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4af37]/40 bg-white/5">
                <GraduationCap className="h-7 w-7 text-[#d4af37]" />
              </div>
            )}

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              একাডেমিক ফলাফল
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{student.fullName}</h1>
            <p className="mt-1 text-sm text-[#c7cedb]">ভর্তি নম্বর: {student.admissionNumber}</p>

            <div className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-2">
              <Pill>{student.className}</Pill>
              <Pill>{student.sectionName}</Pill>
              <Pill accent>রোল {student.rollNumber}</Pill>
            </div>

            {/* Guardian & personal info */}
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-left text-xs text-[#c7cedb]">
              {student.fatherName && <InfoRow label="পিতার নাম" value={student.fatherName} />}
              {student.motherName && <InfoRow label="মাতার নাম" value={student.motherName} />}
              <InfoRow
                label="জন্ম তারিখ"
                value={new Date(student.dateOfBirth).toLocaleDateString("bn-BD", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoRow label="লিঙ্গ" value={genderLabel(student.gender)} />
              {student.phone && <InfoRow label="ফোন" value={student.phone} />}
              {student.address && <InfoRow label="ঠিকানা" value={student.address} />}
            </div>
          </div>
        </header>

        {/* ---------- Results ---------- */}
        {results.map((r) => {
          const colors = gradeColor(r.grade);
          return (
            <section
              key={r.id}
              className="overflow-hidden rounded-2xl border border-[#e4ddc9] bg-white shadow-[0_8px_30px_rgba(26,42,68,0.06)]"
            >
              {/* Exam header strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee2cc] bg-[#faf7f0] px-6 py-4 sm:px-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b6f47]">
                    পরীক্ষা
                  </p>
                  <h2 className="text-lg font-bold text-[#1a2a44]">{r.exam.name}</h2>
                </div>
                <span
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ring-1"
                  style={{ background: colors.bg, color: colors.text, borderColor: colors.ring }}
                >
                  <Award className="h-3.5 w-3.5" />
                  {r.grade}
                </span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 px-6 py-6 sm:gap-4 sm:px-8">
                <StatCard label="মোট নম্বর" value={r.totalMarks} />
                <StatCard label="শতকরা" value={`${r.percentage.toFixed(2)}%`} highlight />
                <StatCard
                  label="অবস্থান"
                  value={r.position ?? "—"}
                  icon={r.position === 1 ? <TrendingUp className="h-3.5 w-3.5 text-[#1f7a43]" /> : undefined}
                />
              </div>

              {/* Subject table */}
              <div className="px-6 pb-6 sm:px-8">
                <div className="overflow-hidden rounded-xl border border-[#eee2cc]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1a2a44] text-left text-white">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">বিষয়</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                          প্রাপ্ত
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                          পূর্ণমান
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                          গ্রেড
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.details.map((d, idx) => {
                        const pct = (d.totalMarks / d.subject.fullMarks) * 100;
                        return (
                          <tr key={d.subjectId} className={idx % 2 === 0 ? "bg-white" : "bg-[#faf7f0]"}>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#1a2a44]">{d.subject.name}</div>
                              <div className="mt-1.5 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-[#eee2cc]">
                                <div
                                  className="h-full rounded-full bg-[#1a2a44]"
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[#1a2a44]">
                              {d.totalMarks}
                            </td>
                            <td className="px-4 py-3 text-right text-[#6b7280]">{d.subject.fullMarks}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold text-[#1a2a44]">{d.grade}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })}

        {/* ---------- Footer note ---------- */}
        <p className="text-center text-xs text-[#8b8578]">
          এই ফলাফলটি মাদার কেয়ার স্কুল অ্যান্ড কলেজ কর্তৃক অনলাইনে যাচাইকৃত।
        </p>
      </div>
    </div>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={
        accent
          ? "rounded-full bg-[#d4af37] px-3.5 py-1 text-xs font-bold text-[#1a2a44]"
          : "rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white"
      }
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[#8b93a3]">{label}</div>
      <div className="mt-0.5 font-medium text-white">{value}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  icon,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-[#1a2a44]/10 bg-[#1a2a44] p-4 text-center"
          : "rounded-xl border border-[#eee2cc] bg-[#faf7f0] p-4 text-center"
      }
    >
      <div
        className={
          highlight
            ? "text-[10px] font-semibold uppercase tracking-wide text-[#c7cedb]"
            : "text-[10px] font-semibold uppercase tracking-wide text-[#8b6f47]"
        }
      >
        {label}
      </div>
      <div
        className={
          highlight
            ? "mt-1 flex items-center justify-center gap-1 text-xl font-bold text-white"
            : "mt-1 flex items-center justify-center gap-1 text-xl font-bold text-[#1a2a44]"
        }
      >
        {icon}
        {value}
      </div>
    </div>
  );
}