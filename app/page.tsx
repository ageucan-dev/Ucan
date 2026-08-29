"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LineChart,
  ShieldCheck,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

declare global {
  interface Window {
    UCAN_FORM_ENDPOINT?: string;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const basePath = "/estetica-saude";

const segments = [
  "Clínica de estética",
  "Clínica odontológica",
  "Clínica de massoterapia",
  "Outra clínica de saúde",
];

const followerRanges = [
  "Até 5 mil seguidores",
  "De 5 mil a 10 mil seguidores",
  "De 10 mil a 50 mil seguidores",
  "Mais de 50 mil seguidores",
];

const revenueRanges = [
  "Até R$ 20 mil por mês",
  "De R$ 20 mil a R$ 50 mil por mês",
  "De R$ 50 mil a R$ 100 mil por mês",
  "De R$ 100 mil a R$ 250 mil por mês",
  "Acima de R$ 250 mil por mês",
];

const advertisingOptions = [
  "Sim, de forma contínua",
  "Sim, ocasionalmente",
  "Ainda não investe",
];

const originalSiteNavigation = [
  ["Home", "https://ucanmkt.com.br/#inicio"],
  ["Serviços", "https://ucanmkt.com.br/#servicos"],
  ["Cases", "https://ucanmkt.com.br/#cases"],
  ["Sobre", "https://ucanmkt.com.br/#sobre"],
  ["Contato", "https://ucanmkt.com.br/#final-cta"],
] as const;

const originalSiteContacts = [
  ["+55 16 99639-6543", "https://wa.me/5516996396543", true],
  ["@ucan_agencia", "https://www.instagram.com/ucan_agencia/", true],
  [
    "U CAN no Facebook",
    "https://www.facebook.com/profile.php?id=100090519185464&ref=PROFILE_EDIT_xav_ig_profile_page_web#",
    true,
  ],
  ["digital@ucanmkt.com.br", "mailto:digital@ucanmkt.com.br", false],
] as const;

type FormStatus = "idle" | "submitting" | "success" | "error";

function pushEvent(event: string, details: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...details });
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function FormSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onValueChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-[#e8edf7]">
        {label}
      </label>
      <input type="hidden" name={id} value={value} />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="h-12 w-full rounded-xl border-[#2c3855] bg-[#0d1426] px-4 text-left text-[15px] text-[#f8fafc] shadow-none focus:ring-[#00eca6]/30"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-[#2c3855] bg-[#11182c] text-[#f8fafc]">
          {options.map((option) => (
            <SelectItem key={option} value={option} className="py-2.5 focus:bg-[#19233b] focus:text-[#00eca6]">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LeadForm() {
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState("");
  const [followers, setFollowers] = useState("");
  const [revenue, setRevenue] = useState("");
  const [advertising, setAdvertising] = useState("");
  const [consent, setConsent] = useState(false);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  function markStarted() {
    if (started) return;
    setStarted(true);
    pushEvent("lead_form_start", { form_name: "estetica_saude" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!segment || !followers || !revenue || !advertising || !consent) {
      setStatus("error");
      setMessage("Preencha as opções de qualificação e confirme a autorização de contato.");
      return;
    }

    const endpoint = window.UCAN_FORM_ENDPOINT?.trim();
    if (!endpoint) {
      setStatus("error");
      setMessage("O formulário está pronto, mas o destino dos contatos ainda precisa ser conectado.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    pushEvent("lead_form_submit", { form_name: "estetica_saude", segment });

    try {
      const formData = new FormData(form);
      formData.set("segmento", segment);
      formData.set("seguidores", followers);
      formData.set("faturamento", revenue);
      formData.set("investe_publicidade", advertising);
      formData.set("consentimento", "Sim");
      formData.set("pagina", window.location.href);
      formData.set("data_envio", new Date().toISOString());

      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(
        (key) => formData.set(key, params.get(key) || ""),
      );

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setStatus("success");
      setMessage("Recebemos seus dados. A equipe da U Can entrará em contato após analisar o perfil da clínica.");
      pushEvent("lead_form_success", { form_name: "estetica_saude", segment });
      form.reset();
      setPhone("");
      setSegment("");
      setFollowers("");
      setRevenue("");
      setAdvertising("");
      setConsent(false);
    } catch {
      setStatus("error");
      setMessage("Não foi possível enviar agora. Revise sua conexão e tente novamente.");
      pushEvent("lead_form_error", { form_name: "estetica_saude" });
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center text-center" aria-live="polite">
        <div className="mb-6 grid size-16 place-items-center rounded-full bg-[#0d3b34] text-[#00eca6]">
          <CheckCircle2 className="size-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#00eca6]">Formulário enviado</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f8fafc]">Agora vamos analisar sua clínica.</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-[#a8b1c4]">{message}</p>
        <Button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 h-11 rounded-full bg-[#00eca6] px-6 font-bold text-[#06121a] hover:bg-[#00d999]"
        >
          Enviar outro contato
        </Button>
      </div>
    );
  }

  return (
    <form id="diagnostico" onSubmit={handleSubmit} onFocus={markStarted} className="scroll-mt-24">
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#102c2c] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#00eca6]">
          <ShieldCheck className="size-4" />
          Análise de perfil
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#f8fafc]">Vamos entender o momento da sua clínica.</h2>
        <p className="mt-3 text-sm leading-6 text-[#a8b1c4]">
          Leva menos de 2 minutos. As informações ajudam a equipe a preparar um diagnóstico mais objetivo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-semibold text-[#e8edf7]">Nome</label>
          <Input id="nome" name="nome" required autoComplete="name" placeholder="Como podemos chamar você?" className="h-12 rounded-xl border-[#2c3855] bg-[#0d1426] px-4 text-[15px] text-[#f8fafc] shadow-none placeholder:text-[#6f7b94] focus-visible:ring-[#00eca6]/30" />
        </div>
        <div className="space-y-2">
          <label htmlFor="telefone" className="text-sm font-semibold text-[#e8edf7]">Telefone</label>
          <Input id="telefone" name="telefone" required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(16) 99999-9999" className="h-12 rounded-xl border-[#2c3855] bg-[#0d1426] px-4 text-[15px] text-[#f8fafc] shadow-none placeholder:text-[#6f7b94] focus-visible:ring-[#00eca6]/30" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-[#e8edf7]">E-mail</label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@clinica.com.br" className="h-12 rounded-xl border-[#2c3855] bg-[#0d1426] px-4 text-[15px] text-[#f8fafc] shadow-none placeholder:text-[#6f7b94] focus-visible:ring-[#00eca6]/30" />
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="empresa" className="text-sm font-semibold text-[#e8edf7]">Nome da clínica ou empresa</label>
        <Input id="empresa" name="empresa" required autoComplete="organization" placeholder="Nome da sua empresa" className="h-12 rounded-xl border-[#2c3855] bg-[#0d1426] px-4 text-[15px] text-[#f8fafc] shadow-none placeholder:text-[#6f7b94] focus-visible:ring-[#00eca6]/30" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormSelect id="segmento" label="Segmento" placeholder="Selecione o segmento" value={segment} options={segments} onValueChange={setSegment} />
        <FormSelect id="seguidores" label="Seguidores da clínica" placeholder="Selecione uma faixa" value={followers} options={followerRanges} onValueChange={setFollowers} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormSelect id="faturamento" label="Faturamento mensal" placeholder="Selecione uma faixa" value={revenue} options={revenueRanges} onValueChange={setRevenue} />
        <FormSelect id="investe_publicidade" label="Investe em publicidade?" placeholder="Selecione uma opção" value={advertising} options={advertisingOptions} onValueChange={setAdvertising} />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#0d1426] p-4">
        <Checkbox id="consentimento" checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-0.5 border-[#6f7b94] data-[state=checked]:border-[#00eca6] data-[state=checked]:bg-[#00eca6] data-[state=checked]:text-[#06121a]" />
        <label htmlFor="consentimento" className="cursor-pointer text-xs leading-5 text-[#9eabc1]">
          Autorizo a U Can Marketing Digital a entrar em contato para analisar minha solicitação. Meus dados serão utilizados somente para atendimento comercial.
        </label>
      </div>

      {message && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-[#3a151c] text-[#ffb4c0]" : "bg-[#102c2c] text-[#00eca6]"}`} aria-live="polite">
          {message}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="mt-5 h-14 w-full rounded-xl bg-[#00eca6] text-base font-bold text-[#06121a] shadow-[0_14px_34px_rgba(0,236,166,0.2)] transition hover:-translate-y-0.5 hover:bg-[#00d999] disabled:translate-y-0">
        {status === "submitting" ? "Enviando..." : "Solicitar diagnóstico estratégico"}
        {status !== "submitting" && <ArrowRight className="ml-2 size-5" />}
      </Button>
      <p className="mt-3 text-center text-xs text-[#8995ab]">A solicitação passa por uma análise antes do contato.</p>
    </form>
  );
}

function OriginalFooter() {
  return (
    <footer className="ucan-original-footer">
      <div className="ucan-original-footer__inner">
        <div className="ucan-original-footer__columns">
          <div className="ucan-original-footer__brand">
            <a href="https://ucanmkt.com.br/#inicio" aria-label="Página inicial da U CAN">
              <img
                className="ucan-original-footer__logo"
                src={`${basePath}/assets/ucan-logo-white.png`}
                alt="U CAN Marketing Digital"
                loading="lazy"
                decoding="async"
              />
            </a>
            <p>Estruturas de captação para negócios locais crescerem com mais controle, dados e previsibilidade.</p>
          </div>

          <nav className="ucan-original-footer__column" aria-label="Navegação do rodapé">
            <h2>Navegação</h2>
            {originalSiteNavigation.map(([label, href]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>

          <div className="ucan-original-footer__column" aria-label="Canais de contato">
            <h2>Contato</h2>
            {originalSiteContacts.map(([display, href, external]) => (
              <a
                key={display}
                className="ucan-original-footer__contact-item"
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {display}
              </a>
            ))}
          </div>
        </div>

        <div className="ucan-original-footer__bottom">
          <p>© 2026 U CAN Marketing Digital. Todos os direitos reservados.</p>
          <p>Desenvolvido para performance local.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0a1021] text-[#f8fafc]">
      <header className="ucan-official-header">
        <div className="ucan-official-header__inner">
          <a href="#topo" className="ucan-official-header__brand" aria-label="U Can Marketing Digital">
            <span className="ucan-official-header__symbol">
              <img src={`${basePath}/assets/ucan-logo-white.png`} alt="" />
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
            onClick={() => pushEvent("cta_click", { cta_location: "header_whatsapp" })}
            className="ucan-official-header__whatsapp"
          >
            <img src={`${basePath}/assets/whatsapp.png`} alt="" />
            <span className="ucan-official-header__whatsapp-label">Quero uma análise</span>
          </a>
        </div>
      </header>

      <section id="topo" className="relative scroll-mt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_0%,rgba(109,53,216,0.28),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(0,236,166,0.12),transparent_31%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-24 pb-14 sm:px-8 sm:py-20 lg:grid-cols-[1.04fr_.96fr] lg:items-start lg:gap-16 lg:py-24">
          <div className="pt-2 lg:pt-8">
            <h1 className="max-w-3xl text-[2.75rem] font-black leading-[1.02] tracking-[-0.045em] text-[#f8fafc] sm:text-6xl lg:text-[4.35rem]">
              Querendo aumentar o faturamento da sua clínica de forma <span className="text-[#00eca6]">saudável?</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#a8b1c4] sm:text-xl">
              A U Can conecta anúncios, página, atendimento, agendamento, vendas e mensuração para sua clínica entender o que gera resultado e onde o faturamento está escapando.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Estética", "Odontologia", "Massoterapia"].map((item) => (
                <span key={item} className="rounded-full border border-[#2b3652] bg-[#11182c] px-4 py-2 text-sm font-bold text-[#d9e0ee] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">{item}</span>
              ))}
            </div>

            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                [Target, "Aquisição", "Leads mais alinhados"],
                [BarChart3, "Mensuração", "Retorno acompanhado"],
                [LineChart, "Previsibilidade", "Decisões com dados"],
              ].map(([Icon, title, text]) => {
                const IconComponent = Icon as typeof Target;
                return (
                  <div key={String(title)} className="rounded-2xl border border-[#26314b] bg-[#11182c]/85 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur">
                    <IconComponent className="size-5 text-[#00eca6]" />
                    <p className="mt-3 text-sm font-bold text-[#f8fafc]">{String(title)}</p>
                    <p className="mt-1 text-xs leading-5 text-[#9da8bd]">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#6d35d8]/35 via-transparent to-[#00eca6]/20 blur-2xl" />
            <div className="rounded-[2rem] border border-[#26314b] bg-[#11182c] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <OriginalFooter />
    </main>
  );
}