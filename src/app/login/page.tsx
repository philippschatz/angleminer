import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { angemeldetAls } from "@/lib/session";
import { konto as copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default async function LoginSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  if (await angemeldetAls()) redirect("/konto");
  const { fehler } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <Link href="/" className="mb-10 block text-sm font-bold hover:underline">← Zurück</Link>
      <h1 className="font-heavy mb-3 text-4xl uppercase">{copy.loginTitel}</h1>
      <p className="mb-8 font-medium">{copy.loginText}</p>
      <LoginForm linkUngueltig={fehler === "link"} />
    </main>
  );
}
