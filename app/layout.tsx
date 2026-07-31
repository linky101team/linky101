import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "LinkY101 is a gamified networking and entrepreneurship platform for young people aged 13-18 — learn, connect, and launch your ideas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LinkY101",
    template: "%s · LinkY101",
  },
  description: DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LinkY101",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "LinkY101",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "LinkY101",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LinkY101",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B3E5FC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-bg font-sans antialiased lg:flex lg:min-h-screen lg:items-center lg:justify-center lg:gap-12 lg:p-8" style={{ background: "linear-gradient(160deg, #64B5F6, #E1F5FE)" }}>
        <div className="hidden text-center lg:block">
          <h1 className="text-5xl font-black uppercase tracking-wide text-white drop-shadow-lg">
            Link<span className="text-[#0D1B2A]">Y</span>101
          </h1>
          <p className="mt-2 max-w-xs text-sm font-bold text-white/90">
            The gamified app where teen entrepreneurs learn, connect, and launch their ideas.
          </p>
        </div>

        {/*
          The `lg:transform` below isn't decorative — per the CSS spec, an
          element with a `transform` becomes the containing block for any
          `position: fixed` descendant. That's what keeps the bottom nav,
          modals, and the Linky AI bubble anchored to this phone frame on
          desktop instead of escaping to the real browser window edges.
        */}
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-bg lg:min-h-0 lg:h-[860px] lg:overflow-y-auto lg:rounded-[40px] lg:border-8 lg:border-white lg:shadow-2xl lg:[transform:translateZ(0)]">
          {children}
        </div>
      </body>
    </html>
  );
}
