# oc-server-discovery

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Frontend app (Next.js + shadcn)

The dashboard frontend lives in `apps/web`.

Copy `apps/web/.env.example` to `apps/web/.env.local` and set:

```bash
OC_API_BASE_URL=http://localhost:8080
```

Run API and frontend in separate terminals:

```bash
bun run api:dev
```

```bash
bun run web:dev
```

Open `http://localhost:3000` to view the dashboard.

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
