"use server";

export interface SmsBalance {
    success: boolean;
    balance?: number;
    message?: string;
}

export async function getSmsBalance(): Promise<SmsBalance> {
    try {
        const response = await fetch(
            `http://bulksmsbd.net/api/getBalanceApi?api_key=dVlG7cCiUQ9v0j9VPUbl`,
            {
                method: 'GET',
                cache: 'no-store',
                next: { revalidate: 30 }
            }
        );

        const data = await response.json();

        if (data?.status === 'success' || data?.balance) {
            return {
                success: true,
                balance: parseFloat(data.balance || data.data?.balance || "0"),
            };
        }

        return {
            success: false,
            message: data.message || "Failed to fetch balance",
        };
    } catch (error) {
        console.error("Balance API Error:", error);
        return {
            success: false,
            message: "Could not connect to Bulk SMS BD",
        };
    }
}