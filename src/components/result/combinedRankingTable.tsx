"use client";

import { Trophy } from "lucide-react";

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

import type { CombinedRankingResponse } from "@/service/result/result.service";

interface CombinedRankingTableProps {
    ranking: CombinedRankingResponse | null;
    isLoading?: boolean;
}

export function CombinedRankingTable({ ranking, isLoading }: CombinedRankingTableProps) {
    return (
        <Card className="border-emerald-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    সামগ্রিক ফলাফল ও র‍্যাংকিং (সকল পরীক্ষা)
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                    {isLoading
                        ? "লোড হচ্ছে..."
                        : ranking
                        ? `${ranking.examCount}টি পরীক্ষার ভিত্তিতে · মোট ${ranking.totalStudents} জন শিক্ষার্থী`
                        : "কোনো তথ্য পাওয়া যায়নি"}
                </p>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">র‍্যাংক</TableHead>
                                <TableHead className="w-16">রোল</TableHead>
                                <TableHead>নাম</TableHead>
                                <TableHead>পরীক্ষার সংখ্যা</TableHead>
                                <TableHead>গড় শতকরা</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!ranking || ranking.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        কোনো শিক্ষার্থী পাওয়া যায়নি।
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ranking.data.map((row) => (
                                    <TableRow key={row.studentEnrollmentId}>
                                        <TableCell className="font-semibold">{row.rank ?? "—"}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.rollNumber ?? "—"}</TableCell>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{row.examCount}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {row.averagePercentage !== null ? `${row.averagePercentage.toFixed(2)}%` : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}