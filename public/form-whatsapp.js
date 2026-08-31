(() => {
  const FORM_ID = "diagnostico";
  const WHATSAPP_NUMBER = "5516991760422";

  const lowerFirst = (value) => {
    if (!value) return "";
    return value.charAt(0).toLowerCase() + value.slice(1);
  };

  const createEventId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `ucan_es_${window.crypto.randomUUID()}`;
    }

    return `ucan_es_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const isConsentChecked = (form) => {
    const consent = form.querySelector("#consentimento");
    if (!consent) return false;

    return (
      consent.getAttribute("data-state") === "checked" ||
      consent.getAttribute("aria-checked") === "true" ||
      consent.checked === true
    );
  };

  const advertisingSentence = (value) => {
    if (value === "Sim, de forma contínua") {
      return "Atualmente investimos em publicidade de forma contínua.";
    }

    if (value === "Sim, ocasionalmente") {
      return "Atualmente investimos em publicidade ocasionalmente.";
    }

    return "Atualmente ainda não investimos em publicidade.";
  };

  const pushEvent = (event, details) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...details });
  };

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.id !== FORM_ID) return;

      const formData = new FormData(form);
      const name = String(formData.get("nome") || "").trim();
      const phone = String(formData.get("telefone") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const company = String(formData.get("empresa") || "").trim();
      const segment = String(formData.get("segmento") || "").trim();
      const followers = String(formData.get("seguidores") || "").trim();
      const revenue = String(formData.get("faturamento") || "").trim();
      const advertising = String(formData.get("investe_publicidade") || "").trim();

      const customFieldsAreValid =
        segment && followers && revenue && advertising && isConsentChecked(form);

      // Mantém a lógica/feedback visual atual do React quando os campos de
      // qualificação ou o consentimento ainda não estiverem completos.
      if (!customFieldsAreValid) return;

      // A validação nativa de required/type=email ocorre antes do evento submit.
      // Esta checagem adicional impede qualquer avanço com dados vazios.
      if (!name || !phone || !email || !company || !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Interrompe exclusivamente o envio externo original quando o formulário
      // está completo e substitui o destino pelo WhatsApp deste formulário.
      event.preventDefault();
      event.stopImmediatePropagation();

      const message = `Olá! Meu nome é ${name} e gostaria de entender melhor como a U Can pode ajudar minha clínica.\n\nMinha clínica/empresa se chama ${company} e atuamos no segmento de ${lowerFirst(segment)}. Atualmente temos ${lowerFirst(followers)} e nosso faturamento mensal é ${lowerFirst(revenue)}.\n\n${advertisingSentence(advertising)}\n\nMeu telefone é ${phone} e meu e-mail é ${email}.\n\nGostaria de receber uma análise sobre a estrutura de captação da minha clínica.`;

      // Um único identificador é criado por conversão. Ele será reutilizado no
      // Meta Pixel e na Conversions API para permitir deduplicação do evento Lead.
      const eventId = createEventId();
      const eventTime = Math.floor(Date.now() / 1000);
      const trackingDetails = {
        form_name: "estetica_saude",
        segment,
        destination: "whatsapp",
        event_id: eventId,
        event_time: eventTime,
      };

      pushEvent("lead_form_submit", trackingDetails);

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      let redirected = false;
      const redirectToWhatsapp = () => {
        if (redirected) return;
        redirected = true;
        window.location.assign(whatsappUrl);
      };

      // O callback dá ao GTM tempo para disparar GA4/Meta Pixel antes da saída
      // da página. eventTimeout e o fallback evitam bloquear o usuário se o GTM
      // estiver lento, bloqueado ou indisponível.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "lead_form_whatsapp",
        ...trackingDetails,
        eventCallback: redirectToWhatsapp,
        eventTimeout: 1200,
      });

      window.setTimeout(redirectToWhatsapp, 1400);
    },
    true,
  );
})();
