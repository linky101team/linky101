import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "LinkY101 is the professional network for young entrepreneurs aged 13-19 — learn real skills, connect with mentors, and launch your ideas.";

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
  // No more phone-frame mockup: on every screen size this is a real,
  // full-width web app. `(main)/layout.tsx` handles the responsive shell
  // (sidebar + dashboard on desktop, bottom tab bar on mobile) — this root
  // layout just provides the page background.
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-sans antialiased">{children}</body>
    </html>
  );
}
