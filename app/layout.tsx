import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing para Clínicas | U Can Marketing Digital",
  description:
    "Estratégia de aquisição, atendimento, vendas e mensuração para clínicas de estética, odontologia e massoterapia.",
  icons: {
    icon: "/estetica-saude/assets/ucan-logo-white.png",
    shortcut: "/estetica-saude/assets/ucan-logo-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="/estetica-saude/form-config.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
