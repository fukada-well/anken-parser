import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";

  const projects = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
  });

  const rows = projects.map((p) => {
    let techStack: string[] = [];
    try { techStack = JSON.parse(p.techStack); } catch { techStack = []; }
    return {
      案件名: p.projectName || "",
      業務内容: p.description || "",
      技術スタック: techStack.join(" / "),
      必要経験: p.experience || "",
      単価: p.rate || "",
      期間: p.duration || "",
      勤務地: p.location || "",
      その他: p.notes || "",
      登録日: new Date(p.createdAt).toLocaleDateString("ja-JP"),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "案件一覧");

  if (format === "xlsx") {
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="anken_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  }

  const csv = XLSX.utils.sheet_to_csv(ws);
  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anken_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
