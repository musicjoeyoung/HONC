## 🪿 HONC

This is a project created with the `create-honc-app` template.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` key and value (see: `.dev.vars.example`).

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── seed.ts # Optional seeding script
├── .dev.vars.example # Example .dev.vars file
├── wrangler.toml # Cloudflare Workers configuration
├── drizzle.config.ts # Drizzle configuration
├── tsconfig.json # TypeScript configuration
└── package.json
```

### Backend Setup

1.  Clone repository:

```
git clone  https://github.com/yourusername/spooking-honc.git

cd spooking-honc
```

2.  Install dependencies:

`npm install`

3.  Create  `.dev.vars`  file:

```
DATABASE_URL=your_neon_postgresql_url

FPX_ENDPOINT=http://localhost:8788/v1/traces

AI=your_cloudflare_ai_key

R2_BUCKET=your_r2_bucket_name
```

4.  Start backend server:

`npm run dev`


### Commands

Run the migrations and (optionally) seed the database:

```sh
# this is a convenience script that runs db:generate, db:migrate, and db:seed
npm run db:setup
```

Run the development server:

```sh
npm run dev
```

### Developing

When you iterate on the database schema, you'll need to generate a new migration and apply it:

```sh
npm run db:generate
npm run db:migrate
```

### Deploying

Set your `DATABASE_URL` secret (and any other secrets you need) with wrangler:

```sh
npx wrangler secret put DATABASE_URL
```

Finally, change the name of the project in `wrangler.toml` to something appropriate for your project

```toml
name = "my-neon-project"
```

Deploy with wrangler:

```sh
npm run deploy
```

## Features

-   🎨 AI Image Generation: Create custom goose characters
-   🤖 GooseBot: Interactive chat interface
-   📚 Goose Facts: Educational goose information
-   🔄 3D Model: Interactive spinning goose

## Tech Stack

-   Frontend: React, TypeScript, Three.js, SCSS
-   Backend: Hono, Cloudflare Workers
-   Database: PostgreSQL (Neon)
-   Storage: Cloudflare R2
-   AI: Cloudflare Workers AI

