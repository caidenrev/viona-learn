"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { BookStackIcon, SparkleIcon } from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk. Cek username dan kata sandi.");
        return;
      }
      router.push(data.user.role === "TEACHER" ? "/admin" : "/workspace");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fcf9f4] stationery-dots flex items-center justify-center p-4 sm:p-8 overflow-x-hidden">
      <div className="w-full max-w-md">
        <WashiCard
          tapeColor="pink"
          className="bg-[#ffffff] p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <StickerImage
                src={STICKERS.mascotHirono}
                alt="Maskot Belajar Yuk"
                className="w-24 h-24 rounded-full border-2 border-[#FFAAA6] bg-[#faf7f2] p-1"
              />
            </div>
            <RibbonTag color="butter" className="mb-2">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>BELAJAR YUK!</span>
            </RibbonTag>
            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold text-[#4a3e3d]">
              Viona Learn Room
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63] mt-1">
              Ruang belajar &amp; planner pribadi kita berdua.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block font-[family-name:var(--font-mali)] text-xs font-bold uppercase tracking-wider text-[#534342] mb-1.5"
              >
                Username atau Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email..."
                className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border-2 border-[#eadfd5] focus:border-[#C8B6FF] focus:outline-none px-4 py-2.5 font-[family-name:var(--font-patrick-hand)] text-lg text-[#4a3e3d]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-[family-name:var(--font-mali)] text-xs font-bold uppercase tracking-wider text-[#534342] mb-1.5"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border-2 border-[#eadfd5] focus:border-[#C8B6FF] focus:outline-none px-4 py-2.5 font-[family-name:var(--font-patrick-hand)] text-lg text-[#4a3e3d]"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-[#ffdad6] text-[#93000a] px-4 py-2.5 font-[family-name:var(--font-mali)] text-xs font-bold"
              >
                {error}
              </div>
            )}

            <SquishyButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              <BookStackIcon className="w-4 h-4" />
              <span>{loading ? "Membuka Ruang Belajar..." : "Masuk ke Ruang Belajar"}</span>
            </SquishyButton>
          </form>

          <div className="mt-6 flex items-center justify-center gap-3 opacity-90">
            <StickerImage
              src={STICKERS.sheet.ribbonSemangat}
              alt="Semangat"
              className="h-9 w-auto"
            />
            <StickerImage
              src={STICKERS.sheet.bubbleBisaKok}
              alt="Bisa Kok"
              className="h-9 w-auto"
            />
          </div>
        </WashiCard>
      </div>
    </main>
  );
}
