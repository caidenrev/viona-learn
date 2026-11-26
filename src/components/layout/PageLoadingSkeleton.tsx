import { VionaLogo } from "@/components/icons/VionaLogo";

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f4] text-[#4a3e3d] overflow-x-hidden">
      <header className="sticky top-0 z-40 w-full bg-[#fcf9f4]/90 backdrop-blur-xl border-b border-[#eadfd5]">
        <div className="h-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <VionaLogo className="w-7 h-7 shrink-0" />
            <span className="font-[family-name:var(--font-gaegu)] text-xl sm:text-2xl font-bold text-[#8e4b49] tracking-tight">
              Viona Learn
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-9 w-28 rounded-full bg-[#f6f3ee] animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-[#f6f3ee] animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-[#f6f3ee] animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-full bg-[#FFF3B0] animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-[#f6f3ee] animate-pulse" />
          </div>
        </div>
        <div className="h-1 w-full bg-[#f6f3ee] overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-[#FFAAA6] animate-pulse" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-6 space-y-6">
        <div className="rounded-3xl bg-white border-2 border-dashed border-[#eadfd5] p-6 sm:p-8 space-y-4">
          <div className="h-6 w-36 rounded-full bg-[#ffdad8] animate-pulse" />
          <div className="h-9 w-2/3 max-w-md rounded-2xl bg-[#f6f3ee] animate-pulse" />
          <div className="h-5 w-1/2 max-w-sm rounded-xl bg-[#f6f3ee] animate-pulse" />
          <div className="h-14 w-full max-w-xl rounded-2xl bg-[#faf7f2] animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 rounded-3xl bg-white border-2 border-dashed border-[#eadfd5] p-6 space-y-3">
            <div className="h-5 w-24 rounded-full bg-[#C8B6FF]/40 animate-pulse" />
            <div className="h-7 w-3/4 rounded-xl bg-[#f6f3ee] animate-pulse" />
            <div className="h-4 w-full rounded-xl bg-[#f6f3ee] animate-pulse" />
          </div>
          <div className="h-44 rounded-3xl bg-white border-2 border-dashed border-[#eadfd5] p-6 space-y-3">
            <div className="h-5 w-24 rounded-full bg-[#FFF3B0] animate-pulse" />
            <div className="h-7 w-2/3 rounded-xl bg-[#f6f3ee] animate-pulse" />
            <div className="h-4 w-5/6 rounded-xl bg-[#f6f3ee] animate-pulse" />
          </div>
        </div>
      </main>

      <div className="md:hidden fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-3 flex justify-center pointer-events-none">
        <div className="w-full max-w-md h-14 rounded-full bg-white/95 border-2 border-dashed border-[#eadfd5] animate-pulse" />
      </div>
    </div>
  );
}
