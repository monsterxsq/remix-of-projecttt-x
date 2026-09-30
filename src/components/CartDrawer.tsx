import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { brl } from "@/lib/products";
import { useStore } from "@/lib/store";


export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, count } = useStore();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60">
      <button
        aria-label="Fechar carrinho"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="flex items-center gap-2 font-display text-lg">
            <ShoppingBag className="size-5 text-primary" /> Sua sacola ({count})
          </p>
          <button onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Sua sacola ainda está vazia.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-md bg-secondary p-3">
                  <img
                    src={i.image}
                    alt={i.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-16 shrink-0 rounded-sm object-cover sm:size-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{i.name}</p>
                    {i.variant && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{i.variant}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-md bg-card px-2 py-1.5">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Diminuir">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Aumentar">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-primary">{brl(i.price * i.qty)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(i.id)}
                    aria-label="Remover"
                    className="self-start text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="space-y-3 border-t border-border px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className="font-semibold text-success">GRÁTIS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl text-primary">{brl(total)}</span>
          </div>
          {items.length === 0 ? (
            <button
              disabled
              className="min-h-14 w-full rounded-md bg-cta py-4 text-sm font-bold uppercase tracking-wide text-cta-foreground opacity-40"
            >
              Finalizar compra com 90% OFF
            </button>
          ) : (
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="flex min-h-14 w-full items-center justify-center rounded-md bg-cta py-4 text-sm font-bold uppercase tracking-wide text-cta-foreground shadow-cta transition active:scale-[0.99]"
            >
              Finalizar compra com 90% OFF
            </Link>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Compra segura • Pix na hora
          </p>

        </footer>
      </aside>
    </div>
  );
}
