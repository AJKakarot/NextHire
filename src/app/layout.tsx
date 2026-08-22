import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/app-chrome";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "NextHire",
  description:
    "Analyze your resume with AI. Get ATS score, career guidance, and browse jobs on NextHire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark bg-canvas"
      style={{ colorScheme: "dark", backgroundColor: "#09090B" }}
    >
      <body
        className={`${inter.className} ${inter.variable} ${syne.variable} bg-canvas font-sans text-ink`}
        style={{ backgroundColor: "#09090B" }}
      >
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-canvas pb-[env(safe-area-inset-bottom)] font-sans text-ink">
              <AppChrome>{children}</AppChrome>
            </div>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
