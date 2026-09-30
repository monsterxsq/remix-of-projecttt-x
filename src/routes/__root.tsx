import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { AlertTriangle, Menu, ShoppingBag } from "lucide-react";
import { Suspense, lazy, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
const logo = "/img/logo-crown.svg";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/lib/store";
import { captureTracking } from "../lib/tracking";

const CartDrawer = lazy(() =>
  import("../components/CartDrawer").then((m) => ({ default: m.CartDrawer })),
);

function CartMount() {
  const { open } = useStore();
  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse link não existe mais ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110"
          >
            Voltar para a promoção
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Essa página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Tente atualizar ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }
      ,{ name: "theme-color", content: "#FF4C00" },
      { title: "Mari Maria Makeup — Promoção Limitada" },
      {
        name: "description",
        content:
          "Responda 4 perguntas rápidas e libere seu desconto especial para garantir um dos 432 produtos da nossa promoção limitada.",
      },
      { property: "og:site_name", content: "Mari Maria Makeup" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Mari Maria Makeup — Promoção Limitada" },
      { name: "twitter:title", content: "Mari Maria Makeup — Promoção Limitada" },
      { property: "og:description", content: "Responda 4 perguntas rápidas e libere seu desconto especial para garantir um dos 432 produtos da nossa promoção limitada." },
      { name: "twitter:description", content: "Responda 4 perguntas rápidas e libere seu desconto especial para garantir um dos 432 produtos da nossa promoção limitada." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6a7c3202-5a34-4466-b42c-7564bce960a5/id-preview-db3a8f14--494c342b-b117-4d82-987f-2b157f0d86c7.lovable.app-1785942331136.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6a7c3202-5a34-4466-b42c-7564bce960a5/id-preview-db3a8f14--494c342b-b117-4d82-987f-2b157f0d86c7.lovable.app-1785942331136.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Manrope:wght@400;600;700&display=swap",
      },
      { rel: "preload", as: "image", href: logo, fetchPriority: "high" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/svg+xml", sizes: "64x64", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
        <Scripts />
      </body>
    </html>
  );
}

function TopBar() {
  const { count, setOpen } = useStore();
  return (
    <>
      <div className="bg-primary px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-center text-[11px] font-medium leading-tight text-primary-foreground sm:text-xs">
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>
            Você está em um <b className="font-bold">ambiente seguro!</b> Nova interface!
          </span>
        </span>
      </div>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="grid size-10 place-items-center justify-self-start rounded-full text-foreground transition active:bg-secondary"
            >
              <Menu className="size-6" strokeWidth={1.75} />
            </button>

            <Link to="/" className="justify-self-center" aria-label="Página inicial">
              <img
                src={logo}
                alt="Logo da loja"
                width={1074}
                height={771}
                className="h-14 w-auto object-contain sm:h-16"
              />
            </Link>

            <div className="flex items-center justify-self-end">
              <button
                onClick={() => setOpen(true)}
                className="relative grid size-10 place-items-center rounded-full text-foreground transition active:bg-secondary"
                aria-label="Abrir sacola"
              >
                <ShoppingBag className="size-6" strokeWidth={1.75} />
                {count > 0 && (
                  <span className="absolute right-0 top-0 grid size-[18px] place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-card">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    captureTracking();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);


  return (
    <QueryClientProvider client={queryClient}>
      <TopBar />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <SiteFooter />
      <CartMount />
    </QueryClientProvider>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <img
          src={logo}
          alt="Mari Maria Makeup"
          width={96}
          height={70}
          loading="lazy"
          className="mx-auto h-14 w-auto object-contain"
        />

        <div className="mt-8 grid gap-8 text-left sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Institucional</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Sobre a Mari Maria</li>
              <li>Política de privacidade</li>
              <li>Termos de uso</li>
              <li>Por tempo limitado</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Ajuda</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Prazos e formas de envio</li>
              <li>Trocas e devoluções</li>
              <li>Acompanhar meu pedido</li>
              <li>Perguntas frequentes</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Atendimento</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Segunda a sexta, das 9h às 18h</li>
              <li>Pagamento via Pix aprovado na hora</li>
              <li>Ambiente 100% seguro e criptografado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-foreground px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-[11px] leading-relaxed text-background/80">
        <p>
          2026 - Mari Maria Cosméticos LTDA | CNPJ 25.249.077/0001-20 | Avenida Maria Coelho
          Aguiar, 215 - Bloco G - Jardim São Luís, São Paulo/SP - CEP 05804-900
        </p>
        <p className="mt-1">Todos os preços e condições válidos apenas para o estoque da promoção.</p>
      </div>
    </footer>
  );
}
