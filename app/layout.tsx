import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DLP ITニュース・プロンプトメーカー",
  description: "ITニュースRSSをDLP視点のGemini用分析プロンプトに変換するWebアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
