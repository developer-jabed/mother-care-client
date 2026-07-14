"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
    defaultSearch?: string;
    defaultGender?: string;
    defaultIsActive?: string;
    defaultLimit?: number;
}

const ALL = "__all__"; // sentinel — Radix Select can't use "" as an item value

export default function StudentsFilterBar({
    defaultSearch,
    defaultGender,
    defaultIsActive,
    defaultLimit,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(defaultSearch ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === "" || value === ALL) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            params.set("page", "1"); // reset to first page on any filter change
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams]
    );

    // Debounced search — 300ms after typing stops
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (search !== (defaultSearch ?? "")) {
                updateParams({ search: search || undefined });
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const hasActiveFilters = Boolean(defaultSearch || defaultGender || defaultIsActive);

    const clearAll = () => {
        setSearch("");
        router.push(pathname);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="নাম বা ভর্তি নম্বর দিয়ে খুঁজুন..."
                        className="pl-9 h-11 rounded-xl border-gray-200 focus-visible:ring-rose-500"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Gender filter */}
                <Select
                    value={defaultGender || ALL}
                    onValueChange={(v) => updateParams({ gender: v === ALL ? undefined : v })}
                >
                    <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl border-gray-200">
                        <SelectValue placeholder="লিঙ্গ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>সকল লিঙ্গ</SelectItem>
                        <SelectItem value="MALE">পুরুষ</SelectItem>
                        <SelectItem value="FEMALE">মহিলা</SelectItem>
                        <SelectItem value="OTHER">অন্যান্য</SelectItem>
                    </SelectContent>
                </Select>

                {/* Active/Inactive filter */}
                <Select
                    value={defaultIsActive || ALL}
                    onValueChange={(v) => updateParams({ isActive: v === ALL ? undefined : v })}
                >
                    <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl border-gray-200">
                        <SelectValue placeholder="অবস্থা" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>সকল অবস্থা</SelectItem>
                        <SelectItem value="true">সক্রিয়</SelectItem>
                        <SelectItem value="false">নিষ্ক্রিয়</SelectItem>
                    </SelectContent>
                </Select>

                {/* Page size */}
                <Select
                    value={String(defaultLimit ?? 10)}
                    onValueChange={(v) => updateParams({ limit: v })}
                >
                    <SelectTrigger className="w-full sm:w-32 h-11 rounded-xl border-gray-200">
                        <SelectValue placeholder="সারি" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">১০ / পৃষ্ঠা</SelectItem>
                        <SelectItem value="25">২৫ / পৃষ্ঠা</SelectItem>
                        <SelectItem value="50">৫০ / পৃষ্ঠা</SelectItem>
                        <SelectItem value="100">১০০ / পৃষ্ঠা</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <div className="flex items-center gap-2 pt-1">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">ফিল্টার সক্রিয়</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                    >
                        সব মুছুন
                    </Button>
                </div>
            )}
        </div>
    );
}