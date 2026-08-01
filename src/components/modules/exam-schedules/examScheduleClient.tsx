"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  type ExamSchedule,
  type CreateExamScheduleInput,
} from "@/service/examSchedule/examSchedule.service";
import { getSubjectsByClassId } from "@/service/subject/subject.service";

export interface ExamOption {
  id: number;
  name: string;
}

export interface SubjectOption {
  id: number;
  name: string;
}

export interface ClassOption {
  id: number;
  name: string;
}

interface Props {
  initialSchedules: ExamSchedule[];
  exams: ExamOption[];
  classes: ClassOption[];
}

type FormState = {
  examId: string;
  subjectId: string;
  classId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
};

const emptyForm: FormState = {
  examId: "",
  subjectId: "",
  classId: "",
  examDate: "",
  startTime: "",
  endTime: "",
  roomNumber: "",
};

const toIso = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return "";
  return new Date(`${dateStr}T${timeStr}`).toISOString();
};

// ✅ Fixed (uses local time)
const fromIsoToDateInput = (iso: string) => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromIsoToTimeInput = (iso: string) => {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function ExamScheduleStudio({
  initialSchedules,
  exams,
  classes,
}: Props) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>(initialSchedules);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ExamSchedule | null>(null);

  // Subjects loaded dynamically based on selected class
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [filterExamId, setFilterExamId] = useState<string>("all");
  const [filterClassId, setFilterClassId] = useState<string>("all");

  const examMap = useMemo(
    () => new Map(exams.map((e) => [e.id, e.name])),
    [exams]
  );
  const classMap = useMemo(
    () => new Map(classes.map((c) => [c.id, c.name])),
    [classes]
  );

  // ── Load subjects when class is selected ───────────────────────────
  useEffect(() => {
    if (!form.classId) {
      setSubjects([]);
      return;
    }

    const classId = Number(form.classId);
    let cancelled = false;

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const result = await getSubjectsByClassId(classId);

        if (!cancelled) {
          if (result.success) {
            setSubjects(
              result.data.map((s) => ({
                id: s.id,
                name: s.name,
              }))
            );
          } else {
            setSubjects([]);
            toast.error(result.message || "বিষয় লোড করা যায়নি");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setSubjects([]);
          toast.error("বিষয় লোড করতে সমস্যা হয়েছে");
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [form.classId]);

  // ── Filter schedules ───────────────────────────────────────────────
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (filterExamId !== "all" && s.examId !== Number(filterExamId))
        return false;
      if (filterClassId !== "all" && s.classId !== Number(filterClassId))
        return false;
      return true;
    });
  }, [schedules, filterExamId, filterClassId]);

  // ── Group by Class ─────────────────────────────────────────────────
  const schedulesByClass = useMemo(() => {
    const map = new Map<number, ExamSchedule[]>();

    filteredSchedules.forEach((s) => {
      const list = map.get(s.classId) ?? [];
      list.push(s);
      map.set(s.classId, list);
    });

    map.forEach((list) => {
      list.sort(
        (a, b) =>
          new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
      );
    });

    return map;
  }, [filteredSchedules]);

  const sortedClassIds = useMemo(() => {
    return Array.from(schedulesByClass.keys()).sort((a, b) => {
      const nameA = classMap.get(a) ?? "";
      const nameB = classMap.get(b) ?? "";
      return nameA.localeCompare(nameB);
    });
  }, [schedulesByClass, classMap]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSubjects([]);
    setIsFormOpen(true);
  };

  const openEditForm = (schedule: ExamSchedule) => {
    setEditingId(schedule.id);
    setForm({
      examId: String(schedule.examId),
      subjectId: String(schedule.subjectId),
      classId: String(schedule.classId),
      examDate: fromIsoToDateInput(schedule.examDate),
      startTime: fromIsoToTimeInput(schedule.startTime),
      endTime: fromIsoToTimeInput(schedule.endTime),
      roomNumber: schedule.roomNumber ?? "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSubjects([]);
  };

  const isFormValid =
    form.examId &&
    form.subjectId &&
    form.classId &&
    form.examDate &&
    form.startTime &&
    form.endTime;

  const handleSubmit = () => {
    if (!isFormValid) return;

    const payload: CreateExamScheduleInput = {
      examId: Number(form.examId),
      subjectId: Number(form.subjectId),
      classId: Number(form.classId),
      examDate: toIso(form.examDate, "00:00"),
      startTime: toIso(form.examDate, form.startTime),
      endTime: toIso(form.examDate, form.endTime),
      roomNumber: form.roomNumber || null,
    };

    startTransition(async () => {
      const response = editingId
        ? await updateExamSchedule(editingId, payload)
        : await createExamSchedule(payload);

      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      if (editingId) {
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === editingId ? (response.data as ExamSchedule) : s
          )
        );
      } else {
        setSchedules((prev) => [...prev, response.data as ExamSchedule]);
      }

      toast.success(response.message);
      closeForm();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;

    startTransition(async () => {
      const response = await deleteExamSchedule(target.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setSchedules((prev) => prev.filter((s) => s.id !== target.id));
      toast.success(response.message);
      setDeleteTarget(null);
    });
  };

  // Helper to show subject name in the table
  const getSubjectName = (schedule: ExamSchedule) => {
    return schedule.subject?.name ?? "—";
  };

  return (
    <div className="schedule-studio">
      {/* ---------- Header ---------- */}
      <section className="header-card">
        <div className="header-card__left">
          <div className="header-card__eyebrow">পরিকল্পনা</div>
          <h2 className="header-card__title">পরীক্ষার সময়সূচী</h2>
          <p className="header-card__hint">
            প্রতিটি পরীক্ষা, শ্রেণি ও বিষয়ের জন্য তারিখ, সময় এবং কক্ষ নির্ধারণ
            করুন।
          </p>
        </div>
        <button className="add-button" onClick={openCreateForm}>
          <Plus className="h-4 w-4" aria-hidden />
          নতুন সময়সূচী
        </button>
      </section>

      {/* ---------- Filters ---------- */}
      <section className="filter-bar">
        <div className="filter-field">
          <span className="filter-field__label">পরীক্ষা</span>
          <Select value={filterExamId} onValueChange={setFilterExamId}>
            <SelectTrigger className="filter-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সকল পরীক্ষা</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={String(exam.id)}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="filter-field">
          <span className="filter-field__label">শ্রেণি</span>
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="filter-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সকল শ্রেণি</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* ---------- Class-wise Schedule List ---------- */}
      <div className="class-groups">
        {sortedClassIds.length === 0 ? (
          <section className="table-card">
            <div className="empty-state">
              <CalendarClock className="h-8 w-8" aria-hidden />
              <p>কোনো সময়সূচী পাওয়া যায়নি</p>
            </div>
          </section>
        ) : (
          sortedClassIds.map((classId) => {
            const classSchedules = schedulesByClass.get(classId) ?? [];
            const className = classMap.get(classId) ?? `Class ${classId}`;

            return (
              <section key={classId} className="table-card class-group">
                <div className="class-header">
                  <h3 className="class-title">{className}</h3>
                  <span className="class-count">
                    {classSchedules.length} টি সময়সূচী
                  </span>
                </div>

                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>পরীক্ষা</th>
                      <th>বিষয়</th>
                      <th>তারিখ</th>
                      <th>সময়</th>
                      <th>কক্ষ</th>
                      <th className="actions-col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSchedules.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {examMap.get(s.examId) ?? s.exam?.name ?? "—"}
                        </td>
                        <td>{getSubjectName(s)}</td>
                        <td className="mono">
                          {new Date(s.examDate).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="mono">
                          {new Date(s.startTime).toLocaleTimeString("bn-BD", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(s.endTime).toLocaleTimeString("bn-BD", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          {s.roomNumber ? (
                            <span className="room-badge">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {s.roomNumber}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="actions-col">
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              onClick={() => openEditForm(s)}
                              aria-label="সম্পাদনা"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </button>
                            <button
                              className="icon-btn icon-btn--danger"
                              onClick={() => setDeleteTarget(s)}
                              aria-label="মুছুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })
        )}
      </div>

      {/* ---------- Create / Edit Dialog ---------- */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="schedule-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "সময়সূচী সম্পাদনা করুন"
                : "নতুন সময়সূচী যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="form-grid">
            {/* Exam */}
            <FormField label="পরীক্ষা">
              <Select
                value={form.examId}
                onValueChange={(v) => setForm((f) => ({ ...f, examId: v }))}
              >
                <SelectTrigger>
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
            </FormField>

            {/* Class */}
            <FormField label="শ্রেণি">
              <Select
                value={form.classId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    classId: v,
                    subjectId: "", // reset subject
                  }))
                }
              >
                <SelectTrigger>
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
            </FormField>

            {/* Subject (loaded dynamically) */}
            <FormField label="বিষয়">
              <Select
                value={form.subjectId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, subjectId: v }))
                }
                disabled={!form.classId || loadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.classId
                        ? "আগে শ্রেণি নির্বাচন করুন"
                        : loadingSubjects
                        ? "লোড হচ্ছে..."
                        : "নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {loadingSubjects ? (
                    <SelectItem value="__loading" disabled>
                      লোড হচ্ছে...
                    </SelectItem>
                  ) : subjects.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      এই শ্রেণির কোনো বিষয় নেই
                    </SelectItem>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={String(subject.id)}
                      >
                        {subject.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>

            {/* Room */}
            <FormField label="কক্ষ নম্বর (ঐচ্ছিক)">
              <Input
                value={form.roomNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roomNumber: e.target.value }))
                }
                placeholder="যেমন: ২০৩"
              />
            </FormField>

            {/* Date */}
            <FormField label="তারিখ">
              <Input
                type="date"
                value={form.examDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, examDate: e.target.value }))
                }
              />
            </FormField>

            {/* Time pair */}
            <div className="form-grid__time-pair">
              <FormField label="শুরুর সময়">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="শেষের সময়">
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </div>

          <div className="dialog-actions">
            <Button
              variant="outline"
              onClick={closeForm}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : editingId ? (
                "আপডেট করুন"
              ) : (
                "তৈরি করুন"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete Confirm ---------- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>সময়সূচী মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  {examMap.get(deleteTarget.examId)} ·{" "}
                  {classMap.get(deleteTarget.classId)} ·{" "}
                  {deleteTarget.subject?.name ?? "—"} — এই সময়সূচীটি
                  স্থায়ীভাবে মুছে যাবে।
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="delete-confirm-btn"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        .schedule-studio {
          --ink: #1b2430;
          --ink-soft: #48505c;
          --paper: #f7f5f0;
          --paper-raised: #ffffff;
          --hairline: #dcd6c8;
          --brass: #b08d57;
          --brass-deep: #8f7040;
          --navy: #1c2b45;
          --navy-bg: #eef1f6;

          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: "Hind Siliguri", "Noto Sans Bengali", ui-sans-serif,
            system-ui, sans-serif;
          color: var(--ink);
        }

        .mono {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }

        .header-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 4px;
          padding: 28px clamp(20px, 4vw, 36px);
          overflow: hidden;
        }
        .header-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            var(--navy) 0%,
            var(--navy) 40%,
            transparent 40%
          );
          background-size: 24px 4px;
        }
        .header-card__eyebrow {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass-deep);
          font-weight: 600;
        }
        .header-card__title {
          font-family: "Noto Serif Bengali", "Georgia", serif;
          font-size: clamp(20px, 2.4vw, 26px);
          font-weight: 600;
          margin: 6px 0 6px;
        }
        .header-card__hint {
          font-size: 13px;
          color: var(--ink-soft);
          max-width: 52ch;
          line-height: 1.6;
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 3px;
          padding: 11px 18px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.15s ease;
        }
        .add-button:hover {
          background: #14213a;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 4px;
          padding: 16px 20px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 180px;
        }
        .filter-field__label {
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-soft);
          letter-spacing: 0.02em;
        }

        .class-groups {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .class-group {
          overflow: hidden;
        }

        .class-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: var(--navy);
          color: white;
        }

        .class-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }

        .class-count {
          font-size: 12px;
          opacity: 0.85;
          background: rgba(255, 255, 255, 0.15);
          padding: 3px 10px;
          border-radius: 999px;
        }

        .table-card {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 4px;
          overflow: hidden;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .schedule-table th {
          text-align: left;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          font-weight: 600;
          padding: 12px 16px;
          background: var(--navy-bg);
          border-bottom: 1px solid var(--hairline);
        }
        .schedule-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--hairline);
          vertical-align: middle;
        }
        .schedule-table tr:last-child td {
          border-bottom: none;
        }
        .actions-col {
          width: 1%;
          white-space: nowrap;
        }

        .room-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--brass-deep);
          background: #f9f2e4;
          border: 1px solid #ecdcb8;
          border-radius: 999px;
          padding: 3px 10px;
        }

        .row-actions {
          display: flex;
          gap: 6px;
        }
        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          border: 1px solid var(--hairline);
          background: #fff;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .icon-btn:hover {
          background: var(--navy-bg);
          color: var(--navy);
        }
        .icon-btn--danger:hover {
          background: #f6ece9;
          color: #a6483c;
          border-color: #e3c5bd;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 56px 20px;
          color: var(--ink-soft);
          font-size: 13.5px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin: 8px 0 20px;
        }
        .form-grid__time-pair {
          grid-column: span 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) {
          .form-grid,
          .form-grid__time-pair {
            grid-template-columns: 1fr;
          }
          .form-grid__time-pair {
            grid-column: span 1;
          }
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        :global(.delete-confirm-btn) {
          background: #a6483c !important;
        }
        :global(.delete-confirm-btn:hover) {
          background: #8f3b31 !important;
        }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      {children}
      <style jsx>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-field__label {
          font-size: 12px;
          font-weight: 600;
          color: #48505c;
        }
      `}</style>
    </label>
  );
}