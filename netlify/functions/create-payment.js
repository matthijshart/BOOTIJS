const mollieClient = require('@mollie/api-client');
const crypto = require('crypto');

const { MOLLIE_API_KEY } = process.env;
const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });

exports.handler = async (event) => {
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

    const orderId = crypto.randomBytes(4).toString('hex').toUpperCase();

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: Number(amount).toFixed(2) },
      description: description || 'BOOTIJS bestelling',
      redirectUrl: `https://bootijs.nl/bedankt.html?order=${orderId}`,
      metadata: { phone, orderId }
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ checkoutUrl: payment.getCheckoutUrl(), orderId })
    };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
