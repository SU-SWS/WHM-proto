import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { MainNav } from "@/components/MainNav";
import { StanfordLogo } from "@/components/StanfordLogo";
import { getAllSites } from "@/lib/data/load";
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
  title: { default: "Website Health | Stanford Web Services", template: "%s | Website Health" },
  description: "A plain-language picture of each Stanford site’s health.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const anyLive = getAllSites().some((s) => s.source === "live");
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <body className="bg-white font-sans text-black">
        <a href="#main-content" className="skiplink">
          Skip to main content
        </a>
        <div className="bg-cardinal-red px-20 py-6 text-white">
          <a href="https://www.stanford.edu" className="inline-block text-white hocus:text-white focus-visible:outline-white">
            <StanfordLogo />
          </a>
        </div>
        <header className="border-b border-black-20">
          <div className="mx-auto flex max-w-[1152px] flex-wrap items-center gap-x-24 gap-y-12 px-20 py-14">
            <p className="m-0 mr-auto font-serif text-23 font-semibold leading-tight">
              Website Health{" "}
              <small className="ml-8 font-sans text-15 font-normal text-black-80">Stanford Web Services</small>
            </p>
            <MainNav />
          </div>
        </header>
        <aside aria-label="About this data" className="border-l-[6px] border-poppy bg-sample-tint">
          <div className="mx-auto max-w-[1152px] px-20 py-9 text-16">
            {anyLive ? (
              <>
                <strong>Prototype.</strong> Some sections show live Siteimprove data. Sections marked
                “Sample data” are illustrations, not measurements of these sites.
              </>
            ) : (
              <>
                <strong>Demo with sample data.</strong> Numbers and issues are illustrations, not
                measurements of these sites.
              </>
            )}
          </div>
        </aside>
        <main id="main-content" tabIndex={-1} className="page focus:outline-none">
          {children}
        </main>
        <footer className="border-t border-black-20">
          <div className="mx-auto max-w-[1152px] px-20 py-14 text-15 text-black-80">
            WHM prototype, Stanford Web Services.{anyLive ? "" : " Sample data only."}
          </div>
        </footer>
      </body>
    </html>
  );
}
