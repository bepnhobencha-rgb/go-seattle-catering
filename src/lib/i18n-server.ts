import { cookies, headers } from "next/headers";
import type { Lang } from "./i18n";

const LANG_COOKIE = "gs-lang";

/** Server-side only: read user's language preference from cookie, fall back to Accept-Language. */
export async function getLang(): Promise<Lang> {
  const cookieStore = cookies();
  const fromCookie = cookieStore.get(LANG_COOKIE)?.value;
  if (fromCookie === "vn" || fromCookie === "en") return fromCookie;

  const acceptLang = headers().get("accept-language") ?? "";
  const lower = acceptLang.toLowerCase();
  if (lower.includes("vi") || lower.includes("vn")) return "vn";
  return "en";
}
