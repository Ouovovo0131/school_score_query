"use client";

import { useEffect, useState } from "react";
import { demoReport, type ScoreReport } from "@/lib/score-report";
import Link from "next/link";

export default function ReportPage() {
  const [report, setReport] = useState<ScoreReport | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("latestReport");
      if (raw) {
        setReport(JSON.parse(raw));
        return;
      }
    } catch (e) {
      // ignore
    }

    // fallback to demo
    setReport(demoReport);
  }, []);

  if (!report) return null;

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">成績分析報表</h1>
          <Link href="/" className="text-sm text-slate-600 underline">回到登入</Link>
        </div>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">來源</div>
              <div className="mt-1 text-lg font-semibold">{report.source}</div>
              <div className="mt-1 text-sm text-slate-400">{report.generatedAtLabel}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">學生</div>
              <div className="mt-1 text-lg font-semibold">{report.profile.studentName}</div>
              <div className="mt-1 text-sm text-slate-400">{report.profile.school} · {report.profile.semester}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-slate-500">平均成績</div>
              <div className="mt-1 text-2xl font-bold">{report.summary.average.toFixed(1)}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-slate-500">班排</div>
              <div className="mt-1 text-2xl font-bold">{report.summary.classRank}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-slate-500">累積學分</div>
              <div className="mt-1 text-2xl font-bold">{report.summary.credits}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-slate-500">PR 值</div>
              <div className="mt-1 text-2xl font-bold">{report.summary.percentile}</div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">科目明細</h2>
            <div className="mt-3 space-y-3">
              {report.subjects.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-slate-500">{s.rank} · {s.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{s.score}</div>
                    <div className={`text-sm ${s.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.delta >= 0 ? `+${s.delta}` : s.delta} 分</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">分析重點</h3>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
              {report.insights.map((ins, idx) => (
                <li key={idx}>{ins}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
