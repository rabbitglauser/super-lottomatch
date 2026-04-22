import type { ReactNode } from "react";

import Footer from "@/components/organisms/Footer";

interface LoginTemplateProps {
  hero: ReactNode;
  form: ReactNode;
}

export default function LoginTemplate({ hero, form }: LoginTemplateProps) {
  return (
    <main className="relative flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center lg:flex">
        {hero}
      </section>
      <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-10">
        {form}
      </section>
      <Footer />
    </main>
  );
}
