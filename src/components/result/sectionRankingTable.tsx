"use client";

import { BarChart3, Loader2, MoreHorizontal, Pencil, Trash2, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Result, SectionResultResponse, CombinedRankingResponse } from "@/service/result/result.service";

interface SectionRankingTableProps {
    sectionResults: SectionResultResponse | null;
    combinedRanking: CombinedRankingResponse | null;
    results: Result[]; // used to look up the full Result (with details) for edit/delete
    isCalculating: boolean;
    isPublishing: boolean;
    publishingId: number | null;
    onCalculatePositions: () => void;
    onEdit: (result: Result) => void;
    onTogglePublish: (resultId: number, isPublished: boolean) => void;
    onDelete: (result: Result) => void;
}

export function SectionRankingTable({
    sectionResults,
    combinedRanking,
    results,
    isCalculating,
    isPublishing,
    publishingId,
    onCalculatePositions,
    onEdit,
    onTogglePublish,
    onDelete,
}: SectionRankingTableProps) {
    // Lookup: studentEnrollmentId -> combined (all-exam) rank + avg percentage
    const combinedMap = new Map<number, { rank: number | null; averagePercentage: number | null }>(
        (combinedRanking?.data ?? []).map((row) => [
            row.studentEnrollmentId,
            { rank: row.rank, averagePercentage: row.averagePercentage },
        ])
    );

    return (
        <Card className="border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        শাখার ফলাফল ও র‍্যাংকিং
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {sectionResults
                            ? `${sectionResults.examName} · মোট ${sectionResults.totalStudents} জন শিক্ষার্থী`
                            : "লোড হচ্ছে..."}
                        {combinedRanking ? ` · সামগ্রিক: ${combinedRanking.examCount}টি পরীক্ষার ভিত্তিতে` : ""}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCalculatePositions}
                    disabled={isCalculating || !sectionResults || sectionResults.totalStudents === 0}
                >
                    {isCalculating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <BarChart3 className="mr-2 h-4 w-4" />
                    )}
                    অবস্থান নির্ধারণ করুন
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">র‍্যাংক</TableHead>
                                <TableHead className="w-20">সামগ্রিক র‍্যাংক</TableHead>
                                <TableHead className="w-16">রোল</TableHead>
                                <TableHead>নাম</TableHead>
                                <TableHead>মোট নম্বর</TableHead>
                                <TableHead>শতকরা</TableHead>
                                <TableHead>গড় শতকরা (সামগ্রিক)</TableHead>
                                <TableHead>গ্রেড</TableHead>
                                <TableHead>অবস্থা</TableHead>
                                <TableHead className="w-[60px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!sectionResults || sectionResults.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                        কোনো শিক্ষার্থী পাওয়া যায়নি।
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sectionResults.data.map((row) => {
                                    const combined = combinedMap.get(row.studentEnrollmentId);

                                    return (
                                        <TableRow key={row.studentEnrollmentId}>
                                            <TableCell className="font-semibold">{row.rank ?? "—"}</TableCell>
                                            <TableCell className="font-semibold text-emerald-600">
                                                {combined?.rank ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{row.rollNumber}</TableCell>
                                            <TableCell className="font-medium">{row.name}</TableCell>
                                            <TableCell>{row.totalMarks ?? "—"}</TableCell>
                                            <TableCell>
                                                {row.percentage !== null ? `${row.percentage.toFixed(2)}%` : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {combined?.averagePercentage !== null && combined?.averagePercentage !== undefined
                                                    ? `${combined.averagePercentage.toFixed(2)}%`
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>{row.grade ?? "—"}</TableCell>
                                            <TableCell>
                                                {row.hasResult ? (
                                                    <Badge variant={row.isPublished ? "default" : "secondary"}>
                                                        {row.isPublished ? "প্রকাশিত" : "অপ্রকাশিত"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">নম্বর দেওয়া হয়নি</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {row.hasResult && row.resultId && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                {isPublishing && publishingId === row.resultId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                disabled={row.isPublished}
                                                                onClick={() => {
                                                                    const fullResult = results.find((r) => r.id === row.resultId);
                                                                    if (fullResult) onEdit(fullResult);
                                                                }}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                বিস্তারিত সম্পাদনা
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onTogglePublish(row.resultId!, row.isPublished)}
                                                            >
                                                                {row.isPublished ? "অপ্রকাশিত করুন" : "প্রকাশ করুন"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                disabled={row.isPublished}
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    const fullResult = results.find((r) => r.id === row.resultId);
                                                                    if (fullResult) onDelete(fullResult);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                মুছে ফেলুন
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}