"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  CircleDollarSign,
  LineChart,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
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

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#574b61] md:flex" aria-label="Navegação principal">
            <a href="#problema" className="transition hover:text-[#6d35d8]">O problema</a>
            <a href="#metodo" className="transition hover:text-[#6d35d8]">Como funciona</a>
            <a href="#perfil" className="transition hover:text-[#6d35d8]">Para quem é</a>
          </nav>

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

      <section id="problema" className="scroll-mt-24 bg-[#21122f] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c8a9ff]">A real causa</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">O problema nem sempre é gerar mais leads.</h2>
              <p className="mt-6 text-lg leading-8 text-[#cabfd2]">É transformar interesse em atendimento, comparecimento, fechamento e receita — sem perder visibilidade entre uma etapa e outra.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [UsersRound, "Audiência sem agenda", "A clínica cresce nas redes, mas os horários e o faturamento continuam oscilando."],
                [MessageCircleMore, "Lead sem acompanhamento", "Contatos chegam, demoram a receber resposta e se perdem por falta de processo."],
                [CircleDollarSign, "Investimento sem retorno claro", "A verba é aplicada, mas ninguém sabe quanto cada real retorna em vendas."],
              ].map(([Icon, title, text]) => {
                const IconComponent = Icon as typeof Target;
                return (
                  <article key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.07] p-6">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#7641da] text-white"><IconComponent className="size-5" /></span>
                    <h3 className="mt-5 text-lg font-bold">{String(title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#cbbfd3]">{String(text)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="metodo" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6d35d8]">Método U Can</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#21122f] sm:text-5xl">Um sistema completo, não apenas anúncios.</h2>
            <p className="mt-5 text-lg leading-8 text-[#6c6074]">Cada etapa precisa conversar com a próxima. É isso que permite identificar gargalos, corrigir desperdícios e tomar decisões com mais segurança.</p>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["01", "Oferta", "Clareza sobre o que será vendido e para quem."],
              ["02", "Aquisição", "Criativos, anúncios e página para gerar oportunidades."],
              ["03", "Atendimento", "Velocidade, script e qualificação dos contatos."],
              ["04", "Venda", "Agendamento, comparecimento e acompanhamento."],
              ["05", "Dados", "Mensuração do investimento até o faturamento."],
            ].map(([number, title, text]) => (
              <article key={number} className="group rounded-3xl border border-[#e7deef] bg-[#fcfaff] p-6 transition hover:-translate-y-1 hover:border-[#c9b4e8] hover:shadow-[0_18px_40px_rgba(76,42,108,0.09)]">
                <span className="text-xs font-black tracking-[0.18em] text-[#8b5ee3]">{number}</span>
                <h3 className="mt-8 text-xl font-bold text-[#281637]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#726779]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3edfb] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[2rem] shadow-[0_28px_60px_rgba(51,28,72,0.18)]">
            <img src={`${basePath}/assets/clinic-growth-performance-hero.png`} alt="Gestores de uma clínica analisando o desempenho do negócio" className="aspect-[4/3] h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#160c20]/90 to-transparent p-6 pt-24 text-white sm:p-8 sm:pt-28">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9c4ff]">Decisões orientadas por dados</p>
              <p className="mt-2 max-w-lg text-xl font-bold leading-7">Marketing, atendimento e comercial olhando para o mesmo resultado.</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6d35d8]">Crescer com controle</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#21122f] sm:text-5xl">Saiba o que acontece depois que o lead chega.</h2>
            <p className="mt-6 text-lg leading-8 text-[#685c70]">O anúncio é apenas o começo. A U Can acompanha o caminho até o agendamento e a venda para encontrar o verdadeiro gargalo da operação.</p>
            <ul className="mt-7 space-y-4">
              {[
                "Entender quanto cada canal gera em oportunidades",
                "Identificar perdas no atendimento e no follow-up",
                "Medir agendamentos, comparecimentos e vendas",
                "Tomar decisões com base no funil completo",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#43364c]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#6d35d8] text-white"><Check className="size-3" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="perfil" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[#dfd2ee] bg-[#f8f4ff] p-7 sm:p-10">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#6d35d8] text-white"><CheckCircle2 className="size-6" /></div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-[#241332]">Esta análise é para clínicas que...</h2>
              <ul className="mt-7 space-y-4">
                {[
                  "Já possuem operação, pacientes e faturamento",
                  "Têm capacidade para atender novos pacientes",
                  "Já construíram audiência ou presença digital",
                  "Querem investir com mais mensuração e previsibilidade",
                  "Possuem um decisor envolvido no crescimento",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-[#4c3e56]"><Check className="mt-1 size-4 shrink-0 text-[#6d35d8]" />{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-[2rem] bg-[#21122f] p-7 text-white sm:p-10">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#d8bfff]"><Target className="size-6" /></div>
              <h2 className="mt-6 text-3xl font-black tracking-tight">Antes de falar em crescimento...</h2>
              <p className="mt-5 text-base leading-7 text-[#cbbfd3]">Não vamos prometer um número pronto. Primeiro analisamos estrutura, oferta, capacidade, investimento, atendimento e histórico da clínica.</p>
              <p className="mt-5 text-base leading-7 text-[#cbbfd3]">A partir disso, identificamos se existe aderência e quais pontos precisam ser corrigidos para construir um processo mais previsível.</p>
              <a href="#diagnostico" onClick={() => pushEvent("cta_click", { cta_location: "profile" })} className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#21122f] transition hover:bg-[#eee5f8]">
                Quero solicitar uma análise<ArrowRight className="ml-2 size-4" />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#6d35d8] to-[#4d1fa5] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e0d0ff]">Próximo passo</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Sua clínica está pronta para crescer com mais previsibilidade?</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#eadfff]">Preencha o formulário e permita que a equipe da U Can entenda o momento atual do seu negócio.</p>
          <a href="#diagnostico" onClick={() => pushEvent("cta_click", { cta_location: "final" })} className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[#5022a8] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#f5efff]">
            Solicitar diagnóstico estratégico<ArrowRight className="ml-2 size-5" />
          </a>
        </div>
      </section>

      <footer className="bg-[#150b1e] py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-center sm:px-8 md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#6d35d8]"><img src={`${basePath}/assets/ucan-logo-white.png`} alt="" className="size-6 object-contain" /></span>
            <div>
              <p className="font-black">U CAN Marketing Digital</p>
              <p className="mt-1 text-xs text-[#ad9eb6]">Aquisição, atendimento, vendas e mensuração.</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-[#9f91a8]">© 2026 U Can Marketing Digital. Todos os direitos reservados.</p>
        </div>
      </footer>

      <a href="#diagnostico" onClick={() => pushEvent("cta_click", { cta_location: "mobile_sticky" })} className="fixed inset-x-4 bottom-4 z-40 flex h-13 items-center justify-center rounded-full bg-[#6d35d8] px-5 text-sm font-bold text-white shadow-[0_16px_38px_rgba(39,19,56,0.35)] md:hidden">
        Solicitar análise<ArrowRight className="ml-2 size-4" />
      </a>
    </main>
  );
}
