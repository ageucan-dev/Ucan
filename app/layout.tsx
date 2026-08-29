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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap"
        />
        <script src="/estetica-saude/form-config.js" defer />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const syncHeader = () => {
                  const header = document.querySelector('.ucan-official-header');
                  if (!header) return;
                  const scrolled = window.scrollY > 40;
                  header.classList.toggle('ucan-official-header--scrolled', scrolled);
                  header.classList.toggle('ucan-official-header--hero', !scrolled);
                };

                syncHeader();
                window.addEventListener('scroll', syncHeader, { passive: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
