import { User } from "lucide-react";
import type { Student } from "@/service/student/student.service";

export default function StudentSummaryCard({ student }: { student: Student }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-rose-500 to-amber-500 relative">
                <div className="absolute -bottom-12 left-8">
                    <div className="h-24 w-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow">
                        {student.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.photo} alt={student.fullName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <User className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 pb-6 px-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{student.fullName}</h1>
                        <p className="text-gray-500 mt-1">ভর্তি নং: {student.admissionNumber}</p>
                    </div>
                    <span
                        className={
                            student.isActive
                                ? "inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                                : "inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
                        }
                    >
                        {student.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-sm">
                    <div>
                        <p className="text-gray-500">জন্ম তারিখ</p>
                        <p className="font-medium">
                            {new Date(student.dateOfBirth).toLocaleDateString("bn-BD")}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">লিঙ্গ</p>
                        <p className="font-medium">
                            {student.gender === "MALE" ? "পুরুষ" : student.gender === "FEMALE" ? "মহিলা" : "অন্যান্য"}
                        </p>
                    </div>
                    {student.user?.email && (
                        <div>
                            <p className="text-gray-500">ইমেইল</p>
                            <p className="font-medium">{student.user.email}</p>
                        </div>
                    )}
                    {student.phone && (
                        <div>
                            <p className="text-gray-500">মোবাইল</p>
                            <p className="font-medium">{student.phone}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}