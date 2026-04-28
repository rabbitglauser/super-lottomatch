import type { ReactNode } from "react";

import DesktopFooter from "@/components/organisms/DesktopFooter";

interface LoginTemplateProps {
  hero: ReactNode;
  form: ReactNode;
}

export default function DesktopLoginTemplate({ hero, form }: LoginTemplateProps) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="flex flex-1 flex-col lg:flex-row">
        <section className="order-2 flex w-full items-center justify-center px-6 pb-4 pt-2 sm:px-10 sm:pb-6 sm:pt-3 md:pb-8 md:pt-4 lg:order-1 lg:w-1/2 lg:items-center lg:px-10 lg:pb-8 lg:pt-6">
          {hero}
        </section>
        <section className="order-1 flex w-full items-center justify-center px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 md:px-10 md:pb-8 md:pt-4 lg:order-2 lg:w-1/2 lg:items-center lg:pb-8 lg:pt-6">
          {form}
        </section>
      </div>

      <DesktopFooter className="mt-auto" />
    </main>
  );
}
