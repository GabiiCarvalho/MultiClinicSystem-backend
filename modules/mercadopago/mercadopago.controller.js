const axios = require("axios");
const database = require("../../config/database");

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_URL = "https://api.mercadopago.com/v1/payments";

// ✅ Função para traduzir os códigos de recusa do Mercado Pago
const traduzirErroMP = (statusDetail) => {
  const erros = {
    cc_rejected_insufficient_amount:
      "Saldo insuficiente no cartão. Tente outro cartão ou forma de pagamento.",
    cc_rejected_bad_filled_security_code:
      "O código de segurança (CVV) do cartão está incorreto.",
    cc_rejected_bad_filled_date:
      "A data de validade do cartão está incorreta ou expirada.",
    cc_rejected_bad_filled_other:
      "Verifique os dados do cartão e tente novamente.",
    cc_rejected_call_for_authorize:
      "Pagamento não autorizado. Por favor, ligue para o seu banco.",
    cc_rejected_card_disabled:
      "O cartão está bloqueado ou desabilitado. Entre em contato com o banco.",
    cc_rejected_duplicated_payment:
      "Este pagamento já foi processado anteriormente.",
    cc_rejected_high_risk: "Pagamento recusado por medidas de segurança.",
    cc_rejected_max_attempts:
      "Muitas tentativas de pagamento. Aguarde alguns minutos.",
    cc_rejected_other_reason:
      "Pagamento recusado pelo banco. Tente outro cartão.",
  };
  return (
    erros[statusDetail] ||
    "Pagamento recusado. Verifique os dados do cartão e tente novamente."
  );
};

exports.processarPagamento = async (req, res) => {
  try {
    const {
      payment_method_id,
      token,
      installments,
      issuer_id,
      payer,
      plano,
      valorPlano,
    } = req.body;

    const clinica_id = req.user.clinica_id;

    // 1. Montar o payload para o Mercado Pago
    const payloadMP = {
      transaction_amount: Number(valorPlano),
      description: `Assinatura MultiClinic - Plano ${plano}`,
      // ✅ FORÇA O MÉTODO PARA 'master' SE NÃO VIER DO FRONTEND
      payment_method_id: payment_method_id || "master",
      issuer_id: issuer_id || undefined,
      payer: {
        email: payer?.email || "teste@email.com",
        identification: payer?.identification,
      },
      token: token || undefined, // Apenas para cartão
      installments: Number(installments) || 1,
    };

    // 2. Enviar para o Mercado Pago
    const response = await axios.post(MP_URL, payloadMP, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${clinica_id}-${Date.now()}`,
      },
    });

    const pagamento = response.data;

    // 3. Pagamento Aprovado
    if (pagamento.status === "approved") {
      await database.query(
        `UPDATE clinicas SET is_subscribed = true WHERE id = $1`,
        [clinica_id],
      );
      return res.json({ status: "approved", message: "Pagamento aprovado!" });
    }

    // 4. PIX Pendente
    if (
      pagamento.status === "pending" &&
      pagamento.payment_method_id === "pix"
    ) {
      return res.json({
        status: "pending",
        pixData: {
          encodedImage:
            pagamento.point_of_interaction.transaction_data.qr_code_base64,
          payload: pagamento.point_of_interaction.transaction_data.qr_code,
        },
      });
    }

    // 5. Pagamento Recusado
    if (pagamento.status === "rejected") {
      return res.status(400).json({
        status: "rejected",
        message: traduzirErroMP(pagamento.status_detail),
      });
    }

    // 6. Outros status
    return res.status(400).json({
      status: pagamento.status,
      message: "Pagamento não concluído. Tente novamente.",
    });
  } catch (error) {
    console.error("Erro Mercado Pago:", error.response?.data || error.message);

    // Se o erro for por falta de dados do cartão (ex: token expirado)
    if (error.response?.data?.message?.includes("payment_method_id")) {
      return res.status(400).json({
        error:
          "Erro no formulário de pagamento. Verifique os dados e tente novamente.",
      });
    }

    return res.status(500).json({
      error: "Erro ao processar pagamento.",
      detalhes: error.response?.data || error.message,
    });
  }
};

exports.verificarStatusAssinatura = async (req, res) => {
  try {
    const clinica_id = req.user.clinica_id;
    const { rows } = await database.query(
      "SELECT is_subscribed FROM clinicas WHERE id = $1",
      [clinica_id],
    );
    return res.json({ is_subscribed: rows[0]?.is_subscribed || false });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao verificar status" });
  }
};
