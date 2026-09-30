const BASE_URL = process.env.SASUSYNC_BASE_URL || "https://sms.sasusync.com";
const API_KEY = process.env.SASUSYNC_API_KEY;

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

export class SasuSyncError extends Error {
  status: number;
  detail: any;
  constructor(status: number, detail: any) {
    super(`${status}: ${detail}`);
    this.status = status;
    this.detail = detail;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request(method: string, path: string, payload?: any, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 
          "X-API-Key": API_KEY || "", 
          "Content-Type": "application/json" 
        },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(30000),
      });
    } catch (err) {
      if (attempt === attempts - 1) throw err;
      await sleep(2 ** attempt * 1000);
      continue;
    }

    if (RETRY_STATUSES.has(res.status) && attempt < attempts - 1) {
      await sleep(2 ** attempt * 1000);
      continue;
    }
    
    const text = await res.text();
    if (!res.ok) {
      let detail = text;
      try { detail = JSON.parse(text).detail ?? text; } catch (e) { /* not JSON */ }
      throw new SasuSyncError(res.status, detail);
    }
    return JSON.parse(text);
  }
}

export function sendSms(sender: string, recipients: string | string[], message: string, options?: { sandbox?: boolean }) {
  const list = Array.isArray(recipients) ? recipients : [recipients];
  const path = options?.sandbox ? "/smssandbox/v1/send" : "/api/v1/send";
  return request("POST", path, { sender, recipients: list, message });
}
