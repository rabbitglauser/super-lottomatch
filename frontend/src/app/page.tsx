import LoginForm from "@/components/Login/LoginForm";
import { AdminHero } from "@/components/Login/AdminHero";

export default function HomePage() {
  return (
    <main className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center lg:flex">
        <AdminHero />
      </section>
      <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-10">
        <LoginForm />
      </section>
    </main>
  );
}
