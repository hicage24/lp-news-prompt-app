export type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
  contentSnippet?: string;
};

export function buildDlpPrompt(item: NewsItem): string {
  return `以下のITニュースを、PCDEPOTのデジタルライフプランナー視点で分析してください。

【前提】
- 顧客情報、社内情報、個人情報は含めません。
- 公開ニュースの内容だけをもとに分析してください。
- 一般家庭、初心者、高齢のお客様にも伝わる表現にしてください。
- 店頭や訪問サポートで相談が増えそうかを重視してください。
- 不確実な内容は断定せず、「可能性」として表現してください。

【出力項目】
1. 30秒要約
2. 一般家庭への影響
3. 店頭相談が増えそうな内容
4. 初心者・高齢者が困りそうな点
5. DLPが注意して確認すべきポイント
6. 注意喚起ポイント
7. 提案やサポートにつながる可能性
8. 相談増加スコア（1〜5）
9. 店頭で使える一言説明
10. 誤解されやすい点

【ニュース】
タイトル：${item.title}
媒体：${item.source}
公開日：${item.pubDate ?? "不明"}
URL：${item.link}
概要：${item.contentSnippet ?? "概要なし"}`;
}
