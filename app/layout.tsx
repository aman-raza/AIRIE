import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AIRIE AI Console",
  description: "Minimal, responsive frontend for AIRIE AI workflows",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
