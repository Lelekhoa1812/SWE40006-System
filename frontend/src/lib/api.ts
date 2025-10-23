export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

//import { env } from '@/env';

function buildApiUrl(path: string): string {
  // const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = 'http://localhost:4000';
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const url = `${baseUrl}${path}`;

  return url;
}

export async function fetchJson<T>(
  path: string,
  init?: globalThis.RequestInit
): Promise<T> {
  const url = buildApiUrl(path);

  const resp = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && init.headers ? init.headers : {}),
    },
    cache: 'no-store',
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new ApiError(text || resp.statusText, resp.status);
  }

  const respJson = await resp.json();

  return respJson as T;
}

export async function postData<T>(path: string, data: object): Promise<T> {
  const url = buildApiUrl(path);

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const respJson = await resp.json();

  return respJson as T;
}
