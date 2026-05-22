/**
 * Cloudflare Worker: Pure Cloudflare Backend (D1 + R2 + MailChannels)
 */

export interface Env {
	DB: D1Database;
	DOCUMENTS_BUCKET: R2Bucket;
	AUTH_TOKEN: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		// CORS Headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role, X-User-Dept, X-User-Id',
		};

		if (method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Auth Check
		const authHeader = request.headers.get('Authorization');
		if (!env.AUTH_TOKEN || authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}

		try {
			// --- USERS API ---
			if (path === '/api/users/sync' && method === 'POST') {
				const { id, email, name } = await request.json() as any;
				const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
				if (!user) {
					await env.DB.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
						.bind(id, email, name).run();
					return Response.json({ status: 'created' }, { headers: corsHeaders });
				}
				return Response.json(user, { headers: corsHeaders });
			}

			if (path === '/api/users/setup' && method === 'POST') {
				const { id, name, role, department, notificationFrequency } = await request.json() as any;
				await env.DB.prepare('UPDATE users SET name = ?, role = ?, department = ?, notificationFrequency = ? WHERE id = ?')
					.bind(name, role, department, notificationFrequency, id).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// --- REQUESTS API ---
			if (path === '/api/requests' && method === 'GET') {
				const userRole = request.headers.get('X-User-Role');
				const userDept = request.headers.get('X-User-Dept');

				if (userRole === 'teacher' && userDept) {
					const { results } = await env.DB.prepare('SELECT * FROM print_requests WHERE department = ? ORDER BY createdAt DESC')
						.bind(userDept).all();
					return Response.json(results, { headers: corsHeaders });
				}

				const { results } = await env.DB.prepare('SELECT * FROM print_requests ORDER BY createdAt DESC').all();
				return Response.json(results, { headers: corsHeaders });
			}

			if (path === '/api/requests' && method === 'POST') {
				const data = await request.json() as any;
				const id = crypto.randomUUID();
				await env.DB.prepare(`
					INSERT INTO print_requests 
					(id, documentName, googleDriveLink, copies, color, size, doubleSided, neededBy, department, requesterId, requesterName, requesterEmail)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`).bind(
					id, data.documentName, data.googleDriveLink, data.copies, data.color ? 1 : 0, 
					data.size, data.doubleSided ? 1 : 0, data.neededBy, data.department, 
					data.requesterId, data.requesterName, data.requesterEmail
				).run();

				// NOTIFY HODs
				ctx.waitUntil((async () => {
					try {
						const { results: hods } = await env.DB.prepare('SELECT email FROM users WHERE department = ? AND (role = ? OR role = ?) AND notificationFrequency != ?')
							.bind(data.department, 'hod', 'admin', 'never').all();
						
						for (const hod of hods as any[]) {
							if (hod.email) {
								await fetch('https://api.mailchannels.net/tx/v1/send', {
									method: 'POST',
									headers: { 'content-type': 'application/json' },
									body: JSON.stringify({
										personalizations: [{ to: [{ email: hod.email }] }],
										from: { email: 'notifications@print-manager.workers.dev', name: 'Print Manager' },
										subject: `New Print Request: ${data.documentName}`,
										content: [{ 
											type: 'text/html', 
											value: `<p>A new print request has been submitted for your department (${data.department}) by ${data.requesterName}.</p>
											        <p><b>Document:</b> ${data.documentName}</p>` 
										}],
									}),
								});
							}
						}
					} catch (e) {
						console.error('Worker HOD notification failed', e);
					}
				})());

				return Response.json({ id }, { headers: corsHeaders });
			}

			if (path.startsWith('/api/requests/') && method === 'PUT') {
				const id = path.split('/').pop();
				const updates = await request.json() as any;
				
				let query = 'UPDATE print_requests SET ';
				const params: any[] = [];
				const keys = Object.keys(updates);
				
				keys.forEach((key, i) => {
					query += `${key} = ?${i + 1}`;
					if (i < keys.length - 1) query += ', ';
					params.push(updates[key]);
				});
				
				query += ` WHERE id = ?${keys.length + 1}`;
				params.push(id);

				await env.DB.prepare(query).bind(...params).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			if (path.startsWith('/api/requests/') && method === 'DELETE') {
				const id = path.split('/').pop();
				await env.DB.prepare('DELETE FROM print_requests WHERE id = ?').bind(id).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// --- RESERVATIONS API ---
			if (path === '/api/reservations' && method === 'GET') {
				const from = url.searchParams.get('from');
				const to = url.searchParams.get('to');
				if (!from || !to) {
					return new Response('from and to params required', { status: 400, headers: corsHeaders });
				}
				const { results } = await env.DB.prepare(
					'SELECT * FROM reservations WHERE date >= ? AND date <= ? ORDER BY date ASC, period ASC'
				).bind(from, to).all();
				return Response.json(results, { headers: corsHeaders });
			}

			if (path === '/api/reservations' && method === 'POST') {
				const data = await request.json() as any;
				const { date, period, pcCount, teacherId, teacherName, department, notes } = data;
				const row = await env.DB.prepare(
					'SELECT COALESCE(SUM(pcCount), 0) as total FROM reservations WHERE date = ? AND period = ?'
				).bind(date, period).first() as any;
				if ((row?.total || 0) + pcCount > 30) {
					return Response.json({ error: 'Not enough PCs available' }, { status: 409, headers: corsHeaders });
				}
				const id = crypto.randomUUID();
				await env.DB.prepare(
					'INSERT INTO reservations (id, date, period, pcCount, teacherId, teacherName, department, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
				).bind(id, date, period, pcCount, teacherId, teacherName, department, notes || '').run();
				return Response.json({ id }, { status: 201, headers: corsHeaders });
			}

			if (path.startsWith('/api/reservations/') && method === 'DELETE') {
				const id = path.split('/').pop();
				const userRole = request.headers.get('X-User-Role');
				const userId = request.headers.get('X-User-Id');
				const reservation = await env.DB.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first() as any;
				if (!reservation) return new Response('Not found', { status: 404, headers: corsHeaders });
				if (userRole !== 'printer' && userRole !== 'admin' && reservation.teacherId !== userId) {
					return new Response('Forbidden', { status: 403, headers: corsHeaders });
				}
				await env.DB.prepare('DELETE FROM reservations WHERE id = ?').bind(id).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			if (path.startsWith('/api/reservations/') && method === 'PATCH') {
				const id = path.split('/').pop();
				const userRole = request.headers.get('X-User-Role');
				if (userRole !== 'printer' && userRole !== 'admin') {
					return new Response('Forbidden', { status: 403, headers: corsHeaders });
				}
				const data = await request.json() as any;
				const { pcCount, notes } = data;
				if (pcCount !== undefined) {
					const reservation = await env.DB.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first() as any;
					if (!reservation) return new Response('Not found', { status: 404, headers: corsHeaders });
					const row = await env.DB.prepare(
						'SELECT COALESCE(SUM(pcCount), 0) as total FROM reservations WHERE date = ? AND period = ? AND id != ?'
					).bind(reservation.date, reservation.period, id).first() as any;
					if ((row?.total || 0) + pcCount > 30) {
						return Response.json({ error: 'Not enough PCs available' }, { status: 409, headers: corsHeaders });
					}
				}
				if (pcCount !== undefined && notes !== undefined) {
					await env.DB.prepare('UPDATE reservations SET pcCount = ?, notes = ? WHERE id = ?').bind(pcCount, notes, id).run();
				} else if (pcCount !== undefined) {
					await env.DB.prepare('UPDATE reservations SET pcCount = ? WHERE id = ?').bind(pcCount, id).run();
				} else if (notes !== undefined) {
					await env.DB.prepare('UPDATE reservations SET notes = ? WHERE id = ?').bind(notes, id).run();
				}
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// --- BLOCKED PERIODS API ---
			if (path === '/api/blocked-periods' && method === 'GET') {
				const from = url.searchParams.get('from');
				const to = url.searchParams.get('to');
				if (!from || !to) return new Response('from and to required', { status: 400, headers: corsHeaders });
				const { results } = await env.DB.prepare(
					'SELECT * FROM blocked_periods WHERE date >= ? AND date <= ? ORDER BY date ASC'
				).bind(from, to).all();
				return Response.json(results, { headers: corsHeaders });
			}

			if (path === '/api/blocked-periods' && method === 'POST') {
				const userRole = request.headers.get('X-User-Role');
				if (userRole !== 'printer' && userRole !== 'admin') {
					return new Response('Forbidden', { status: 403, headers: corsHeaders });
				}
				const data = await request.json() as any;
				const { date, period, reason } = data;
				const id = crypto.randomUUID();
				await env.DB.prepare(
					'INSERT INTO blocked_periods (id, date, period, reason) VALUES (?, ?, ?, ?)'
				).bind(id, date, period, reason || '').run();
				return Response.json({ id }, { status: 201, headers: corsHeaders });
			}

			if (path.startsWith('/api/blocked-periods/') && method === 'DELETE') {
				const userRole = request.headers.get('X-User-Role');
				if (userRole !== 'printer' && userRole !== 'admin') {
					return new Response('Forbidden', { status: 403, headers: corsHeaders });
				}
				const id = path.split('/').pop();
				await env.DB.prepare('DELETE FROM blocked_periods WHERE id = ?').bind(id).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// --- EMAIL API ---
			if (path === '/api/send-email' && method === 'POST') {
				const { to, subject, html } = await request.json() as any;
				const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						personalizations: [{ to: [{ email: to }] }],
						from: { email: 'notifications@print-manager.workers.dev', name: 'Print Manager' },
						subject,
						content: [{ type: 'text/html', value: html }],
					}),
				});
				return new Response(res.body, { status: res.status, headers: corsHeaders });
			}

			// --- R2 STORAGE ---
			if (path.startsWith('/upload/') && method === 'PUT') {
				const key = decodeURIComponent(path.replace('/upload/', ''));
				await env.DOCUMENTS_BUCKET.put(key, request.body);
				return new Response(`Uploaded ${key}`, { status: 201, headers: corsHeaders });
			}

			if (path.startsWith('/download/') && method === 'GET') {
				const key = decodeURIComponent(path.replace('/download/', ''));
				const object = await env.DOCUMENTS_BUCKET.get(key);
				if (!object) return new Response('Not Found', { status: 404, headers: corsHeaders });
				const headers = new Headers(corsHeaders);
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				return new Response(object.body, { headers });
			}

		} catch (e: any) {
			return new Response(e.message, { status: 500, headers: corsHeaders });
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
} satisfies ExportedHandler<Env>;
