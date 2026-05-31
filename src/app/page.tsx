"use client";

import { FormEvent, useState } from "react";
import { demoReport, type AnalyzeRequest, type ScoreReport } from "@/lib/score-report";

const initialForm: AnalyzeRequest = {
  school: "智慧校園平台",
  account: "",
  password: "",
  semester: "113-2",
};

const summaryCards = [
  {
    label: "平均成績",
    helper: "加權平均",
    tone: "from-amber-400 to-orange-500",
  },
  {
    label: "班排",
    helper: "目前名次",
    tone: "from-sky-400 to-cyan-500",
  },
  {
    label: "累積學分",
    helper: "完成學分",
    tone: "from-emerald-400 to-teal-500",
  },
  {
    label: "PR 值",
    helper: "同儕百分位",
    tone: "from-fuchsia-400 to-rose-500",
  },
] as const;

function buildPath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function createChartPoints(values: number[], min: number, max: number, width: number, height: number) {
  return values.map((value, index) => {
    const x = 28 + (index / Math.max(values.length - 1, 1)) * (width - 56);
    const ratio = (value - min) / Math.max(max - min, 1);
    const y = 20 + (1 - ratio) * (height - 40);

    return { x, y };
  });
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [report, setReport] = useState<ScoreReport>(demoReport);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginUrl = "https://shcloud14.k12ea.gov.tw/HLHSHLC/Auth/Auth/CloudLogin";
  const [embedLogin, setEmbedLogin] = useState(true);

  const lineWidth = 640;
  const lineHeight = 260;

  const trendValues = report.trend.map((point) => point.score);
  const classValues = report.trend.map((point) => point.classAverage);
  const minTrend = Math.min(...trendValues, ...classValues) - 4;
  const maxTrend = Math.max(...trendValues, ...classValues) + 4;
  const trendPath = buildPath(createChartPoints(trendValues, minTrend, maxTrend, lineWidth, lineHeight));
  const classPath = buildPath(createChartPoints(classValues, minTrend, maxTrend, lineWidth, lineHeight));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { report?: ScoreReport; error?: string };

      if (!response.ok || !payload.report) {
        throw new Error(payload.error ?? "分析失敗，請稍後再試。");
      }

      setReport(payload.report);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "分析失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_52%),radial-gradient(circle_at_85%_10%,_rgba(14,165,233,0.14),_transparent_32%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-6 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-900">
                智慧校園成績分析
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Vercel Ready
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  登入智慧校園平台，抓成績與五標，直接做成可解讀的分析儀表板。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  這個專案已先完成 Next.js + Node.js + React 的部署骨架，前端會送出登入資料到 API，再由後端回傳分析報表。等你提供學校平台的實際登入頁、欄位與 selector，就能把 demo 轉成真實抓取流程。
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={embedLogin} onChange={() => setEmbedLogin((s) => !s)} className="scale-110" />
                  在左側嵌入學校登入頁面（若被拒絕請改用下方表單）
                </label>
              </div>

              {embedLogin ? (
                <div className="mt-4 w-full max-w-3xl overflow-hidden rounded-2xl border bg-white">
                  <div className="px-3 py-2 text-sm text-slate-600">嵌入登入頁面（來源：{loginUrl}）</div>
                  <div className="h-[420px]">
                    <iframe src={loginUrl} title="校方登入" className="h-full w-full border-0" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-3xl border border-white/80 bg-slate-950 p-4 text-white shadow-lg shadow-slate-950/10"
                >
                  <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.tone}`} />
                  <div className="mt-4 text-sm text-slate-300">{card.label}</div>
                  <div className="mt-2 text-2xl font-black tracking-tight">
                    {card.label === "平均成績" && `${report.summary.average.toFixed(1)}`}
                    {card.label === "班排" && report.summary.classRank}
                    {card.label === "累積學分" && `${report.summary.credits}`}
                    {card.label === "PR 值" && `${report.summary.percentile}`}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{card.helper}</div>
                </article>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-950/95 p-5 text-white shadow-2xl shadow-slate-900/20"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">分析入口</h2>
              <p className="text-sm leading-6 text-slate-300">
                先填你的學校平台資訊，這版會回傳可運作的示範分析。之後只要替換 API 內的抓取器就能接真實資料。
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                平台名稱
                <select
                  value={form.school}
                  onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:bg-white/10"
                >
                  <option className="text-slate-950">智慧校園平台</option>
                  <option className="text-slate-950">校務系統</option>
                  <option className="text-slate-950">自訂平台</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-200">
                帳號
                <input
                  value={form.account}
                  onChange={(event) => setForm((current) => ({ ...current, account: event.target.value }))}
                  placeholder="請輸入學號或登入帳號"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-200">
                密碼
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="僅用於送到後端，不會顯示在頁面上"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-200">
                學期
                <input
                  value={form.semester}
                  onChange={(event) => setForm((current) => ({ ...current, semester: event.target.value }))}
                  placeholder="例如 113-2"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "分析中..." : "抓取並分析成績"}
            </button>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
              <div className="font-semibold text-white">目前資料模式</div>
              <p className="mt-1">
                {report.source} · {report.profile.studentName} · {report.generatedAtLabel}
              </p>
            </div>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.1)] backdrop-blur-lg sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">五標與趨勢</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">五標視覺化</h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
                狀態：{report.integrationState === "demo" ? "示範資料" : "真實資料"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {report.standards.map((standard) => (
                <article key={standard.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-bold text-slate-900">{standard.label}</div>
                    <div className="text-xl font-black text-slate-950">{standard.value}</div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
                      style={{ width: `${standard.value}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{standard.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">學期趨勢</div>
                  <p className="mt-1 text-sm text-slate-300">你的分數線與班平均線並排顯示。</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    個人成績
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-300" />
                    班平均
                  </span>
                </div>
              </div>

              <svg viewBox={`0 0 ${lineWidth} ${lineHeight}`} className="mt-4 h-[18rem] w-full">
                {[0, 1, 2, 3].map((index) => {
                  const y = 20 + index * 66;

                  return (
                    <line
                      key={index}
                      x1="20"
                      x2={lineWidth - 20}
                      y1={y}
                      y2={y}
                      stroke="rgba(148,163,184,0.22)"
                      strokeDasharray="4 6"
                    />
                  );
                })}

                {createChartPoints(trendValues, minTrend, maxTrend, lineWidth, lineHeight).map((point, index) => (
                  <g key={report.trend[index].term}>
                    <circle cx={point.x} cy={point.y} r="5" fill="#fdba74" />
                    <text x={point.x} y={lineHeight - 10} textAnchor="middle" fill="#94a3b8" fontSize="12">
                      {report.trend[index].term}
                    </text>
                  </g>
                ))}

                <path d={classPath} fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
                <path d={trendPath} fill="none" stroke="#fdba74" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.1)] backdrop-blur-lg sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">目前報表</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{report.profile.studentName}</h2>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <p>平台：{report.profile.school}</p>
                <p>學期：{report.profile.semester}</p>
                <p>帳號：{report.profile.accountLabel}</p>
                <p>來源：{report.source}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <div className="text-xs text-slate-300">平均</div>
                  <div className="mt-1 text-2xl font-black">{report.summary.average.toFixed(1)}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-950">
                  <div className="text-xs text-slate-500">PR</div>
                  <div className="mt-1 text-2xl font-black">{report.summary.percentile}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-950">
                  <div className="text-xs text-slate-500">班排</div>
                  <div className="mt-1 text-lg font-black">{report.summary.classRank}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <div className="text-xs text-slate-300">學分</div>
                  <div className="mt-1 text-2xl font-black">{report.summary.credits}</div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.1)] backdrop-blur-lg sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">分析重點</div>
              <ul className="mt-4 space-y-3">
                {report.insights.map((insight) => (
                  <li key={insight} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    {insight}
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.16)] sm:px-6">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">五標解讀</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">五標不是單一分數，而是定位你的落點</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              頂標、前標、均標、後標、底標可以一起看出你在哪一段區間。這個介面會先把成績與班平均轉成視覺圖，再配上每科排行與變動量，讓你一眼看出要補強的科目。
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.1)] backdrop-blur-lg sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">科目明細</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">單科表現</h2>
              </div>
              <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                {report.subjects.length} 科資料
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {report.subjects.map((subject) => (
                <div key={subject.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">{subject.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {subject.rank} · {subject.note}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-950">{subject.score}</div>
                      <div className={`text-xs font-semibold ${subject.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {subject.delta >= 0 ? `+${subject.delta}` : subject.delta} 分
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400"
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
