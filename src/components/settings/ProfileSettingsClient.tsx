"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

const AVATAR_CHOICES = [
  STICKERS.mascotHirono,
  STICKERS.welcomeBunny,
  STICKERS.pomodoroCat,
  STICKERS.streakStar,
];

export function ProfileSettingsClient({
  user,
}: {
  user: {
    name: string;
    nickname: string | null;
    dreamTarget: string | null;
    bio: string | null;
    focusWindow: string | null;
    avatarUrl: string | null;
    username: string;
    role: "TEACHER" | "STUDENT";
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [dreamTarget, setDreamTarget] = useState(user.dreamTarget ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [focusWindow, setFocusWindow] = useState(
    user.focusWindow ?? "19:30 - 21:00 WIB"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl ?? STICKERS.mascotHirono
  );
  const [profileMsg, setProfileMsg] = useState("");

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    if (user.role !== "STUDENT") return;
    const res = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nickname,
        dreamTarget,
        bio,
        focusWindow,
        avatarUrl,
      }),
    });
    if (res.ok) {
      setProfileMsg("Profil tersimpan!");
      router.refresh();
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwMsg(data.error ?? "Gagal mengganti kata sandi.");
      return;
    }
    setPwMsg("Kata sandi berhasil diperbarui.");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <WashiCard
        tapeColor="pink"
        title="Pengaturan Profil & Keamanan"
        badge={<RibbonTag color="lilac">Asia/Jakarta (UTC+7)</RibbonTag>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 flex flex-col items-center text-center gap-3 p-4 rounded-3xl bg-[#faf7f2] border border-[#eadfd5]">
            <StickerImage
              src={avatarUrl}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
            <div className="font-[family-name:var(--font-gaegu)] text-2xl font-bold">
              {nickname || name}
            </div>
            <RibbonTag color="butter">@{user.username}</RibbonTag>

            {user.role === "STUDENT" && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {AVATAR_CHOICES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setAvatarUrl(src)}
                    className={`w-12 h-12 rounded-2xl border-2 p-1 bg-white/80 transition-transform hover:scale-105 ${
                      avatarUrl === src ? "border-[#8e4b49]" : "border-[#eadfd5]"
                    }`}
                  >
                    <img src={src} alt="Avatar" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-5">
            {user.role === "STUDENT" && (
              <form onSubmit={saveProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Nama Panggilan"
                    className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                </div>
                <input
                  type="text"
                  value={dreamTarget}
                  onChange={(e) => setDreamTarget(e.target.value)}
                  placeholder="Target Karier Impian"
                  className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <input
                  type="text"
                  value={focusWindow}
                  onChange={(e) => setFocusWindow(e.target.value)}
                  placeholder="Jam Fokus Favorit (mis. 19:30 - 21:00 WIB)"
                  className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Catatan motto belajarmu..."
                  className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <SquishyButton type="submit" variant="primary">
                    Simpan Perubahan
                  </SquishyButton>
                  {profileMsg && (
                    <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                      {profileMsg}
                    </span>
                  )}
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-dashed border-[#eadfd5] flex flex-wrap items-center justify-between gap-3">
              <SquishyButton
                type="button"
                variant="secondary"
                onClick={() => setPwOpen((v) => !v)}
              >
                Ganti Kata Sandi
              </SquishyButton>
              <SquishyButton type="button" variant="outline" onClick={logout}>
                Keluar Akun
              </SquishyButton>
            </div>

            {pwOpen && (
              <form
                onSubmit={changePassword}
                className="rounded-2xl bg-[#f6f3ee] p-4 border border-[#eadfd5] space-y-3"
              >
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Kata sandi saat ini"
                  className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kata sandi baru (min. 6 karakter)"
                  className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <SquishyButton type="submit" variant="mint">
                    Perbarui Kata Sandi
                  </SquishyButton>
                  {pwMsg && (
                    <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d]">
                      {pwMsg}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </WashiCard>
    </div>
  );
}
