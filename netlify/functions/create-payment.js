import mollieClient from '@mollie/api-client';

const { MOLLIE_API_KEY, URL = 'http://localhost:8888' } = process.env;
const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });
const phoneStore = new Map();

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

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: Number(amount).toFixed(2) },
      description: description || 'BOOTIJS bestelling',
      redirectUrl: `${URL}/bedankt.html`,
      metadata: { phone }
    });

    if (phone) {
      phoneStore.set(payment.id, phone);
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ checkoutUrl: payment.getCheckoutUrl() }),
    };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
}
