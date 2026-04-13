---
name: component-scaffold
description: Scaffold a new React component in the correct Atomic Design tier for the SuperLottomatch frontend. Use when the user asks to create a new atom, molecule, organism, or template.
user_invocable: true
---

# Component Scaffold — Atomic Design

Creates a new component file at the correct path with the project's TypeScript + Tailwind conventions pre-filled. Always consult `atomic-design` skill or `docs/ATOMIC-DESIGN.md` for tier rules before placing the file.

## Usage

`$ARGUMENTS` should be `<tier> <Name>`, e.g.:

- `/component-scaffold atom Button`
- `/component-scaffold molecule SearchBar`
- `/component-scaffold organism GuestList`
- `/component-scaffold template DashboardTemplate`

Tier must be one of: `atom`, `molecule`, `organism`, `template`.
Name must be PascalCase.

If `$ARGUMENTS` is missing or malformed, ask the user for the tier and the component name before creating anything.

## Step 1 — Validate the tier

Run the 5-question decision tree from the `atomic-design` skill against the user's intent. If the user said "atom" but described something that fetches data, **push back** and propose the correct tier. Do not silently override — ask the user to confirm before creating the file.

## Step 2 — Compute the target path

Path pattern: `frontend/src/components/<tier>s/<Name>/<Name>.tsx`

Examples:

| Input | Target path |
|-------|-------------|
| `atom Button` | `frontend/src/components/atoms/Button/Button.tsx` |
| `molecule SearchBar` | `frontend/src/components/molecules/SearchBar/SearchBar.tsx` |
| `organism LoginForm` | `frontend/src/components/organisms/LoginForm/LoginForm.tsx` |
| `template LoginTemplate` | `frontend/src/components/templates/LoginTemplate/LoginTemplate.tsx` |

**Before writing:** check whether the file already exists. If it does, stop and report to the user — do not overwrite.

## Step 3 — Write the file via the Write tool

Use the template for the chosen tier (below). Fill in `{{Name}}` and adapt the props to whatever the user described.

### Rules that apply to every template

- **Strict TypeScript.** Every prop has an explicit type. Never use `any`.
- **No hex values.** Only semantic Tailwind tokens from `globals.css` (`text-brand`, `bg-input-bg`, `text-heading`, `text-muted`, `text-input-text`, `text-input-icon`, `border-divider`, `text-footer`, `bg-page`, `text-text-primary`).
- **Default export** (matches existing `FormField.tsx`, `LoginForm.tsx`).
- **`"use client"` directive only when needed** — add it for components that use hooks, event handlers, or browser APIs. Atoms and templates usually don't need it.
- **Large, accessible sizing** — target audience is 40+ and non-technical. Default to generous padding and `rounded-3xl` / `rounded-2xl` where it fits the existing look.

### Atom template

```tsx
interface {{Name}}Props {
  children: React.ReactNode;
}

export default function {{Name}}({ children }: {{Name}}Props) {
  return (
    <span className="text-text-primary">
      {children}
    </span>
  );
}
```

For an interactive atom like `Button`, include handler props and mark `"use client"`:

```tsx
"use client";

import type { ReactNode } from "react";

interface {{Name}}Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export default function {{Name}}({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {{Name}}Props) {
  const base =
    "h-16 rounded-2xl px-8 text-lg font-semibold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand/90"
      : "border border-divider text-heading hover:bg-input-bg";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}
```

### Molecule template

```tsx
"use client";

import type { ChangeEvent } from "react";

interface {{Name}}Props {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function {{Name}}({ label, value, onChange }: {{Name}}Props) {
  return (
    <div>
      <label className="mb-3 block text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        className="h-20 w-full rounded-3xl border border-transparent bg-input-bg px-7 text-2xl text-input-text outline-none transition focus:border-brand/20 focus:ring-4 focus:ring-brand/10"
      />
    </div>
  );
}
```

Molecules may import atoms — prefer composing an existing `atoms/Input` or `atoms/Label` when they exist.

### Organism template

```tsx
"use client";

import { useState } from "react";

interface {{Name}}Props {
  onSubmit: (value: string) => void;
}

export default function {{Name}}({ onSubmit }: {{Name}}Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* compose molecules/atoms here */}
    </form>
  );
}
```

Organisms own state but **do not fetch data** — the containing page passes handlers in as props.

### Template template

```tsx
import type { ReactNode } from "react";

interface {{Name}}Props {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function {{Name}}({ header, children, footer }: {{Name}}Props) {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <header>{header}</header>
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
}
```

Templates are **layout only** — no state, no data, no `"use client"`.

## Step 4 — Remind the author of follow-ups

After creating the file, report to the user:

1. The exact path that was written.
2. A reminder to create `<Name>.test.tsx` next to it (project target is >75% coverage — see `docs/TESTING.md`).
3. If the component should be composed into an existing page, point the user at which page file to edit — do not edit it unsolicited.
4. Run `cd frontend && npm run lint` to confirm the file type-checks.

## Do not

- Do not overwrite an existing file — stop and ask.
- Do not create a barrel `index.ts` — the project doesn't use them yet.
- Do not invent Tailwind tokens that don't exist in `globals.css`.
- Do not add `any`, non-null assertions on props, or commented-out placeholder code.
- Do not skip the tier validation in Step 1.
