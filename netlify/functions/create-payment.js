import mollieClient from '@mollie/api-client';

const {
  MOLLIE_API_KEY,
  URL = 'http://localhost:8888',
  WEBHOOK_URL
} = process.env;
const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });

export async function handler(event) {
  try {
    if (!MOLLIE_API_KEY) {
      return { statusCode: 500, body: 'MOLLIE_API_KEY not configured' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { amount, description, phone } = JSON.parse(event.body || '{}');
    if (!amount || isNaN(Number(amount))) {
      return { statusCode: 400, body: 'Invalid amount' };
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
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
}
