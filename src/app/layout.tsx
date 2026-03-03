import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADN, Vacío y Universo — Sistema Académico 3D",
  description:
    "Sistema académico 3D: ADN + metáfora del vacío + universo inspirado en Einstein (modelo didáctico)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
