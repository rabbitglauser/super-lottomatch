"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import Button from "@/components/atoms/Button/Button";
import FormField from "@/components/molecules/FormField/FormField";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginForm() {
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
    <div className="w-full max-w-4xl rounded-[2rem] bg-white/70 px-10 py-14 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-16 sm:py-18">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-heading">
          Login
        </h1>
        <p className="mt-3 text-2xl text-muted">
          Geben Sie Ihre Zugangsdaten ein.
        </p>
      </div>

      <form className="space-y-10" onSubmit={handleSubmit}>
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
          <p className="text-center text-xl font-semibold text-brand">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Anmelden…" : "Anmelden"}
        </Button>
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
