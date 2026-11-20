import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so pages make no requests to Google.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Health Monitoring",
  description: "A plain-language picture of each Stanford site’s health.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <body className="font-sans text-black bg-white">
        <a href="#main-content" className="skiplink">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
