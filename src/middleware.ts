import { NextRequest, NextResponse } from "next/server";

// ============================================================
// セキュリティ設定 - Vercelの環境変数で ON/OFF を切り替え
//
// IP制限を有効にする場合:
//   SECURITY_IP_RESTRICTION = true
//   ALLOWED_IPS = 123.456.789.0,111.222.333.4
//
// Basic認証を有効にする場合:
//   SECURITY_BASIC_AUTH = true
//   BASIC_AUTH_USER = admin
//   BASIC_AUTH_PASSWORD = password123
// ============================================================

const IP_RESTRICTION = process.env.SECURITY_IP_RESTRICTION === "true";
const BASIC_AUTH = process.env.SECURITY_BASIC_AUTH === "true";

const ALLOWED_IPS = (process.env.ALLOWED_IPS || "")
  .split(",").map((ip) => ip.trim()).filter(Boolean);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

function checkBasicAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");
  return user === process.env.BASIC_AUTH_USER && pass === process.env.BASIC_AUTH_PASSWORD;
}

export function middleware(req: NextRequest) {
  if (IP_RESTRICTION && ALLOWED_IPS.length > 0) {
    const ip = getClientIp(req);
    if (!ALLOWED_IPS.includes(ip)) {
      return new NextResponse(
        `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>アクセス拒否</title>
        <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f4f0;}
        .box{text-align:center;padding:40px;background:#fff;border-radius:12px;border:1px solid #e2e0d8;}
        h1{font-size:18px;color:#1a1917;}p{color:#6b6a65;font-size:13px;}</style>
        </head><body><div class="box"><h1>🚫 アクセス権限がありません</h1>
        <p>このIPアドレスからのアクセスは許可されていません。<br>管理者にお問い合わせください。</p>
        <p style="margin-top:16px;font-size:11px;color:#a8a7a2;">IP: ${ip}</p>
        </div></body></html>`,
        { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
  }

  if (BASIC_AUTH && !checkBasicAuth(req)) {
    return new NextResponse("認証が必要です", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="案件Parser"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
