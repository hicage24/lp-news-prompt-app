"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDlpPrompt, type NewsItem } from "@/lib/prompt";
import { Copy, ExternalLink, RefreshCw, Search, Sparkles } from "lucide-react";

type CategoryKey = "all" | "security" | "pc" | "smartphone" | "network" | "ai";

const categories: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "security", label: "詐欺・セキュリティ" },
  { key: "pc", label: "Windows/PC" },
  { key: "smartphone", label: "スマホ" },
  { key: "network", label: "Wi-Fi/通信" },
  { key: "ai", label: "AI/サービス" },
];

function estimateCategory(item: NewsItem): CategoryKey {
  const text = `${item.title} ${item.source} ${item.contentSnippet ?? ""}`.toLowerCase();

  if (/(詐欺|フィッシング|不正|脆弱性|マルウェア|ランサム|jpcert|ipa|security|password|パスワード|認証|情報漏えい|攻撃)/i.test(text)) {
    return "security";
  }

  if (/(windows|microsoft|surface|pc|パソコン|プリンタ|bluetooth|ドライバ|update|アップデート|office)/i.test(text)) {
    return "pc";
  }

  if (/(iphone|ios|ipad|apple|icloud|android|スマホ|スマートフォン|google|line|アプリ)/i.test(text)) {
    return "smartphone";
  }

  if (/(wi-fi|wifi|ルーター|ネットワーク|通信|回線|vpn|dns|インターネット|メール)/i.test(text)) {
    return "network";
  }

  if (/(ai|生成ai|gemini|chatgpt|copilot|人工知能|llm)/i.test(text)) {
    return "ai";
  }

  return "all";
}

function scoreConsultationRisk(item: NewsItem): number {
  const text = `${item.title} ${item.source} ${item.contentSnippet ?? ""}`.toLowerCase();
  let score = 1;

  if (/(詐欺|フィッシング|不正|マルウェア|ランサム|脆弱性|情報漏えい|乗っ取り|偽|攻撃)/i.test(text)) score += 2;
  if (/(windows|iphone|ios|android|apple|microsoft|google|line|wi-fi|wifi|ルーター|メール|アプリ)/i.test(text)) score += 1;
  if (/(アップデート|更新|終了|障害|停止|変更|つながらない|使えない|削除|警告|注意喚起)/i.test(text)) score += 1;
  if (/(ipa|jpcert|重要|緊急|注意)/i.test(text)) score += 1;

  return Math.min(score, 5);
}

function scoreTone(score: number): string {
  if (score >= 5) return "bg-rose-100 text-rose-700 ring-rose-200";
  if (score >= 4) return "bg-amber-100 text-amber-800 ring-amber-200";
  if (score >= 3) return "bg-cyan-100 text-cyan-800 ring-cyan-200";
  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function formatDate(value?: string): string {
  if (!value) return "公開日不明";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "公開日不明";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function Home() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");

  async function loadNews() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (!res.ok) throw new Error("ニュースを取得できませんでした。");

      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ニュースを取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.title} ${item.source} ${item.contentSnippet ?? ""}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const itemCategory = estimateCategory(item);
      const matchesCategory = category === "all" || itemCategory === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  const averageScore = useMemo(() => {
    if (filteredItems.length === 0) return 0;
    const total = filteredItems.reduce((sum, item) => sum + scoreConsultationRisk(item), 0);
    return Math.round((total / filteredItems.length) * 10) / 10;
  }, [filteredItems]);

  async function copyPrompt(item: NewsItem) {
    const prompt = buildDlpPrompt(item);
    await navigator.clipboard.writeText(prompt);
    setCopiedLink(item.link);
    window.setTimeout(() => setCopiedLink(null), 1800);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-6 text-stone-950 md:px-8">
      <section className="mx-auto grid max-w-7xl gap-5">
        <div className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-teal-700">PCDEPOT / Digital Life Planner</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">DLP ITニュース・プロンプトメーカー</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 md:text-base">
              公開ITニュースRSSを一覧表示し、DLP視点で相談増加スコアを見ながらGemini用の分析プロンプトを作れます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:min-w-64">
            <div className="rounded-lg bg-stone-100 p-3">
              <div className="text-stone-500">表示件数</div>
              <div className="mt-1 text-2xl font-bold">{filteredItems.length}</div>
            </div>
            <div className="rounded-lg bg-teal-50 p-3">
              <div className="text-teal-700">平均スコア</div>
              <div className="mt-1 text-2xl font-bold text-teal-900">{averageScore || "-"}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-stone-400" />
            <input
              className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
              placeholder="Windows、詐欺、iPhone、Wi-Fiなどで検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            onClick={loadNews}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            RSS再取得
          </button>

          <div className="flex flex-wrap gap-2 lg:col-span-2">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  category === c.key
                    ? "bg-teal-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm">
            ニュースを取得しています...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
        ) : (
          <div className="grid gap-3">
            {filteredItems.map((item) => {
              const score = scoreConsultationRisk(item);
              const itemCategory = categories.find((c) => c.key === estimateCategory(item))?.label ?? "その他";

              return (
                <article key={item.link} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                          {item.source}
                        </span>
                        <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {itemCategory}
                        </span>
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${scoreTone(score)}`}>
                          相談増加スコア {score}/5
                        </span>
                        <span className="text-xs text-stone-500">{formatDate(item.pubDate)}</span>
                      </div>

                      <h2 className="text-lg font-bold leading-snug md:text-xl">{item.title}</h2>
                      {item.contentSnippet && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{item.contentSnippet}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-stone-100 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
                        title="元記事を開く"
                      >
                        <ExternalLink className="h-4 w-4" />
                        元記事
                      </a>
                      <button
                        onClick={() => copyPrompt(item)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-600"
                        title="Gemini用プロンプトをクリップボードにコピー"
                      >
                        {copiedLink === item.link ? <Sparkles className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedLink === item.link ? "コピー済み" : "Gemini用プロンプトをコピー"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm">
                条件に合うニュースがありません。
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
