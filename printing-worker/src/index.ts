/**
 * Cloudflare Worker for Document Storage and Email Notifications
 */

export interface Env {
	DOCUMENTS_BUCKET: R2Bucket;
	AUTH_TOKEN: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		// Basic Auth Check
		const authHeader = request.headers.get('Authorization');
		if (!env.AUTH_TOKEN || authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
			return new Response('Unauthorized', { status: 401 });
		}

		try {
			// --- EMAIL NOTIFICATION ENDPOINT ---
			if (path === '/send-email' && method === 'POST') {
				const body = await request.json() as any;
				const { to, subject, html } = body;

				if (!to || !subject || !html) {
					return new Response('Missing email fields', { status: 400 });
				}

				const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						personalizations: [
							{
								to: [{ email: to, name: to.split('@')[0] }],
							},
						],
						from: {
							email: 'notifications@print-manager.workers.dev',
							name: 'Print Manager',
						},
						subject: subject,
						content: [
							{
								type: 'text/html',
								value: html,
							},
						],
					}),
				});

				const res = await fetch(send_request);
				if (res.ok) {
					return new Response('Email sent');
				} else {
					return new Response(`Failed to send email: ${await res.text()}`, { status: 500 });
				}
			}

			// --- STORAGE ENDPOINTS ---
			if (path === '/list' && method === 'GET') {
				const list = await env.DOCUMENTS_BUCKET.list();
				return Response.json(list.objects);
			}

			if (path.startsWith('/download/') && method === 'GET') {
				const key = decodeURIComponent(path.replace('/download/', ''));
				const object = await env.DOCUMENTS_BUCKET.get(key);
				if (!object) return new Response('Not Found', { status: 404 });
				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				return new Response(object.body, { headers });
			}

			if (path.startsWith('/upload/') && method === 'PUT') {
				const key = decodeURIComponent(path.replace('/upload/', ''));
				await env.DOCUMENTS_BUCKET.put(key, request.body);
				return new Response(`Uploaded ${key} successfully`, { status: 201 });
			}

			if (path.startsWith('/delete/') && method === 'DELETE') {
				const key = decodeURIComponent(path.replace('/delete/', ''));
				await env.DOCUMENTS_BUCKET.delete(key);
				return new Response(`Deleted ${key} successfully`);
			}
		} catch (e: any) {
			return new Response(e.message, { status: 500 });
		}

		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
