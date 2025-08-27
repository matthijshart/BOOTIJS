export function resolve(specifier, context, defaultResolve) {
  if (specifier === '@mollie/api-client') {
    return { url: new URL('./mollie-stub.mjs', import.meta.url).href, shortCircuit: true };
  }
  if (specifier === 'twilio') {
    return { url: new URL('./twilio-stub.mjs', import.meta.url).href, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
