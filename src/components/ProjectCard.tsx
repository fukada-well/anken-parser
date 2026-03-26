"use client";
import { Project } from "@/types";

type Props = { project: Project; index: number; onDelete: (id: number) => void };

export default function ProjectCard({ project: p, index, onDelete }: Props) {
  async function handleDelete() {
    if (!confirm(`「${p.projectName || "この案件"}」を削除しますか？`)) return;
    await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    onDelete(p.id);
  }

  const date = new Date(p.createdAt).toLocaleDateString("ja-JP");

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="rounded bg-blue-600 px-2 py-0.5 text-[11px] font-mono text-white">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-800">{p.projectName || "案件名不明"}</span>
        <span className="text-[11px] text-gray-400">{date}</span>
        <button onClick={handleDelete} className="ml-1 rounded px-2 py-0.5 text-[11px] text-gray-400 hover:bg-red-50 hover:text-red-500 transition">削除</button>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <FieldFull label="業務内容" value={p.description} />
        <div className="col-span-2">
          <Label>技術スタック</Label>
          {p.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {p.techStack.map((s, i) => (
                <span key={i} className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[11px] text-blue-700">{s}</span>
              ))}
            </div>
          ) : <span className="text-[13px] italic text-gray-300">—</span>}
        </div>
        <Field label="必要経験" value={p.experience} />
        <div>
          <Label>単価</Label>
          {p.rate
            ? <span className="text-base font-bold text-amber-600">{p.rate}</span>
            : <span className="text-[13px] italic text-gray-300">情報なし</span>}
        </div>
        <Field label="期間" value={p.duration} />
        <Field label="勤務地" value={p.location} />
        {p.notes && <FieldFull label="その他" value={p.notes} />}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{children}</p>;
}
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <Label>{label}</Label>
      {value ? <p className="text-[13px] leading-relaxed text-gray-800">{value}</p>
             : <p className="text-[13px] italic text-gray-300">情報なし</p>}
    </div>
  );
}
function FieldFull({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="col-span-2">
      <Label>{label}</Label>
      {value ? <p className="text-[13px] leading-relaxed text-gray-800">{value}</p>
             : <p className="text-[13px] italic text-gray-300">情報なし</p>}
    </div>
  );
}
