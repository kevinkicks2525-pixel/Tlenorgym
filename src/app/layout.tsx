import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Tlénor Gym — The Power To Build Your Body",
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
  openGraph: {
    title: "Tlénor Gym — The Power To Build Your Body",
    description:
      "Salle de sport premium à Draria. Équipement TechnoGym, coaching personnalisé et ambiance motivante.",
    type: "website",
    locale: "fr_DZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
