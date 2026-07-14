"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/user.interface";
import { Menu, School, Bell } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardMobileSidebar from "./DashboardMobileSidebar";
import UserDropdown from "./UserDropdown";
import LiveClock from "@/hooks/useClock";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}

const DashboardNavbarContent = ({
  userInfo,
  navItems = [],
  dashboardHome = "/",
}: DashboardNavbarContentProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* LEFT SIDE - Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <Sheet
              open={isMobile && isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-50">
                  <Menu className="h-5 w-5 text-rose-700" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 p-0">
                <DashboardMobileSidebar
                  userInfo={userInfo}
                  navItems={navItems}
                  dashboardHome={dashboardHome}
                />
              </SheetContent>
            </Sheet>

            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center shadow-md shadow-rose-200/60">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-xl md:text-2xl tracking-tight text-gray-900 leading-none">
                    মাদার কেয়ার
                  </div>
                  <p className="text-[10px] font-semibold text-rose-600 tracking-wide -mt-0.5">
                    স্কুল অ্যান্ড কলেজ
                  </p>
                </div>
              </div>

              <div className="hidden md:block pl-6 border-l border-gray-200">
                <p className="text-sm font-semibold text-gray-800">
                  একাডেমিক পোর্টাল
                </p>
                <p className="text-xs text-gray-500">Mother Care School and College</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center bg-rose-50/70 rounded-2xl px-5 py-2 border border-rose-100">
              <LiveClock />
            </div>

            {/* LIVE Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-2xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              সচল
            </div>

            {/* Notification Sheet */}
            <Sheet
              open={isNotificationOpen}
              onOpenChange={setIsNotificationOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl hover:bg-rose-50"
                >
                  <Bell className="h-5 w-5 text-rose-700" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-medium text-white shadow">
                    ২
                  </span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-96 sm:w-[440px]">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>বিজ্ঞপ্তিসমূহ</SheetTitle>
                </SheetHeader>

                <div className="flex-1 py-6 space-y-4 overflow-y-auto">
                  <div className="p-4 bg-white border border-rose-100 rounded-2xl">
                    <p className="font-medium text-gray-900">অ্যাসাইনমেন্টের সময়সীমা</p>
                    <p className="text-sm text-gray-600 mt-1">
                      ওয়েব ডেভেলপমেন্ট অ্যাসাইনমেন্ট আগামীকাল জমা দিতে হবে
                    </p>
                    <p className="text-xs text-gray-500 mt-3">২ ঘণ্টা আগে</p>
                  </div>

                  <div className="p-4 bg-white border border-rose-100 rounded-2xl">
                    <p className="font-medium text-gray-900">ফলাফল প্রকাশিত হয়েছে</p>
                    <p className="text-sm text-gray-600 mt-1">
                      ৩য় সেমিস্টার মিডটার্ম পরীক্ষার ফলাফল এখন পাওয়া যাচ্ছে
                    </p>
                    <p className="text-xs text-gray-500 mt-3">গতকাল</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full border-rose-200 hover:bg-rose-50">
                    সব পঠিত হিসেবে চিহ্নিত করুন
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Dropdown */}
            <UserDropdown userInfo={userInfo} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbarContent;