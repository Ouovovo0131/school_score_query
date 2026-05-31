import { buildDemoReport, type AnalyzeRequest } from "@/lib/score-report";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<AnalyzeRequest> | null;

  if (!payload?.account?.trim() || !payload?.password?.trim() || !payload?.school?.trim()) {
    return Response.json(
      {
        error: "請填寫學校、帳號與密碼後再進行分析。",
      },
      { status: 400 },
    );
  }

  const report = buildDemoReport({
    school: payload.school,
    account: payload.account,
    password: payload.password,
    semester: payload.semester ?? "113-2",
  });

  return Response.json({
    mode: "demo",
    report,
  });
}