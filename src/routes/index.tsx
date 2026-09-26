import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Flame,
  Gift,
  Heart,
  LayoutGrid,
  List,
  PartyPopper,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";

const logo = "/img/logo-crown.svg";
const Confetti = lazy(() =>
  import("@/components/Confetti").then((m) => ({ default: m.Confetti })),
);
import { Stars } from "@/components/SocialProof";
const SocialProof = lazy(() =>
  import("@/components/SocialProof").then((m) => ({ default: m.SocialProof })),
);
import { BUMPS, PRODUCTS, brl } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mari Maria Makeup — Promoção Limitada" },
      {
        name: "description",
        content:
          "Responda 4 perguntas rápidas e libere seu desconto especial para garantir um dos 432 produtos da nossa promoção limitada.",
      },
      { property: "og:title", content: "Mari Maria Makeup — Promoção Limitada" },
      {
        property: "og:description",
        content:
          "Responda 4 perguntas rápidas e libere seu desconto especial para garantir um dos 432 produtos da nossa promoção limitada.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Funnel,
});

type QuizOption = {
  label: string;
  image?: string;
};

type QuizQuestion = {
  q: string;
  hint: string;
  options: QuizOption[];
};

const productQuizOptions = [
  { slug: "lip-juice", label: "Lip Juice" },
  { slug: "base-hype-up", label: "Base Hype Up" },
  { slug: "po-solto-soft-silk", label: "Pó Solto Soft Silk" },
  { slug: "paleta-afrodite-atena", label: "Paleta Afrodite & Atena" },
].map(({ slug, label }) => ({
  label,
  image: PRODUCTS.find((product) => product.slug === slug)?.image,
}));

const QUESTIONS: QuizQuestion[] = [
  {
    q: "Qual é o seu tipo de maquiagem favorito?",
    hint: "Escolha o estilo que mais combina com você",
    options: [
      { label: "Natural e leve" },
      { label: "Glow iluminado" },
      { label: "Marcante e poderosa" },
      { label: "Colorida e criativa" },
    ],
  },
  {
    q: "Em qual parte do mês você costuma comprar maquiagem?",
    hint: "Isso ajuda a preparar ofertas melhores para você",
    options: [
      { label: "No começo do mês" },
      { label: "No meio do mês" },
      { label: "No fim do mês" },
      { label: "Quando aparece uma promoção" },
    ],
  },
  {
    q: "Qual destes produtos Mari Maria é o seu favorito?",
    hint: "Escolha apenas um dos queridinhos",
    options: productQuizOptions,
  },
  {
    q: "Qual produto você mais gostaria de ver na Mari Maria?",
    hint: "Conte o que está faltando na sua necessaire",
    options: [
      { label: "Corretivo de alta cobertura" },
      { label: "Blush líquido" },
      { label: "Protetor solar com cor" },
      { label: "Kit completo de skincare" },
    ],
  },
];

function playAnswerSound() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    gain.connect(ctx.destination);
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      osc.connect(gain);
      osc.start(now + i * 0.09);
      osc.stop(now + 0.34);
    });
    window.setTimeout(() => ctx.close(), 600);
  } catch {
    /* áudio indisponível */
  }
}

function Funnel() {
  const { funnel, setFunnel, add, setOpen } = useStore();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showPopup, setShowPopup] = useState(true);
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(-1); // -1 = antes do quiz
  const [answers, setAnswers] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    if (funnel.completed) {
      setShowPopup(false);
      setStep(QUESTIONS.length);
    }
  }, [funnel.completed]);

  useEffect(() => {
    if (showPopup || step < 0 || step >= QUESTIONS.length) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showPopup, step]);

  useEffect(() => {
    if (!showPopup && !celebrate) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [celebrate, showPopup]);

  function start() {
    const clean = name.trim();
    if (clean.length < 2) return setError("Digite seu primeiro nome para continuar.");
    if (!accepted) return setError("Marque a caixinha para garantir seu presente de 9 anos.");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setError("");
    setFunnel({ name: clean, completed: false });
    setShowPopup(false);
    setStep(0);
  }

  function answer(option: string) {
    playAnswerSound();
    const next = [...answers, option];
    setAnswers(next);
    if (step + 1 >= QUESTIONS.length) {
      setStep(QUESTIONS.length);
      setFunnel({ name: name.trim() || funnel.name, completed: true });
      setCelebrate(true);
      setConfetti(true);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      window.setTimeout(() => setConfetti(false), 4600);
    } else {
      setStep(step + 1);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }

  const firstName = funnel.name || name.trim();
  const done = step >= QUESTIONS.length;

  return (
    <main className="min-h-[100dvh]">
      {confetti && (
        <Suspense fallback={null}>
          <Confetti />
        </Suspense>
      )}

      {/* PARABÉNS COM CONFETTI */}
      {celebrate && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-pop rounded-lg bg-card p-6 text-center shadow-card ring-1 ring-border sm:p-8">
            <img
              src={logo}
              alt="Logo da loja"
              width={56}
              height={40}
              className="mx-auto h-11 w-auto object-contain"
            />
            <PartyPopper className="mx-auto mt-4 size-9 text-primary" />
            <h2 className="mt-3 text-2xl leading-tight sm:text-3xl">
              Parabéns{firstName ? `, ${firstName}` : ""}!
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Seu desconto de <b className="text-primary">90% OFF</b> já está aplicado nos 432
              produtos mais vendidos e kits da queima de estoque de 9 anos.
            </p>
            <p className="mt-3 text-xs font-semibold text-destructive">
              Atenção: válido só nesta sessão — o estoque é limitado.
            </p>
            <button
              onClick={() => setCelebrate(false)}
              className="mt-5 flex min-h-14 w-full animate-cta items-center justify-center gap-2 rounded-md bg-cta text-base font-bold text-cta-foreground shadow-cta transition active:scale-[0.99]"
            >
              Ver meus produtos liberados <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* POP UP INICIAL */}
      {showPopup && (
        <div className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto overscroll-contain bg-foreground/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md sm:items-center sm:p-4">
          <div className="my-auto w-full max-w-sm animate-pop overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-border">
            <div className="border-b border-border bg-secondary px-6 py-5">
              <img
                src={logo}
                alt="Logo da loja"
                width={56}
                height={40}
                className="mx-auto h-12 w-auto object-contain"
              />
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="text-center">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
                  <Flame className="size-3.5" /> É festa: 9 anos
                </p>
                <h1 className="mt-4 text-4xl leading-none sm:text-5xl">90% OFF</h1>
                <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-snug text-muted-foreground">
                  A Mari Maria completa <b className="text-foreground">9 anos</b> e abriu a maior
                  queima de estoque da história: <b className="text-foreground">432 produtos</b>{" "}
                  em promoção limitada com até 90% OFF. Responda 4 perguntinhas e o presente é seu.
                </p>
              </div>


              <div className="space-y-3">
                <input
                  id="nome"
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="w-full rounded-md border border-input bg-card px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />

                <label
                  htmlFor="aceite"
                  className={`flex min-h-12 w-full cursor-pointer select-none items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                    accepted ? "border-cta bg-cta/15 ring-2 ring-cta/40" : "border-border bg-secondary"
                  }`}
                >
                  <input
                    id="aceite"
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      setError("");
                    }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`grid size-5 shrink-0 place-items-center rounded-sm border ${
                      accepted ? "border-cta bg-cta" : "border-input bg-card"
                    }`}
                  >
                    {accepted && <Check className="size-3.5 text-cta-foreground" />}
                  </span>
                  <span className={`text-sm font-semibold leading-tight ${accepted ? "text-cta" : ""}`}>
                    Sim, quero meu presente de 9 anos
                  </span>
                </label>
              </div>

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <div className="space-y-3">
                <button
                  onClick={start}
                  className="flex min-h-14 w-full animate-cta items-center justify-center gap-2 rounded-md bg-cta py-4 text-[0.95rem] font-bold uppercase tracking-wide text-cta-foreground shadow-cta transition active:scale-[0.99]"
                >
                  Quero meu desconto de aniversário <ArrowRight className="size-5" />
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <Flame className="size-3.5 text-primary" /> Promoção limitada para{" "}
                  <b className="text-foreground">432 produtos</b> — garanta o seu
                </p>
              </div>
            </div>
          </div>
        </div>
      )}






      {/* QUIZ */}
      {!showPopup && !done && step >= 0 && (
        <section className="quiz-active min-h-[100dvh] bg-background pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <header className="sticky top-[81px] z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:top-[89px] sm:px-5">
            <div className="mx-auto max-w-xl">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-xs font-semibold text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img
                    src={logo}
                    alt="Mari Maria Makeup"
                    width={56}
                    height={40}
                    className="h-7 w-auto shrink-0 object-contain"
                  />
                  <span className="truncate">Pergunta {step + 1} de {QUESTIONS.length}</span>
                </div>
                <span className="shrink-0 font-bold text-primary">
                  {Math.round(((step + 1) / QUESTIONS.length) * 100)}%
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-label="Progresso do quiz"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(((step + 1) / QUESTIONS.length) * 100)}
              >
                <div
                  className="h-full rounded-full bg-gradient-brand transition-[width] duration-500"
                  style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </header>

          <div key={step} className="mx-auto max-w-xl animate-rise px-4 pt-5 sm:px-5 sm:pt-8">
            <p className="text-sm font-semibold text-primary">
              {firstName ? `${firstName}, ` : ""}vamos personalizar sua oferta
            </p>
            <h1 className="mt-1.5 text-2xl leading-tight sm:text-3xl">{QUESTIONS[step]?.q}</h1>
            <p className="mt-2 text-sm leading-snug text-muted-foreground">
              {QUESTIONS[step]?.hint}
            </p>

            <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:gap-3">
              {(QUESTIONS[step]?.options ?? []).map((o) => (
                <li key={o.label}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => answer(o.label)}
                    className="group h-auto min-h-16 w-full justify-start whitespace-normal rounded-lg border-border bg-card p-2.5 pr-3 text-left text-[15px] font-semibold shadow-soft active:scale-[0.99] sm:min-h-[4.5rem] sm:p-3 sm:text-base sm:hover:border-primary sm:hover:bg-accent/40"
                  >
                    {o.image ? (
                      <img
                        src={o.image}
                        alt=""
                        aria-hidden
                        width={128}
                        height={128}
                        loading="eager"
                        decoding="async"
                        className="size-12 shrink-0 rounded-md bg-secondary object-cover sm:size-14"
                      />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary sm:size-11">
                        <Sparkles className="size-4 text-primary" aria-hidden />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
                    <ArrowRight className="size-4 shrink-0 text-primary opacity-40 transition sm:group-hover:opacity-100" />
                  </Button>
                </li>
              ))}

            </ul>
          </div>
        </section>
      )}

      {/* LOJA / PARABÉNS */}
      {done && (
        <>
          <section className="relative overflow-hidden bg-gradient-brand px-4 py-12 text-center text-primary-foreground sm:px-5 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-card/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-12 size-64 rounded-full bg-card/10 blur-2xl"
            />
            <div className="relative mx-auto max-w-2xl animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full bg-card/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ring-1 ring-card/30">
                <PartyPopper className="size-3.5" /> Desconto liberado
              </span>
              <h1 className="mt-5 text-3xl leading-tight sm:text-5xl">
                Parabéns{firstName ? `, ${firstName}` : ""}!
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-snug opacity-95">
                Seus <b>90% OFF</b> já estão aplicados nos 432 produtos mais vendidos e kits da
                queima de estoque de 9 anos.
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {[
                  { icon: Sparkles, t: "90% OFF aplicado" },
                  { icon: Gift, t: "432 itens liberados" },
                ].map(({ icon: Icon, t }) => (
                  <p
                    key={t}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-card/15 px-3 py-2.5 text-xs font-semibold ring-1 ring-card/20"
                  >
                    <Icon className="size-4" /> {t}
                  </p>
                ))}
                <p className="inline-flex items-center justify-center gap-2 rounded-xl bg-card/15 px-3 py-2.5 text-xs font-semibold ring-1 ring-card/20">
                  <Flame className="size-4" /> Promoção limitada — garanta o seu
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-card text-center text-[10px] font-semibold leading-tight sm:text-xs">
            {[
              { icon: Truck, t: "Frete grátis acima de R$ 79" },
              { icon: Sparkles, t: "Originais com nota fiscal" },
              { icon: Gift, t: "Brindes em kits selecionados" },
            ].map(({ icon: Icon, t }) => (
              <p key={t} className="flex flex-col items-center gap-1.5 px-2 py-4">
                <Icon className="size-4 text-primary" />
                {t}
              </p>
            ))}
          </div>

          <section className="mx-auto max-w-5xl px-4 pb-10 pt-5 sm:px-5 sm:pb-12">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Home</span>
              <ChevronRight className="size-3" />
              <span>Aniversário 9 anos</span>
              <ChevronRight className="size-3" />
              <span>Queima de estoque</span>
            </nav>
            <h2 className="mt-3 text-xl sm:text-2xl">
              {firstName ? `${firstName}, sua` : "Sua"} seleção com 90% OFF
            </h2>

            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-sm leading-tight text-muted-foreground">
                <b className="text-primary">{PRODUCTS.length} produtos</b>
                <br />
                encontrados
              </p>
              <div className="flex gap-2">
                {(
                  [
                    { k: "grid", icon: LayoutGrid, t: "Grade" },
                    { k: "list", icon: List, t: "Lista" },
                  ] as const
                ).map(({ k, icon: Icon, t }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setView(k)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                      view === k
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" /> {t}
                  </button>
                ))}
              </div>
            </div>

            <ul
              className={
                view === "grid"
                  ? "mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3"
                  : "mt-5 grid grid-cols-1 gap-3"
              }
            >
              {PRODUCTS.map((p, i) => (
                <li key={p.slug} className="h-full">
                  <div className="relative flex h-full flex-col rounded-2xl bg-card p-3 shadow-card transition">
                    <button
                      type="button"
                      aria-label="Favoritar"
                      className="absolute right-2.5 top-2.5 z-10 text-muted-foreground transition active:scale-90"
                    >
                      <Heart className="size-5" strokeWidth={1.75} />
                    </button>
                    <Link
                      to="/produto/$slug"
                      params={{ slug: p.slug }}
                      className={view === "grid" ? "flex flex-1 flex-col" : "flex flex-1 gap-3"}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading={i < 2 ? "eager" : "lazy"}
                        decoding="async"
                        width={800}
                        height={800}
                        className={
                          view === "grid"
                            ? "aspect-square w-full rounded-xl bg-secondary object-cover"
                            : "aspect-square w-28 shrink-0 rounded-xl bg-secondary object-cover"
                        }
                      />
                      <div className="flex flex-1 flex-col pt-2">
                        <div className="flex h-3.5 flex-wrap items-center gap-1.5">
                          {(p.options ?? []).slice(0, 3).map((o, idx) => (
                            <span
                              key={o}
                              title={o}
                              className={`size-3.5 rounded-[3px] border border-border ${
                                ["bg-primary", "bg-foreground/70", "bg-secondary"][idx]
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Stars /> ({p.reviews.toLocaleString("pt-BR")})
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-tight">{p.name}</p>
                        <div className="mt-1 flex flex-wrap items-end gap-x-2">
                          <span className="font-display text-base text-primary sm:text-lg">
                            {brl(p.price)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {brl(p.compareAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                    {p.options ? (
                      <Link
                        to="/produto/$slug"
                        params={{ slug: p.slug }}
                        className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
                      >
                        <ShoppingBag className="size-4" /> Adicionar
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          add({ slug: p.slug, name: p.name, price: p.price, image: p.image });
                          setOpen(true);
                        }}
                        className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
                      >
                        <ShoppingBag className="size-4" /> Adicionar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>



          <section
            className="mx-auto max-w-5xl px-4 pb-12 sm:px-5 sm:pb-14"
            style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}
          >
            <h2 className="text-xl sm:text-2xl">Leve mais gastando pouco</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Itens de até R$ 19 que combinam com o que você escolheu.
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {BUMPS.map((b) => (
                <li
                  key={b.slug}
                  className="rounded-xl border border-border bg-card p-3 text-center shadow-soft"
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 text-xs font-semibold leading-tight">{b.name}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{brl(b.price)}</p>
                </li>
              ))}
            </ul>
          </section>

          <Suspense fallback={null}>
            <SocialProof />
          </Suspense>
        </>
      )}
    </main>
  );
}
