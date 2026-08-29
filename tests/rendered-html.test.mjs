import assert from "node:assert/strict";
import test from "node:test";

test("renders the landing page at its production subpath", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/estetica-saude/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /Querendo aumentar o faturamento da sua empresa de forma/);
  assert.doesNotMatch(html, /Para clínicas estruturadas/);
  assert.match(html, /https:\/\/wa\.me\/5516996396345/);
  assert.match(html, /assets\/whatsapp\.png/);
  assert.match(html, /ucan-official-header__whatsapp-label">Quero uma análise/);
  assert.doesNotMatch(html, /Analisar o potencial da minha clínica/);
  assert.match(html, /id="diagnostico"/);
  assert.match(html, /Solicitar diagnóstico estratégico/);
});
