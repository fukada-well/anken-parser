import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `You are an IT project information extraction AI.
Extract ALL project listings from the given text and return ONLY a valid JSON array.
No markdown, no explanation, just the raw JSON array.
Each object must have these exact keys:
- project_name: string or null
- description: string or null
- tech_stack: array of strings (empty array if none)
- experience: string or null
- rate: string or null (normalize to Japanese format like "60〜70万円/月")
- duration: string or null
- location: string or null
- notes: string or null`;

function extractRateMin(rate: string | null): number | null {
  if (!rate) return null;
  const nums = rate.match(/\d+/g);
  return nums ? parseInt(nums[0], 10) : null;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "テキストが空です" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ error: "AIの応答からJSONを抽出できませんでした" }, { status: 500 });
    }

    const parsed = JSON.parse(match[0]);
    const saved = await Promise.all(
      parsed.map((p: {
        project_name?: string;
        description?: string;
        tech_stack?: string[];
        experience?: string;
        rate?: string;
        duration?: string;
        location?: string;
        notes?: string;
      }) =>
        prisma.project.create({
          data: {
            projectName: p.project_name ?? null,
            description: p.description ?? null,
            techStack: JSON.stringify(p.tech_stack || []),
            experience: p.experience ?? null,
            rate: p.rate ?? null,
            rateMin: extractRateMin(p.rate ?? null),
            duration: p.duration ?? null,
            location: p.location ?? null,
            notes: p.notes ?? null,
            rawText: text,
          },
        })
      )
    );

    return NextResponse.json({ count: saved.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
