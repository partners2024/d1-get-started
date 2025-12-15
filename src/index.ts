export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // 1. ตั้งค่า CORS Headers (สำคัญมาก เพื่อให้ Cloudflare Pages ดึงข้อมูลได้)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://videogu.pages.dev", // หรือระบุโดเมนเว็บของคุณแทน * เพื่อความปลอดภัย
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. จัดการ Preflight Request (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 3. API สำหรับดึงข้อมูลวิดีโอ
    if (url.pathname === "/api/videos") {
      try {
        // ดึงข้อมูลทั้งหมดจากตาราง videos
        const { results } = await env.DB.prepare("SELECT * FROM videos ORDER BY id DESC").all();
        return Response.json(results, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    // API เดิม (ตัวอย่าง)
    if (url.pathname === "/api/Users") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM Customers WHERE CompanyName = ?"
      )
        .bind("Bs Beverages")
        .all();
      return Response.json(results, { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
} satisfies ExportedHandler<Env>;
