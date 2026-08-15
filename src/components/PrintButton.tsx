"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      className="pop-press rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm">
      PDF ⬇
    </button>
  );
}
