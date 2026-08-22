"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NavBar from "./navbar";
import SiteFooter from "./site-footer";

const MINIMAL_CHROME_ROUTES = ["/career-guide"];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimal = MINIMAL_CHROME_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
  }, []);

  if (minimal) {
    return <main className="relative z-10 flex-1">{children}</main>;
  }

  return (
    <>
      <NavBar />
      <main className="relative z-10 flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
