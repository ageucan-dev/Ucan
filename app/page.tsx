"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardCheck,
  Crosshair,
  MapPin,
  MessageCircle,
  MousePointer2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const basePath = "/negocios-locais";
const WHATSAPP_NUMBER = "5516991760422";

const segments = [
  "Advocacia",
  "Clínica de estética",
  "Clínica médica",
  "Clínica odontológica",
  "Outro negócio local",
];

const challenges = [
  "Quero atrair mais contatos",
  "Recebo contatos, mas poucos avançam",
  "Não sei o que os anúncios estão trazendo",
  "Ainda não anuncio",
  "Outro momento",
];

function pushEvent(event: string, details: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...details });
}


function navigateToSection(event: { preventDefault: () => void }, sectionId: string) {
  event.preventDefault();
  const target = document.getElementById(sectionId);
  if (!target) return;

  window.history.replaceState(null, "", `#${sectionId}`);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createEventId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `ucan_lp_${window.crypto.randomUUID()}`;
  }
  return `ucan_lp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function TrackingBridge() {
  useEffect(() => {
    const keys = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "utm_id", "gclid", "gbraid", "wbraid", "fbclid", "msclkid",
    ];
    const params = new URLSearchParams(window.location.search);
    const current: Record<string, string> = {};
    keys.forEach((key) => {
      const value = params.get(key);
      if (value) current[key] = value;
    });

    const storageKey = "ucan_local_lead_attribution_v1";
    let stored: Record<string, Record<string, string>> = {};
    try {
      stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      stored = {};
    }

    const touch = {
      ...current,
      landing_page: window.location.href,
      referrer: document.referrer || "",
      captured_at: new Date().toISOString(),
    };
    if (!stored.first_touch) stored.first_touch = touch;
    if (Object.keys(current).length || !stored.last_touch) stored.last_touch = touch;

    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch {
      // A página continua funcionando quando o armazenamento está indisponível.
    }

    pushEvent("tracking_context_ready", {
      form_name: "negocios_locais",
      tracking: {
        first_touch: stored.first_touch,
        last_touch: stored.last_touch,
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_referrer: document.referrer || "",
      },
    });

    const handleWhatsAppClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href*="wa.me/"]');
      if (!link) return;
      pushEvent("whatsapp_click", {
        form_name: "negocios_locais",
        cta_location: link.dataset.location || "page",
      });
    };
    document.addEventListener("click", handleWhatsAppClick);
    return () => document.removeEventListener("click", handleWhatsAppClick);
  }, []);

  return null;
}

function LeadForm() {
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  function markStarted() {
    if (started) return;
    setStarted(true);
    pushEvent("lead_form_start", { form_name: "negocios_locais" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("nome") || "").trim();
    const phone = String(formData.get("telefone") || "").trim();
    const segment = String(formData.get("segmento") || "").trim();
    const city = String(formData.get("cidade") || "").trim();
    const challenge = String(formData.get("desafio") || "").trim();
    const consent = formData.get("consentimento") === "on";

    if (!name || !phone || !segment || !consent) {
      setStatus("error");
      setError("Preencha nome, WhatsApp e segmento e autorize o contato para continuar.");
      return;
    }

    setStatus("idle");
    setError("");
    const eventId = createEventId();
    const eventTime = Math.floor(Date.now() / 1000);
    const eventDetails = {
      form_name: "negocios_locais",
      segment,
      destination: "whatsapp",
      event_id: eventId,
      event_time: eventTime,
    };

    pushEvent("lead_form_submit", eventDetails);
    pushEvent("generate_lead", eventDetails);

    const business = segment === "Advocacia"
      ? "Atuo na advocacia"
      : segment === "Outro negócio local"
        ? "Tenho um negócio local"
        : `Tenho uma ${segment.toLowerCase()}`;
    const challengeMessage = challenge === "Outro momento"
      ? "Posso contar mais sobre meu momento por aqui."
      : challenge
        ? `${challenge}.`
        : "";

    const message = [
      `Oi, tudo bem? Sou ${name} e cheguei pelo site da U Can.`,
      `${business}${city ? ` em ${city}` : ""}.`,
      challengeMessage,
      "Queria conversar sobre como melhorar minha captação. Podemos falar por aqui?",
    ].filter(Boolean).join("\n\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    let redirected = false;
    const redirect = () => {
      if (redirected) return;
      redirected = true;
      window.location.assign(whatsappUrl);
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_form_whatsapp",
      ...eventDetails,
      eventCallback: redirect,
      eventTimeout: 1000,
    });
    window.setTimeout(redirect, 1200);
  }

  return (
    <form id="diagnostico" onSubmit={handleSubmit} onFocus={markStarted} className="space-y-4">
      <div className="mb-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e9fbf5] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#087d5b]">
          <ClipboardCheck className="size-4" /> Conversa inicial
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#10172a] sm:text-3xl">Vamos olhar para o seu cenário?</h2>
        <p className="mt-2 text-sm leading-6 text-[#657087]">Conte o básico. A conversa continua no WhatsApp, sem compromisso.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-semibold text-[#273149]">
          Seu nome
          <input name="nome" autoComplete="name" required maxLength={80} placeholder="Como podemos chamar você?" className="h-12 w-full rounded-xl border border-[#dce2ea] bg-white px-3.5 font-normal outline-none transition focus:border-[#08a979] focus:ring-4 focus:ring-[#08a979]/10" />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#273149]">
          WhatsApp
          <input name="telefone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={24} placeholder="(00) 00000-0000" className="h-12 w-full rounded-xl border border-[#dce2ea] bg-white px-3.5 font-normal outline-none transition focus:border-[#08a979] focus:ring-4 focus:ring-[#08a979]/10" />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-[#273149]">
        Qual é o seu segmento?
        <select name="segmento" required defaultValue="" className="h-12 w-full rounded-xl border border-[#dce2ea] bg-white px-3.5 font-normal outline-none transition focus:border-[#08a979] focus:ring-4 focus:ring-[#08a979]/10">
          <option value="" disabled>Selecione uma opção</option>
          {segments.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>

      <details className="group rounded-xl border border-[#e3e7ed] bg-[#fbfcfd]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-[#38445b]">
          Adicionar cidade e principal desafio <span className="text-xs font-normal text-[#8490a4]">opcional</span>
          <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-3 border-t border-[#e8ebf0] p-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-[#273149]">
            Cidade
            <input name="cidade" autoComplete="address-level2" maxLength={80} placeholder="Ex.: Franca, SP" className="h-11 w-full rounded-lg border border-[#dce2ea] bg-white px-3 text-sm font-normal outline-none focus:border-[#08a979]" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-[#273149]">
            Principal desafio
            <select name="desafio" defaultValue="" className="h-11 w-full rounded-lg border border-[#dce2ea] bg-white px-3 text-sm font-normal outline-none focus:border-[#08a979]">
              <option value="">Prefiro contar no WhatsApp</option>
              {challenges.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </details>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f5f7f9] p-3.5 text-xs leading-5 text-[#68748a]">
        <input type="checkbox" name="consentimento" required className="mt-0.5 size-4 shrink-0 accent-[#08a979]" />
        <span>Autorizo a U Can a entrar em contato sobre esta solicitação. Meus dados serão usados para atendimento comercial.</span>
      </label>

      {error && <p role="alert" className="rounded-xl bg-[#fff0ef] px-4 py-3 text-sm text-[#a8332a]">{error}</p>}

      <button type="submit" className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#08a979] px-5 text-base font-bold text-white shadow-[0_12px_28px_rgba(8,169,121,.2)] transition hover:-translate-y-0.5 hover:bg-[#078e67] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087d5b]">
        Quero conversar sobre minha captação <ArrowRight className="size-5 transition group-hover:translate-x-1" />
      </button>
      <p className="text-center text-xs text-[#8791a3]">Ao enviar, o WhatsApp abre com uma mensagem pronta para você revisar.</p>
    </form>
  );
}

const faqs = [
  {
    question: "A U Can atende somente clínicas?",
    answer: "Não. A U Can estrutura aquisição e mensuração para negócios locais. A página apresenta exemplos de advocacia e clínicas, mas o melhor caminho depende do segmento, da região e da oferta de cada empresa.",
  },
  {
    question: "Preciso já anunciar no Google?",
    answer: "Não. A conversa inicial serve para entender o momento do negócio, a demanda de busca e o que precisa estar pronto antes de investir em mídia.",
  },
  {
    question: "A U Can garante quantidade de leads ou vendas?",
    answer: "Não prometemos um volume ou resultado garantido. A performance depende de fatores como oferta, região, verba, concorrência, página e atendimento comercial. O trabalho é acompanhar esses pontos e tomar decisões com dados.",
  },
  {
    question: "O investimento em anúncios está incluído?",
    answer: "Não. A verba de mídia é paga pelo cliente diretamente às plataformas e não está incluída na mensalidade dos serviços.",
  },
];

function BrandMark() {
  return (
    <a href="#topo" onClick={(event) => navigateToSection(event, "topo")} className="flex items-center gap-3" aria-label="U Can Marketing Digital">
      <img src={`${basePath}/assets/ucan-logo-white.png`} alt="" className="size-11 object-contain" />
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold tracking-[0.1em] text-white">U CAN</span>
        <span className="block text-[11px] font-medium tracking-wide text-white/65">Marketing Digital</span>
      </span>
    </a>
  );
}

function PipelineVisual() {
  const steps = [
    ["01", "Busca com intenção", "A pessoa procura uma solução"],
    ["02", "Página que orienta", "Oferta clara e próximo passo"],
    ["03", "Conversa no WhatsApp", "Contato com contexto"],
    ["04", "Dados & Atendimento", "leitura para melhoria dos resultados"],
  ];

  return (
    <div className="mx-auto w-full max-w-[500px] border-l border-white/15 pl-6 sm:pl-9">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#5de0ba]">Uma operação conectada</p>
      <h2 className="mt-3 max-w-sm font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">Cada etapa precisa levar à próxima.</h2>
      <ol className="mt-8">
        {steps.map(([number, title, subtitle]) => (
          <li key={number} className="grid grid-cols-[3.25rem_1fr] gap-3 border-t border-white/15 py-4">
            <span className="font-mono text-xs text-[#5de0ba]">{number}</span>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-6 text-white/55">{subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 max-w-sm text-xs leading-5 text-white/45">O percurso é ajustado ao serviço, à região e à forma de atendimento de cada negócio.</p>
    </div>
  );
}

function ClientLogos() {
  const clients = [
    ["G&S Advogados", "g-s-advogados.svg"],
    ["Top Locações", "top-locacoes.svg"],
    ["KNN Idiomas", "knn.png"],
    ["H.C. Diesel by Hiper Center", "hiper-center.svg"],
    ["Mega Marca", "mega-marca.svg"],
    ["CCS Advocacia", "ccs-advocacia.svg"],
  ];

  return (
    <section aria-label="Marcas atendidas em projetos" className="overflow-hidden bg-[#0a1021] py-8 text-white sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <p className="mb-7 text-center text-[11px] font-medium uppercase tracking-[.2em] text-white/55">Marcas de projetos atendidos pela U Can</p>
      </div>
      <div className="client-marquee relative">
        <div className="client-marquee__track flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-12 px-6 sm:gap-20 sm:px-10">
              {clients.map(([name, image]) => (
                <div key={name} className="flex h-20 w-48 shrink-0 items-center justify-center px-2 sm:w-56">
                  <img
                    src={basePath + "/assets/clients/" + image}
                    alt={copy === 0 ? name : ""}
                    loading="lazy"
                    className={image === "knn.png" ? "max-h-full max-w-full object-contain" : "client-logo-artwork max-h-full max-w-full object-contain"}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChannelPlatforms() {
  const channels = [["Google Ads", "google-ads.svg"], ["Meta Ads", "meta-ads.svg"], ["LinkedIn Ads", "linkedin-ads.svg"], ["TikTok Ads", "tiktok-ads.svg"]];
  return <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#078e67]">Canais de aquisição</p><h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-.035em] text-[#10172a] sm:text-4xl">A estratégia começa pelo público e pela intenção.</h2><p className="mt-4 max-w-xl leading-7 text-[#657087]">A plataforma entra depois de entender o objetivo, a região e o comportamento de busca. A execução depende do escopo definido para cada negócio.</p></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{channels.map(([name, image]) => <div key={name} className="flex h-20 items-center justify-center px-2"><img src={basePath + "/assets/channels/" + image} alt={name} loading="lazy" className="channel-logo-artwork max-h-full max-w-[170px] object-contain" /></div>)}</div></div></section>;
}

function HistoricalDashboard() {
  const metrics = [
    { value: "R$ 10 mi+", label: "Investimento em anúncios", tone: "text-[#147d64]", accent: "border-t-[#18a87b]" },
    { value: "520.833", label: "Contatos gerados", tone: "text-[#4f46a5]", accent: "border-t-[#7568d8]" },
    { value: "8,7", label: "Retorno médio sobre investimento", tone: "text-[#a34c19]", accent: "border-t-[#e48a45]" },
    { value: "R$ 6.578", label: "Investimento médio por cliente", tone: "text-[#1769a1]", accent: "border-t-[#4a9bd1]" },
  ];

  const charts = [
    {
      title: "Investimento em anúncios",
      value: "R$ 10 mi+",
      labels: ["R$ 10 mi+", "R$ 7,5 mi", "R$ 5 mi", "R$ 2,5 mi", "R$ 0"],
      height: "96%",
      color: "from-[#16a77a]/45 to-[#55d7ad]/85",
      summary: "Total informado · histórico parcial",
    },
    {
      title: "Contatos gerados",
      value: "520.833",
      labels: ["600 mil", "450 mil", "300 mil", "150 mil", "0"],
      height: "87%",
      color: "from-[#6c5dd3]/45 to-[#a497ff]/85",
      summary: "Total acumulado informado",
    },
  ];

  return (
    <section className="bg-[#edf1f4] px-4 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden border border-[#d8dee7] bg-[#f7f9fb] shadow-[0_16px_50px_rgba(23,36,55,.08)]">
        <header className="flex flex-col gap-4 bg-[#111a2b] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-3">
            <img src={basePath + "/assets/ucan-logo-white.png"} alt="" className="size-9 object-contain" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/55">U Can · relatório de performance</p>
              <h2 className="mt-1 font-display text-lg font-semibold sm:text-xl">Visão histórica consolidada</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/75">
            <span className="border border-white/15 px-3 py-2">Período · histórico disponível</span>
            <span className="border border-white/15 px-3 py-2">Dados agregados</span>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-7 sm:py-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#657087]">Indicadores principais</p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-[#19243a]">Aquisição e resultado</h3>
            </div>
            <p className="text-xs text-[#738095]">Os valores refletem os dados históricos disponíveis.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className={"min-h-[132px] border border-[#dfe4ea] border-t-[3px] bg-white p-4 shadow-[0_2px_8px_rgba(24,39,58,.04)] " + metric.accent}>
                <p className="text-xs font-medium leading-5 text-[#5d687a]">{metric.label}</p>
                <p className={"mt-3 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem] " + metric.tone}>{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:grid lg:grid-cols-2">
            {charts.map((chart, index) => (
              <article key={chart.title} className="border border-[#dfe4ea] bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 border-b border-[#edf0f3] pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#253148]">{chart.title}</h4>
                    <p className="mt-1 text-[11px] text-[#7a8596]">{chart.summary}</p>
                  </div>
                  <span className="font-display text-sm font-semibold text-[#253148]">{chart.value}</span>
                </div>
                <div className="mt-4 grid grid-cols-[58px_1fr] gap-2">
                  <div className="flex h-44 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-[#8a95a4]" aria-hidden="true">
                    {chart.labels.map((label) => <span key={label}>{label}</span>)}
                  </div>
                  <div className="relative h-44">
                    <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((line) => <span key={line} className="border-t border-[#e6eaf0]" />)}
                    </div>
                    <div className="absolute inset-x-0 bottom-5 top-0 flex items-end justify-center">
                      <div className={"relative w-[22%] min-w-12 overflow-hidden border border-white/70 bg-gradient-to-t " + chart.color} style={{ height: chart.height }}>
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="absolute inset-y-0 left-1/3 w-px bg-white/25" />
                      </div>
                    </div>
                    <p className="absolute inset-x-0 bottom-0 text-center text-[10px] font-medium text-[#7b8797]">{index === 0 ? "Investimento consolidado" : "Contatos acumulados"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStepCard({
  title,
  summary,
  detail,
}: {
  title: string;
  summary: string;
  detail: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const detailId = `process-step-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <article className="relative border-t-2 border-[#0a1021] pt-4 pb-5 sm:pb-6">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={detailId}
        onClick={() => setIsOpen((open) => !open)}
        className="group block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#08a979]"
      >
        <span className="mt-1 flex items-center justify-between gap-3 pr-8">
          <span className="font-display text-lg font-bold text-[#10172a]">{title}</span>
          <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-[#758196] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </span>
        <span className="mt-2 block text-sm leading-6 text-[#697488]">{summary}</span>
        <span className="mt-3 block text-xs font-semibold text-[#087d5b]">{isOpen ? "Fechar resumo" : "Clique para saber mais"}</span>
      </button>
      {isOpen && (
        <div id={detailId} role="region" aria-label={`Resumo: ${title}`} className="mt-3 border-l-2 border-[#08a979] pl-3 text-sm leading-6 text-[#4f5c70]">
          {detail}
        </div>
      )}
    </article>
  );
}

export default function Home() {
  return (
    <main id="topo" className="min-h-screen bg-[#f7f8f6] font-sans text-[#10172a]">
      <TrackingBridge />
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <BrandMark />
          <a href="#contato" onClick={(event) => { navigateToSection(event, "contato"); pushEvent("cta_click", { cta_location: "header" }); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-5">
            <span className="hidden sm:inline">Entender meu cenário</span><span className="sm:hidden">Falar com a U Can</span><ArrowDownRight className="size-4" />
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#0a1021] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_5%,rgba(104,62,205,.27),transparent_37%),radial-gradient(ellipse_at_87%_64%,rgba(0,213,157,.14),transparent_34%)]" />
        <div className="mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:grid-cols-[1.04fr_.96fr] lg:gap-16 lg:px-10 lg:pt-32">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#72dfbf]">Aquisição e performance para negócios locais</p>
            <h1 className="mt-7 font-display text-[2.7rem] font-bold leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-[4.1rem]">
              <span>O cliente ideal te procura na Internet</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#bdc5d4] sm:text-lg sm:leading-8">
              A U Can conecta anúncio, página, WhatsApp e Dados para o seu negócio local transformar procura em conversas comerciais em vendas e retornos precisáveis.
            </p>
            <p className="mt-7 border-l-2 border-[#4ce0b4] pl-4 text-sm leading-6 text-white/70">Experiência com advocacia, saúde, serviços e outros negócios locais.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#contato" onClick={(event) => { navigateToSection(event, "contato"); pushEvent("cta_click", { cta_location: "hero_primary" }); }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#08a979] px-6 text-sm font-bold text-white shadow-[0_15px_34px_rgba(8,169,121,.22)] transition hover:-translate-y-0.5 hover:bg-[#078e67]">
                Quero analisar minha captação <ArrowRight className="size-4" />
              </a>
              <a href="#como-funciona" onClick={(event) => { navigateToSection(event, "como-funciona"); pushEvent("cta_click", { cta_location: "hero_secondary" }); }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]">
                Ver como funciona <ArrowDownRight className="size-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-white/45">Uma conversa para entender o cenário. Sem promessa de resultado pronto.</p>
          </div>
          <PipelineVisual />
        </div>
        <div className="border-t border-white/[0.08]">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-10">
            {[
              [Search, "Intenção", "Encontrar quem já está procurando"],
              [MessageCircle, "Contato", "Deixar o próximo passo simples"],
              [BarChart3, "Mensuração", "Entender o que acontece depois do clique"],
            ].map(([Icon, title, text]) => {
              const IconComponent = Icon as typeof Search;
              return <div key={String(title)} className="flex items-center gap-3"><span className="grid size-10 place-items-center text-[#58dfb7]"><IconComponent className="size-5" /></span><div><p className="text-sm font-bold text-white">{String(title)}</p><p className="mt-0.5 text-xs text-white/50">{String(text)}</p></div></div>;
            })}
          </div>
        </div>
      </section>

      <ClientLogos />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#078e67]">O que muda</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-.035em] text-[#10172a] sm:text-4xl">Mais do que colocar anúncios no ar.</h2>
          <p className="mt-5 leading-7 text-[#657087]">Quando anúncio, página e atendimento trabalham separados, fica difícil saber onde os contatos se perdem. A operação precisa olhar o caminho inteiro.</p>
          <a href="#contato" onClick={(event) => { navigateToSection(event, "contato"); pushEvent("cta_click", { cta_location: "what_changes" }); }} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#087d5b] hover:text-[#055f45]">Vamos conversar sobre esse caminho <ArrowRight className="size-4" /></a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [Target, "A oferta", "Ajuste de mensagem ao que sua empresa realmente vende."],
            [MousePointer2, "A chegada", "Página ou WhatsApp com um próximo passo claro."],
            [MessageCircle, "O atendimento", "Contexto para a equipe dar sequência ao contato."],
            [TrendingUp, "A leitura", "Indicadores para identificar avanços e gargalos."],
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Target;
            return <article key={String(title)} className="border-t border-[#dfe5df] py-5 sm:py-6"><IconComponent className="size-5 text-[#08a979]" /><h3 className="mt-4 font-display text-lg font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[#6a7486]">{String(text)}</p></article>;
          })}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-10 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#078e67]">Um processo conectado</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-.035em] sm:text-4xl">Do primeiro clique à conversa comercial.</h2>
            <p className="mt-4 leading-7 text-[#657087]">O trabalho começa entendendo o negócio, a região e a capacidade de atendimento. Depois, cada etapa é estruturada para fazer sentido junto.</p>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-5 md:grid-cols-4">
            {[
              {
                title: "Entender",
                summary: "Oferta, público, região e momento da empresa.",
                detail: "Mapeamos o que sua empresa oferece, quem deseja atrair, onde atende e como funciona o atendimento hoje. Isso ajuda a definir prioridades antes de investir em mídia.",
              },
              {
                title: "Estruturar",
                summary: "Anúncio, página e caminho de conversão.",
                detail: "Organizamos a mensagem, o canal e o próximo passo. Quando fizer parte do escopo, preparamos a página e os pontos de contato para que anúncio e atendimento sigam a mesma direção.",
              },
              {
                title: "Acompanhar",
                summary: "Contato, atendimento e dados disponíveis.",
                detail: "Acompanhamos os indicadores que foram configurados e observamos como os contatos avançam. Assim fica mais fácil identificar etapas que precisam de atenção.",
              },
              {
                title: "Otimizar",
                summary: "Decisões a partir do que a operação mostra.",
                detail: "Usamos os dados disponíveis para orientar ajustes em campanhas, páginas e processos de contato. As mudanças são feitas conforme o cenário e os sinais observados.",
              },
            ].map((step) => <ProcessStepCard key={step.title} {...step} />)}
          </div>
        </div>
      </section>

      <HistoricalDashboard />

      <ChannelPlatforms />

      <section className="bg-[#0a1021] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:px-10">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#58dfb7]">Para cada negócio, um contexto</p><h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl">Estratégia começa pelas particularidades.</h2><p className="mt-4 leading-7 text-white/60">Uma clínica e um escritório de advocacia não têm a mesma jornada, oferta ou regra de comunicação. A análise considera o que muda em cada operação.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Advocacia", "Busca local, área de atuação e comunicação profissional."], ["Estética e saúde", "Procedimentos, agenda e regras específicas de divulgação."], ["Odontologia e medicina", "Especialidades, região e capacidade de atendimento."], ["Outros negócios locais", "Demanda, oferta, sazonalidade e percurso até a venda."]].map(([title, text]) => <div key={title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"><MapPin className="mt-0.5 size-4 shrink-0 text-[#58dfb7]" /><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/55">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:px-10">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#078e67]">Perguntas frequentes</p><h2 className="mt-4 font-display text-3xl font-bold tracking-[-.035em] sm:text-4xl">Antes de começar a conversa.</h2><p className="mt-4 leading-7 text-[#657087]">Se o seu cenário tiver algum detalhe específico, pode contar no WhatsApp depois de enviar o formulário.</p></div>
          <div className="divide-y divide-[#e7ebe7] border-y border-[#e7ebe7]">
            {faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-sm font-bold text-[#202a40] sm:text-base">{faq.question}<ChevronDown className="size-4 shrink-0 text-[#68748a] transition group-open:rotate-180" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[#697488]">{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="scroll-mt-8 bg-[#f1f4f1] py-16 sm:py-24" id="contato">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10">
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#078e67]">Próximo passo</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl">Vamos entender se faz sentido para o seu negócio?</h2>
            <p className="mt-5 max-w-lg leading-7 text-[#657087]">Responda três itens rápidos. O WhatsApp abre com uma mensagem pronta, que você pode revisar antes de enviar.</p>
            <ul className="mt-7 space-y-3 text-sm text-[#4d5a70]">
              {["Sem apresentação longa", "Sem compromisso de contratação", "A conversa começa pelo seu cenário"].map((item) => <li key={item} className="flex items-center gap-2.5"><Check className="size-4 text-[#08a979]" />{item}</li>)}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-[#e3e8e2] bg-white p-5 shadow-[0_20px_60px_rgba(20,35,27,.08)] sm:p-8">
            <LeadForm />
          </div>
        </div>
      </section>

      <footer className="bg-[#070c18] px-5 py-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div><BrandMark /><p className="mt-4 max-w-sm text-sm leading-6 text-white/50">Aquisição, conversão e mensuração para negócios locais.</p></div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/55">
            <a href="https://ucanmkt.com.br/" className="hover:text-white">Site da U Can</a>
            <a href="mailto:digital@ucanmkt.com.br" className="hover:text-white">digital@ucanmkt.com.br</a>
            <a href="https://wa.me/5516991760422" data-location="footer" target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/35">© 2026 U Can Marketing Digital. Todos os direitos reservados.</div>
      </footer>

      <a href="#contato" onClick={(event) => { navigateToSection(event, "contato"); pushEvent("cta_click", { cta_location: "floating_mobile" }); }} className="fixed inset-x-4 bottom-4 z-30 flex min-h-12 items-center justify-center gap-2 bg-[#08a979] px-5 text-sm font-bold text-white shadow-lg sm:hidden">
        Quero conversar <ArrowRight className="size-4" />
      </a>
    </main>
  );
}
