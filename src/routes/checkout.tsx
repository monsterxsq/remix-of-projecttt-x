import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useServerFn } from "@tanstack/react-start";

import { createPixCharge, getPixStatus } from "@/lib/pix.functions";
import { BUMPS, brl } from "@/lib/products";
import { useStore } from "@/lib/store";
import { getTrackingQuery } from "@/lib/tracking";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Pagamento via Pix" },
      {
        name: "description",
        content:
          "Finalize seu pedido: endereço preenchido automaticamente pelo CEP, três opções de frete e pagamento via Pix aprovado na hora.",
      },
      { property: "og:title", content: "Checkout — Pagamento via Pix" },
      {
        property: "og:description",
        content: "Endereço automático pelo CEP, frete à sua escolha e Pix instantâneo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

const EMPTY: Address = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

const SHIPPING = [
  {
    id: "express",
    label: "Express",
    desc: "Chega em até 2 dias úteis",
    price: 23.9,
  },
  {
    id: "correios",
    label: "Correios normal",
    desc: "Chega em até 5 dias úteis",
    price: 11.9,
  },
  {
    id: "gratis",
    label: "Frete grátis",
    desc: "Chega em até 13 dias úteis",
    price: 0,
  },
] as const;

type ShippingId = (typeof SHIPPING)[number]["id"];

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Checkout() {
  const { items, total, funnel, setQty, remove, add, setOpen } = useStore();
  const [name, setName] = useState(funnel.name);
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [shipping, setShipping] = useState<ShippingId>("gratis");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pixLoading, setPixLoading] = useState(false);
  const [pix, setPix] = useState<{ code: string; transactionId: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const createCharge = useServerFn(createPixCharge);
  const checkStatus = useServerFn(getPixStatus);

  // Integração de pagamento removida — aguardando nova documentação do gateway.


  const shippingOption = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[2];
  const grandTotal = total + shippingOption.price;

  const lookupCep = useCallback(async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as {
        erro?: boolean | string;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) {
        setCepStatus("error");
        return;
      }
      setAddr((a) => ({
        ...a,
        street: data.logradouro ?? a.street,
        district: data.bairro ?? a.district,
        city: data.localidade ?? "",
        state: data.uf ?? "",
      }));
      setCepStatus("ok");
    } catch {
      setCepStatus("error");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pix) return;
    let cancelled = false;
    void (async () => {
      const QRCode = await import("qrcode");
      const url = await QRCode.toDataURL(pix.code, { width: 320, margin: 1 });
      if (!cancelled) setQrDataUrl(url);
    })();
    const stop = setTimeout(
      () => {
        setExpired(true);
      },
      15 * 60 * 1000,
    );
    return () => {
      cancelled = true;
      clearTimeout(stop);
    };
  }, [pix]);

  // Ao confirmar o pagamento, redireciona para a página de rastreio.
  useEffect(() => {
    if (!pix || expired) return;
    const transactionId = pix.transactionId;
    const id = setInterval(() => {
      void (async () => {
        try {
          const res = await checkStatus({ data: { transactionId } });
          if (res.status === "COMPLETED") {
            clearInterval(id);
            void navigate({ to: "/rastreio", search: { pedido: transactionId } });
          }
        } catch {
          /* tenta de novo no próximo ciclo */
        }
      })();
    }, 5000);
    pollRef.current = id;
    return () => clearInterval(id);
  }, [pix, expired, navigate, checkStatus]);

  function validateStep1() {
    if (name.trim().length < 2) return "Informe seu nome completo.";
    const digitsPhone = phone.replace(/\D/g, "");
    if (digitsPhone.length < 10 || digitsPhone.length > 11)
      return "Informe um celular válido com DDD.";
    return "";
  }

  function validateStep2() {
    if (addr.cep.replace(/\D/g, "").length !== 8) return "Informe um CEP válido.";
    if (!addr.street.trim()) return "Informe a rua.";
    if (!addr.number.trim()) return "Informe o número.";
    if (!addr.city.trim() || !addr.state.trim()) return "Informe cidade e estado.";
    return "";
  }

  function validateStep3() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Informe um e-mail válido.";
    if (cpf.replace(/\D/g, "").length !== 11) return "Informe um CPF válido.";
    return "";
  }

  function validate() {
    return validateStep1() || validateStep2() || validateStep3();
  }

  function goTo(next: 1 | 2 | 3) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  }

  function nextStep() {
    const v = step === 1 ? validateStep1() : step === 2 ? validateStep2() : "";
    setError(v);
    if (v) return;
    goTo(step === 1 ? 2 : 3);
  }

  async function payWithPix() {
    const v = validate();
    setError(v);
    if (v) return;
    if (items.length === 0) {
      setError("Sua sacola está vazia.");
      return;
    }
    setPixLoading(true);
    try {
      const utm = getTrackingQuery();
      const title = items.length === 1 ? items[0]!.name : `Pedido com ${items.length} itens`;
      const res = await createCharge({
        data: {
          amount: Math.round(grandTotal * 100),
          name: name.trim(),
          email: email.trim(),
          document: cpf.replace(/\D/g, ""),
          phone: phone.replace(/\D/g, ""),
          title: title.slice(0, 120),
          ...(utm ? { utm } : {}),
        },
      });
      setPix({ code: res.pixCode, transactionId: res.transactionId });
      setExpired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o Pix.");
    } finally {
      setPixLoading(false);
    }
  }


  async function copyCode() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const field =
    "mt-1.5 w-full rounded-md border border-input bg-secondary px-3.5 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  const label = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Continuar comprando
      </Link>

      <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">Finalizar pedido</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Desconto de <b className="text-primary">90% OFF</b> aplicado • pagamento via Pix
      </p>

      {pix ? (
        <section className="mt-6 rounded-md border border-border bg-card p-5 text-center shadow-soft">
          <h2 className="text-lg">Escaneie o QR Code para pagar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Valor: <b className="text-primary">{brl(grandTotal)}</b>
          </p>
          <div className="mt-4 flex justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Pix para pagamento do pedido"
                className="size-64 rounded-md border border-border bg-white p-2"
                width={256}
                height={256}
              />
            ) : (
              <div className="flex size-64 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="mt-4 break-all rounded-md bg-secondary p-3 text-left text-xs text-muted-foreground">
            {pix.code}
          </p>
          <button
            onClick={copyCode}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-cta font-bold uppercase text-cta-foreground"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copied ? "Código copiado" : "Copiar código Pix"}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Ao pagar, você é levado direto ao código de rastreio do seu pedido.
          </p>
          {expired ? (
            <p className="mt-3 text-sm font-medium text-destructive">
              Tempo de pagamento expirado. Recarregue a página para gerar um novo Pix.
            </p>
          ) : (
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Aguardando confirmação do pagamento…
            </p>
          )}
        </section>
      ) : (
        <>
          <ol className="mt-6 flex items-center gap-2">
            {(["Seus dados", "Entrega", "Pagamento"] as const).map((t, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const active = step === n;
              const done = step > n;
              return (
                <li key={t} className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : n}
                  </span>
                  <span
                    className={`truncate text-xs font-semibold ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </span>
                  {i < 2 && <span className="h-px flex-1 bg-border" />}
                </li>
              );
            })}
          </ol>

          {step === 1 && (
            <section className="mt-4 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
              <h2 className="text-base sm:text-lg">Seus dados</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Etapa 1 de 3 — rapidinho, prometo.
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className={label} htmlFor="nome">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    value={name}
                    maxLength={80}
                    onChange={(e) => setName(e.target.value)}
                    className={field}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className={label} htmlFor="telefone">
                    Celular (com DDD)
                  </label>
                  <input
                    id="telefone"
                    inputMode="numeric"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className={field}
                    autoComplete="tel"
                  />
                </div>
              </div>
              {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
              <button
                onClick={nextStep}
                className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-md bg-cta py-3.5 text-base font-bold uppercase tracking-wide text-cta-foreground shadow-cta transition active:scale-[0.99]"
              >
                Continuar
              </button>
            </section>
          )}

          {step === 2 && (
          <>
          <section className="mt-4 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
            <h2 className="flex items-center gap-2 text-base sm:text-lg">
              <Truck className="size-4 text-primary" /> Endereço de entrega
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Etapa 2 de 3 — digite o CEP e o resto preenche sozinho.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="cep">
                  CEP
                </label>
                <div className="relative">
                  <input
                    id="cep"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={addr.cep}
                    onChange={(e) => {
                      const masked = maskCep(e.target.value);
                      setAddr((a) => ({ ...a, cep: masked }));
                      setCepStatus("idle");
                      if (masked.replace(/\D/g, "").length === 8) void lookupCep(masked);
                    }}
                    onBlur={() => void lookupCep(addr.cep)}
                    className={field}
                    autoComplete="postal-code"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {cepStatus === "loading" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    {cepStatus === "ok" && <Check className="size-4 text-success" />}
                  </span>
                </div>
                {cepStatus === "error" && (
                  <p className="mt-1 text-xs font-medium text-destructive">CEP não encontrado.</p>
                )}
                {cepStatus === "ok" && (
                  <p className="mt-1 text-xs text-success">Endereço preenchido automaticamente.</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className={label} htmlFor="rua">
                  Rua / Avenida
                </label>
                <input
                  id="rua"
                  value={addr.street}
                  onChange={(e) => setAddr((a) => ({ ...a, street: e.target.value }))}
                  className={field}
                  autoComplete="address-line1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label} htmlFor="numero">
                  Número
                </label>
                <input
                  id="numero"
                  inputMode="numeric"
                  value={addr.number}
                  onChange={(e) => setAddr((a) => ({ ...a, number: e.target.value }))}
                  className={field}
                />
              </div>
              <div className="sm:col-span-4">
                <label className={label} htmlFor="compl">
                  Complemento (opcional)
                </label>
                <input
                  id="compl"
                  value={addr.complement}
                  onChange={(e) => setAddr((a) => ({ ...a, complement: e.target.value }))}
                  className={field}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label} htmlFor="bairro">
                  Bairro
                </label>
                <input
                  id="bairro"
                  value={addr.district}
                  onChange={(e) => setAddr((a) => ({ ...a, district: e.target.value }))}
                  className={field}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={label} htmlFor="cidade">
                  Cidade
                </label>
                <input
                  id="cidade"
                  value={addr.city}
                  onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                  className={field}
                />
              </div>
              <div className="sm:col-span-1">
                <label className={label} htmlFor="uf">
                  UF
                </label>
                <input
                  id="uf"
                  maxLength={2}
                  value={addr.state}
                  onChange={(e) => setAddr((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                  className={field}
                />
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
            <h2 className="text-base sm:text-lg">Forma de envio</h2>
            <div className="mt-3 space-y-2">
              {SHIPPING.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3.5 transition ${
                    shipping === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="frete"
                    value={opt.id}
                    checked={shipping === opt.id}
                    onChange={() => setShipping(opt.id)}
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                  </span>
                  <b className={`shrink-0 text-sm ${opt.price === 0 ? "text-success" : ""}`}>
                    {opt.price === 0 ? "Grátis" : brl(opt.price)}
                  </b>
                </label>
              ))}
            </div>
            {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => goTo(1)}
                className="flex min-h-13 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground"
              >
                Voltar
              </button>
              <button
                onClick={nextStep}
                className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-md bg-cta py-3.5 text-base font-bold uppercase tracking-wide text-cta-foreground shadow-cta transition active:scale-[0.99]"
              >
                Continuar
              </button>
            </div>
          </section>
          </>
          )}

          {step === 3 && (
          <>
          <section className="mt-4 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
            <h2 className="text-base sm:text-lg">Dados para o Pix</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className={label} htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  maxLength={120}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className={label} htmlFor="cpf">
                  CPF
                </label>
                <input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  className={field}
                />
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-primary/30 bg-card p-4 shadow-soft sm:p-5">
            <h2 className="text-base sm:text-lg">Leve também com desconto</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Oferta exclusiva desta compra — adicione com 1 toque.
            </p>
            <ul className="mt-3 space-y-2">
              {BUMPS.map((b) => {
                const inCart = items.some((i) => i.slug === b.slug);
                return (
                  <li key={b.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        if (inCart) {
                          const found = items.find((i) => i.slug === b.slug);
                          if (found) remove(found.id);
                          return;
                        }
                        add({ slug: b.slug, name: b.name, price: b.price, image: b.image });
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition ${
                        inCart ? "border-primary bg-primary/5" : "border-border bg-secondary"
                      }`}
                    >
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                          inCart ? "border-primary bg-primary" : "border-input bg-card"
                        }`}
                      >
                        {inCart && <Check className="size-3.5 text-primary-foreground" />}
                      </span>
                      <img
                        src={b.image}
                        alt={b.name}
                        loading="lazy"
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-sm bg-card object-contain"
                      />
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">
                        {b.name}
                      </span>
                      <span className="shrink-0 text-right text-sm">
                        <b className="text-primary">{brl(b.price)}</b>
                        <br />
                        <s className="text-xs text-muted-foreground">{brl(b.compareAt)}</s>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-4 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
            <h2 className="text-base sm:text-lg">Resumo da sacola</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {items.length === 0 && <li className="text-muted-foreground">Sua sacola está vazia.</li>}
              {items.map((i) => (
                <li key={i.id} className="flex items-start gap-3">
                  <img
                    src={i.image}
                    alt={i.name}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-md bg-secondary object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{i.name}</p>
                    {i.variant && <p className="text-xs text-muted-foreground">{i.variant}</p>}
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        aria-label="Diminuir quantidade"
                        onClick={() => setQty(i.id, i.qty - 1)}
                        className="flex size-8 items-center justify-center rounded-md border border-border"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button
                        aria-label="Aumentar quantidade"
                        onClick={() => setQty(i.id, i.qty + 1)}
                        className="flex size-8 items-center justify-center rounded-md border border-border"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        aria-label="Remover item"
                        onClick={() => remove(i.id)}
                        className="ml-1 flex size-8 items-center justify-center rounded-md text-muted-foreground"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <b className="shrink-0">{brl(i.price * i.qty)}</b>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{brl(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete ({shippingOption.label})</span>
                <span className={shippingOption.price === 0 ? "text-success" : ""}>
                  {shippingOption.price === 0 ? "Grátis" : brl(shippingOption.price)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl text-primary">{brl(grandTotal)}</span>
            </div>
          </section>

          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => goTo(2)}
              className="flex min-h-14 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground"
            >
              Voltar
            </button>
            <button
              onClick={payWithPix}
              disabled={items.length === 0 || pixLoading}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-md bg-cta text-base font-bold uppercase tracking-wide text-cta-foreground shadow-cta transition active:scale-[0.99] disabled:opacity-40"
            >
              {pixLoading ? <Loader2 className="size-5 animate-spin" /> : <QrCode className="size-5" />}
              Gerar Pix
            </button>
          </div>
          </>
          )}
        </>
      )}

      <p className="mt-3 flex items-center justify-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" /> Compra segura • dados protegidos
      </p>
    </main>
  );
}
