import mollieClient from '@mollie/api-client';
import twilio from 'twilio';
import crypto from 'crypto';

const {
  MOLLIE_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  MOLLIE_SIGNING_KEY
} = process.env;

const mollie = mollieClient({ apiKey: MOLLIE_API_KEY });

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const signatureHeader = event.headers['x-mollie-signature'] || event.headers['X-Mollie-Signature'];
    if (!signatureHeader || !MOLLIE_SIGNING_KEY) {
      console.warn('Missing signature header or signing key');
      return { statusCode: 403, body: 'Invalid signature' };
    }

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64')
      : Buffer.from(event.body || '', 'utf8');
    const bodyString = bodyBuffer.toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', MOLLIE_SIGNING_KEY)
      .update(bodyBuffer)
      .digest('base64');

    const expectedBuf = Buffer.from(expectedSignature);
    const headerBuf = Buffer.from(signatureHeader);
    if (
      expectedBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, headerBuf)
    ) {
      console.warn('Mollie signature verification failed', {
        expected: expectedSignature,
        received: signatureHeader
      });
      return { statusCode: 403, body: 'Invalid signature' };
    }

    const paymentId = new URLSearchParams(bodyString).get('id');
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
