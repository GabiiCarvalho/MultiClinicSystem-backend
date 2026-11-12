const axios = require("axios");
const database = require("../../config/database");

const ASAAS_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_KEY = process.env.ASAAS_API_KEY;

const apiAsaas = axios.create({
  baseURL: ASAAS_URL,
  headers: {
    access_token: ASAAS_KEY,
    "Content-Type": "application/json",
  },
});

// ✅ DICIONÁRIO DE ERROS AMIGÁVEIS DO ASAAS
const traduzirErroAsaas = (asaasError) => {
  if (!asaasError)
    return "Ocorreu um erro ao processar sua assinatura. Tente novamente.";

  const code = asaasError.code;
  const originalDesc = asaasError.description || "";

  const mensagens = {
    invalid_action:
      "Pagamento recusado. Verifique os dados do seu cartão ou tente outra forma de pagamento.",
    invalid_creditCard:
      "Os dados do cartão estão incompletos ou inválidos. Verifique e tente novamente.",
    invalid_cpfCnpj:
      "O CPF ou CNPJ informado é inválido. Verifique os números.",
    invalid_postalCode: "O CEP informado é inválido ou não foi encontrado.",
    insufficient_funds:
      "Saldo insuficiente no cartão. Tente outro cartão ou forma de pagamento.",
    expired_card: "O cartão informado está expirado. Verifique a validade.",
    invalid_card_number:
      "O número do cartão é inválido. Verifique e tente novamente.",
    invalid_card_expiry: "A data de validade do cartão é inválida.",
    invalid_card_cvv: "O código de segurança (CVV) do cartão é inválido.",
    transaction_declined:
      "A transação foi recusada pelo banco. Tente novamente ou use outro cartão.",
    invalid_environment:
      "Erro de configuração do sistema de pagamentos. Contate o suporte.",
    invalid_value:
      "O valor da assinatura é inválido. Entre em contato com o suporte.",
  };

  if (
    code === "invalid_action" ||
    originalDesc.includes("não autorizada") ||
    originalDesc.includes("recusada")
  ) {
    return mensagens.invalid_action;
  }

  return (
    mensagens[code] ||
    originalDesc ||
    "Ocorreu um erro ao processar sua assinatura. Tente novamente."
  );
};

exports.criarCheckoutAssinatura = async (req, res) => {
  try {
    const {
      nome,
      cpfCnpj,
      email,
      formaPagamento,
      valorPlano,
      numeroCartao,
      nomeImpresso,
      validade,
      cvv,
      cep,
      numero,
      telefone,
    } = req.body;

    const clinica_id = req.user.clinica_id;

    // 1. Criar cliente no Asaas
    const customerResponse = await apiAsaas.post("/customers", {
      name: nome,
      cpfCnpj: cpfCnpj.replace(/\D/g, ""),
      email: email,
    });
    const customerId = customerResponse.data.id;

    // 2. Criar a Assinatura
    const payloadAssinatura = {
      customer: customerId,
      billingType: formaPagamento,
      value: Number(valorPlano),
      nextDueDate: new Date().toISOString().split("T")[0],
      cycle: "MONTHLY",
      description: "Assinatura MultiClinic System",
    };

    // 3. Adiciona os dados do cartão (se for cartão)
    if (formaPagamento === "CREDIT_CARD") {
      const [mes, ano] = validade.split("/");

      payloadAssinatura.creditCard = {
        holderName: nomeImpresso,
        number: numeroCartao.replace(/\D/g, ""),
        expiryMonth: mes,
        expiryYear: `20${ano}`,
        ccv: cvv,
      };

      payloadAssinatura.creditCardHolderInfo = {
        name: nome,
        email: email,
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        postalCode: cep ? cep.replace(/\D/g, "") : "89223005",
        addressNumber: numero || "123",
        phone: telefone ? telefone.replace(/\D/g, "") : "47999999999",
      };

      payloadAssinatura.remoteIp = req.ip;
    }

    // 4. Criar a Assinatura no Asaas
    const subscriptionResponse = await apiAsaas.post(
      "/subscriptions",
      payloadAssinatura,
    );
    const assinatura = subscriptionResponse.data;

    // 5. Se for PIX ou BOLETO, buscar dados da primeira cobrança
    let qrCodeData = null;
    let boletoUrl = null;

    if (formaPagamento === "PIX" || formaPagamento === "BOLETO") {
      const paymentsResponse = await apiAsaas.get(
        `/subscriptions/${assinatura.id}/payments`,
      );
      const primeiroPagamentoId = paymentsResponse.data.data[0].id;

      if (formaPagamento === "PIX") {
        const pixResponse = await apiAsaas.get(
          `/payments/${primeiroPagamentoId}/pixQrCode`,
        );
        qrCodeData = {
          encodedImage: pixResponse.data.encodedImage,
          payload: pixResponse.data.payload,
        };
      } else if (formaPagamento === "BOLETO") {
        const boletoResponse = await apiAsaas.get(
          `/payments/${primeiroPagamentoId}/identificationField`,
        );
        boletoUrl = boletoResponse.data.identificationField;
      }
    }

    // 6. Salvar os IDs no banco de dados
    await database.query(
      `UPDATE clinicas SET asaas_customer_id = $1, asaas_subscription_id = $2 WHERE id = $3`,
      [customerId, assinatura.id, clinica_id],
    );

    // ✅ 7. LIBERAÇÃO IMEDIATA NO BANCO PARA CARTÃO
    if (formaPagamento === "CREDIT_CARD") {
      await database.query(
        `UPDATE clinicas SET is_subscribed = true WHERE id = $1`,
        [clinica_id],
      );
      console.log(
        `✅ [BANCO] Acesso liberado imediatamente via Cartão para clínica ${clinica_id}`,
      );
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Assinatura gerada com sucesso.",
      assinaturaId: assinatura.id,
      qrCode: qrCodeData,
      boleto: boletoUrl,
    });
  } catch (error) {
    console.error("Erro Asaas:", error.response?.data || error.message);
    const asaasError = error.response?.data?.errors?.[0];
    const mensagemAmigavel = traduzirErroAsaas(asaasError);

    return res.status(400).json({
      error: mensagemAmigavel,
      detalhes: asaasError,
    });
  }
};

exports.receberWebhook = async (req, res) => {
  try {
    // ✅ RESPOSTA IMEDIATA (Para o Asaas parar de reenviar)
    res.status(200).send("Webhook recebido");

    const { event, payment } = req.body;
    console.log(
      `[Webhook Asaas] Evento recebido: ${event} - ID: ${payment?.id}`,
    );

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const customerId = payment.customer;

      if (customerId) {
        // ✅ Só atualiza se ainda não estiver ativo no banco
        const { rowCount } = await database.query(
          `UPDATE clinicas SET is_subscribed = true 
           WHERE asaas_customer_id = $1 AND is_subscribed = false`,
          [customerId],
        );

        if (rowCount > 0) {
          console.log(
            `✅ [WEBHOOK] Assinatura ativada para o cliente: ${customerId}`,
          );
        }
      }
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
  }
};

// ✅ NOVA ROTA LEVE PARA O FRONTEND CONSULTAR
exports.verificarStatusAssinatura = async (req, res) => {
  try {
    const clinica_id = req.user.clinica_id;
    const { rows } = await database.query(
      "SELECT is_subscribed FROM clinicas WHERE id = $1",
      [clinica_id],
    );
    return res.json({ is_subscribed: rows[0]?.is_subscribed || false });
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return res.status(500).json({ error: "Erro ao verificar status" });
  }
};
