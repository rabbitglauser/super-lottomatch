import AdminHero from "@/components/organisms/AdminHero";
import LoginForm from "@/components/organisms/LoginForm";
import LoginTemplate from "@/components/templates/LoginTemplate";

export default function HomePage() {
  return <LoginTemplate hero={<AdminHero />} form={<LoginForm />} />;
}
