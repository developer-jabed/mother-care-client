export default function LoginIllustration() {
    return (
        <div className="relative flex items-center justify-center py-6">
            {/* dashed orbit ring */}
            <div className="absolute h-52 w-52 rounded-full border-2 border-dashed border-violet-300/60 animate-spin-slow" />

            <svg
                width="220"
                height="220"
                viewBox="0 0 220 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
            >
                {/* soft ground shadow */}
                <ellipse cx="110" cy="190" rx="60" ry="10" fill="#DDD6FE" opacity="0.6" />

                {/* open book */}
                <path d="M60 150 Q110 130 160 150 L160 165 Q110 150 60 165 Z" fill="#F59E0B" />
                <path d="M60 150 Q110 135 110 150 L110 165 Q60 150 60 165 Z" fill="#FBBF24" />
                <path d="M160 150 Q110 135 110 150 L110 165 Q160 150 160 165 Z" fill="#FCD34D" />

                {/* child body */}
                <circle cx="95" cy="95" r="22" fill="#FBCFE8" />
                <path d="M75 95 a20 20 0 0 1 40 0 v8 h-40 z" fill="#C026D3" />
                <rect x="80" y="110" width="30" height="35" rx="10" fill="#A21CAF" />

                {/* graduation cap */}
                <path d="M95 62 L130 75 L95 88 L60 75 Z" fill="#3B0764" />
                <rect x="92" y="88" width="6" height="14" fill="#3B0764" />
                <circle cx="128" cy="80" r="3" fill="#F59E0B" />

                {/* speech bubble with sparkle (learning moment) */}
                <rect x="130" y="45" width="46" height="30" rx="12" fill="#FDE68A" />
                <path d="M140 75 l6 10 l4 -10 z" fill="#FDE68A" />
                <path d="M153 58 l3 6 l6 2 l-6 2 l-3 6 l-3 -6 l-6 -2 l6 -2 z" fill="#D97706" />

                {/* floating small circles for depth */}
                <circle cx="45" cy="60" r="5" fill="#F0ABFC" opacity="0.8" />
                <circle cx="175" cy="130" r="4" fill="#FCD34D" opacity="0.8" />
                <circle cx="35" cy="140" r="3.5" fill="#C4B5FD" opacity="0.8" />
            </svg>
        </div>
    );
}