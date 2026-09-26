import { BadgeCheck, Star, ThumbsUp } from "lucide-react";

export const REVIEWS = [
  {
    name: "Juliana R.",
    city: "São Paulo, SP",
    text: "Chegou em 3 dias e o Lip Juice é ainda melhor pessoalmente. O cheirinho de morango dura horas!",
    stars: 5,
    date: "29/07/2026",
    helpful: 214,
  },
  {
    name: "Camila M.",
    city: "Belo Horizonte, MG",
    text: "Comprei achando que era pegadinha por esse preço. Veio original, lacrado e com nota fiscal.",
    stars: 5,
    date: "22/07/2026",
    helpful: 188,
  },
  {
    name: "Beatriz L.",
    city: "Recife, PE",
    text: "A base H2 cobre tudo e não craquela no calor daqui. Já é minha terceira compra na queima.",
    stars: 5,
    date: "14/07/2026",
    helpful: 173,
  },
  {
    name: "Larissa S.",
    city: "Curitiba, PR",
    text: "Peguei o kit das paletas de presente pra minha irmã e acabei comprando outro pra mim.",
    stars: 5,
    date: "05/07/2026",
    helpful: 141,
  },
  {
    name: "Cinthia N.",
    city: "Salvador, BA",
    text: "Paguei no Pix e o pedido saiu pra entrega no mesmo dia. Rastreio chegou por e-mail direitinho, sem enrolação.",
    stars: 5,
    date: "22/06/2026",
    helpful: 132,
  },
  {
    name: "Amanda F.",
    city: "Goiânia, GO",
    text: "Trabalho como maquiadora e uso na noiva: o pó Soft Silk seca o brilho e a make aguenta 12h de casamento.",
    stars: 5,
    date: "18/06/2026",
    helpful: 126,
  },
  {
    name: "Patrícia D.",
    city: "Porto Alegre, RS",
    text: "Já tinha comprado em outro site e veio falsificado. Aqui veio com selo, lacre e o cheiro certinho da loja física.",
    stars: 5,
    date: "09/06/2026",
    helpful: 118,
  },
  {
    name: "Renata O.",
    city: "Fortaleza, CE",
    text: "Comprei 4 itens e paguei menos do que 1 na loja do shopping. Voltei 2 dias depois pra comprar de novo.",
    stars: 5,
    date: "02/06/2026",
    helpful: 109,
  },
];

const RATING_BARS = [
  { stars: 5, pct: 94 },
  { stars: 4, pct: 4 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

export function Stars({ n = 5, className = "" }: { n?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < n ? "fill-warning text-warning" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export function SocialProof() {
  return (
    <section className="border-t border-border bg-secondary/60 px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Provas sociais
          </p>
          <h2 className="mt-2 font-display text-3xl">+128 mil clientes atendidas</h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Stars /> 4.9 de 5 em 42.318 avaliações verificadas
          </div>
        </div>

        <div className="mb-8 grid gap-6 rounded-lg bg-card p-6 shadow-soft sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="text-center sm:pr-6">
            <p className="font-display text-5xl leading-none text-primary">4,9</p>
            <Stars className="mt-2 justify-center" />
            <p className="mt-1 text-xs text-muted-foreground">42.318 avaliações</p>
          </div>
          <ul className="space-y-1.5">
            {RATING_BARS.map((b) => (
              <li key={b.stars} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="w-8 shrink-0">{b.stars}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${b.pct}%` }} />
                </span>
                <span className="w-9 shrink-0 text-right">{b.pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mb-8 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          {[
            ["98%", "recomendam a loja"],
            ["24h", "envio após o Pix"],
            ["7.412", "pedidos nos últimos 30 dias"],
            ["100%", "originais com nota fiscal"],
          ].map(([n, l]) => (
            <li key={l} className="rounded-lg bg-card p-4 shadow-soft">
              <p className="font-display text-2xl text-primary">{n}</p>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">{l}</p>
            </li>
          ))}
        </ul>

        <ul className="grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((r) => (
            <li key={r.name} className="rounded-lg bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.city} • {r.date}
                    </p>
                  </div>
                </div>
                <Stars n={r.stars} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">"{r.text}"</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <BadgeCheck className="size-4" /> Compra verificada
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="size-3.5" /> {r.helpful} acharam útil
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
