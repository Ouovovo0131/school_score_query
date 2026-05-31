import { buildDemoReport, type AnalyzeRequest } from "@/lib/score-report";
import { loginAndGetHtml } from "@/lib/scraper";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<AnalyzeRequest & { mode?: string; loginUrl?: string }> | null;

  if (!payload?.account?.trim() || !payload?.password?.trim() || !payload?.school?.trim()) {
    return Response.json(
      {
        error: "請填寫學校、帳號與密碼後再進行分析。",
      },
      { status: 400 },
    );
  }

  // 如果 payload.mode === 'live' 嘗試以 Playwright 登入並回傳登入後的 HTML 快照
  if (payload.mode === "live") {
    const loginUrl = payload.loginUrl ?? "https://shcloud14.k12ea.gov.tw/HLHSHLC/Auth/Auth/CloudLogin";

    const result = await loginAndGetHtml({ url: loginUrl, account: payload.account, password: payload.password });

    if (!result.success) {
      // 回退到 demo，但也回傳錯誤與 demo report
      const report = buildDemoReport({
        school: payload.school,
        account: payload.account,
        password: payload.password,
        semester: payload.semester ?? "113-2",
      });

      return Response.json({ mode: "demo", report, error: `Live login failed: ${result.error}` }, { status: 200 });
    }

    return Response.json({ mode: "live", snapshotHtml: result.html }, { status: 200 });
  }

  const report = buildDemoReport({
    school: payload.school,
    account: payload.account,
    password: payload.password,
    semester: payload.semester ?? "113-2",
  });

  return Response.json({ mode: "demo", report });
}