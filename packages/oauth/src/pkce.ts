const PKCE_HASH_S256_ALGORITHM = 'SHA-256';
const PKCE_CODE_VERIFIER_LENGTH_IN_BYTES = 64;

export async function generateCodeVerifier(): Promise<string> {
  const randomBytes = await getRandomBytes(PKCE_CODE_VERIFIER_LENGTH_IN_BYTES);
  return base64URLEncode(randomBytes);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashedArrayBuffer = await sha256(verifier);
  const hashedBytes = new Uint8Array(hashedArrayBuffer);
  return base64URLEncode(hashedBytes);
}

async function getRandomBytes(length: number): Promise<Uint8Array> {
  const buffer = new Uint8Array(length);
  window.crypto.getRandomValues(buffer);
  return buffer;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest(PKCE_HASH_S256_ALGORITHM, data);
}

function base64URLEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
  return base64.split('=')[0];
}
