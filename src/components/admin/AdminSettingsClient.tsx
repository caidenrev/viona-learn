"use client";

import { useState } from "react";
import { SquishyButton, WashiCard, RibbonTag } from "@/components/ui/PastelPrimitives";

export function AdminSettingsClient({
  initialWhatsapp,
  initialSiteTitle,
  studentUsername,
}: {
  initialWhatsapp: string;
  initialSiteTitle: string;
  studentUsername: string;
}) {
  const [teacherWhatsapp, setTeacherWhatsapp] = useState(initialWhatsapp);
  const [siteTitle, setSiteTitle] = useState(initialSiteTitle);
  const [resetStudentPassword, setResetStudentPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherWhatsapp,
        siteTitle,
        ...(resetStudentPassword.trim().length >= 6
          ? { resetStudentPassword: resetStudentPassword.trim() }
          : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Gagal menyimpan pengaturan.");
      return;
    }
    setResetStudentPassword("");
    setMessage(
      data.passwordReset
        ? "Pengaturan & kata sandi baru siswa tersimpan!"
        : "Pengaturan berhasil disimpan!"
    );
  }

  return (
    <div className="space-y-6">
      <WashiCard
        tapeColor="pink"
        title="Pengaturan Mentor & Tombol Tanya Husband"
        badge={<RibbonTag color="mint">Khusus Teacher</RibbonTag>}
      >
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block font-[family-name:var(--font-mali)] text-xs font-bold uppercase mb-1">
              Nomor WhatsApp Teacher (untuk Tanya Husband)
            </label>
            <input
              type="text"
              value={teacherWhatsapp}
              onChange={(e) => setTeacherWhatsapp(e.target.value)}
              placeholder="6281234567890"
              className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-lg"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-mali)] text-xs font-bold uppercase mb-1">
              Judul Workspace
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-lg"
            />
          </div>

          <div className="pt-3 border-t border-dashed border-[#eadfd5]">
            <label className="block font-[family-name:var(--font-mali)] text-xs font-bold uppercase mb-1">
              Reset Kata Sandi Akun Siswa (@{studentUsername}) - Opsional
            </label>
            <input
              type="password"
              value={resetStudentPassword}
              onChange={(e) => setResetStudentPassword(e.target.value)}
              placeholder="Isi min. 6 karakter kalau siswa lupa password"
              className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SquishyButton type="submit" variant="primary">
              Simpan Pengaturan
            </SquishyButton>
            {message && (
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                {message}
              </span>
            )}
          </div>
        </form>
      </WashiCard>
    </div>
  );
}
