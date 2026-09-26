const lipJuiceCafe = "/img/lip-juice-cafe-oficial.webp";
import lipMenta from "@/assets/lip-juice-menta.jpg";
import lipTangerina from "@/assets/lip-juice-tangerina.jpg";
import lipMorango from "@/assets/lip-juice-morango.jpg";
import lipMelancia from "@/assets/lip-juice-melancia.jpg";
import lipPitaya from "@/assets/lip-juice-pitaya.png";
import lipCoco from "@/assets/lip-juice-coco.jpg";
import glowDuoChocolate from "@/assets/glow-duo-chocolate.png";
import glowDuoCaramelo from "@/assets/glow-duo-caramelo.png";
import hypeUp1 from "@/assets/hype-up-1.png";
import hypeUp2 from "@/assets/hype-up-2.png";
import hypeUp3 from "@/assets/hype-up-3.png";
import hypeUp4 from "@/assets/hype-up-4.png";
import hypeUp5 from "@/assets/hype-up-5.png";
import hypeUp6 from "@/assets/hype-up-6.png";
import softSilk1 from "@/assets/soft-silk-1.png";
import softSilk2 from "@/assets/soft-silk-2.png";
import softSilk3 from "@/assets/soft-silk-3.png";
import softSilk4 from "@/assets/soft-silk-4.png";
import afrodite1 from "@/assets/afrodite-atena-1.webp";
import afrodite2 from "@/assets/afrodite-atena-2.webp";
import afrodite3 from "@/assets/afrodite-atena-3.webp";
import afrodite4 from "@/assets/afrodite-atena-4.webp";
const pinceis = "/img/pinceis.jpg";
const esponjas = "/img/esponjas.jpg";
import lashUp1 from "@/assets/lashup-01--1-.png";
import lashUp2 from "@/assets/lashup-03--2-.png";
import lashUp3 from "@/assets/lashup-02--9-.png";
import lashUp4 from "@/assets/lashup-aplicacao.png";
import lashUp5 from "@/assets/lashup-efeitos.png";
import iceCreamy1 from "@/assets/ice-creamy-01.png";
import iceCreamy2 from "@/assets/ice-creamy-04.png";
import iceCreamy3 from "@/assets/ice-creamy-SITE-foto-ajustada-aplicador-ice-creamy.png";
import iceCreamy4 from "@/assets/ice-creamy-strawberry--2-.png";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt: number;
  image: string;
  badge?: string;
  optionsLabel?: string;
  options?: string[];
  optionsPick?: number;
  optionImages?: Record<string, string>;
  optionColors?: Record<string, string>;
  gallery?: string[];
  description: string;
  bullets: string[];
  rating: number;
  reviews: number;
  sold: number;
};

export const PRODUCTS: Product[] = [
  {
    slug: "lip-juice",
    name: "Combo Lip Juice | Mari Maria Makeup",
    tagline: "Gloss hidratante com brilho de vidro",
    price: 45.89,
    compareAt: 89.9,
    image: lipMorango,
    badge: "Escolha 2 sabores",
    optionsLabel: "Escolha 2 sabores",
    options: ["Tangerina", "Morango", "Melancia", "Pitaya", "Coco", "Menta"],
    optionsPick: 2,
    optionImages: {
      Tangerina: lipTangerina,
      Morango: lipMorango,
      Melancia: lipMelancia,
      Pitaya: lipPitaya,
      Coco: lipCoco,
      Menta: lipMenta,
    },
    description:
      "O gloss labial mais amado do Brasil. Textura leve, brilho molhado e aquele cheirinho de fruta que gruda na memória. Nesta promoção de 9 anos você escolhe 2 sabores.",
    bullets: [
      "Hidratação por até 8 horas",
      "Não pesa e não gruda nos cabelos",
      "Cheirinho de fruta natural",
      "Vegano e não testado em animais",
    ],
    rating: 4.9,
    reviews: 12483,
    sold: 3120,
  },
  {
    slug: "lip-juice-cafe",
    name: "NOVO Lip Juice Café",
    tagline: "Edição limitada com charm + chaveiro",
    price: 26.89,
    compareAt: 59.9,
    image: lipJuiceCafe,
    badge: "Edição limitada",
    optionsLabel: "Escolha o chaveiro colecionável",
    options: ["Chaveiro Grão Dourado", "Chaveiro Coroa Dourada"],
    optionsPick: 1,
    description:
      "O lançamento que esgotou em 4 horas está de volta só no aniversário de 9 anos: Lip Juice Café com charm dourado e chaveiro exclusivo inclusos.",
    bullets: [
      "Aroma de café com baunilha",
      "Vem com charm + chaveiro colecionável",
      "Acabamento glossy translúcido",
      "Estoque limitado por CPF",
    ],
    rating: 4.9,
    reviews: 4210,
    sold: 1890,
  },
  {
    slug: "glow-duo",
    name: "Kit Especial Glow Duo Chocolate e Caramelo Salgado Compre 1 leve os 2 | Ox Mari Maria Hair",
    tagline: "Chocolate + Caramelo Salgado — Ox Mari Maria Hair",
    price: 49.63,
    compareAt: 129.8,
    image: glowDuoChocolate,
    badge: "Compre 1 leve 2",
    optionsLabel: "Kits inclusos",
    optionImages: {
      Chocolate: glowDuoChocolate,
      "Caramelo Salgado": glowDuoCaramelo,
    },
    description:
      "O duo de brilho do Ox Mari Maria Hair: Chocolate e Caramelo Salgado. Compre 1 e leve os 2 para selar o fio, alinhar e dar brilho espelhado.",
    bullets: [
      "Brilho espelhado desde a primeira aplicação",
      "Reduz o frizz em até 92%",
      "Sem sal e sem parabenos",
      "Rende cerca de 30 aplicações",
    ],
    rating: 4.8,
    reviews: 7355,
    sold: 2040,
  },
  {
    slug: "base-hype-up",
    name: "Base Hype Up H2 | Mari Maria Makeup",
    tagline: "2 tons a preço de 1 — 11 tons disponíveis",
    price: 29.3,
    compareAt: 79.9,
    image: hypeUp1,
    gallery: [hypeUp1, hypeUp2, hypeUp3, hypeUp4, hypeUp5, hypeUp6],
    badge: "2 tons por 1",
    optionsLabel: "Escolha o segundo tom",
    options: ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11"],
    optionsPick: 1,
    optionColors: {
      H1: "#f5dcc6",
      H2: "#efcdaf",
      H3: "#e6bd98",
      H4: "#dcae85",
      H5: "#cf9a6b",
      H6: "#c08a58",
      H7: "#a97046",
      H8: "#90593a",
      H9: "#74452e",
      H10: "#573324",
      H11: "#3d241a",
    },
    description:
      "Cobertura buildable de alta duração com acabamento natural. Leve o tom H2 e escolha um segundo tom de brinde para misturar no verão e no inverno.",
    bullets: [
      "Até 12h de duração",
      "Acabamento natural, não craquela",
      "Com ácido hialurônico",
      "Não transfere na roupa",
    ],
    rating: 4.8,
    reviews: 9120,
    sold: 2760,
  },
  {
    slug: "po-solto-soft-silk",
    name: "Pó Solto Soft Silk Sugar Coat | Mari Maria Makeup",
    tagline: "Efeito seda, zero brilho oleoso — 8 tons disponíveis",
    price: 23.19,
    compareAt: 54.9,
    image: softSilk1,
    gallery: [softSilk1, softSilk2, softSilk3, softSilk4],
    optionsLabel: "Escolha o tom",
    options: [
      "Vanilla Puff",
      "Delicate",
      "Sugar Coat",
      "Cupcake",
      "Quick Bake",
      "Frosted",
      "Mint Veil",
      "Tangerine",
    ],
    optionsPick: 1,
    description:
      "Pó solto ultrafino que sela a maquiagem com efeito seda e controla a oleosidade sem marcar linhas de expressão. São 8 tons Invisible Silk — encontre o seu.",
    bullets: [
      "Textura ultrafina micronizada",
      "Controla a oleosidade por horas",
      "Efeito blur natural",
      "Ideal para baking",
    ],
    rating: 4.9,
    reviews: 6402,
    sold: 1980,
  },
  {
    slug: "paleta-afrodite-atena",
    name: "Kit Paleta Sombra Iluminador Afrodite Atena | Mari Maria",
    tagline: "Afrodite & Atena",
    price: 54.45,
    compareAt: 149.9,
    image: afrodite1,
    gallery: [afrodite1, afrodite2, afrodite3, afrodite4],
    badge: "Kit 2 paletas",
    description:
      "As duas paletas mais desejadas juntas: Afrodite para looks quentes e Atena para o glow. Pigmentação absurda e zero fallout.",
    bullets: [
      "12 sombras + 2 iluminadores",
      "Pigmentação alta em uma passada",
      "Mattes cremosos e shimmers metálicos",
      "Espelho grande embutido",
    ],
    rating: 4.9,
    reviews: 8814,
    sold: 2410,
  },
  {
    slug: "ice-creamy-strawberry",
    name: "Ice Creamy Strawberry | Mari Maria Makeup",
    tagline: "Lip Balm 10g — hidratação com brilho e cheirinho de morango",
    price: 17.9,
    compareAt: 54.9,
    image: iceCreamy2,
    gallery: [iceCreamy2, iceCreamy1, iceCreamy3, iceCreamy4],
    description:
      "O Ice Creamy Strawberry é um lip balm cremoso de 10g que hidrata profundamente, deixa um brilho natural nos lábios e traz o cheirinho irresistível de sorvete de morango.",
    bullets: [
      "Hidratação intensa por até 8 horas",
      "Brilho natural sem efeito pegajoso",
      "Aplicador prático em formato de bico",
      "Embalagem colecionável de casquinha",
    ],
    rating: 4.9,
    reviews: 3120,
    sold: 1540,
  },
  {
    slug: "mascara-lash-up",
    name: "Máscara De Cílios - Lash Up | Mari Maria Makeup",
    tagline: "Máscara 5 em 1 — volume, curvatura e definição extrema",
    price: 24.9,
    compareAt: 79.9,
    image: lashUp1,
    gallery: [lashUp1, lashUp2, lashUp3, lashUp4, lashUp5],
    description:
      "A Lash Up é a máscara de cílios 5 em 1 da Mari Maria Makeup: curvatura precisa, cor intensa, comprimento alongado, definição extrema e volume máximo em uma única aplicação.",
    bullets: [
      "Efeito 5 em 1 em uma só passada",
      "Escova que separa e define de ponta a ponta",
      "Cor preto intenso de longa duração",
      "5g — não borra e não esfarela",
    ],
    rating: 4.9,
    reviews: 5280,
    sold: 2310,
  },
];

export type Bump = {
  slug: string;
  name: string;
  price: number;
  compareAt: number;
  image: string;
};

export const BUMPS: Bump[] = [
  { slug: "kit-pinceis-finos", name: "Kit Pincéis Finos", price: 19.9, compareAt: 69.9, image: pinceis },
  { slug: "kit-esponjas", name: "Kit Esponjas", price: 14.9, compareAt: 49.9, image: esponjas },
  { slug: "mascara-lash-up", name: "Máscara De Cílios - Lash Up | Mari Maria Makeup", price: 24.9, compareAt: 79.9, image: lashUp1 },
  { slug: "ice-creamy-strawberry", name: "Ice Creamy Strawberry | Mari Maria Makeup", price: 17.9, compareAt: 54.9, image: iceCreamy2 },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
