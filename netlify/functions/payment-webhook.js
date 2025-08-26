import mollieClient from '@mollie/api-client';
import twilio from 'twilio';

const {
  MOLLIE_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM
} = process.env;

const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
    if (phone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
      const amount = payment.amount?.value;
      const description = payment.description;
      const order = payment.metadata?.orderId ? `\nBestelling: ${payment.metadata.orderId}` : '';

      await twilioClient.messages.create({
        from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${phone}`,
        body: `Betaling ontvangen voor ${description} van €${amount}.${order}`
      });
    }

    return { statusCode: 200, body: 'Webhook processed' };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
}
