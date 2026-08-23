/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import gsap from "gsap";

import LogoutButton from "./LogoutButton";

import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";
import { getUserInfo } from "@/service/auth/getUserInfo";

import { UserInfo } from "@/types/user.interface";

const NAV_LINKS = [
  { href: "/result", label: "ফলাফল" },
  { href: "/events", label: "ইভেন্ট" },
  // চাইলে আরও লিঙ্ক যোগ করতে পারেন
  // { href: "/about", label: "আমাদের সম্পর্কে" },
  // { href: "/admission", label: "ভর্তি" },
];

export default function PublicNavbar() {
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const initials = useMemo(() => {
    if (!userInfo?.name) return "ব";
    return userInfo.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [userInfo]);

  const dashboardHref = useMemo(() => {
    if (!userInfo?.role) return "/dashboard";
    return getUserDashboardRoute(userInfo.role);
  }, [userInfo]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // User data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await getCookie("accessToken");
        if (!token) {
          setLoggedIn(false);
          setUserInfo(null);
          return;
        }

        const result = await getUserInfo();
        let userData: UserInfo | null = null;

        if (result && typeof result === "object") {
          if ("success" in result && result.success) {
            userData = (result as any).data || null;
          } else if ("id" in result) {
            userData = result as UserInfo;
          }
        }

        if (userData?.id) {
          setLoggedIn(true);
          setUserInfo(userData);
        } else {
          setLoggedIn(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setLoggedIn(false);
        setUserInfo(null);
      }
    };

    initializeUser();
  }, []);

  // Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(logoRef.current, {
        opacity: 1,
        scale: 0.5,
        duration: 0.7,
      })
        .from(
          linksRef.current ? Array.from(linksRef.current.children) : [],
          {
            opacity: 1,
            y: -16,
            stagger: 0.1,
            duration: 0.5,
          },
          "-=0.4"
        )
        .from(
          rightRef.current,
          {
            opacity: 1,
            x: 24,
            duration: 0.55,
          },
          "-=0.4"
        );
    }, navRef);

    return () => ctx.revert();
  }, [mounted]);

  // Mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current || !mobileOverlayRef.current) return;

    if (mobileOpen) {
      gsap.set(mobileMenuRef.current, { x: "100%" });
      gsap.set(mobileOverlayRef.current, { opacity: 0 });

      gsap.to(mobileOverlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(mobileMenuRef.current, {
        x: "0%",
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      gsap.to(mobileMenuRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      });
      gsap.to(mobileOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
      });
    }
  }, [mobileOpen]);

  // Dropdown animation
  useEffect(() => {
    const dropdown = document.getElementById("user-dropdown");
    if (!dropdown || !dropdownOpen) return;

    gsap.fromTo(
      dropdown,
      { opacity: 1, y: -10, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      }
    );
  }, [dropdownOpen]);

  // Skeleton
  if (!mounted) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 h-20 border-b border-transparent bg-[oklch(0.945_0.008_60)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-black/5" />
            <div className="hidden h-5 w-52 animate-pulse rounded bg-black/5 sm:block" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-black/8 bg-[oklch(0.945_0.008_60)]/95 shadow-[0_4px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl"
            : "border-b border-transparent bg-[oklch(0.945_0.008_60)]/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-5 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              ref={logoRef}
              className="relative h-11 w-11 overflow-hidden rounded-full shadow-md ring-2 ring-emerald-500/20 transition-all duration-300 group-hover:ring-emerald-500/40 group-hover:scale-105"
            >
              <Image
                src="/asset/mothercare.png"
                alt="মাদার কেয়ার স্কুল অ্যান্ড কলেজ"
                fill
                className="object-cover"
                sizes="44px"
                priority
              />
            </div>

            <div className="hidden leading-tight sm:block">
              <h1 className="text-[17px] font-bold tracking-tight text-gray-900 transition-colors group-hover:text-emerald-700 lg:text-lg">
                মাদার কেয়ার স্কুল অ্যান্ড কলেজ
              </h1>
            </div>
          </Link>

          {/* Desktop Links - More Animated */}
          <div ref={linksRef} className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70"
                }`}
              >
                {link.label}

                {/* Animated underline */}
                <span
                  className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-emerald-600 transition-all duration-300 ${
                    isActive(link.href) ? "w-5 opacity-100" : "w-0 opacity-0 group-hover:w-5"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div ref={rightRef} className="flex items-center gap-2.5">
            {loggedIn && userInfo ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:bg-black/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-md shadow-emerald-600/20">
                    {initials}
                  </div>

                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-semibold leading-none text-gray-900">
                      {userInfo.name}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-gray-500">
                      {userInfo.role}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    id="user-dropdown"
                    className="absolute right-0 top-[115%] z-50 w-72 overflow-hidden rounded-2xl border border-black/5 bg-[oklch(0.97_0.005_60)] shadow-xl shadow-black/5"
                  >
                    <div className="border-b border-black/5 px-4 py-4">
                      <p className="font-semibold text-gray-900">{userInfo.name}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{userInfo.email}</p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <LayoutDashboard size={17} />
                        ড্যাশবোর্ড
                      </Link>
                    </div>

                    <div className="border-t border-black/5 p-1.5">
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/50 px-5 py-2 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm md:inline-flex"
              >
                লগইন
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition-all duration-300 hover:bg-black/5 md:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            ref={mobileOverlayRef}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-[oklch(0.955_0.006_60)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-500/20">
                  <Image
                    src="/asset/mothercare.png"
                    alt="মাদার কেয়ার স্কুল অ্যান্ড কলেজ"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <h2 className="text-sm font-bold leading-tight text-gray-900">
                  মাদার কেয়ার স্কুল
                  <br />
                  অ্যান্ড কলেজ
                </h2>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            {loggedIn && userInfo && (
              <div className="border-b border-black/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {userInfo.name}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {loggedIn && userInfo && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-gray-700 transition-all duration-300 hover:bg-black/5"
                  >
                    <LayoutDashboard size={18} />
                    ড্যাশবোর্ড
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-black/5 p-4">
              {loggedIn ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:bg-emerald-700"
                >
                  লগইন
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}