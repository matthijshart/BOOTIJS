# BOOTIJS

Deze project gebruikt Netlify Functions om Mollie-betalingen te verwerken en WhatsApp-berichten te versturen met Twilio.

## Omgevingsvariabelen

Zorg ervoor dat de volgende variabelen zijn ingesteld in Netlify of in een lokale `.env`:

- `MOLLIE_API`
- `MOLLIE_SIGNING_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

### MOLLIE_SIGNING_KEY verkrijgen

1. Log in op het [Mollie-dashboard](https://www.mollie.com/dashboard).
2. Ga naar **Developers** ➔ **Webhooks**.
3. Klik op **Show signing key** en kopieer de sleutel.
4. Stel deze waarde in als `MOLLIE_SIGNING_KEY` in Netlify.

Gebruik een testbetaling om de webhook te valideren. De `MOLLIE_SIGNING_KEY` wordt gebruikt om de `X-Mollie-Signature` header te verifiëren.

### API-sleutel testen

1. Zet een test API-sleutel (start met `test_`) in `MOLLIE_API`.
2. Draai `netlify dev` of deploy op Netlify.
3. Start een betaling via `/.netlify/functions/create-payment` en check de redirect/QR-code.

