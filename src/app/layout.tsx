import "./globals.css";

import type { Metadata } from "next";
import { GeistMono, GeistSans } from "geist/font";

import { DesktopSidebar } from "~/components/desktop-nav";
import { MobileNav } from "~/components/mobile-nav";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeProvider } from "~/components/theme-provider";
import { cn } from "~/lib/cn";

export const metadata: Metadata = {
  title: {
    default: "Time Reporting App",
    template: `%s - Time Reporting App`,
  },
  description:
    "An app for indie contractors to track time and generate invoices.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen flex-col overflow-y-hidden bg-accent lg:flex-row">
              <DesktopSidebar className="hidden lg:flex" />
              <MobileNav className="lg:hidden" />
              <div className="bg-background p-4 lg:ml-72 lg:w-full lg:p-6">
                {props.children}
              </div>
            </div>
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
