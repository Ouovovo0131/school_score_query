export async function GET() {
  return Response.json({
    status: "ok",
    service: "score-query-app",
    timestamp: new Date().toISOString(),
  });
}