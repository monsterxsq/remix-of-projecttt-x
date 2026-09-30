import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { REVIEWS, SocialProof, Stars } from "@/components/SocialProof";
import { PRODUCTS, brl, getProduct, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produto indisponível | Mari Maria" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Produto Grátis | Mari Maria`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<string | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry?.isIntersecting), {
      rootMargin: "0px 0px -80px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = product.optionsPick ?? 0;

  function toggleOption(o: string) {
    setError("");
    setSelected((prev) => {
      if (prev.includes(o)) return prev.filter((x) => x !== o);
      if (prev.length >= pick) return pick === 1 ? [o] : [...prev.slice(1), o];
      return [...prev, o];
    });
  }

  function addToCart() {
    if (pick > 0 && selected.length < pick) {
      setError(
        pick === 1 ? "Selecione uma opção antes de continuar." : `Selecione ${pick} opções.`,
      );
      document.getElementById("opcoes")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({
      slug: product.slug,
      name: product.name,
      price: 0,
      image: product.image,
      qty: 1,
      variant: selected.length ? selected.join(" + ") : undefined,
    });
  }

  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-5 sm:pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Voltar para a promoção
        </Link>
      </div>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-5 sm:py-8 lg:grid-cols-2 lg:gap-8">
        <div className="h-fit self-start">
        <div className="relative overflow-hidden rounded-md border border-border bg-card shadow-soft">
          <img
            src={
              view ||
              (selected.length && product.optionImages?.[selected[selected.length - 1]!]) ||
              product.image
            }
            alt={product.name}
            width={800}
            height={800}
            decoding="async"
            className="aspect-square w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-success px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success-foreground">
            Produto grátis
          </span>
        </div>
        {(product.gallery ?? (!product.options && product.optionImages
          ? Object.values(product.optionImages)
          : null)) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(product.gallery ??
              Object.values(product.optionImages ?? {})).map((url, idx) => (
              <button
                key={url}
                onClick={() => setView(url)}
                aria-label={`Ver imagem ${idx + 1}`}
                className={`overflow-hidden rounded-md border bg-card p-1 transition ${
                  (view ?? product.image) === url ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={url}
                  alt={`${product.name} — imagem ${idx + 1}`}
                  loading="lazy"
                  className="size-16 object-contain"
                />
              </button>
            ))}
          </div>
        )}
        </div>

        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            <Flame className="size-3.5 text-primary" /> Queima de estoque 9 anos
          </p>
          <h1 className="mt-3 text-2xl leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Stars /> {product.rating} • {product.reviews.toLocaleString("pt-BR")} avaliações
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl text-success sm:text-4xl">Grátis</span>
            <span className="pb-1 text-sm text-muted-foreground line-through">
              {brl(product.compareAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-success">Você paga apenas o frete na primeira compra</p>
          {product.stock && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-destructive">
              <Flame className="size-4 shrink-0" />
              Apenas {product.stock} unidades disponíveis
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>


          {product.options && (
            <div id="opcoes" className="mt-7 scroll-mt-24">
              <p className="text-xs font-bold uppercase tracking-wider">
                {product.optionsLabel}{" "}
                <span className="text-primary">
                  ({selected.length}/{pick})
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.options.map((o) => {
                  const on = selected.includes(o);
                  const thumb = product.optionImages?.[o];
                  const swatch = product.optionColors?.[o];
                  return (
                    <button
                      key={o}
                      onClick={() => toggleOption(o)}
                      className={`flex min-h-11 items-center gap-2 rounded-md border py-1.5 pl-1.5 pr-4 text-sm font-medium transition ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {thumb && (
                        <img
                          src={thumb}
                          alt={o}
                          loading="lazy"
                          className="size-8 rounded bg-secondary object-contain"
                        />
                      )}
                      {!thumb && swatch && (
                        <span
                          aria-hidden
                          className="size-7 rounded-full border border-border"
                          style={{ backgroundColor: swatch }}
                        />
                      )}
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

          <div ref={ctaRef} className="mt-6 flex items-center gap-3">
            <button
              onClick={addToCart}
              className="min-h-14 flex-1 rounded-md bg-primary px-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition hover:brightness-110 sm:text-base"
            >
              Escolher grátis
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-5 sm:pb-12">
        <h2 className="text-xl sm:text-2xl">Quem comprou, comentou</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {REVIEWS.slice(0, 2).map((r) => (
            <li key={r.name} className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.name}</p>
                <Stars n={r.stars} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">"{r.text}"</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-5">
        <h2 className="text-xl sm:text-2xl">Outros produtos grátis</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {related.map((p) => (
            <li key={p.slug}>
              <Link
                to="/produto/$slug"
                params={{ slug: p.slug }}
                className="block overflow-hidden rounded-md border border-border bg-card shadow-soft transition sm:hover:-translate-y-1 sm:hover:shadow-card"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3 sm:p-4">
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="mt-1 font-display text-lg text-success">Grátis</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SocialProof />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.35)] backdrop-blur transition-transform duration-300 ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 sm:gap-5">
          <img
            src={product.image}
            alt=""
            aria-hidden
            className="hidden size-14 rounded-md bg-secondary object-contain sm:block"
          />
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-semibold leading-tight">{product.name}</p>
            <p className="font-display text-lg leading-none text-success">Grátis</p>
          </div>

          <button
            onClick={addToCart}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition hover:brightness-110 sm:flex-none sm:px-10"
          >
            <ShoppingBag className="size-4" /> Escolher grátis
          </button>
        </div>
      </div>
    </main>
  );
}
