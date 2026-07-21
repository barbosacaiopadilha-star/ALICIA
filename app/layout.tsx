import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const title = "Aliviar — A escolha do médico merece tanto cuidado quanto o tratamento";
const description =
  "Aliviar é a Curadoria Médica que ajuda você a escolher, com consciência, quem irá conduzir seu tratamento.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · Aliviar",
  },
  description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Aliviar",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
