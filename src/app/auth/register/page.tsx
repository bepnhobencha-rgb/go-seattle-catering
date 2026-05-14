import { RegisterForm } from "./RegisterForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function RegisterPage() {
  const lang = await getLang();
  return <RegisterForm t={dict[lang]} />;
}
