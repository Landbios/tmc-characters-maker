/**
 * Helper to get the correct absolute URL for authentications and callbacks.
 * Falls back to localhost in local dev but uses NEXT_PUBLIC_SITE_URL in production.
 */
export const getAuthRedirectUrl = (path: string = '/auth/callback') => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/';

  // Make sure to include `http(s)://`
  url = url.includes('http') ? url : `https://${url}`;

  // Make sure it includes trailing `/`
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

  // Path shouldn't start with `/` to avoid double slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${url}${cleanPath}`;
};
