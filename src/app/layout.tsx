import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/app-chrome";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${syne.variable} font-sans`}>
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-black pb-[env(safe-area-inset-bottom)] font-sans text-zinc-100">
              <AppChrome>{children}</AppChrome>
            </div>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
