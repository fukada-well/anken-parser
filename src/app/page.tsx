"use client";
import { useCallback, useEffect, useState } from "react";
import ParseForm from "@/components/ParseForm";
import FilterBar from "@/components/FilterBar";
import ProjectCard from "@/components/ProjectCard";
import { FilterState, Project } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  location: "", rateMin: 0, techStack: "", keyword: "",
  sortBy: "createdAt", sortOrder: "desc",
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [total, setTotal] = useState(0);

  const fetchProjects = useCallback(async (f: FilterState) => {
    const params = new URLSearchParams({
      location: f.location, rateMin: String(f.rateMin),
      techStack: f.techStack, keyword: f.keyword,
      sortBy: f.sortBy, sortOrder: f.sortOrder,
    });
    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    setProjects(data.projects || []);
    setLocations(data.locations || []);
    setTotal(data.total || 0);
  }, []);

  useEffect(() => { fetchProjects(filters); }, [filters, fetchProjects]);

  function handleDelete(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f4f0]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-6">
        <span className="text-base font-bold text-blue-600 tracking-tight">
          案件<span className="font-normal text-gray-400">Parser</span>
        </span>
        <span className="text-sm text-gray-400">AI 案件情報 統一フォーマット変換ツール</span>
        <span className="ml-auto rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-mono text-[11px] text-blue-600">
          Powered by Claude AI
        </span>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <ParseForm onParsed={() => fetchProjects(filters)} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <FilterBar
            filters={filters} locations={locations}
            onChange={setFilters} total={total} shown={projects.length}
          />
          <div className="flex-1 overflow-y-auto p-5">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-gray-300">
                <span className="text-5xl">📋</span>
                <p className="text-sm leading-relaxed">左パネルに案件情報を貼り付けて<br/>「解析する」を押してください</p>
                <p className="text-xs text-gray-200">フォーマット不問 · 複数案件対応 · 自動保存</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
