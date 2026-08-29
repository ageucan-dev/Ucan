"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  LineChart,
  ShieldCheck,
  Sparkles,
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
      <label htmlFor={id} className="text-sm font-semibold text-[#29153d]">
        {label}
      </label>
      <input type="hidden" name={id} value={value} />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="h-12 w-full rounded-xl border-[#ded5eb] bg-white px-4 text-left text-[15px] shadow-none focus:ring-[#6d35d8]/20"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-[#ded5eb] bg-white">
          {options.map((option) => (
            <SelectItem key={option} value={option} className="py-2.5">
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
        <div className="mb-6 grid size-16 place-items-center rounded-full bg-[#e9ddff] text-[#5d24ca]">
          <CheckCircle2 className="size-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6d35d8]">Formulário enviado</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#20112f]">Agora vamos analisar sua clínica.</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-[#685d72]">{message}</p>
        <Button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 h-11 rounded-full bg-[#21122f] px-6 text-white hover:bg-[#352047]"
        >
          Enviar outro contato
        </Button>
      </div>
    );
  }

  return (
    <form id="diagnostico" onSubmit={handleSubmit} onFocus={markStarted} className="scroll-mt-24">
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f0e8ff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6230c8]">
          <ShieldCheck className="size-4" />
          Análise de perfil
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#20112f]">Vamos entender o momento da sua clínica.</h2>
        <p className="mt-3 text-sm leading-6 text-[#6d6275]">
          Leva menos de 2 minutos. As informações ajudam a equipe a preparar um diagnóstico mais objetivo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-semibold text-[#29153d]">Nome</label>
          <Input id="nome" name="nome" required autoComplete="name" placeholder="Como podemos chamar você?" className="h-12 rounded-xl border-[#ded5eb] bg-white px-4 text-[15px] shadow-none focus-visible:ring-[#6d35d8]/20" />
        </div>
        <div className="space-y-2">
          <label htmlFor="telefone" className="text-sm font-semibold text-[#29153d]">Telefone</label>
          <Input id="telefone" name="telefone" required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(16) 99999-9999" className="h-12 rounded-xl border-[#ded5eb] bg-white px-4 text-[15px] shadow-none focus-visible:ring-[#6d35d8]/20" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-[#29153d]">E-mail</label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@clinica.com.br" className="h-12 rounded-xl border-[#ded5eb] bg-white px-4 text-[15px] shadow-none focus-visible:ring-[#6d35d8]/20" />
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="empresa" className="text-sm font-semibold text-[#29153d]">Nome da clínica ou empresa</label>
        <Input id="empresa" name="empresa" required autoComplete="organization" placeholder="Nome da sua empresa" className="h-12 rounded-xl border-[#ded5eb] bg-white px-4 text-[15px] shadow-none focus-visible:ring-[#6d35d8]/20" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormSelect id="segmento" label="Segmento" placeholder="Selecione o segmento" value={segment} options={segments} onValueChange={setSegment} />
        <FormSelect id="seguidores" label="Seguidores da clínica" placeholder="Selecione uma faixa" value={followers} options={followerRanges} onValueChange={setFollowers} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormSelect id="faturamento" label="Faturamento mensal" placeholder="Selecione uma faixa" value={revenue} options={revenueRanges} onValueChange={setRevenue} />
        <FormSelect id="investe_publicidade" label="Investe em publicidade?" placeholder="Selecione uma opção" value={advertising} options={advertisingOptions} onValueChange={setAdvertising} />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7f3fc] p-4">
        <Checkbox id="consentimento" checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-0.5 border-[#8a76a1] data-[state=checked]:border-[#6d35d8] data-[state=checked]:bg-[#6d35d8]" />
        <label htmlFor="consentimento" className="cursor-pointer text-xs leading-5 text-[#685d72]">
          Autorizo a U Can Marketing Digital a entrar em contato para analisar minha solicitação. Meus dados serão utilizados somente para atendimento comercial.
        </label>
      </div>

      {message && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-[#f0e8ff] text-[#5d24ca]"}`} aria-live="polite">
          {message}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="mt-5 h-14 w-full rounded-xl bg-[#6d35d8] text-base font-bold text-white shadow-[0_14px_34px_rgba(109,53,216,0.26)] transition hover:-translate-y-0.5 hover:bg-[#5d27c6] disabled:translate-y-0">
        {status === "submitting" ? "Enviando..." : "Solicitar diagnóstico estratégico"}
        {status !== "submitting" && <ArrowRight className="ml-2 size-5" />}
      </Button>
      <p className="mt-3 text-center text-xs text-[#7a7082]">A solicitação passa por uma análise antes do contato.</p>
    </form>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#20112f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e1f1]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#topo" className="flex items-center gap-3" aria-label="U Can Marketing Digital">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#6d35d8] shadow-[0_8px_22px_rgba(109,53,216,0.25)]">
              <img src={`${basePath}/assets/ucan-logo-white.png`} alt="" className="size-7 object-contain" />
            </span>
            <span>
              <span className="block text-lg font-black leading-none tracking-tight">U CAN</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#776a81]">Marketing Digital</span>
            </span>
          </a>

          <a href="#diagnostico" onClick={() => pushEvent("cta_click", { cta_location: "header" })} className="inline-flex h-11 items-center justify-center rounded-full bg-[#21122f] px-5 text-sm font-bold text-white transition hover:bg-[#362047]">
            Quero uma análise
          </a>
        </div>
      </header>

      <section id="topo" className="relative scroll-mt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_0%,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(205,184,255,0.22),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.04fr_.96fr] lg:items-start lg:gap-16 lg:py-24">
          <div className="pt-2 lg:pt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8c9ef] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6532ca] shadow-sm">
              <Sparkles className="size-4" />
              Para clínicas estruturadas
            </div>

            <h1 className="mt-7 max-w-3xl text-[2.75rem] font-black leading-[1.02] tracking-[-0.045em] text-[#1e102c] sm:text-6xl lg:text-[4.35rem]">
              Sua clínica já tem audiência. Agora precisa transformar atenção em <span className="text-[#6d35d8]">crescimento previsível.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#62566c] sm:text-xl">
              A U Can conecta anúncios, página, atendimento, agendamento, vendas e mensuração para sua clínica entender o que gera resultado — e onde o faturamento está escapando.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Estética", "Odontologia", "Massoterapia"].map((item) => (
                <span key={item} className="rounded-full border border-[#ded2ed] bg-white px-4 py-2 text-sm font-bold text-[#4c3a5d] shadow-sm">{item}</span>
              ))}
            </div>

            <a href="#diagnostico" onClick={() => pushEvent("cta_click", { cta_location: "hero" })} className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-[#6d35d8] px-7 text-base font-bold text-white shadow-[0_16px_36px_rgba(109,53,216,0.28)] transition hover:-translate-y-0.5 hover:bg-[#5d27c6]">
              Analisar o potencial da minha clínica
              <ArrowRight className="ml-2 size-5" />
            </a>

            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                [Target, "Aquisição", "Leads mais alinhados"],
                [BarChart3, "Mensuração", "Retorno acompanhado"],
                [LineChart, "Previsibilidade", "Decisões com dados"],
              ].map(([Icon, title, text]) => {
                const IconComponent = Icon as typeof Target;
                return (
                  <div key={String(title)} className="rounded-2xl border border-white bg-white/75 p-4 shadow-[0_10px_30px_rgba(42,21,65,0.06)] backdrop-blur">
                    <IconComponent className="size-5 text-[#6d35d8]" />
                    <p className="mt-3 text-sm font-bold text-[#2a1838]">{String(title)}</p>
                    <p className="mt-1 text-xs leading-5 text-[#766b7d]">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#decfff] via-transparent to-[#f1eaff] blur-2xl" />
            <div className="rounded-[2rem] border border-[#e3d9ed] bg-white p-6 shadow-[0_30px_80px_rgba(48,26,70,0.13)] sm:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ece5f2] bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#ece5f2] px-5 sm:px-8 md:grid-cols-4 md:divide-x md:divide-y-0">
          {["Oferta clara", "Captação qualificada", "Processo comercial", "Mensuração completa"].map((item) => (
            <div key={item} className="flex items-center justify-center gap-2 px-5 py-5 text-center text-sm font-bold text-[#44364e]">
              <Check className="size-4 text-[#6d35d8]" />
              {item}
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
