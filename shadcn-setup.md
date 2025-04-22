
# 🛠️ shadcn/ui Setup for Vite + React + TypeScript

This guide walks you through integrating `shadcn/ui` into your modern React project with Vite, TypeScript, and Tailwind CSS.

---

## ✅ 1. Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

### When prompted:

| Prompt                            | Recommended Answer (TypeScript)              |
|----------------------------------|----------------------------------------------|
| Which style (default/tailwind)?  | `tailwind`                                   |
| Path for components              | `src/components`                             |
| Path alias (optional)            | `@/components`                               |
| Typescript?                      | ✅ yes                                        |
| Tailwind config file             | leave default unless yours is named differently |
| Use app directory?               | ❌ No (for Vite)                              |

---

## ✅ 2. Update tsconfig.json

Add or confirm:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## ✅ 3. Update tailwind.config.ts

Ensure content is set correctly:

```ts
content: [
  "./index.html",
  "./src/**/*.{ts,tsx}",
],
plugins: [require("tailwindcss-animate")],
```

Install required plugins:

```bash
npm install -D tailwindcss-animate class-variance-authority
```

---

## ✅ 4. Update vite.config.ts

Configure alias resolution:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

---

## ✅ 5. Verify Tailwind CSS

Ensure `index.css` includes:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

And that it's imported in `main.tsx`:

```ts
import './index.css';
```

---

## ✅ 6. Install a Component

Use the CLI to install any UI component:

```bash
npx shadcn-ui@latest add button
```

Import and use in your app:

```tsx
import { Button } from "@/components/ui/button";

<Button className="bg-blue-600 text-white">Click Me</Button>
```

---

## 🧪 Done!

Your shadcn/ui setup is now complete and TypeScript-ready 🎉
