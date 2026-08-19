import { getOptionalSession } from "./_lib/get-optional-session";
import { FAQ } from "./_components/FAQ";
import { Features } from "./_components/Features";
import { Hero } from "./_components/Hero";
import { Testimonials } from "./_components/Testimonials";

export default async function Page() {
  const session = await getOptionalSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <Features />
      <Testimonials />
      <FAQ />
    </>
  );
}
