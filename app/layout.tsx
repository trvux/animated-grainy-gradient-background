import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" });

const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ui\\trvux",
  description:
    "Explore production-ready, high-performance WebGL canvas shaders. Get dynamic fluid noise and animated mesh gradients optimized for 60 FPS interfaces.",
  keywords: [
    "WebGL shaders",
    "mesh gradient",
    "fluid noise",
    "generative art",
    "canvas animation",
    "Next.js background",
  ],
  openGraph: {
    title: "Next-Gen Generative Canvas Shaders & WebGL Backgrounds",
    description:
      "Explore production-ready, high-performance WebGL canvas shaders.",
    type: "website",
  },
  verification: {
    google: "ponuQUqXgwJ_xMwYUr6es897rZ0mKjBAeE-GQEM0Eh0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-serif",
        notoSerif.variable,
        interHeading.variable,
      )}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
