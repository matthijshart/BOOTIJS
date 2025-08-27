# BOOTIJS

## Netlify configuratie

### MOLLIE_API_KEY instellen
1. Ga in Netlify naar **Site settings → Build & deploy → Environment**.
2. Voeg de variabele `MOLLIE_API_KEY` toe met je Mollie API-sleutel.
3. Deploys mislukken automatisch wanneer deze variabele ontbreekt.

### Lokale ontwikkeling
1. Kopieer het voorbeeldbestand en vul je sleutel in:
   ```bash
   cp .env.example .env
   # Open .env en vul MOLLIE_API_KEY in
   ```
2. Netlify Functions laden automatisch waarden uit `.env` via [dotenv](https://github.com/motdotla/dotenv).
3. Controleer je setup lokaal met:
   ```bash
   MOLLIE_API_KEY=your_key npm run build
   ```

## Deploy
Tijdens de Netlify-deploy wordt `npm run build` uitgevoerd; dit script controleert of `MOLLIE_API_KEY` gezet is. Zonder deze variabele stopt de build.

