import mollieClient from '@mollie/api-client';

const {
  MOLLIE_API,
  URL = 'http://localhost:8888',
  WEBHOOK_URL
} = process.env;
const mollie = mollieClient({ apiKey: MOLLIE_API });

function jsonError(statusCode, message) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ error: message })
  };
}

export async function handler(event) {
  try {
    if (!MOLLIE_API) {
      return jsonError(500, 'MOLLIE_API not configured');
    }

    if (event.httpMethod !== 'POST') {
      return jsonError(405, 'Method Not Allowed');
    }

    const { amount, description, phone } = JSON.parse(event.body || '{}');
    if (!amount || isNaN(Number(amount))) {
      return jsonError(400, 'Invalid amount');
    }

    const paymentData = {
      amount: { currency: 'EUR', value: Number(amount).toFixed(2) },
      description: description || 'BOOTIJS bestelling',
      method: 'ideal',
      redirectUrl: `${URL}/bedankt.html`,
      webhookUrl: WEBHOOK_URL || `${URL}/.netlify/functions/payment-webhook`
    };
    if (phone) {
      paymentData.metadata = { phone };
    }

    const payment = await mollie.payments.create(paymentData);
    const fullPayment = await mollie.payments.get(payment.id, {
      include: 'details.qrCode'
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        checkoutUrl: payment.getCheckoutUrl(),
        qrCode: fullPayment.details?.qrCode?.src || null
      })
    };
  } catch (err) {
    return jsonError(500, `Error: ${err.message}`);
  }
}
