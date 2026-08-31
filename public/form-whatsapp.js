(() => {
  const FORM_ID = "diagnostico";
  const WHATSAPP_NUMBER = "5516991760422";
  const ATTRIBUTION_STORAGE_KEY = "ucan_es_attribution_v1";
  const ATTRIBUTION_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "msclkid",
  ];

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

  const getCookie = (name) => {
    const prefix = `${name}=`;
    const cookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
  };

  const readStoredAttribution = () => {
    try {
      const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeStoredAttribution = (value) => {
    try {
      window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // O rastreamento continua funcionando mesmo com storage bloqueado.
    }
  };

  const getCurrentAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    const values = {};

    ATTRIBUTION_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) values[key] = value;
    });

    return values;
  };

  const captureAttribution = () => {
    const now = new Date().toISOString();
    const current = getCurrentAttribution();
    const hasCampaignData = Object.keys(current).length > 0;
    const stored = readStoredAttribution() || {};

    if (!stored.first_touch) {
      stored.first_touch = {
        ...current,
        landing_page: window.location.href,
        referrer: document.referrer || "",
        captured_at: now,
      };
    }

    if (hasCampaignData || !stored.last_touch) {
      stored.last_touch = {
        ...current,
        landing_page: window.location.href,
        referrer: document.referrer || "",
        captured_at: now,
      };
    }

    writeStoredAttribution(stored);
    return stored;
  };

  const attributionValue = (touch, key) => {
    if (!touch || !touch[key]) return "";
    return String(touch[key]);
  };

  const buildTrackingContext = () => {
    const attribution = captureAttribution();
    const first = attribution.first_touch || {};
    const last = attribution.last_touch || {};

    return {
      first_touch: {
        utm_source: attributionValue(first, "utm_source"),
        utm_medium: attributionValue(first, "utm_medium"),
        utm_campaign: attributionValue(first, "utm_campaign"),
        utm_content: attributionValue(first, "utm_content"),
        utm_term: attributionValue(first, "utm_term"),
        utm_id: attributionValue(first, "utm_id"),
        gclid: attributionValue(first, "gclid"),
        gbraid: attributionValue(first, "gbraid"),
        wbraid: attributionValue(first, "wbraid"),
        fbclid: attributionValue(first, "fbclid"),
        msclkid: attributionValue(first, "msclkid"),
        landing_page: attributionValue(first, "landing_page"),
        referrer: attributionValue(first, "referrer"),
        captured_at: attributionValue(first, "captured_at"),
      },
      last_touch: {
        utm_source: attributionValue(last, "utm_source"),
        utm_medium: attributionValue(last, "utm_medium"),
        utm_campaign: attributionValue(last, "utm_campaign"),
        utm_content: attributionValue(last, "utm_content"),
        utm_term: attributionValue(last, "utm_term"),
        utm_id: attributionValue(last, "utm_id"),
        gclid: attributionValue(last, "gclid"),
        gbraid: attributionValue(last, "gbraid"),
        wbraid: attributionValue(last, "wbraid"),
        fbclid: attributionValue(last, "fbclid"),
        msclkid: attributionValue(last, "msclkid"),
        landing_page: attributionValue(last, "landing_page"),
        referrer: attributionValue(last, "referrer"),
        captured_at: attributionValue(last, "captured_at"),
      },
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      ga_cookie: getCookie("_ga"),
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_referrer: document.referrer || "",
    };
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

  const sendServerLead = (payload) => {
    const endpoint = String(window.UCAN_TRACKING_ENDPOINT || "").trim();
    if (!endpoint) return;

    const body = JSON.stringify(payload);

    // String simples evita preflight desnecessário em webhooks cross-origin e
    // aumenta a chance de o navegador concluir o envio durante o redirecionamento.
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return;
    } catch {
      // Usa o fallback abaixo.
    }

    try {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // A falha do endpoint nunca deve bloquear o redirecionamento do lead.
    }
  };

  // Disponibiliza contexto de aquisição para GTM sem expor PII.
  pushEvent("tracking_context_ready", {
    form_name: "estetica_saude",
    tracking: buildTrackingContext(),
  });

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

      if (!customFieldsAreValid) return;

      if (!name || !phone || !email || !company || !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const message = `Olá! Meu nome é ${name} e gostaria de entender melhor como a U Can pode ajudar minha clínica.\n\nMinha clínica/empresa se chama ${company} e atuamos no segmento de ${lowerFirst(segment)}. Atualmente temos ${lowerFirst(followers)} e nosso faturamento mensal é ${lowerFirst(revenue)}.\n\n${advertisingSentence(advertising)}\n\nMeu telefone é ${phone} e meu e-mail é ${email}.\n\nGostaria de receber uma análise sobre a estrutura de captação da minha clínica.`;

      const eventId = createEventId();
      const eventTime = Math.floor(Date.now() / 1000);
      const tracking = buildTrackingContext();
      const trackingDetails = {
        form_name: "estetica_saude",
        segment,
        destination: "whatsapp",
        event_id: eventId,
        event_time: eventTime,
        tracking,
      };

      pushEvent("lead_form_submit", trackingDetails);

      // O payload server-side contém os dados fornecidos com consentimento,
      // mas eles NÃO são enviados ao dataLayer. O webhook seguro fará o hash
      // e o envio à Meta CAPI/CRM quando for configurado.
      sendServerLead({
        event_name: "Lead",
        event_id: eventId,
        event_time: eventTime,
        action_source: "website",
        event_source_url: window.location.href,
        form_name: "estetica_saude",
        consent: true,
        user_data: {
          email,
          phone,
          client_user_agent: navigator.userAgent || "",
          fbp: tracking.fbp,
          fbc: tracking.fbc,
        },
        lead_data: {
          name,
          company,
          segment,
          followers,
          revenue,
          advertising,
        },
        attribution: tracking,
      });

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      let redirected = false;
      const redirectToWhatsapp = () => {
        if (redirected) return;
        redirected = true;
        window.location.assign(whatsappUrl);
      };

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
