import { Inter } from "next/font/google";
import "./globals.css";
import LayoutRoot from "./components/LayoutRoot";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aquarium Sun",
  description: "Control your aquarium lights naturally",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0 }}>
        <LayoutRoot>{children}</LayoutRoot>
      </body>
    </html>
  );
}
