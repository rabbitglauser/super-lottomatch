import AdminHero from "@/components/organisms/AdminHero/AdminHero";
import LoginForm from "@/components/organisms/LoginForm/LoginForm";
import LoginTemplate from "@/components/templates/LoginTemplate/LoginTemplate";

export default function HomePage() {
  return <LoginTemplate hero={<AdminHero />} form={<LoginForm />} />;
}
