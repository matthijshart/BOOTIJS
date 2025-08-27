export default function mollieClient() {
  return {
    payments: {
      get: async () => ({
        status: 'paid',
        amount: { value: '10.00' },
        description: 'Test payment',
        metadata: { phone: '31612345678' }
      })
    }
  };
}
