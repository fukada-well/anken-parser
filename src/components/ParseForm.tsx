"use client";
import { useState } from "react";

type Props = { onParsed: () => void };

export default function ParseForm({ onParsed }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleParse() {
    if (!text.trim()) { setError("案件情報を入力してください"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析エラー");
      setSuccess(`${data.count}件の案件を解析・保存しました`);
      setText("");
      onParsed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">案件情報を入力</p>
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3 min-h-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"メール文面、サマリシート、ツールからコピーした情報をそのまま貼り付けてください。\n\n複数案件・フォーマット不問です。"}
          className="flex-1 min-h-0 resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 outline-none focus:border-blue-500 focus:bg-white placeholder:text-gray-300"
        />
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        {success && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">✓ {success}</div>}
        <button
          onClick={handleParse}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "解析中..." : "◎ 案件情報を解析する"}
        </button>
      </div>
    </div>
  );
}
