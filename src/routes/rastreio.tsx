import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Package, Search, Truck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getPixStatus } from "@/lib/pix.functions";

export const Route = createFileRoute("/rastreio")({
  validateSearch: (search: Record<string, unknown>) => ({
    pedido: typeof search["pedido"] === "string" ? search["pedido"].slice(0, 120) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rastreio do pedido | Mari Maria" },
      {
        name: "description",
        content:
          "Acompanhe seu pedido Mari Maria: pagamento confirmado, separação e envio com código de rastreio no seu e-mail.",
      },
      { property: "og:title", content: "Rastreio do pedido | Mari Maria" },
      {
        property: "og:description",
        content: "Acompanhe seu pedido: pagamento confirmado, separação e envio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { pedido } = Route.useSearch();
  const navigate = useNavigate();
  const lookup = useServerFn(getPixStatus);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!pedido) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    void (async () => {
      try {
        const res = await lookup({ data: { transactionId: pedido } });
        if (!cancelled) setStatus(res.status === "COMPLETED" ? "completed" : "pending");
      } catch {
        if (!cancelled) setStatus("pending");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pedido, lookup]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) return;
    void navigate({ to: "/rastreio", search: { pedido: clean.slice(0, 120) } });
  }

  const steps = [
    { label: "Pagamento confirmado", done: true },
    { label: "Pedido em separação", done: false },
    { label: "Enviado — código de rastreio no seu e-mail", done: false },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-14 pt-6 sm:pt-10">
      {pedido ? (
        <>
          <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
            {checking ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <Check className="size-8 text-success" />
            )}
          </div>
          <h1 className="mt-4 text-2xl">Pedido recebido!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "pending" && "Aguardando a confirmação do Pix…"}
            {status === "completed" && "Pagamento confirmado. Já estamos preparando seu pedido."}
          </p>

          <section className="mt-6 rounded-md border border-border bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Código do pedido
            </p>
            <p className="mt-1.5 break-all text-sm font-medium">{pedido}</p>

            <ol className="mt-5 space-y-4">
              {steps.map((s, i) => (
                <li key={s.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                      s.done ? "bg-success text-background" : "border border-dashed border-border"
                    }`}
                  >
                    {s.done ? <Check className="size-3.5" /> : <b className="text-xs">{i + 1}</b>}
                  </span>
                  <span
                    className={`text-sm leading-snug ${s.done ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-5 flex items-start gap-2 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              Assim que o pedido for enviado, você recebe o código de rastreio por e-mail em até 1
              dia útil.
            </p>
          </section>

          <Link
            to="/"
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-cta font-bold uppercase text-cta-foreground"
          >
            Voltar à loja
          </Link>
        </>
      ) : (
        <>
          <div className="flex size-16 items-center justify-center rounded-full bg-accent">
            <Package className="size-8 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl">Rastreie seu pedido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Após o envio, o código de rastreio chega no seu e-mail em até 1 dia útil. Cole o código
            do seu pedido abaixo para acompanhar.
          </p>

          <form onSubmit={submit} className="mt-6">
            <label
              htmlFor="pedido"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Código do pedido
            </label>
            <input
              id="pedido"
              value={code}
              maxLength={120}
              placeholder="Ex.: TXN9F3A2B1"
              onChange={(e) => setCode(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3.5 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-cta font-bold uppercase text-cta-foreground"
            >
              <Search className="size-5" /> Consultar
            </button>
          </form>

          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-muted-foreground">
            Voltar à loja
          </Link>
        </>
      )}
    </main>
  );
}
