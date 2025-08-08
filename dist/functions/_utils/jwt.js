// Minimal JWT HS256 implementation using Web Crypto (Cloudflare runtime)

const textEncoder = new TextEncoder();

function base64UrlEncode(inputBytes) {
  let str = btoa(String.fromCharCode(...new Uint8Array(inputBytes)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlEncodeString(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importKey(secret) {
  const keyData = typeof secret === 'string' ? textEncoder.encode(secret) : secret;
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJwtHS256(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64UrlEncodeString(JSON.stringify(header));
  const payloadEncoded = base64UrlEncodeString(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(dataToSign));
  const signatureEncoded = base64UrlEncode(sig);
  return `${dataToSign}.${signatureEncoded}`;
}

export async function verifyJwtHS256(token, secret) {
  if (!token || token.split('.').length !== 3) return null;
  const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
  const dataToVerify = `${headerEncoded}.${payloadEncoded}`;
  const signature = Uint8Array.from(atob(signatureEncoded.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const key = await importKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, signature, textEncoder.encode(dataToVerify));
  if (!ok) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadEncoded.replace(/-/g, '+').replace(/_/g, '/')))));
    // Basic exp check if exists
    if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}


