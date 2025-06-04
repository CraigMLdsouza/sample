# Built using Cursor AI Tool

# AI Chat (Mobile-Only Gemini ChatGPT Clone)

A fully functional, mobile-only AI chat application powered by Google Gemini, Supabase, Auth0, and Bootstrap 5. Engage with a Large Language Model (LLM) using both text and image prompts. All conversations are securely persisted and scoped per user.

## Tech Stack
- Next.js 14 (App Router)
- Bootstrap 5 (mobile-first, utility classes only)
- tRPC v10 (API & server logic)
- Supabase (PostgreSQL, RLS)
- Auth0 (authentication)
- Google Gemini API (text & image)
- Jest (unit testing)

---

## Screenshots
<!-- Add mobile screenshots here after running the app -->

---

## Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
```
AUTH0_DOMAIN=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_ISSUER_BASE_URL=...
AUTH0_BASE_URL=http://localhost:3000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

---

## Supabase Schema & RLS
See `/docs/supabase-schema.sql` for full schema and policies. Run in Supabase SQL editor.

---

## Local Development
```bash
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) on your mobile device or emulator.

---

## Testing
```bash
npm run test
```

---

## Deployment
Deploy to Vercel (free tier) with your environment variables set in the Vercel dashboard.

---

## Features
- Mobile-only, Bootstrap 5 UI
- Auth0 authentication (Universal Login)
- Supabase RLS for secure, user-scoped data
- Google Gemini text & image prompt routing
- Persistent conversations & messages
- Floating new chat button, auto-scroll, loading animations
- Unit tests for core logic

---

## License
MIT

## [Further documentation in progress]

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
