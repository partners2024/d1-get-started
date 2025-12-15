import { D1Database } from '@cloudflare/workers-types';

export interface Env {
	VDB: D1Database;
	ASSETS: Fetcher;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// ตั้งค่า CORS เพื่อให้หน้าเว็บอื่น (หรือ localhost) ดึงข้อมูลได้
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// กรณี Preflight Request
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// API Endpoint สำหรับดึงวิดีโอ
		if (url.pathname === "/api/videos") {
			try {
				// คำสั่ง SQL ดึงข้อมูล
				const { results } = await env.VDB.prepare(
					"SELECT * FROM videos ORDER BY id DESC"
				).all();

				return new Response(JSON.stringify(results), {
					headers: {
						...corsHeaders,
						"Content-Type": "application/json",
					},
				});
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message }), {
					status: 500,
					headers: corsHeaders,
				});
			}
		}

		// ถ้าไม่ใช่ API ให้แสดงหน้าเว็บปกติ (Frontend)
		return env.ASSETS.fetch(request);
	},
};
