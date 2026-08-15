import Link from "next/link";
import { einwilligung as copy } from "@/content/copy";

export const dynamic = "force-dynamic";

// Landeseite nach Klick auf Bestätigungs- oder Abmeldelink.

export default async function NewsletterSeite({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const inhalt =
    status === "bestaetigt"
      ? { titel: copy.bestaetigtTitel, text: copy.bestaetigtText, bg: "bg-pop-mint" }
      : status === "abgemeldet"
        ? { titel: copy.abgemeldetTitel, text: copy.abgemeldetText, bg: "bg-pop-yellow" }
        : { titel: copy.ungueltigTitel, text: copy.ungueltigText, bg: "bg-pop-pink" };

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <div className={`rounded-3xl border-[3px] border-ink ${inhalt.bg} px-8 py-10 shadow-pop`}>
        <h1 className="font-heavy mb-3 text-3xl uppercase">{inhalt.titel}</h1>
        <p className="font-medium">{inhalt.text}</p>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-bold hover:underline">
        ← {copy.zurStartseite}
      </Link>
    </main>
  );
}
