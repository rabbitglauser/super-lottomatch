"use client";

import { Lock, Mail } from "lucide-react";
import FormField from "./FormField";

export default function LoginForm() {
  return (
    <div className="w-full max-w-3xl rounded-[2rem] bg-white/70 px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-12 sm:py-14">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-heading">
          Login
        </h1>
        <p className="mt-3 text-xl text-muted">
          Geben Sie Ihre Zugangsdaten ein.
        </p>
      </div>

      <form className="space-y-8">
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          placeholder="name@beispiel.ch"
          icon={Mail}
        />

        <FormField
          id="password"
          label="Passwort"
          type="password"
          placeholder="••••••••"
          icon={Lock}
        />

        <button
          type="submit"
          className="h-20 w-full rounded-3xl bg-brand text-2xl font-bold text-white shadow-[0_14px_30px_rgba(179,1,26,0.28)] transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-[0.99]"
        >
          Anmelden
        </button>
      </form>

      <div className="my-10 h-px w-full bg-divider" />

      <div className="space-y-5 text-center">
        <a
          href="#"
          className="text-2xl font-semibold text-brand transition hover:underline"
        >
          Passwort vergessen?
        </a>

        <p className="text-lg text-muted">
          Probleme beim Login?{" "}
          <a
            href="#"
            className="font-semibold text-brand transition hover:underline"
          >
            Support kontaktieren
          </a>
        </p>
      </div>
    </div>
  );
}
