import { NavSection } from "@/types/dashboard.interface";
import { getDefaultDashboardRoute, UserRole } from "./auth-utils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
    const defaultDashboard = getDefaultDashboardRoute(role);
    return [
        {
            items: [
                { title: "হোম", href: "/", icon: "Home", roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
                { title: "ড্যাশবোর্ড", href: defaultDashboard, icon: "LayoutDashboard", roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
              
            ],
        },
        {
            title: "সেটিংস",
            items: [
                { title: "পাসওয়ার্ড পরিবর্তন", href: "/change-password", icon: "Settings", roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
            ],
        },
    ];
};


export const studentNavItems: NavSection[] = [
    {
        title: "শিক্ষার্থী ব্যবস্থাপনা",
        items: [
            { title: "নোটস", href: "/dashboard/student/notes", icon: "NotebookPen", roles: ["STUDENT", "CR", "TEACHER"] },
        ],
    },

];




// ─────────────────────────────────────────────────────────────────────────────
// Teacher
// ─────────────────────────────────────────────────────────────────────────────
export const teacherNavItems: NavSection[] = [
    {
        title: "ক্লাস ব্যবস্থাপনা",
        items: [
            { title: "প্র্যাকটিক্যাল ও অ্যাসাইনমেন্ট", href: "/teacher/dashboard/assignments", icon: "ClipboardList", roles: ["TEACHER"] },
        ],
    },

];

// ─────────────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────────────
export const adminNavItems: NavSection[] = [
    {
        title: "শিক্ষার্থী ব্যবস্থাপনা",
        items: [

            { title: "শিক্ষার্থীগণ", href: "/admin/dashboard/students", icon: "Users", roles: ["ADMIN"] },
            { title: "শিক্ষার্থী ভর্তি", href: "/admin/dashboard/student-enrollment", icon: "UserPlus", roles: ["ADMIN"] },
        ],
    },
    {
        title: "প্রতিষ্ঠান ব্যবস্থাপনা",
        items: [
            { title: "শিক্ষাবর্ষ, ক্লাস ও শাখা", href: "/admin/dashboard/academic-structure", icon: "School", roles: ["ADMIN"] },
            { title: "বিষয়সমূহ", href: "/admin/dashboard/classes", icon: "School", roles: ["ADMIN"] },
            { title: "পরীক্ষা", href: "/admin/dashboard/exams", icon: "User", roles: ["ADMIN"] },
            { title: "রেজাল্ট", href: "/admin/dashboard/results", icon: "User", roles: ["ADMIN"] },
            { title: "গ্রেডিং স্কেল", href: "/admin/dashboard/grading-scales", icon: "User", roles: ["ADMIN"] },
            { title: "এসএমএস", href: "/admin/dashboard/sms", icon: "User", roles: ["ADMIN"] },
            { title : "শিক্ষার্থী উত্তীর্ণ", href: "/admin/dashboard/student-promote", icon: "User", roles: ["ADMIN"] },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role resolver
// ─────────────────────────────────────────────────────────────────────────────
export const getNavItemsByRole = (role: UserRole): NavSection[] => {
    const common = getCommonNavItems(role);
    switch (role) {
        case "ADMIN": return [...common, ...adminNavItems];
        case "TEACHER": return [...common, ...teacherNavItems];
        case "STUDENT": return [...common, ...studentNavItems];
        default: return common;
    }
};