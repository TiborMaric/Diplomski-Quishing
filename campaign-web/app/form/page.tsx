import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import { markReachedForm } from "@/lib/telemetry";
import { FormClient } from "./FormClient";

export default async function FormPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("qsh_session")?.value;
  if (sessionToken) {
    await markReachedForm(sessionToken);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("form.title")}</h1>
      <p className="mt-2 text-sm text-zinc-600">{t("form.subtitle")}</p>
      <FormClient />
      <p className="mt-8 text-xs text-zinc-500">{t("form.privacyNote")}</p>
    </main>
  );
}
