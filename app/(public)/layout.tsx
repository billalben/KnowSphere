import { Footer } from "./_components/Footer";
import { HeroHeader } from "./_components/HeroHeader";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-svh h-full flex-col">
      <HeroHeader />

      <main className="container mx-auto flex-1 px-4 md:px-6 lg:px-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
