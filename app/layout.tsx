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
  return (
    <html lang="en">
      <body className="bg-bg font-sans antialiased lg:flex lg:min-h-screen lg:items-center lg:justify-center lg:gap-12 lg:p-8" style={{ background: "linear-gradient(160deg, #64B5F6, #E1F5FE)" }}>
        <div className="hidden text-center lg:block">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#0D1B2A] drop-shadow-lg">
            LinkY<span className="text-[#FFD93D]">101</span>
          </h1>
          <p className="mt-2 max-w-xs text-sm font-semibold text-white/90">
            Your professional network, before LinkedIn.
          </p>
          <p className="mt-1 max-w-xs text-xs text-white/75">
            Learn real skills. Connect with mentors. Launch your ideas.
          </p>
        </div>

        {/*
          The `lg:transform` below isn't decorative — per the CSS spec, an
          element with a `transform` becomes the containing block for any
          `position: fixed` descendant. That's what keeps the bottom nav,
          modals, and the Linky AI bubble anchored to this phone frame on
          desktop instead of escaping to the real browser window edges.
        */}
        {/*
          overflow-y-auto lives on the INNER div, not this one. If this outer
          (transformed) box scrolled its own content, any `position: fixed`
          descendant — nav, modals, the Linky AI bubble — would scroll away
          with the content instead of staying pinned, because a transformed
          ancestor that is ALSO the scroll container drags its fixed
          descendants along with the scroll (verified empirically — this is
          not how truly-fixed-to-viewport elements behave, but it is how
          fixed-relative-to-a-transformed-container elements behave once that
          same container scrolls itself). Keeping this outer box static
          (overflow-hidden, no scrolling of its own) and scrolling only the
          inner wrapper keeps fixed descendants correctly anchored to the
          phone frame at all times, regardless of scroll position.
        */}
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-bg lg:relative lg:min-h-0 lg:h-[min(860px,calc(100vh-4rem))] lg:overflow-hidden lg:rounded-[40px] lg:border-8 lg:border-white lg:shadow-2xl lg:[transform:translateZ(0)]">
          <div className="lg:h-full lg:w-full lg:overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
