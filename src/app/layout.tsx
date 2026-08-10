import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Tlénor Gym - The Power To Build Your Body",
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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
