import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "";
  const rateMin = parseInt(searchParams.get("rateMin") || "0", 10);
  const techStack = searchParams.get("techStack") || "";
  const keyword = searchParams.get("keyword") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const where: Record<string, unknown> = { archived: false };
  if (location) where.location = location;
  if (rateMin > 0) where.rateMin = { gte: rateMin };
  if (keyword) {
    where.OR = [
      { projectName: { contains: keyword } },
      { description: { contains: keyword } },
      { techStack: { contains: keyword } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
  });

  const result = projects.map((p) => ({
    ...p,
    techStack: (() => { try { return JSON.parse(p.techStack); } catch { return []; } })(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const filtered = techStack
    ? result.filter((p) =>
        p.techStack.some((t: string) => t.toLowerCase().includes(techStack.toLowerCase()))
      )
    : result;

  const allLocations = await prisma.project.findMany({
    where: { archived: false },
    select: { location: true },
    distinct: ["location"],
  });
  const locations = allLocations.map((l) => l.location).filter((l): l is string => !!l);

  return NextResponse.json({ projects: filtered, locations, total: result.length });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.project.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
