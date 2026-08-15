import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tlenorgym.dz"),
  title: "Tlénor Gym - The Power To Build Your Body",
  description:
    "Salle de sport premium à Draria, Alger. Équipement TechnoGym professionnel, coaching personnalisé, compléments alimentaires et abonnements flexibles. Rejoignez 8000+ membres.",
  keywords: [
    "salle de sport draria",
    "gym alger",
    "tlenor gym",
    "musculation",
    "coaching sportif",
    "technogym",
    "compléments alimentaires",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Tlénor Gym - The Power To Build Your Body",
    description:
      "Salle de sport premium à Draria. Équipement TechnoGym, coaching personnalisé et ambiance motivante.",
    type: "website",
    locale: "fr_DZ",
    images: [
      {
        url: "/images/facade.jpg",
        width: 1200,
        height: 630,
        alt: "Tlénor Gym Salle de Sport Draria",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
