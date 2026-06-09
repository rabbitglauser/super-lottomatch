"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import FormField from "@/components/molecules/FormField";
import { API_BASE_URL } from "@/lib/constants";

export default function DesktopLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Ungültige Zugangsdaten");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Verbindung zum Server fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/70 px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:rounded-3xl sm:px-8 sm:py-8 lg:max-w-2xl lg:rounded-[2rem] lg:px-12 lg:py-10">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
          Login
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base lg:mt-2 lg:text-lg">
          Geben Sie Ihre Zugangsdaten ein.
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          placeholder="name@beispiel.ch"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <FormField
          id="password"
          label="Passwort"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p className="text-center text-sm font-semibold text-brand sm:text-base">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-white shadow-[0_14px_30px_rgba(179,1,26,0.28)] transition hover:bg-brand/90 focus:ring-4 focus:ring-brand/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:text-base lg:h-14 lg:text-lg"
        >
          {isSubmitting ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>

      <div className="my-4 h-px w-full bg-divider sm:my-5 lg:my-6" />

      <div className="space-y-2 text-center sm:space-y-3">
        <a
          href="#"
          className="block text-sm font-semibold text-brand transition hover:underline sm:text-base lg:text-lg"
        >
          Passwort vergessen?
        </a>

        <p className="text-xs text-muted-foreground sm:text-sm">
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
