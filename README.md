# BOOTIJS

Serverless functions for handling Mollie payments and optional WhatsApp notifications via Twilio.

## Environment variables

Create a `.env` file (see `.env.example`) with the following variables:

- `MOLLIE_API_KEY` – Mollie API key.
- `MOLLIE_SIGNING_KEY` – key used to verify Mollie webhook signatures.
- `TWILIO_ACCOUNT_SID` – Twilio account SID *(optional, required for WhatsApp notifications)*.
- `TWILIO_AUTH_TOKEN` – Twilio auth token *(optional)*.
- `TWILIO_WHATSAPP_FROM` – Twilio WhatsApp-enabled sender number *(optional)*.

If the Twilio variables are not set, the webhook will skip sending WhatsApp messages but still process payments.
