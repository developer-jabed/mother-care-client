import LoginForm from "@/components/modules/auth/login";
import LoginIllustration from "@/components/modules/auth/LoginIllustration";

export const dynamic = "force-dynamic";

const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) => {
  const params = (await searchParams) || {};

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-8">
      {/* subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(#D6D0C4 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* soft, low-contrast color washes — quiet, not a loud gradient */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-200/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/30 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-rose-100/20 blur-[100px]" />

      {/* faint floating dots for quiet motion, kept subtle */}
      <div className="pointer-events-none absolute top-20 right-24 h-2 w-2 rounded-full bg-violet-300/50 animate-float-dot" />
      <div className="pointer-events-none absolute bottom-28 left-20 h-1.5 w-1.5 rounded-full bg-amber-300/50 animate-float-dot" style={{ animationDelay: "1s" }} />

      {/* ── floating card ──────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-black/[0.06] ring-1 ring-black/[0.03] grid lg:grid-cols-2">
        {/* left: illustration panel */}
        <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-violet-50 via-white to-amber-50/60 p-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-syne font-bold text-sm">
              মা
            </div>
            <span className="font-syne text-sm font-bold tracking-tight text-violet-950">
              মাদার কেয়ার স্কুল অ্যান্ড কলেজ
            </span>
          </div>

          <LoginIllustration />

          <div className="space-y-1.5">
            <h2 className="font-syne text-xl font-extrabold leading-snug text-violet-950">
              প্রতিটি শিক্ষার্থীর অগ্রগতি,
              <br />
              এক জায়গায়।
            </h2>
            <p className="text-sm font-medium text-violet-700/70">
              ভর্তি, ফলাফল ও একাডেমিক সব তথ্য এখন সহজে পরিচালনা করুন।
            </p>
          </div>
        </div>

        {/* right: form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* mobile-only brand mark */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white font-syne font-bold text-sm">
              মা
            </div>
            <span className="font-syne text-sm font-bold tracking-tight text-gray-900">
              মাদার কেয়ার স্কুল অ্যান্ড কলেজ
            </span>
          </div>

          <div className="mb-8 space-y-1.5">
            <h1 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">
              আবার স্বাগতম
            </h1>
            <p className="text-sm font-medium text-gray-500">
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