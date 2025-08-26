import mollieClient from '@mollie/api-client';
import twilio from 'twilio';

const {
  MOLLIE_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM
} = process.env;

const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const paymentId = new URLSearchParams(event.body || '').get('id');
    if (!paymentId) {
      return { statusCode: 400, body: 'Missing payment id' };
    }

    const payment = await mollie.payments.get(paymentId);
    if (payment.status !== 'paid') {
      return { statusCode: 200, body: 'Payment not completed' };
    }

    const phone = payment.metadata && payment.metadata.phone;
    if (phone) {
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        return { statusCode: 500, body: 'Twilio credentials not configured' };
      }

      const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      const amount = payment.amount?.value;
      const description = payment.description;
      const order = payment.metadata?.orderId ? `\nBestelling: ${payment.metadata.orderId}` : '';

      try {
        await twilioClient.messages.create({
          from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${phone}`,
          body: `Betaling ontvangen voor ${description} van €${amount}.${order}`
        });
      } catch (err) {
        return { statusCode: 502, body: `Twilio API error: ${err.message}` };
      }
    }

    return { statusCode: 200, body: 'Webhook processed' };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
}
