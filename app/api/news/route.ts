import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FeedConfig = {
  name: string;
  url: string;
};

const feeds: FeedConfig[] = [
  { name: "IPA セキュリティセンター", url: "https://www.ipa.go.jp/security/rss/alert.rdf" },
  { name: "JPCERT/CC 注意喚起", url: "https://www.jpcert.or.jp/rss/jpcert.rdf" },
  { name: "ITmedia NEWS", url: "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml" },
  { name: "PC Watch", url: "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf" },
  { name: "INTERNET Watch", url: "https://internet.watch.impress.co.jp/data/rss/1.0/iw/feed.rdf" },
];

const parser = new Parser({
  timeout: 10000,
});

function stripHtml(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const settled = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);

      return (parsed.items ?? []).slice(0, 12).map((item) => ({
        title: item.title ?? "無題",
        link: item.link ?? "",
        source: feed.name,
        pubDate: item.pubDate ?? item.isoDate ?? "",
        contentSnippet: stripHtml(item.contentSnippet || item.content || item.summary),
      }));
    })
  );

  const items = settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((item) => item.title && item.link)
    .sort((a, b) => {
      const bd = new Date(b.pubDate || 0).getTime();
      const ad = new Date(a.pubDate || 0).getTime();
      return bd - ad;
    })
    .slice(0, 50);

  return NextResponse.json({ items });
}
