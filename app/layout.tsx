import type { Metadata, Viewport } from "next";

import "./globals.css";
import "./footer.css";
import "./original-header.css";

export const metadata: Metadata = {
  title: "Marketing para Clínicas | U Can Marketing Digital",
  description:
    "Estratégia de aquisição, atendimento, vendas e mensuração para clínicas de estética, odontologia e massoterapia.",
  icons: {
    icon: "/estetica-saude/assets/ucan-logo-white.png",
    shortcut: "/estetica-saude/assets/ucan-logo-white.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const originalNavigation = [
  ["Home", "https://ucanmkt.com.br/#inicio"],
  ["Serviços", "https://ucanmkt.com.br/#servicos"],
  ["Planos", "https://ucanmkt.com.br/#plans"],
  ["Sobre", "https://ucanmkt.com.br/#sobre"],
  ["Contato", "https://ucanmkt.com.br/#final-cta"],
] as const;

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
        <header className="site-header site-header--hero" data-original-header>
          <div className="site-header__inner">
            <a
              className="site-header__logo"
              href="https://ucanmkt.com.br/#inicio"
              aria-label="Página inicial da U CAN"
            >
              <img
                src="/estetica-saude/assets/ucan-logo-white.png"
                width="1080"
                height="1080"
                alt="U CAN - estrutura de captação para negócios locais"
                decoding="async"
              />
            </a>

            <nav className="site-header__nav" aria-label="Navegação principal">
              {originalNavigation.map(([label, href]) => (
                <a key={label} href={href}>
                  {label}
                </a>
              ))}
            </nav>

            <a
              href="https://wa.me/5516996396543"
              className="site-header__cta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Solicitar diagnóstico pelo WhatsApp da U CAN"
            >
              Solicitar Diagnóstico
            </a>

            <a
              className="site-header__whatsapp-link"
              href="https://wa.me/5516996396543"
              target="_blank"
              rel="noreferrer"
              aria-label="Falar com a U CAN no WhatsApp"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12.04 3.5a8.43 8.43 0 0 0-7.16 12.87L4 20.5l4.22-.86A8.43 8.43 0 1 0 12.04 3.5Zm0 1.55a6.88 6.88 0 1 1 0 13.76 6.8 6.8 0 0 1-3.5-.96l-.24-.14-2.5.51.52-2.43-.16-.25a6.88 6.88 0 0 1 5.88-10.49Zm-2.6 3.45c-.14 0-.36.05-.55.27-.19.21-.72.7-.72 1.7 0 1 .74 1.98.84 2.12.1.14 1.43 2.29 3.55 3.12 1.76.7 2.12.56 2.5.53.39-.04 1.25-.51 1.42-1 .18-.49.18-.91.13-1-.05-.09-.2-.14-.42-.25-.23-.11-1.32-.65-1.52-.72-.2-.08-.35-.11-.5.11-.14.21-.57.72-.7.86-.13.15-.26.16-.49.06-.22-.12-.95-.35-1.81-1.12-.67-.6-1.12-1.34-1.25-1.57-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.43Z" />
              </svg>
            </a>
          </div>
        </header>

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const header = document.querySelector('[data-original-header]');
                if (!header) return;

                const syncHeader = () => {
                  const scrolled = window.scrollY > 40;
                  header.classList.toggle('site-header--scrolled', scrolled);
                  header.classList.toggle('site-header--hero', !scrolled);
                };

                syncHeader();
                window.addEventListener('scroll', syncHeader, { passive: true });
                window.addEventListener('pageshow', syncHeader, { passive: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
