const axios = require("axios");
require("dotenv").config();

const ASAAS_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_KEY = process.env.ASAAS_API_KEY;

// ⚠️ COLE A SUA URL DO NGROK AQUI (sem a barra no final)
const NGROK_URL = "https://judiciary-estate-chewer.ngrok-free.dev";

const apiAsaas = axios.create({
  baseURL: ASAAS_URL,
  headers: {
    access_token: ASAAS_KEY,
    "Content-Type": "application/json",
  },
});

async function configurarWebhook() {
  try {
    console.log("⏳ Configurando Webhook no Asaas...");

    const payload = {
      name: "MultiClinic Webhook",
      url: `${NGROK_URL}/assinaturas/webhook`, // Aqui junta a URL com a sua rota
      email: "gabi.05assis9@gmail.com",
      enabled: true,
      interrupted: false,
      apiVersion: "v3",
      authToken: "multiclinic_webhook_token_2026_seguro", // ✅ 35 caracteres
      sendType: "NON_SEQUENTIALLY",
      events: ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"],
    };

    const response = await apiAsaas.post("/webhooks", payload);

    console.log("✅ Webhook criado com sucesso!");
    console.log(response.data);
  } catch (error) {
    console.error(
      "❌ Erro ao criar webhook:",
      error.response?.data || error.message,
    );
  }
}

configurarWebhook();
