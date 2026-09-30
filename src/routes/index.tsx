import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Gift,
  Heart,
  LayoutGrid,
  List,
  PartyPopper,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Stars } from "@/components/SocialProof";
import { PRODUCTS, brl } from "@/lib/products";
import { useStore } from "@/lib/store";

const logo = "/img/logo-crown.svg";
const Confetti = lazy(() =>
  import("@/components/Confetti").then((module) => ({ default: module.Confetti })),
);
const SocialProof = lazy(() =>
  import("@/components/SocialProof").then((module) => ({ default: module.SocialProof })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Produto Grátis na Primeira Compra | Mari Maria Makeup" },
      {
        name: "description",
        content: "Escolha 1 produto grátis na sua primeira compra Mari Maria Makeup. Oferta por tempo limitado.",
      },
      { property: "og:title", content: "Produto Grátis na Primeira Compra | Mari Maria Makeup" },
      {
        property: "og:description",
        content: "Escolha 1 produto grátis na sua primeira compra Mari Maria Makeup. Oferta por tempo limitado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Storefront,
});

function Storefront() {
  const { add, setOpen } = useStore();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showPopup, setShowPopup] = useState(true);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!showPopup) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPopup]);

  function acceptOffer() {
    setShowPopup(false);
    setConfetti(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    window.setTimeout(() => setConfetti(false), 4600);
  }

  return (
    <main className="min-h-[100dvh]">
      {confetti && (
        <Suspense fallback={null}>
          <Confetti />
        </Suspense>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto bg-foreground/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
          <div className="w-full max-w-sm animate-pop overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-border">
            <div className="border-b border-border bg-secondary px-6 py-5">
              <img src={logo} alt="Mari Maria Makeup" width={56} height={40} className="mx-auto h-12 w-auto object-contain" />
            </div>
            <div className="px-6 py-7 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
                <Gift className="size-3.5" /> Presente de primeira compra
              </span>
              <PartyPopper className="mx-auto mt-5 size-10 text-primary" />
              <h1 className="mt-3 text-3xl leading-tight">Você ganhou 1 produto grátis</h1>
              <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
                Escolha seu favorito e pague apenas o frete. Oferta exclusiva para a sua primeira compra.
              </p>
              <Button
                type="button"
                onClick={acceptOffer}
                className="mt-6 min-h-14 w-full animate-cta bg-cta text-base font-bold uppercase text-cta-foreground shadow-cta"
              >
                Aproveitar desconto <ArrowRight className="size-5" />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">Oferta por tempo limitado</p>
            </div>
          </div>
        </div>
      )}

      <section className="bg-gradient-brand px-4 py-8 text-center text-primary-foreground sm:px-5 sm:py-10">
        <div className="mx-auto max-w-2xl animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ring-card/30">
            <Gift className="size-3" /> Primeira compra
          </span>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">Escolha seu produto grátis</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-snug opacity-95">
            Todos os produtos abaixo estão grátis. Escolha 1 favorito e pague apenas o frete.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-card text-center text-[10px] font-semibold leading-tight sm:text-xs">
        {[
          { icon: Gift, text: "1 produto grátis" },
          { icon: Sparkles, text: "Primeira compra" },
          { icon: Truck, text: "Entrega para todo Brasil" },
        ].map(({ icon: Icon, text }) => (
          <p key={text} className="flex flex-col items-center gap-1.5 px-2 py-4">
            <Icon className="size-4 text-primary" />
            {text}
          </p>
        ))}
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-5 sm:px-5 sm:pb-12">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Home</span>
          <ChevronRight className="size-3" />
          <span>Produto grátis</span>
        </nav>
        <h2 className="mt-3 text-xl sm:text-2xl">Produtos disponíveis</h2>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-sm leading-tight text-muted-foreground">
            <b className="text-primary">{PRODUCTS.length} produtos</b>
            <br />
            para escolher
          </p>
          <div className="flex gap-2">
            {([
              { key: "grid", icon: LayoutGrid, label: "Grade" },
              { key: "list", icon: List, label: "Lista" },
            ] as const).map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                type="button"
                variant={view === key ? "default" : "outline"}
                onClick={() => setView(key)}
                className="min-h-9 px-3 text-xs"
              >
                <Icon className="size-3.5" /> {label}
              </Button>
            ))}
          </div>
        </div>

        <ul className={view === "grid" ? "mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3" : "mt-5 grid grid-cols-1 gap-3"}>
          {PRODUCTS.map((product, index) => (
            <li key={product.slug} className="h-full">
              <div className="relative flex h-full flex-col rounded-lg bg-card p-3 shadow-card">
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold uppercase text-success-foreground">
                  Grátis
                </span>
                <button type="button" aria-label="Favoritar" className="absolute right-2.5 top-2.5 z-10 text-muted-foreground">
                  <Heart className="size-5" strokeWidth={1.75} />
                </button>
                <Link to="/produto/$slug" params={{ slug: product.slug }} className={view === "grid" ? "flex flex-1 flex-col" : "flex flex-1 gap-3"}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading={index < 2 ? "eager" : "lazy"}
                    width={800}
                    height={800}
                    className={view === "grid" ? "aspect-square w-full rounded-md bg-secondary object-cover" : "aspect-square w-28 shrink-0 rounded-md bg-secondary object-cover"}
                  />
                  <div className="flex flex-1 flex-col pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Stars /> ({product.reviews.toLocaleString("pt-BR")})</div>
                    <p className="mt-1 text-sm font-semibold leading-tight">{product.name}</p>
                    <div className="mt-1 flex flex-wrap items-end gap-x-2">
                      <span className="font-display text-lg text-success">Grátis</span>
                      <span className="text-xs text-muted-foreground line-through">{brl(product.compareAt)}</span>
                    </div>
                  </div>
                </Link>
                {product.options ? (
                  <Link to="/produto/$slug" params={{ slug: product.slug }} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    <ShoppingBag className="size-4" /> Escolher
                  </Link>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      add({ slug: product.slug, name: product.name, price: 0, image: product.image });
                      setOpen(true);
                    }}
                    className="mt-3 min-h-11 bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    <ShoppingBag className="size-4" /> Escolher grátis
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Suspense fallback={null}>
        <SocialProof />
      </Suspense>
    </main>
  );
}
