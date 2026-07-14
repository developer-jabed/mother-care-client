"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/userInterface";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { School } from "lucide-react";
import DashboardBackground from "@/components/shared/DashboardBackground";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-72 flex-col border-r border-rose-100 shadow-xl relative overflow-hidden">
      <DashboardBackground variant="default" />

      <div className="relative z-10 flex flex-col h-full">
        {/* BRAND HEADER */}
        <div className="flex h-20 items-center px-6 border-b border-rose-100/70 bg-white/60 backdrop-blur-sm">
          <Link href={dashboardHome} className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform group-hover:scale-105">
              <School className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                মাদার কেয়ার
              </span>
              <span className="text-[11px] font-semibold text-rose-600 tracking-wide mt-1">
                স্কুল অ্যান্ড কলেজ
              </span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-8">
            {navItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {section.title && (
                  <h4 className="mb-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-[0.5px]">
                    {section.title}
                  </h4>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = getIconComponent(item.icon);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                          isActive
                            ? "bg-white text-rose-700 shadow-md shadow-rose-200/50"
                            : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-rose-500 to-amber-500 rounded-r-full" />
                        )}

                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-rose-600"
                              : "text-gray-400 group-hover:text-gray-500",
                          )}
                        />

                        <span className="flex-1">{item.title}</span>

                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "ml-auto text-xs font-medium px-2.5 py-0.5",
                              isActive
                                ? "bg-rose-100 text-rose-700"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {sectionIdx < navItems.length - 1 && (
                  <Separator className="my-6 bg-rose-100/60" />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* USER PROFILE FOOTER */}
        <div className="border-t border-rose-100/70 p-5 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-rose-100 shadow-sm">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-semibold text-lg shadow-inner">
              {userInfo.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {userInfo.name}
              </p>
              <p className="text-sm text-gray-500 capitalize">{userInfo.role}</p>
            </div>

            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebarContent;