"use client";

import { useState } from "react";
import { SquishyButton } from "@/components/ui/PastelPrimitives";

export function LogoutButton({
  label = "Keluar Akun",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SquishyButton
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleLogout}
      className={className}
    >
      <span>{loading ? "Keluar..." : label}</span>
    </SquishyButton>
  );
}
