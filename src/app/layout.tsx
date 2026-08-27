import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eAmericanEnglish Worker",
  description: "Shared production workspace for eAmericanEnglish",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
