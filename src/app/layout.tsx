import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "案件Parser",
  description: "IT案件情報をAIで統一フォーマットに変換するツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
