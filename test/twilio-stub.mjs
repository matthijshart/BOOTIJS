export let twilioStubCalled = false;

export default function twilio() {
  return {
    messages: {
      create: async () => {
        twilioStubCalled = true;
      }
    }
  };
}
