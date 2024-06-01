import "./globals.css";

import { ThemeProvider } from "@juliusmarminge/next-themes";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { cn } from "~/lib/cn";
import { Toaster } from "~/ui/sonner";
import { TailwindIndicator } from "~/ui/tailwind-indicator";

const fontCal = localFont({
  src: "./calsans.ttf",
  variable: "--font-cal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timeit.jumr.dev"),
  title: {
    default: "Time Reporting App",
    template: "%s - Time Reporting App",
  },
  description:
    "An app for indie contractors to track time and generate invoices.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-1e6x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        className="antialiased dark:lg:bg-gray-950 lg:bg-accent"
      >
        <body
          className={cn(
            "min-h-svh font-sans",
            GeistSans.variable,
            GeistMono.variable,
            fontCal.variable,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {props.children}

            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
