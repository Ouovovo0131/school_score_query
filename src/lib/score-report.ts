export type ScoreSummary = {
  average: number;
  credits: number;
  classRank: string;
  percentile: number;
}

export type StandardMetric = {
  label: string;
  value: number;
  description: string;
}

export type TrendPoint = {
  term: string;
  score: number;
  classAverage: number;
}

export type SubjectMetric = {
  name: string;
  score: number;
  rank: string;
  delta: number;
  note: string;
}

export type ScoreReport = {
  source: string;
  generatedAt: string;
  generatedAtLabel: string;
  integrationState: "demo" | "live";
  profile: {
    studentName: string;
    school: string;
    semester: string;
    accountLabel: string;
  };
  summary: ScoreSummary;
  standards: StandardMetric[];
  trend: TrendPoint[];
  subjects: SubjectMetric[];
  insights: string[];
}

export type AnalyzeRequest = {
  school: string;
  account: string;
  password: string;
  semester: string;
}

const demoProfile = {
  studentName: "王同學",
  school: "智慧校園平台",
  semester: "113-2",
  accountLabel: "A12***89",
}

export const demoReport: ScoreReport = {
  source: "智慧校園平台示意資料",
  generatedAt: "2026-06-01T08:00:00.000Z",
  generatedAtLabel: "2026/06/01 08:00",
  integrationState: "demo",
  profile: demoProfile,
  summary: {
    average: 87.4,
    credits: 28,
    classRank: "5 / 38",
    percentile: 87,
  },
  standards: [
    {
      label: "頂標",
      value: 92,
      description: "落在頂尖區間，已高於多數同儕。",
    },
    {
      label: "前標",
      value: 84,
      description: "整體表現穩定，主要科目都在前段。",
    },
    {
      label: "均標",
      value: 75,
      description: "學科基礎完整，平均線明顯之上。",
    },
    {
      label: "後標",
      value: 66,
      description: "風險科目已低於這條線的只有少數。",
    },
    {
      label: "底標",
      value: 52,
      description: "最低防線，所有科目都保有安全距離。",
    },
  ],
  trend: [
    { term: "112-1", score: 83.1, classAverage: 76.5 },
    { term: "112-2", score: 85.4, classAverage: 78.2 },
    { term: "113-1", score: 87.4, classAverage: 79.8 },
    { term: "113-2", score: 89.2, classAverage: 81.0 },
  ],
  subjects: [
    { name: "數學", score: 96, rank: "第 2 名", delta: 8, note: "高分主科，拉高整體平均。" },
    { name: "國文", score: 92, rank: "第 3 名", delta: 4, note: "閱讀與寫作維持強勢。" },
    { name: "資訊科技", score: 91, rank: "第 1 名", delta: 6, note: "實作型成績最穩定。" },
    { name: "英文", score: 85, rank: "第 6 名", delta: 2, note: "聽讀穩定，作文仍有進步空間。" },
    { name: "物理", score: 78, rank: "第 9 名", delta: -1, note: "理解已到位，練習題速度可再提升。" },
  ],
  insights: [
    "目前平均高於班平均 8.4 分，維持上升趨勢。",
    "頂標與前標都已跨越，五標分布呈現前段集中。",
    "物理是唯一明顯低於其他主科的科目，可作為補強目標。",
  ],
}

function maskAccount(account: string) {
  const normalized = account.trim()

  if (normalized.length <= 4) {
    return normalized || "未提供"
  }

  return `${normalized.slice(0, 3)}***${normalized.slice(-2)}`
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function cloneTrend(trend: TrendPoint[]) {
  return trend.map((point) => ({ ...point }))
}

function cloneSubjects(subjects: SubjectMetric[]) {
  return subjects.map((subject) => ({ ...subject }))
}

function cloneStandards(standards: StandardMetric[]) {
  return standards.map((standard) => ({ ...standard }))
}

function cloneInsights(insights: string[]) {
  return [...insights]
}

export function buildDemoReport(input: AnalyzeRequest): ScoreReport {
  const now = new Date()
  const school = input.school.trim() || demoProfile.school
  const semester = input.semester.trim() || demoProfile.semester

  return {
    ...demoReport,
    source: school,
    generatedAt: now.toISOString(),
    generatedAtLabel: formatTimestamp(now),
    integrationState: "demo",
    profile: {
      studentName: `${maskAccount(input.account)} 同學`,
      school,
      semester,
      accountLabel: maskAccount(input.account),
    },
    summary: { ...demoReport.summary },
    standards: cloneStandards(demoReport.standards),
    trend: cloneTrend(demoReport.trend),
    subjects: cloneSubjects(demoReport.subjects),
    insights: cloneInsights(demoReport.insights),
  }
}