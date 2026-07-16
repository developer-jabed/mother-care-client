import LoginForm from "@/components/modules/auth/login";
import { GraduationCap, BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) => {
  const params = (await searchParams) || {};

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FFF9F5]">
      {/* ── Left: brand / hero panel ─────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-12 text-white">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-rose-300/20 blur-3xl animate-pulse-slower" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <span className="font-syne text-lg font-bold tracking-tight">
              মাদার কেয়ার স্কুল অ্যান্ড কলেজ
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-syne text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            শিক্ষার্থীদের অগ্রগতি,
            <br />
            এক ড্যাশবোর্ডে।
          </h1>
          <p className="max-w-sm text-rose-50/90 font-medium">
            ভর্তি থেকে ফলাফল — প্রতিষ্ঠানের সম্পূর্ণ একাডেমিক ব্যবস্থাপনা এখন আপনার হাতের মুঠোয়।
          </p>

          {/* signature moment: drifting roll-call card stack */}
          <div className="relative mt-10 h-40 w-full max-w-sm">
            {[
              { label: "রোল ০১ — A+", icon: BookOpen, delay: "0s", y: "translate-y-0" },
              { label: "রোল ০২ — A", icon: Users, delay: "0.4s", y: "translate-y-3" },
              { label: "রোল ০৩ — A+", icon: GraduationCap, delay: "0.8s", y: "translate-y-6" },
            ].map((card, i) => (
              <div
                key={i}
                className="absolute left-0 flex w-64 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md animate-float"
                style={{
                  top: `${i * 34}px`,
                  left: `${i * 22}px`,
                  animationDelay: card.delay,
                }}
              >
                <card.icon className="h-4 w-4 shrink-0 opacity-80" />
                <span className="text-sm font-semibold text-white/95">{card.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-rose-50/60">
          © {new Date().getFullYear()} মাদার কেয়ার স্কুল অ্যান্ড কলেজ। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>

      {/* ── Right: form panel ─────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          {/* mobile-only brand mark */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-syne text-base font-bold tracking-tight text-gray-900">
              মাদার কেয়ার স্কুল অ্যান্ড কলেজ
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-syne text-3xl font-bold tracking-tight text-gray-900">
              আবার স্বাগতম
            </h2>
            <p className="text-gray-500 font-medium">
              চালিয়ে যেতে আপনার তথ্য দিয়ে প্রবেশ করুন
            </p>
          </div>

          <LoginForm redirect={params.redirect} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;