export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    // 1. ตั้งค่า CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://videogu.pages.dev", // อนุญาตเฉพาะโดเมนนี้
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. จัดการ Preflight Request (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 3. ใช้ Switch Case เพื่อแยกจัดการแต่ละ API Path
      switch (url.pathname) {
        
        // --- API 1: ดึงวิดีโอ ---
        case "/api/videos": {
          const { results } = await env.DB.prepare(
            "SELECT * FROM videos ORDER BY id DESC"
          ).all();
          return Response.json(results, { headers: corsHeaders });
        }

        // --- API 2: ดึงผู้ใช้งาน (แก้ไขให้ถูกต้อง) ---
        case "/api/short": {
          // แก้จาก videos เป็น Users (คุณต้องสร้างตาราง Users ใน D1 ก่อนนะ)
          const { results } = await env.DB.prepare(
            "SELECT * FROM short" 
          ).all();
          return Response.json(results, { headers: corsHeaders });
        }

        // --- API 3: ดึงลูกค้า (ตัวอย่างเดิม) ---
        case "/api/customers": {
          const { results } = await env.DB.prepare(
            "SELECT * FROM Customers WHERE CompanyName = ?"
          )
            .bind("Bs Beverages")
            .all();
          return Response.json(results, { headers: corsHeaders });
        }

        // --- กรณีไม่เจอ Path ที่กำหนด ---
        default:
          return new Response("Not Found API Endpoint", { 
            status: 404, 
            headers: corsHeaders 
          });
      }

    } catch (err) {
      // ดักจับ Error รวมที่เดียว
      return Response.json(
        { error: err.message }, 
        { status: 500, headers: corsHeaders }
      );
    }
  },
} satisfies ExportedHandler<Env>;
