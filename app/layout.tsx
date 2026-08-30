import type { Metadata } from "next";

import "./globals.css";
import "./footer.css";
import "./mobile-open.css";

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
        <header className="ucan-official-header ucan-official-header--hero" data-layout-header>
          <div className="ucan-official-header__inner">
            <a href="#topo" className="ucan-official-header__brand" aria-label="U Can Marketing Digital">
              <span className="ucan-official-header__symbol">
                <img src="/estetica-saude/assets/ucan-logo-white.png" alt="" />
              </span>
              <span className="ucan-official-header__copy">
                <span className="ucan-official-header__name">U CAN</span>
                <span className="ucan-official-header__subtitle">Marketing Digital</span>
              </span>
            </a>

            <a
              href="https://wa.me/5516996396345"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Conversar com a U Can no WhatsApp"
              className="ucan-official-header__whatsapp"
            >
              <img src="/estetica-saude/assets/whatsapp.png" alt="" />
              <span className="ucan-official-header__whatsapp-label">Quero uma análise</span>
            </a>
          </div>
        </header>

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }

                const header = document.querySelector('[data-layout-header]');
                if (!header) return;

                const syncHeader = () => {
                  const scrolled = window.scrollY > 40;
                  header.classList.toggle('ucan-official-header--scrolled', scrolled);
                  header.classList.toggle('ucan-official-header--hero', !scrolled);
                };

                const openAtTop = () => {
                  if (!window.location.hash) {
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                  }
                  syncHeader();
                };

                requestAnimationFrame(openAtTop);
                window.addEventListener('load', openAtTop, { once: true });
                window.addEventListener('scroll', syncHeader, { passive: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
