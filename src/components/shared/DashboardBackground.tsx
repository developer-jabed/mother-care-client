"use client";

interface DashboardBackgroundProps {
    variant?: "default" | "subtle" | "vibrant";
    className?: string;
}

const DashboardBackground = ({
    variant = "default",
    className = "",
}: DashboardBackgroundProps) => {
    const patternOpacity =
        variant === "subtle" ? "opacity-[0.07]" : variant === "vibrant" ? "opacity-[0.16]" : "opacity-[0.11]";

    const gridOpacity =
        variant === "subtle" ? "opacity-[0.04]" : variant === "vibrant" ? "opacity-[0.09]" : "opacity-[0.06]";

    const gradientClass =
        variant === "vibrant"
            ? "from-rose-100 via-white to-amber-100/70"
            : variant === "subtle"
                ? "from-rose-50/60 via-white to-amber-50/30"
                : "from-rose-50 via-white to-amber-50/50";

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Base gradient wash */}
            <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass}`} />

            {/* Fine grid layer for depth */}
            <svg className={`absolute inset-0 w-full h-full ${gridOpacity}`} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="dashboard-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M40 0 L0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-rose-900" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
            </svg>

            {/* Large-scale school motif pattern — books, pencil, cap, ruler, apple, star */}
            <svg
                className={`absolute inset-0 w-full h-full ${patternOpacity}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="dashboard-school-pattern"
                        x="0"
                        y="0"
                        width="220"
                        height="220"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Open book */}
                        <g transform="translate(10,20)">
                            <path d="M0 8 Q16 0 32 8 L32 32 Q16 24 0 32 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-700" />
                            <path d="M32 8 Q48 0 64 8 L64 32 Q48 24 32 32 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-700" />
                            <line x1="32" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="1.2" className="text-rose-700" />
                            <line x1="8" y1="14" x2="24" y2="10" stroke="currentColor" strokeWidth="1" className="text-rose-500" />
                            <line x1="8" y1="20" x2="24" y2="16" stroke="currentColor" strokeWidth="1" className="text-rose-500" />
                        </g>

                        {/* Pencil */}
                        <g transform="translate(140,10)">
                            <line x1="0" y1="0" x2="34" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-amber-600" />
                            <path d="M30 30 L40 40 L35 45 L25 35 Z" fill="currentColor" className="text-amber-600" />
                            <path d="M-4 -4 L4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-rose-500" />
                        </g>

                        {/* Graduation cap */}
                        <g transform="translate(20,110)">
                            <path d="M0 10 L35 0 L70 10 L35 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600" />
                            <path d="M0 10 L0 22" stroke="currentColor" strokeWidth="1.5" className="text-rose-600" />
                            <line x1="35" y1="20" x2="35" y2="34" stroke="currentColor" strokeWidth="1.8" className="text-rose-600" />
                            <circle cx="35" cy="36" r="2.5" fill="currentColor" className="text-amber-600" />
                            <path d="M60 12 Q64 22 60 30" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-500" />
                        </g>

                        {/* Ruler / set-square */}
                        <g transform="translate(150,110) rotate(-20)">
                            <rect x="0" y="0" width="55" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-amber-700" />
                            <line x1="10" y1="0" x2="10" y2="8" stroke="currentColor" strokeWidth="1" className="text-amber-700" />
                            <line x1="20" y1="0" x2="20" y2="8" stroke="currentColor" strokeWidth="1" className="text-amber-700" />
                            <line x1="30" y1="0" x2="30" y2="8" stroke="currentColor" strokeWidth="1" className="text-amber-700" />
                            <line x1="40" y1="0" x2="40" y2="8" stroke="currentColor" strokeWidth="1" className="text-amber-700" />
                        </g>

                        {/* Apple (classic school icon) */}
                        <g transform="translate(70,160)">
                            <path
                                d="M12 5 C6 5 2 10 2 16 C2 23 7 30 12 30 C17 30 22 23 22 16 C22 10 18 5 12 5 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="text-rose-600"
                            />
                            <path d="M12 5 Q12 0 16 -2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-700" />
                            <path d="M12 -1 Q17 -3 19 1" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-rose-400" />
                        </g>

                        {/* Star / sparkle accents */}
                        <path
                            d="M190 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z"
                            fill="currentColor"
                            className="text-rose-400"
                        />
                        <path
                            d="M100 190 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 Z"
                            fill="currentColor"
                            className="text-amber-500"
                        />
                        <circle cx="190" cy="150" r="3" fill="currentColor" className="text-rose-300" />
                        <circle cx="10" cy="70" r="2.5" fill="currentColor" className="text-amber-400" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dashboard-school-pattern)" />
            </svg>

            {/* Ambient blurred glow accents — bigger and stronger */}
            <div className="absolute -top-24 -left-20 w-96 h-96 bg-rose-300/25 rounded-full blur-3xl" />
            <div className="absolute top-1/4 -right-28 w-[28rem] h-[28rem] bg-amber-300/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-[26rem] h-72 bg-rose-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
        </div>
    );
};

export default DashboardBackground;