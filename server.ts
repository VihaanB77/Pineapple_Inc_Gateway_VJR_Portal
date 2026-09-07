import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure destination link stored ONLY on server
const BRAVE_TALK_URL = 'https://talk.brave.com/Eh4yN1ma3ILPI5d3D49BHEkSvxeBH21QQ3as4zymR44';

// Specific user-password pairs
interface AccountConfig {
  displayName: string;
  passcode: string;
}

const AUTHORIZED_ACCOUNTS: Record<string, AccountConfig> = {
  killerkhalsa: {
    displayName: 'KillerKhalsa',
    passcode: 'Ilikepacking',
  },
  brothav: {
    displayName: 'BrothaV',
    passcode: 'Ilikegibbles',
  },
};

// In-memory rate limiting to prevent brute force / unauthorized access
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}
const ipAttempts = new Map<string, RateLimitEntry>();

// Cleanup stale rate limit records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipAttempts.entries()) {
    if (now - entry.lastAttempt > 15 * 60 * 1000 && entry.lockedUntil < now) {
      ipAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// Timing-safe string comparison to protect passcodes
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Secure authentication endpoint
app.post('/api/auth/unlock', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientRecord = ipAttempts.get(ip) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };

  // Check if IP is currently locked out
  if (clientRecord.lockedUntil > now) {
    const remainingSeconds = Math.ceil((clientRecord.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Too many failed attempts. Security cooldown active for ${remainingSeconds}s.`,
    });
  }

  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Username and passcode are required.',
    });
  }

  const trimmedUser = username.trim();
  const trimmedPass = password.trim();

  // Lookup individual user account
  const account = AUTHORIZED_ACCOUNTS[trimmedUser.toLowerCase()];
  const isPasswordValid = account ? safeCompare(trimmedPass, account.passcode) : false;

  // Artificial delay to thwart automated high-speed brute force
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!account || !isPasswordValid) {
    clientRecord.attempts += 1;
    clientRecord.lastAttempt = now;

    if (clientRecord.attempts >= 5) {
      // Lock out for 5 minutes after 5 consecutive failures
      clientRecord.lockedUntil = now + 5 * 60 * 1000;
      ipAttempts.set(ip, clientRecord);
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. System locked for 5 minutes.',
      });
    }

    ipAttempts.set(ip, clientRecord);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Access denied.',
      remainingAttempts: Math.max(0, 5 - clientRecord.attempts),
    });
  }

  // Reset rate limit on successful authorization
  ipAttempts.delete(ip);

  // Return confidential destination details ONLY now that the user is authenticated
  return res.json({
    success: true,
    username: account.displayName,
    linkUrl: BRAVE_TALK_URL,
    serviceName: 'Brave Talk',
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
