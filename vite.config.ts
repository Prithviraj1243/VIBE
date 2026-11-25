import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function linkedinApiPlugin(env: Record<string, string>): Plugin {
  const clientId = env.VITE_LINKEDIN_CLIENT_ID || '';
  const clientSecret = env.LINKEDIN_CLIENT_SECRET || '';

  const registerRoutes = (server: ViteDevServer) => {
    server.middlewares.use('/api/linkedin/token', async (req, res) => {
      if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method not allowed' });
      }
      if (!clientId || !clientSecret) {
        return sendJson(res, 500, {
          error: 'Server missing VITE_LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET in .env',
        });
      }

      try {
        const body = await readJsonBody(req);
        const code = String(body.code || '');
        const redirectUri = String(body.redirect_uri || '');

        if (!code || !redirectUri) {
          return sendJson(res, 400, { error: 'Missing code or redirect_uri' });
        }

        const form = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        });

        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });

        const data = (await tokenRes.json().catch(() => ({}))) as Record<string, unknown>;
        if (!tokenRes.ok) {
          return sendJson(res, tokenRes.status, {
            error: String(data.error_description || data.error || `LinkedIn HTTP ${tokenRes.status}`),
            details: data,
          });
        }

        return sendJson(res, 200, data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Token exchange failed';
        return sendJson(res, 500, { error: message });
      }
    });

    server.middlewares.use('/api/linkedin/userinfo', async (req, res) => {
      if (req.method !== 'GET') {
        return sendJson(res, 405, { error: 'Method not allowed' });
      }
      const auth = req.headers.authorization;
      if (!auth) {
        return sendJson(res, 401, { error: 'Missing Authorization header' });
      }

      try {
        const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: auth },
        });
        const data = await profileRes.json().catch(() => ({}));
        return sendJson(res, profileRes.status, data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch userinfo';
        return sendJson(res, 500, { error: message });
      }
    });

    server.middlewares.use('/api/linkedin/post', async (req, res) => {
      if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method not allowed' });
      }
      const auth = req.headers.authorization;
      if (!auth) {
        return sendJson(res, 401, { error: 'Missing Authorization header' });
      }

      try {
        const body = await readJsonBody(req);
        const text = String(body.text || '').trim();
        const personUrn = String(body.personUrn || '').trim();

        if (!text || !personUrn) {
          return sendJson(res, 400, { error: 'Missing text or personUrn' });
        }

        const postPayload = {
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        };

        const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            Authorization: auth,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify(postPayload),
        });

        const data = (await liRes.json().catch(() => ({}))) as Record<string, unknown>;
        if (!liRes.ok) {
          return sendJson(res, liRes.status, {
            success: false,
            error: String(data.message || `LinkedIn HTTP ${liRes.status}`),
            details: data,
          });
        }

        const postId = liRes.headers.get('x-restli-id') || String(data.id || 'published');
        return sendJson(res, 200, { success: true, postId });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'LinkedIn publish failed';
        return sendJson(res, 500, { success: false, error: message });
      }
    });
  };

  return {
    name: 'vybe-linkedin-api',
    configureServer(server) {
      registerRoutes(server);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), linkedinApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      host: true,
    },
  };
});
