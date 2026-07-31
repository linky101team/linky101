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
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-bg font-sans antialiased">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
