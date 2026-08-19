import { getOptionalSession } from "./_lib/get-optional-session";
import { Features } from "./_components/Features";
import { Hero } from "./_components/Hero";

export default async function Page() {
  const session = await getOptionalSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <Features />
    </>
  );
}
