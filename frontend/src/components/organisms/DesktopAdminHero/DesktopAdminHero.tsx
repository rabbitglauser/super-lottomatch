import Image from "next/image";

export default function DesktopAdminHero() {
  return (
    <div className="w-full max-w-xl lg:max-w-3xl">
      <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-brand sm:mb-3 sm:text-xs md:mb-4">
        SUPERLOTTOMATCH
      </p>

      <h1 className="text-3xl font-bold leading-[0.95] tracking-tight text-heading sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem]">
        Einfach sicher
      </h1>

      <h2 className="mt-1 text-3xl font-bold leading-[0.95] tracking-tight text-brand sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem]">
        gewinnen.
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-4 md:text-lg lg:mt-6 lg:text-xl">
        Willkommen zurück im Admin Console. Verwalten Sie Ziehungen,
        Teilnehmer und Gewinne mit STV Präzision.
      </p>

      <div className="mt-4 hidden overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] sm:block sm:rounded-[1.25rem] md:mt-5 lg:mt-6 lg:rounded-[1.75rem]">
        <Image
          src="/HeroPage.png"
          alt="Bingo preview"
          width={1200}
          height={700}
          className="h-auto max-h-[32vh] w-full object-cover lg:max-h-[38vh]"
          priority
          sizes="(max-width: 1024px) 90vw, 50vw"
        />
      </div>
    </div>
  );
}
