import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS } from "@/lib/products";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant?: string | undefined;
};

type FunnelState = {
  name: string;
  completed: boolean;
};

type StoreValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void;
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  funnel: FunnelState;
  setFunnel: (f: FunnelState) => void;
  search: string;
  setSearch: (v: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "mm_cart_v1";
const FUNNEL_KEY = "mm_funnel_v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [funnel, setFunnelState] = useState<FunnelState>({ name: "", completed: false });
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      if (c) {
        const stored = JSON.parse(c) as CartItem[];
        const freeSlugs = new Set(PRODUCTS.map((product) => product.slug));
        setItems(
          stored.map((item) =>
            freeSlugs.has(item.slug) && item.variant !== "Oferta extra"
              ? { ...item, price: 0, qty: 1 }
              : item,
          ),
        );
      }
      const f = localStorage.getItem(FUNNEL_KEY);
      if (f) setFunnelState(JSON.parse(f));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setFunnel = useCallback((f: FunnelState) => {
    setFunnelState(f);
    try {
      localStorage.setItem(FUNNEL_KEY, JSON.stringify(f));
    } catch {
      /* ignore */
    }
  }, []);

  const add: StoreValue["add"] = useCallback((item) => {
    const id = `${item.slug}${item.variant ? `::${item.variant}` : ""}`;
    setItems((prev) => {
      if (item.price === 0) {
        return [...prev.filter((product) => product.price !== 0), { ...item, id, qty: 1 }];
      }
      const found = prev.find((p) => p.id === id);
      if (found) {
        return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + (item.qty ?? 1) } : p));
      }
      return [...prev, { ...item, id, qty: item.qty ?? 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.id !== id)
        : prev.map((p) => (p.id === id ? { ...p, qty: p.price === 0 ? 1 : qty } : p)),
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    return {
      items,
      add,
      remove,
      setQty,
      count,
      total,
      open,
      setOpen,
      funnel,
      setFunnel,
      search,
      setSearch,
    };
  }, [items, add, remove, setQty, open, funnel, setFunnel, search]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
