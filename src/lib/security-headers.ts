// Cabeçalhos de segurança aplicados a todas as respostas do servidor.
// A CSP é permissiva o bastante para não quebrar o SSR do TanStack Start,
// o preview em iframe da Lovable, o ViaCEP e o gateway Pix.
const IS_DEV = import.meta.env.DEV;

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self' https://*.lovable.app https://*.lovableproject.com https://lovable.dev https://*.vercel.app",
  // 'unsafe-eval' só no dev (HMR do Vite). Em produção fica fora.
  `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ""} https:`,
  "style-src 'self' 'unsafe-inline' data: https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "media-src 'self' data: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'self' https:",
  "upgrade-insecure-requests",
].join("; ");

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  // Sem X-Frame-Options: o preview da Lovable roda em iframe.
  // O controle de enquadramento fica por conta de frame-ancestors na CSP.
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Origin-Agent-Cluster", "?1");

  // CSP só em documentos HTML: evita interferir em respostas de API/assets.
  if (contentType.includes("text/html")) {
    headers.set("Content-Security-Policy", CSP);
    // Respostas HTML dependem de sessão/carrinho: nunca cachear em CDN compartilhada.
    if (!headers.has("cache-control")) headers.set("Cache-Control", "no-store");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}