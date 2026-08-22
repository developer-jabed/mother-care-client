/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface FeeType {
  id: number;
  name: string;
  displayName: string;
  frequency: "MONTHLY" | "YEARLY" | "ONE_TIME" | "PER_EXAM";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: number;
  feeTypeId: number;
  academicYearId: number;
  classId: number;
  amount: number;
  isActive: boolean;
  feeType?: FeeType;
  class?: { id: number; name: string };
  academicYear?: { id: number; title: string };
}

export interface StudentFee {
  id: number;
  studentEnrollmentId: number;
  feeStructureId: number;
  feeTypeId: number;
  amount: number;
  discount: number;
  fine: number;
  payableAmount: number;
  paidAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "WAIVED" | "OVERDUE";
  month: number | null;
  year: number | null;
  dueDate: string | null;
  remarks: string | null;
  createdAt: string;
  feeType?: FeeType;
  enrollment?: {
    id: number;
    rollNumber: number;
    student: {
      id: number;
      fullName: string;
      phone: string | null;
      admissionNumber: string;
    };
    class: { id: number; name: string };
    section: { id: number; name: string };
  };
  payments?: FeePayment[];
}

export interface FeePayment {
  id: number;
  studentFeeId: number;
  amount: number;
  paidAt: string;
  receivedById: number | null;
  remarks: string | null;
}

export interface FeeDashboardSummary {
  totalPayable: number;
  totalCollected: number;
  totalDue: number;
  collectionPercentage: number;
  byStatus: Record<
    string,
    { count: number; payable: number; collected: number }
  >;
  classWise: {
    classId: number;
    className: string;
    count: number;
    payable: number;
    collected: number;
    due: number;
    collectionPercentage: number;
  }[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";

// ────────────────────────────────────────────────
// Fee Type
// ────────────────────────────────────────────────

export async function createFeeType(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const payload = {
      name: (formData.get("name") as string)?.trim().toUpperCase(),
      displayName: (formData.get("displayName") as string)?.trim(),
      frequency: (formData.get("frequency") as string) || "MONTHLY",
    };

    if (!payload.name || !payload.displayName) {
      return {
        success: false,
        message: "Name এবং Display Name আবশ্যক",
      };
    }

    const response = await serverFetch.post("/fees/fee-types", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("fee-types-list", REVALIDATE_MAX);
      return {
        success: true,
        message: "ফি টাইপ সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ফি টাইপ তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create fee type error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function getAllFeeTypes(): Promise<{
  success: boolean;
  message?: string;
  data: FeeType[];
}> {
  try {
    const response = await serverFetch.get("/fees/fee-types", {
      next: { tags: ["fee-types-list"] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ফি টাইপ লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get fee types error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: [],
    };
  }
}

// ────────────────────────────────────────────────
// Fee Structure
// ────────────────────────────────────────────────

export async function createFeeStructure(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const payload = {
      feeTypeId: Number(formData.get("feeTypeId")),
      academicYearId: Number(formData.get("academicYearId")),
      classId: Number(formData.get("classId")),
      amount: Number(formData.get("amount")),
    };

    if (
      !payload.feeTypeId ||
      !payload.academicYearId ||
      !payload.classId ||
      !payload.amount
    ) {
      return {
        success: false,
        message: "সব ফিল্ড পূরণ করুন",
      };
    }

    const response = await serverFetch.post("/fees/fee-structures", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("fee-structures-list", REVALIDATE_MAX);
      revalidateTag(
        `fee-structure-class-${payload.classId}`,
        REVALIDATE_MAX
      );
      return {
        success: true,
        message: "ফি স্ট্রাকচার সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ফি স্ট্রাকচার তৈরি করতে ব্যর্থ",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create fee structure error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}


export async function generateMonthlyFees(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const payload = {
      academicYearId: Number(formData.get("academicYearId")),
      classId: Number(formData.get("classId")),
      month: Number(formData.get("month")),
      year: Number(formData.get("year")),
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    if (
      !payload.academicYearId ||
      !payload.classId ||
      !payload.month ||
      !payload.year
    ) {
      return {
        success: false,
        message: "Academic Year, Class, Month এবং Year আবশ্যক",
      };
    }

    const response = await serverFetch.post("/fees/fees/generate-monthly", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("student-fees-list", REVALIDATE_MAX);
      revalidateTag("fee-dashboard", REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "মাসিক ফি সফলভাবে জেনারেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "মাসিক ফি জেনারেট করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("Generate monthly fees error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}


export async function recordFeePayment(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const payload = {
      studentFeeId: Number(formData.get("studentFeeId")),
      amount: Number(formData.get("amount")),
      receivedById: formData.get("receivedById")
        ? Number(formData.get("receivedById"))
        : undefined,
      remarks: (formData.get("remarks") as string) || undefined,
    };

    if (!payload.studentFeeId || !payload.amount || payload.amount <= 0) {
      return {
        success: false,
        message: "সঠিক Student Fee এবং Amount দিন",
      };
    }

    const response = await serverFetch.post("/fees/fees/payment", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("student-fees-list", REVALIDATE_MAX);
      revalidateTag("fee-dashboard", REVALIDATE_MAX);
      revalidateTag(`student-fee-${payload.studentFeeId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "পেমেন্ট সফল! SMS পাঠানো হয়েছে।",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "পেমেন্ট রেকর্ড করতে ব্যর্থ",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Record payment error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ────────────────────────────────────────────────
// Get Student Fees (List)
// ────────────────────────────────────────────────

interface GetStudentFeesParams {
  searchTerm?: string;
  studentEnrollmentId?: number;
  feeTypeId?: number;
  status?: string;
  month?: number;
  year?: number;
  classId?: number;
  sectionId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getStudentFees(params?: GetStudentFeesParams): Promise<{
  success: boolean;
  message?: string;
  data: StudentFee[];
  meta: PaginationMeta | null;
}> {
  try {
    const query = new URLSearchParams();

    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.studentEnrollmentId)
      query.set("studentEnrollmentId", String(params.studentEnrollmentId));
    if (params?.feeTypeId) query.set("feeTypeId", String(params.feeTypeId));
    if (params?.status) query.set("status", params.status);
    if (params?.month) query.set("month", String(params.month));
    if (params?.year) query.set("year", String(params.year));
    if (params?.classId) query.set("classId", String(params.classId));
    if (params?.sectionId) query.set("sectionId", String(params.sectionId));
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const response = await serverFetch.get(`/fees/fees?${query.toString()}`, {
      next: { tags: ["student-fees-list"] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ফি তালিকা লোড করতে ব্যর্থ",
        data: [],
        meta: null,
      };
    }

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Get student fees error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: [],
      meta: null,
    };
  }
}

// ────────────────────────────────────────────────
// Dashboard Summary
// ────────────────────────────────────────────────
// ────────────────────────────────────────────────
// Types — matches new backend getDashboardSummary shape
// ────────────────────────────────────────────────

export interface FeeTypeBreakdown {
  feeTypeId: number;
  feeTypeName: string;
  paidCount: number;
  unpaidCount: number;
  payable: number;
  collected: number;
}

export interface MonthlySnapshot {
  month: number;
  year: number;
  totalStudents: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  totalPayable: number;
  totalCollected: number;
  totalDue: number;
  collectionPercentage: number;
  byFeeType: FeeTypeBreakdown[];
}

export interface TopDefaulter {
  studentFeeId: number;
  studentName: string;
  phone: string | null;
  className: string;
  sectionName: string;
  rollNumber: number;
  feeTypeName: string;
  month: number | null;
  year: number | null;
  due: number;
  dueDate: string | null;
  status: string;
}

export interface FeeSmsHealth {
  FEE_DUE: { PENDING: number; SENT: number; FAILED: number; DELIVERED: number };
  FEE_PAYMENT: { PENDING: number; SENT: number; FAILED: number; DELIVERED: number };
}

export interface FeeDashboardSummary {
  current: MonthlySnapshot;
  previous: MonthlySnapshot;
  comparison: {
    collectedChange: number;
    collectedChangePercentage: number | null;
    paidCountChange: number;
  };
  topDefaulters: TopDefaulter[];
  smsHealth: FeeSmsHealth;
}

// ────────────────────────────────────────────────
// Dashboard Summary
// ────────────────────────────────────────────────

interface DashboardParams {
  classId?: number;
}

export async function getFeeDashboard(
  params?: DashboardParams
): Promise<{
  success: boolean;
  message?: string;
  data: FeeDashboardSummary | null;
}> {
  try {
    const query = new URLSearchParams();

    if (params?.classId) query.set("classId", String(params.classId));

    const response = await serverFetch.get(
      `/fees/dashboard?${query.toString()}`,
      {
        next: { tags: ["fee-dashboard"] },
      }
    );

    const result = await response.json();

    

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ড্যাশবোর্ড লোড করতে ব্যর্থ",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get fee dashboard error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: null,
    };
  }
}

// ────────────────────────────────────────────────
// Send Due Alerts (Manual Trigger)
// ────────────────────────────────────────────────

export async function sendFeeDueAlerts(): Promise<ActionResult> {
  try {
    const response = await serverFetch.post("/fees/send-due-alerts", {
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("student-fees-list", REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "Due alert SMS পাঠানো হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Due alert পাঠাতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("Send due alerts error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ────────────────────────────────────────────────
// Download Receipt URL (client side download)
// ────────────────────────────────────────────────

export async function getFeeReceiptUrl(
  paymentId: number
): Promise<{ success: boolean; message?: string; url?: string }> {
  try {
    // Backend endpoint: GET /fees/payment/:paymentId/receipt
    // Frontend এ সরাসরি এই URL দিয়ে download করবে
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return {
      success: true,
      url: `${baseUrl}/fees/payment/${paymentId}/receipt`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Receipt URL তৈরি করতে ব্যর্থ",
    };
  }
}