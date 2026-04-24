import DesktopAdminHero from "@/components/organisms/DesktopAdminHero";
import DesktopLoginForm from "@/components/organisms/DesktopLoginForm";
import DesktopLoginTemplate from "@/components/templates/DesktopLoginTemplate";

export default function HomePage() {
  return (
    <DesktopLoginTemplate
      hero={<DesktopAdminHero />}
      form={<DesktopLoginForm />}
    />
  );
}
