import Image from "next/image";

export default function DesktopAdminHero() {
  return (
    <div className="hidden w-full max-w-4xl px-10 lg:block">
      <p className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-brand">
        SUPERLOTTOMATCH
      </p>

      <h1 className="text-[4rem] font-bold leading-[0.95] tracking-tight text-heading sm:text-[5rem]">
        Einfach sicher
      </h1>

      <h2 className="mt-2 text-[4rem] font-bold leading-[0.95] tracking-tight text-brand sm:text-[5rem]">
        gewinnen.
      </h2>

      <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-muted-foreground">
        Willkommen zurück im Admin Console. Verwalten Sie Ziehungen,
        Teilnehmer und Gewinne mit STV Präzision.
      </p>

      <div className="mt-10 overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
        <Image
          src="/HeroPage.png"
          alt="Bingo preview"
          width={1200}
          height={700}
          className="h-auto w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
