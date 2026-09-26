import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { rateLimit } from "./rate-limit";

const chargeSchema = z.object({
  amount: z.number().int().min(100),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  document: z.string().regex(/^\d{11}$|^\d{14}$/),
  phone: z.string().regex(/^\d{10,11}$/),
  title: z.string().trim().min(1).max(120),
  utm: z.string().max(2000).optional(),
});

const statusSchema = z.object({ transactionId: z.string().min(1).max(120) });

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chargeSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["DUTTYFY_PIX_URL_ENCRYPTED"];
    if (!url) throw new Error("Gateway Pix não configurado.");

    const ip = getRequestIP({ xForwardedFor: true }) ?? "anon";
    if (!rateLimit(`pix:create:${ip}`, 10, 60_000)) {
      throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    }

    const body = {
      amount: data.amount,
      description: data.title,
      customer: {
        name: data.name,
        document: data.document,
        email: data.email,
        phone: data.phone,
      },
      item: { title: data.title, price: data.amount, quantity: 1 },
      paymentMethod: "PIX" as const,
      ...(data.utm ? { utm: data.utm } : {}),
    };

    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const text = await res.text();
        if (res.ok) {
          const json = JSON.parse(text) as {
            pixCode?: string;
            transactionId?: string;
            status?: string;
          };
          if (!json.pixCode || !json.transactionId) {
            throw new Error("Resposta inválida do gateway Pix.");
          }
          return {
            pixCode: json.pixCode,
            transactionId: json.transactionId,
            status: json.status ?? "PENDING",
          };
        }
        if (res.status >= 400 && res.status < 500) {
          console.error("pix create 4xx", res.status, url.slice(-8));
          throw new Error("Não foi possível gerar o Pix. Confira seus dados e tente novamente.");
        }
        lastError = `HTTP ${res.status}`;
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Não foi possível")) throw err;
        lastError = err instanceof Error ? err.message : "erro de rede";
      } finally {
        clearTimeout(timer);
      }
    }
    console.error("pix create failed", lastError, url.slice(-8));
    throw new Error("Gateway Pix indisponível no momento. Tente novamente em instantes.");
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["DUTTYFY_PIX_URL_ENCRYPTED"];
    if (!url) throw new Error("Gateway Pix não configurado.");

    const ip = getRequestIP({ xForwardedFor: true }) ?? "anon";
    if (!rateLimit(`pix:status:${ip}`, 120, 60_000)) {
      return { status: "PENDING" as const };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(
        `${url}?transactionId=${encodeURIComponent(data.transactionId)}`,
        { signal: controller.signal },
      );
      if (!res.ok) return { status: "PENDING" as const };
      const json = (await res.json()) as { status?: string; paidAt?: string };
      return { status: json.status ?? "PENDING", paidAt: json.paidAt };
    } catch {
      return { status: "PENDING" as const };
    } finally {
      clearTimeout(timer);
    }
  });
