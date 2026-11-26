import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface CachedAppSettings {
  id: string;
  siteTitle: string;
  teacherWhatsapp: string;
}

const fetchAppSettings = unstable_cache(
  async (): Promise<CachedAppSettings> => {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: { id: true, siteTitle: true, teacherWhatsapp: true },
    });
    return (
      settings ?? {
        id: "default",
        siteTitle: "Viona Learn",
        teacherWhatsapp: "6281234567890",
      }
    );
  },
  ["app-settings-default"],
  { revalidate: 120, tags: ["app-settings"] }
);

export async function getCachedAppSettings(): Promise<CachedAppSettings> {
  try {
    return await fetchAppSettings();
  } catch {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: { id: true, siteTitle: true, teacherWhatsapp: true },
    });
    return (
      settings ?? {
        id: "default",
        siteTitle: "Viona Learn",
        teacherWhatsapp: "6281234567890",
      }
    );
  }
}
