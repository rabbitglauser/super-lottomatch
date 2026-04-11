import LoginForm from "@/components/LoginForm";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-end">
      <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-10">
        <LoginForm />
      </section>
    </main>
  );
}
