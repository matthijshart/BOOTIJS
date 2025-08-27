import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { twilioStubCalled } from './twilio-stub.mjs';

test('webhook processes without Twilio credentials', async () => {
  process.env.MOLLIE_API_KEY = 'test';
  process.env.MOLLIE_SIGNING_KEY = 'signing';
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_WHATSAPP_FROM;

  const { handler } = await import('../netlify/functions/payment-webhook.js');

  const body = 'id=tr_test';
  const bodyBuffer = Buffer.from(body);
  const signature = crypto
    .createHmac('sha256', process.env.MOLLIE_SIGNING_KEY)
    .update(bodyBuffer)
    .digest('base64');

  const event = {
    httpMethod: 'POST',
    headers: { 'x-mollie-signature': signature },
    body,
    isBase64Encoded: false
  };

  const response = await handler(event);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, 'Webhook processed');
  assert.equal(twilioStubCalled, false);
});
