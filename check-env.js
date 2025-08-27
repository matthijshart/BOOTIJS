import 'dotenv/config';

if (!process.env.MOLLIE_API_KEY) {
  console.error('MOLLIE_API_KEY is not set. Configure it in Netlify or in a local .env file.');
  process.exit(1);
}

console.log('MOLLIE_API_KEY is set.');
