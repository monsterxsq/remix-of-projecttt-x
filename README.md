# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploy na Vercel

1. Importe o repositório na Vercel (Framework Preset: **Other**).
2. Build Command: `vite build` — Output: gerado pelo Nitro (deixe o padrão).
3. Environment Variables (Project Settings → Environment Variables):
   - `NITRO_PRESET = vercel` (obrigatório: sem isso o build sai no formato Cloudflare)
   - `DUTTYFY_PIX_URL_ENCRYPTED = <url do gateway Pix>`
4. Deploy. Os cabeçalhos de segurança são aplicados em dois níveis:
   - no runtime (`src/lib/security-headers.ts`, inclui CSP nas páginas HTML);
   - na borda da Vercel (`vercel.json`), como defesa em profundidade.

Observação: o rate limit do Pix é em memória por instância; em produção serverless
ele protege por instância, não globalmente.
