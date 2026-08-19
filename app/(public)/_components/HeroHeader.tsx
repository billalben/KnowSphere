"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/public/logo.png";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { authClient } from "@/lib/auth-client";
import { UserDropDown } from "./UserDropDown";
import { useSignOut } from "@/hooks/use-signout";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Contact", href: "/contact" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex items-center gap-2 sm:gap-8 text-sm">
      {menuItems.map((item) => {
        const active = isActiveLink(pathname, item.href);
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-block px-2 py-1 duration-150",
                active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-accent-foreground",
              )}
            >
              <span>{item.name}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-foreground transition-all duration-300",
                  active
                    ? "opacity-100 scale-x-100"
                    : "opacity-0 scale-x-50",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export const HeroHeader = () => {
  const [menuState, setMenuState] = useState(false);
  const pathname = usePathname();

  const {
    data: session,
    isPending, //loading state
    error, //error object
  } = authClient.useSession();

  const { handleSignout } = useSignOut();

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl"
      >
        <div className="mx-auto max-w-5xl px-5 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-3">
            {/* Left: logo + mobile menu button */}
            <div className="flex items-center gap-2 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Image
                  src={Logo}
                  alt="KnowSphere Logo"
                  className="size-9"
                />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            {/* Center: desktop nav links */}
            <div className="hidden lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <NavLinks pathname={pathname} />
            </div>

            {/* Right: auth + theme toggle */}
            <div className="flex items-center gap-3 lg:w-auto">
              {isPending ? null : session && !error ? (
                <UserDropDown
                  name={session.user?.name}
                  email={session.user?.email}
                  imageUrl={session.user?.image}
                  onLogout={handleSignout}
                />
              ) : (
                <Button
                  render={<Link href="/login">Log In</Link>}
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                />
              )}

              <ModeToggle />
            </div>
          </div>

          {/* Mobile menu (when open) */}
          <div className="lg:hidden mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 data-[state=active]:flex dark:shadow-none">
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMenuState(false)}
            />
          </div>
        </div>
      </nav>
    </header>
  );
};
