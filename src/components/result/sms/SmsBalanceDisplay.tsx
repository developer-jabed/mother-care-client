"use client";


import { useEffect, useState } from "react";
import { Wallet, RefreshCw } from "lucide-react";
import { getSmsBalance } from "@/service/smsLog/balance.service";

export default function SmsBalanceDisplay() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBalance = async () => {
        setLoading(true);
        setError("");

        try {
            const result = await getSmsBalance();

            if (result.success) {
                setBalance(result.balance || 0);
            } else {
                setError(result.message || "Failed to load balance");
            }
        } catch (err) {
            setError("Failed to connect to SMS service");
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                    <h3 className="font-semibold text-lg">SMS Balance</h3>
                </div>

                <button
                    onClick={fetchBalance}
                    disabled={loading}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="text-3xl font-bold text-gray-300">Loading...</div>
            ) : error ? (
                <p className="text-red-600 text-sm">{error}</p>
            ) : (
                <div>
                    <p className="text-4xl font-bold text-emerald-600">
                        ৳ {balance?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Available Balance</p>

                    {balance && balance > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                            ≈ {Math.floor(balance / 0.3)} SMS (at ৳0.30 rate)
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}